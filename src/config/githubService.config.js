import { OAuthApp } from '@octokit/oauth-app';
import { Octokit } from '@octokit/core';
import { checkToken } from "@octokit/oauth-methods";  
import { GITHUB_REQUIRED_SCOPES } from '@/constants/common.constants';
import User from '@/models/User.model';
import GLOBALS from '@/constants/globals.constants';

let githubOAuthApp; // Global instance of GitHub OAuthApp
let githubOctokitInstance; // Global instance of Octokit for API calls


/**
 * Initializes the GitHub OAuthApp instance
 * @throws {Error} If GitHub CLIENT_ID or CLIENT_SECRET are missing from Globals file
 */
export const initGithubOAuthApp = () => {

  if (!GLOBALS.GITHUB_CLIENT_ID || !GLOBALS.GITHUB_CLIENT_SECRET) {
    throw new Error('GitHub CLIENT_ID or CLIENT_SECRET missing from Globals file');
  } 

  githubOAuthApp = new OAuthApp({
    clientId: GLOBALS.GITHUB_CLIENT_ID,
    clientSecret: GLOBALS.GITHUB_CLIENT_SECRET,
    clientType: 'oauth-app',
    baseUrl: GLOBALS.NEXT_PUBLIC_URL,
    log:true,
    scopes: GITHUB_REQUIRED_SCOPES,
  });

  console.log('✅ GitHub OAuth App initialized');
};

/**
 * Initializes the Octokit instance for GitHub API interactions
 * @returns {Promise<Octokit>} The initialized Octokit instance
 * @throws {Error} If no superadmin with a valid GitHub access token is found
 */
export const initGithubOctokit = async (userId) => {
  const userDetails = await User.findOne({ _id:userId }, { githubAccessToken: 1 });
  if (!userDetails || !userDetails.githubAccessToken) {
    throw new Error('No user found with a valid GitHub access token.');
  }
  const { githubAccessToken } = userDetails;
  githubOctokitInstance = new Octokit({ auth: githubAccessToken });
  console.log('✅ GitHub Octokit instance initialized');
  return githubOctokitInstance;
};

/**
 * Returns the initialized GitHub OAuthApp instance.
 * Provides full autocomplete support.
 * @returns {OAuthApp} The GitHub OAuthApp instance
 * @throws {Error} If the OAuthApp is not initialized
 */
export const getGithubOAuthApp = () => {
  if (!githubOAuthApp) {
    throw new Error('GitHub OAuth App not initialized. Call initGithubOAuthApp() first.');
  }

  return githubOAuthApp;
};

/**
 * Returns the initialized GitHub Octokit instance.
 * @returns {Octokit} The GitHub Octokit instance
 * @throws {Error} If the Octokit instance is not initialized
 */
export const getGithubOctokit = () => {
  if(!githubOctokitInstance) {
    throw new Error('GitHub Octokit instance not initialized. Call initGithubOctokit() first.');
  }
  return githubOctokitInstance;
};

