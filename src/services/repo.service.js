import Repo from "@/models/Repo.model";
import { BaseService } from "./base.service";
import { getBranchReadme, getRepoDetails, listRepoBranches, listRepoFiles } from "./github.service";
import { NotFoundError, DatabaseError, GitHubError, ValidationError, UnauthorizedError } from "@/lib/errors";
import { validateData } from "@/lib/validation";
import { repoSchema, emsRepoSchema, updateRepoSchema, repoMemberSchema, updateProjectMemberSchema, updateRepoMemberSchema, updateRoleMemberSchema } from "@/lib/validations";
import connectDB, { ObjectId } from "@/lib/mongodb";
import Project from "@/models/Project.model";
import User from "@/models/User.model";

/**
 * Repository service extending BaseService with repo-specific functionality
 */
class RepoService extends BaseService {
    constructor() {
        super(Repo, 'Repo');
    }

    /**
     * Create repository from EMS system
     */
    async createFromEMS(data) {

        try {
            const validatedData = validateData(emsRepoSchema, data);
            const createdRepo = await this.create({
                ...validatedData,
                createdFromEMS: true,
            });


            // Optionally, link repo to project if projectId is provided
            if (createdRepo.projectId) {
                console.log("Linking repo to project:", createdRepo.projectId);
            }
            const project = await Project.findById(createdRepo.projectId);

            console.log("Project found for linking:", project);
            if (project) {
                await project.addRepo(createdRepo._id);
            }

            return createdRepo;
        } catch (error) {
            if (error instanceof ValidationError) throw error;
            throw new DatabaseError(`Failed to create repo from EMS: ${error.message}`);

        }
    }

    /**
     * Create repository with validation
     */
    async createRepo(data) {
        const validatedData = validateData(repoSchema, data);
        return await this.create(validatedData);
    }

    /**
     * Get repository by GitHub ID
     */
    async getByGithubId(githubRepoId) {
        await connectDB();
        console.log("Getting repo by GitHub ID:", githubRepoId);
        const repo = await this.findOne({ githubRepoId });
        if (!repo) {
            throw new NotFoundError('Repository with provided GitHub ID');
        }
        return repo;
    }

    /**
     * Get repositories by project ID
     */
    async getByProject(projectId) {
        await connectDB();
        console.log("Getting repos by project ID:", projectId);
        return await this.findMany({ projectId: ObjectId(projectId) });
    }

    /**
     * Get repositories by project ID and user ID (to check membership)
     */
    async getUserAssignedReposByProjectId(projectId, userId) {
        await connectDB();
        const repos = await this.aggregate([
            // Find projects also because user can be member of repo or project.
            //So find the project first and then find the user in repo or in projects.
            {
                $lookup: {
                    from: "projects",                // collection name for Repo
                    localField: "projectId",  // array of repo ObjectIds in Project
                    foreignField: "_id",          // match Repo _id
                    as: "foundedProjects"
                },
            },
            // Find the project of the given projectId
            {
                $match: {
                    projectId: ObjectId(projectId)
                }
            },
            // Match repos where user is involved
            {
                $match: {
                    $or: [
                        { members: { $in: [ObjectId(userId)] } }, // check repo.members array,
                        { repoCreatorId: ObjectId(userId) },
                        { "foundedProjects.members": { $in: [ObjectId(userId)] } }, // check project.members array,
                        { "foundedProjects.projectCreatorId": ObjectId(userId), },
                        { "roles.scrumMaster": ObjectId(userId) },
                        { "roles.departmentLead": ObjectId(userId) }
                    ]
                }
            },
            {
                $project: {
                    "id": "$_id",
                    "_id": 0,
                    "githubRepoId": 1,
                    "name": 1,
                    "description": 1,
                }
            }

        ])
        return repos;
    }


    /**
     * Get repositories created from EMS
     */
    async getEMSRepos() {
        await connectDB();
        return await this.findMany({ createdFromEMS: true });
    }

    /**
     * Get repository branches
     */
    async getRepoBranches(repoId, userId) {
        await connectDB();
        console.log("Getting repo branches for repo ID:", repoId);
        const repo = await this.findById(repoId);
        if (!repo) {
            throw new NotFoundError("Repository not found");
        }
        // Fetch branches from GitHub
        const branches = await listRepoBranches(repo.name, userId);
        return branches;
    }

    /**
     * Get repository files
     */
    async getRepoBranchFiles(repoId, branchName, path, userId) {
        await connectDB();
        console.log("Getting repo files for repo ID:", repoId);
        const repo = await this.findById(repoId);
        if (!repo) {
            throw new NotFoundError("Repository not found");
        }
        // Fetch files from GitHub
        const files = await listRepoFiles(repo.name, branchName, path, userId);
        return files;
    }

    /**
     * Get repository readme
     */
    async getRepoReadme(repoId, branchName, userId) {
        await connectDB();
        console.log("Getting repo readme for repo ID:", repoId);
        const repo = await this.findById(repoId);
        if (!repo) {
            throw new NotFoundError("Repository not found");
        }
        // Fetch readme from GitHub
        const readme = await getBranchReadme(repo.name, branchName, userId);
        return readme;
    }

    /**
     * Get repository details with GitHub data
     */
    async getGithubRepoDetails(githubRepoId, userId) {
        const foundedRepoFromDB = await this.getByGithubId(githubRepoId);


        const repoDetails = {
            database: foundedRepoFromDB,
        };

        // Fetch GitHub details if repo name exists
        if (foundedRepoFromDB?.name) {
            try {
                const githubRepoDetails = await getRepoDetails(foundedRepoFromDB.name, userId);

                if (githubRepoDetails) {
                    repoDetails.github = githubRepoDetails;

                    // Update local repo with fresh GitHub data
                    await this.updateGithubData(foundedRepoFromDB._id, githubRepoDetails);
                }
            } catch (githubError) {
                console.error('Failed to fetch GitHub details:', githubError.message);
                repoDetails.githubError = 'Failed to fetch GitHub repository details';

                // Update sync status to error
                await foundedRepoFromDB.updateSyncStatus('error');
            }
        }

        return repoDetails;
    }

    /**
     * Update repository with validation
     */
    async updateRepo(id, updateData) {
        const validatedData = validateData(updateRepoSchema, updateData);
        return await this.update(id, validatedData);
    }

    /**
     * Update repository with GitHub data
     */
    async updateGithubData(id, githubData) {
        const updateData = {
            clone_url: githubData.clone_url,
            ssh_url: githubData.ssh_url,
            html_url: githubData.html_url,
            url: githubData.url,
            syncStatus: 'synced',
            lastSyncAt: new Date()
        };

        return await this.update(id, updateData);
    }

    /**
     * Check if repository exists by GitHub ID
     */
    async existsByGithubId(githubRepoId) {
        return await this.exists({ githubRepoId });
    }

    /**
     * Get stale repositories (need sync)
     */
    async getStaleRepos(hours = 24) {
        const staleTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
        return await this.findMany({
            $or: [
                { lastSyncAt: { $lt: staleTime } },
                { lastSyncAt: null }
            ]
        });
    }

    /**
     * Update Role member to repository
     */
    async updateRoleMember(repoId, payload) {
        try {
            await connectDB();

            console.log(repoId, payload);
            const validatedData = validateData(updateRoleMemberSchema, payload);

            const repo = await this.findById(repoId);
            if (!repo) {
                throw new NotFoundError("Repository not found");
            }

            await repo.updateRoleMember(validatedData.userId, validatedData.role);

            return repo;
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof UnauthorizedError) throw error;
            throw new DatabaseError(`Failed to update role member: ${error.message}`);
        }
    }

    /**
     * Add member to repository
     */
    async addMember(repoId, memberData, userId) {
        try {
            const validatedData = validateData(repoMemberSchema, memberData);

            const repo = await this.findById(repoId);
            if (!repo) {
                throw new NotFoundError("Repository not found");
            }

            console.log("Repository found:", repo.canUserEdit(userId), 'can user edit?', userId);

            // Check permissions
            if (!repo.canUserEdit(userId)) {
                throw new UnauthorizedError("You don't have permission to manage repository members");
            }

            // Check if user to be added exists
            const userToAdd = await User.findOne({ userId: validatedData.userId });
            if (!userToAdd) {
                throw new NotFoundError("User to be added not found");
            }

            await repo.addMember(validatedData.userId);
            return repo;
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof UnauthorizedError) throw error;
            throw new DatabaseError(`Failed to add member: ${error.message}`);
        }
    }

    /**
       * Update member in repository
       */
    async updateMember(repoId, memberData, userId) {
        try {
            const validatedData = validateData(updateRepoMemberSchema, memberData);
            console.log("Validated Data:", repoId, validatedData, userId);
            const repo = await this.findById(repoId);
            if (!repo) {
                throw new NotFoundError("Repository not found");
            }

            // Check permissions
            if (!repo.canUserEdit(userId)) {
                throw new UnauthorizedError("You don't have permission to manage repository members");
            }

            // Check if user to be added exists
            const userToAdd = await User.findOne({ userId: validatedData.newUserId });
            if (!userToAdd) {
                throw new NotFoundError("User to be added not found");
            }

            if (validatedData.oldUserId === validatedData.newUserId) {
                throw new ValidationError("Old user ID and new user ID cannot be the same");
            }

            if (!repo.hasMember(validatedData.oldUserId)) {
                throw new ValidationError("Old user ID is not a member of the project");
            }

            await repo.updateMember(validatedData.oldUserId, validatedData.newUserId);
            return repo;
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof UnauthorizedError) throw error;
            throw new DatabaseError(`Failed to update member: ${error.message}`);
        }
    }

    /**
     * Remove member from repository
     */
    async removeMember(repoId, memberData, userId) {
        try {
            const validatedData = validateData(repoMemberSchema, memberData);

            const repo = await this.findById(repoId);
            if (!repo) {
                throw new NotFoundError("Repository not found");
            }

            // Check permissions
            if (!repo.canUserEdit(userId)) {
                throw new UnauthorizedError("You don't have permission to manage repository members");
            }

            await repo.removeMember(validatedData.userId);
            return repo;
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof UnauthorizedError) throw error;
            throw new DatabaseError(`Failed to remove member: ${error.message}`);
        }
    }

    /**
     * Sync repository with GitHub
     */
    async syncWithGithub(id) {
        const repo = await this.findById(id);

        try {
            if (!repo.name) {
                throw new GitHubError('Repository name is required for GitHub sync');
            }

            const githubData = await getRepoDetails(repo.name);
            await this.updateGithubData(id, githubData);

            return { success: true, message: 'Repository synced successfully' };
        } catch (error) {
            await repo.updateSyncStatus('error');
            throw new GitHubError(`Failed to sync repository: ${error.message}`);
        }
    }


    async getRepoMemberDetails(repoId) {
        const repoMemberData = await this.findById(repoId, {
            select: "members repoCreatorId roles"
        })

        if (!repoMemberData) {
            throw new NotFoundError("RepoDetails");
        }

        return repoMemberData;
    }
}

// Export instance and individual functions for backward compatibility
export const repoService = new RepoService();

export const createRepoFromEMS = (data) => repoService.createFromEMS(data);
export const createRepo = (data) => repoService.createRepo(data);
export const getRepoById = (id) => repoService.findById(id);
export const getRepoByGithubId = (githubRepoId) => repoService.getByGithubId(githubRepoId);
export const getGithubRepoDetails = (githubRepoId, userId) => repoService.getGithubRepoDetails(githubRepoId, userId);
export const getRepos = (projectId) => repoService.getByProject(projectId);
export const getEMSRepos = () => repoService.getEMSRepos();
export const updateRepo = (id, updateData) => repoService.updateRepo(id, updateData);
export const deleteRepo = (id) => repoService.delete(id);
export const syncRepoWithGithub = (id) => repoService.syncWithGithub(id);
export const getStaleRepos = (hours) => repoService.getStaleRepos(hours);
export const getReposByProjectId = (projectId) => repoService.getByProject(projectId);
export const addRepoMember = (repoId, memberData, userId) => repoService.addMember(repoId, memberData, userId);
export const updateRepoMember = (repoId, memberData, userId) => repoService.updateMember(repoId, memberData, userId);
export const updateRoleMember = (repoId, memberData) => repoService.updateRoleMember(repoId, memberData);
export const removeRepoMember = (repoId, memberData, userId) => repoService.removeMember(repoId, memberData, userId);
export const getRepoBranches = (repoId, userId) => repoService.getRepoBranches(repoId, userId);
export const getUserRepos = (projectId, userId) => repoService.getUserAssignedReposByProjectId(projectId, userId);
export const getRepoBranchFiles = (repoId, branchName, path, userId) => repoService.getRepoBranchFiles(repoId, branchName, path, userId);
export const getRepoReadme = (repoId, branchName, userId) => repoService.getRepoReadme(repoId, branchName, userId);