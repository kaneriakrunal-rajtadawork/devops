import { getGithubOAuthApp, getGithubOctokit, initGithubOAuthApp, initGithubOctokit } from "@/config/githubService.config";
import { GITHUB_REQUIRED_SCOPES } from "@/constants/common.constants";
import { GITHUB_REST } from "@/constants/github.constants";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project.model";
import WorkItem from "@/models/WorkItem.model.js";
import { Octokit } from '@octokit/rest';
import { getStoredOctokit } from '@/config/githubService.config';
import User from "@/models/User.model";
import GLOBALS from "@/constants/globals.constants";

export async function authorizeWithGithub(userId) {
    initGithubOAuthApp();
    const githubOAuthAppInstance = getGithubOAuthApp();

    console.log("Initiating GitHub authorization for user ID:", userId);
    if (!userId) {
        throw new Error("User ID is required for GitHub authorization");
    }

    // Implement the authorization logic here
    const authUrl = githubOAuthAppInstance.getWebFlowAuthorizationUrl({
        scopes: GITHUB_REQUIRED_SCOPES,
        state: userId,
    });
    return authUrl;
}

export async function handleGithubCallback(code, state) {
    initGithubOAuthApp();
    const githubOAuthAppInstance = getGithubOAuthApp();
    const { authentication } = await githubOAuthAppInstance.createToken({ code, state });
    const userId = state; // Assuming state contains userId
    const token = authentication.token;

    await connectDB();

    console.log("Authentication object:", authentication);
    console.log("User ID from state:", state, 'code', code);

    

    const existingUser = await User.findByIdAndUpdate(userId, {
        githubAccessToken: token,
        githubId: authentication.id,
    }, { new: true });

    const userDetails = await User.findById(userId);

    console.log("User details fetched:", userDetails);

      const userResponse = {
            id: existingUser.id,
            userId: existingUser.userId,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            githubAccessToken: existingUser.githubAccessToken ? true : false, // Only return boolean for security
        };

    console.log("Updated user with GitHub token:", existingUser);
    // const token = existingUser.;
    

    await existingUser.save();

    return {
        message: 'GitHub authorization successful',
        user: userResponse,
        success: true,
    };

}

export async function getRepoDetails(repoName,userId) {

    try {
        await initGithubOctokit(userId);
        const octokit = getGithubOctokit();
        const { data:repo} = await octokit.request(GITHUB_REST.REPOS.GET, {
            owner: GLOBALS.ORGANIZATION_NAME,
            repo:repoName,
        });
        return repo;
    } catch (error) {
        console.error("Error fetching repo details:", error);
        throw new Error("Failed to fetch repo details");
    }
}

export async function listRepoBranches(repoName, userId) {
    try {
        await initGithubOctokit(userId);
        const octokit = getGithubOctokit();
        const { data: branches } = await octokit.request(GITHUB_REST.REPOS.BRANCHES.LIST, {
            owner: GLOBALS.ORGANIZATION_NAME,
            repo: repoName,
        });
        console.log(branches, "repo branches from github service");
        return branches;
    } catch (error) {
        console.error("Error fetching repo branches:", error);
        throw new Error("Failed to fetch repo branches");
    }
}

export async function listRepoFiles(repoName, branchName, path = '', userId) {
    try {
        await initGithubOctokit(userId);
        const octokit = getGithubOctokit();
        console.log("Fetching files for repo:", repoName, "at path:", path);
        const { data: files } = await octokit.request(GITHUB_REST.REPOS.GET_CONTENTS, {
            owner: GLOBALS.ORGANIZATION_NAME,
            repo: repoName,
            ref: branchName,
            path: path,
            headers:{
                accept: "application/vnd.github.raw+json",
            }
        });
        return files;
    } catch (error) {
        console.error("Error fetching repo files:", error);
        throw new Error("Failed to fetch repo files");
    }
}

export async function getBranchReadme(repoName, branchName, userId) {
    try {
        await initGithubOctokit(userId);
        const octokit = getGithubOctokit();
        console.log("Fetching README for repo:", repoName, "on branch:", branchName);
        const { data: readme } = await octokit.request(GITHUB_REST.REPOS.GET_README, {
            owner: GLOBALS.ORGANIZATION_NAME,
            repo: repoName,
            ref: branchName,
        });
        console.log(readme, "repo readme from github service");
        return readme;
    } catch (error) {
        console.error("Error fetching repo readme:", error);
        throw new Error("Failed to fetch repo readme");
    }
}