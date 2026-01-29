import Project from "@/models/Project.model";
import { BaseService } from "./base.service";
import { NotFoundError, ValidationError, DatabaseError, UnauthorizedError } from "@/lib/errors";
import { validateData } from "@/lib/validation";
import { 
  projectSchema, 
  createProjectSchema, 
  updateProjectSchema, 
  emsProjectSchema, 
  projectFilterSchema,
  projectMemberSchema,
  projectLikeSchema, 
  updateProjectMemberSchema
} from "@/lib/validations";
import User from "@/models/User.model";
import connectDB, { ObjectId } from "@/lib/mongodb";
import { v4 as uuidv4 } from 'uuid';
import mongoose from "mongoose";

/**
 * Project service extending BaseService with project-specific functionality
 */
class ProjectService extends BaseService {
  constructor() {
    super(Project);
  }

  /**
   * Create project from EMS system
   */
  async createFromEMS(projectData) {
    try {
      await connectDB();
      const validatedData = validateData(emsProjectSchema, projectData);
      
      // Check if user exists
      // const createdByUser = await User.findOne({ userId: validatedData.projectCreatorId }, { _id: 1 });
      // if (!createdByUser) {
      //   throw new NotFoundError("No user found with the provided user ID");
      // }


      const projectToCreate = {
        ...validatedData,
        createdFromEMS: true
      };

      const newProject = await this.create(projectToCreate);
      return newProject;
    } catch (error) {
      console.log("Error",error)
      if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to create project from EMS: ${error.message}`);
    }
  }

  /**
   * Create a new project
   */
  async createProject(projectData, creatorId) {
    try {
      const validatedData = validateData(createProjectSchema, {
        ...projectData,
        projectCreatorId: creatorId
      });

      const newProject = await this.create(validatedData);

      return newProject;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError(`Failed to create project: ${error.message}`);
    }
  }

  /**
   * Get projects by user (creator or member)
   */
  async getProjectsByUser(userId, filters = {}) {
    try {
      const validatedFilters = validateData(projectFilterSchema, filters);
      
      const query = {
        $or: [
          { projectCreatorId: userId },
          { members: { $in: [userId] }}
        ],
      };

      const projects = await Project.aggregate([
      // Lookup repos from assignedRepos
      {
        $lookup: {
          from: "repos",                // collection name for Repo
          localField: "assignedRepos",  // array of repo ObjectIds in Project
          foreignField: "_id",          // match Repo _id
          as: "foundedRepos"
        }
      },
      // Match projects where user is involved
      {
        $match: {
          $or: [
            { projectCreatorId: ObjectId(userId) },
            { members: { $in:[ObjectId(userId)] } },
            { "foundedRepos.members": { $in:[ObjectId(userId)] } }, // check repo.members array,
            { "foundedRepos.repoCreatorId": ObjectId(userId) },
            { "foundedRepos.roles.scrumMaster": ObjectId(userId) },
            { "foundedRepos.roles.departmentLead": ObjectId(userId) },
          ]
        }
      },
      {
        $project:{
            "id":"$_id",
            "_id": 0,
            "title": 1,
            "description": 1,
        }
      }
    ]);

      return projects;

    

      // let projectQuery = Project.find(query);
      // const projects = await projectQuery.exec();
      // return projects;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError(`Failed to get user projects: ${error.message}`);
    }
  }

  async getProjectMemberDetails(projectId) {
    const projectMemberData = await this.findById(projectId,{
       select:"members projectCreatorId"
    })

    if(!projectMemberData) {
        throw new NotFoundError("ProjectDetails");
    }

    return projectMemberData;
  }

  /**
   * Get project by ID with permission check
   */
  async getProjectById(projectId, userId = null) {
    try {
      const project = await this.findById(projectId);
      if (!project) {
        throw new NotFoundError("Project not found");
      }

      // Check permissions if userId provided
      if (userId && !project.canUserView(userId)) {
        throw new UnauthorizedError("You don't have permission to view this project");
      }

      return project;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof UnauthorizedError) throw error;
      throw new DatabaseError(`Failed to get project: ${error.message}`);
    }
  }

  /**
   * Update project
   */
  async updateProject(projectId, updateData, userId) {
    try {
      const validatedData = validateData(updateProjectSchema, updateData);
      
      const project = await this.findById(projectId);
      if (!project) {
        throw new NotFoundError("Project not found");
      }

      // Check permissions
      if (!project.canUserEdit(userId)) {
        throw new UnauthorizedError("You don't have permission to edit this project");
      }

      const updatedProject = await this.update(projectId, validatedData);
      return updatedProject;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof UnauthorizedError) throw error;
      throw new DatabaseError(`Failed to update project: ${error.message}`);
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectId, userId) {
    try {
      const project = await this.findById(projectId);
      if (!project) {
        throw new NotFoundError("Project not found");
      }

      // Only creator can delete project
      if (project.projectCreatorId !== userId) {
        throw new UnauthorizedError("Only the project creator can delete this project");
      }

      await this.delete(projectId);
      return { message: "Project deleted successfully" };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof UnauthorizedError) throw error;
      throw new DatabaseError(`Failed to delete project: ${error.message}`);
    }
  }

  /**
   * Add member to project
   */
  async addMember(projectId, memberData, userId) {
    try {
      const validatedData = validateData(projectMemberSchema, memberData);
      
      const project = await this.findById(projectId);
      if (!project) {
        throw new NotFoundError("Project not found");
      }

      console.log("Project found:", project.canUserEdit);
      
      // Check permissions
      if (!project.canUserEdit(userId)) {
        throw new UnauthorizedError("You don't have permission to manage project members");
      }

      // Check if user to be added exists
      const userToAdd = await User.findOne({ userId: validatedData.userId });
      if (!userToAdd) {
        throw new NotFoundError("User to be added not found");
      }

      await project.addMember(validatedData.userId);
      return project;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof UnauthorizedError) throw error;
      throw new DatabaseError(`Failed to add member: ${error.message}`);
    }
  }

  /**
   * Update member in project
   */
  async updateMember(projectId, memberData, userId) {
    try {
      const validatedData = validateData(updateProjectMemberSchema, memberData);
      console.log("Validated Data:", projectId, validatedData, userId);
      const project = await this.findById(projectId);
      if (!project) {
        throw new NotFoundError("Project not found");
      }

      // Check permissions
      if (!project.canUserEdit(userId)) {
        throw new UnauthorizedError("You don't have permission to manage project members");
      }

      // Check if user to be added exists
      const userToAdd = await User.findOne({ userId: validatedData.newUserId });
      if (!userToAdd) {
        throw new NotFoundError("User to be added not found");
      }

      if (validatedData.oldUserId === validatedData.newUserId) {
        throw new ValidationError("Old user ID and new user ID cannot be the same");
      }

      if(!project.hasMember(validatedData.oldUserId)) {
        throw new ValidationError("Old user ID is not a member of the project");
      }

      await project.updateMember(validatedData.oldUserId, validatedData.newUserId);
      return project;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof UnauthorizedError) throw error;
      throw new DatabaseError(`Failed to update member: ${error.message}`);
    }
  }

  /**
   * Remove member from project
   */
  async removeMember(projectId, memberData, userId) {
    try {
      const validatedData = validateData(projectMemberSchema, memberData);
      
      const project = await this.findById(projectId);
      if (!project) {
        throw new NotFoundError("Project not found");
      }

      // Check permissions
      if (!project.canUserEdit(userId)) {
        throw new UnauthorizedError("You don't have permission to manage project members");
      }

      await project.removeMember(validatedData.userId);
      return project;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof UnauthorizedError) throw error;
      throw new DatabaseError(`Failed to remove member: ${error.message}`);
    }
  }

  /**
   * Toggle like on project
   */
  async toggleLike(projectId, likeData) {
    try {
      const validatedData = validateData(projectLikeSchema, likeData);
      
      const project = await this.findById(projectId);
      if (!project) {
        throw new NotFoundError("Project not found");
      }

      await project.toggleLike(validatedData.userId);
      return project;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to toggle like: ${error.message}`);
    }
  }

  /**
   * Get featured projects
   */
  async getFeaturedProjects() {
    try {
      const projects = await Project.findFeatured().sort({ lastActivityAt: -1 });
      return projects;
    } catch (error) {
      throw new DatabaseError(`Failed to get featured projects: ${error.message}`);
    }
  }

  /**
   * Get projects by status
   */
  async getProjectsByStatus(status) {
    try {
      const projects = await Project.findByStatus(status).sort({ lastActivityAt: -1 });
      return projects;
    } catch (error) {
      throw new DatabaseError(`Failed to get projects by status: ${error.message}`);
    }
  }

  /**
   * Get projects by technology
   */
  async getProjectsByTechnology(technology) {
    try {
      const projects = await Project.findByTechnology(technology).sort({ lastActivityAt: -1 });
      return projects;
    } catch (error) {
      throw new DatabaseError(`Failed to get projects by technology: ${error.message}`);
    }
  }

  /**
   * Get projects created from EMS
   */
  async getEMSProjects() {
    try {
      const projects = await Project.findEMSProjects().sort({ createdAt: -1 });
      return projects;
    } catch (error) {
      throw new DatabaseError(`Failed to get EMS projects: ${error.message}`);
    }
  }

  /**
   * Search projects
   */
  async searchProjects(searchTerm, filters = {}) {
    try {
      const validatedFilters = validateData(projectFilterSchema, filters);
      const projects = await Project.searchProjects(searchTerm, validatedFilters);
      return projects;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError(`Failed to search projects: ${error.message}`);
    }
  }

  /**
   * Archive project
   */
  async archiveProject(projectId, userId) {
    try {
      const project = await this.findById(projectId);
      if (!project) {
        throw new NotFoundError("Project not found");
      }

      // Only creator can archive project
      if (project.projectCreatorId !== userId) {
        throw new UnauthorizedError("Only the project creator can archive this project");
      }

      await project.archive();
      return project;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof UnauthorizedError) throw error;
      throw new DatabaseError(`Failed to archive project: ${error.message}`);
    }
  }

  /**
   * Unarchive project
   */
  async unarchiveProject(projectId, userId) {
    try {
      const project = await this.findById(projectId);
      if (!project) {
        throw new NotFoundError("Project not found");
      }

      // Only creator can unarchive project
      if (project.projectCreatorId !== userId) {
        throw new UnauthorizedError("Only the project creator can unarchive this project");
      }

      await project.unarchive();
      return project;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof UnauthorizedError) throw error;
      throw new DatabaseError(`Failed to unarchive project: ${error.message}`);
    }
  }

  /**
   * Update project progress
   */
  async updateProgress(projectId, progress, userId) {
    try {
      const project = await this.findById(projectId);
      if (!project) {
        throw new NotFoundError("Project not found");
      }

      // Check permissions
      if (!project.canUserEdit(userId)) {
        throw new UnauthorizedError("You don't have permission to update project progress");
      }

      await project.updateProgress(progress);
      return project;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof UnauthorizedError) throw error;
      throw new DatabaseError(`Failed to update project progress: ${error.message}`);
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStats(projectId) {
    try {
      const stats = await Project.getProjectStats(projectId);
      if (!stats || stats.length === 0) {
        throw new NotFoundError("Project not found");
      }
      return stats[0];
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to get project statistics: ${error.message}`);
    }
  }

  /**
   * Get global user ID and find projects
   */
  async getProjectsByGlobalUserId(mongoUserId) {
    try {
      const user = await User.findById(mongoUserId, { userId: 1 });
      if (!user) {
        throw new NotFoundError("User not found");
      }

      return await this.getProjectsByUser(user.userId);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to get projects by global user ID: ${error.message}`);
    }
  }
}

// Create singleton instance
const projectService = new ProjectService();

// Export methods for backward compatibility
export const createProjectFromEMS = (data) => projectService.createFromEMS(data);
export const createProject = (data, creatorId) => projectService.createProject(data, creatorId);
export const getProjectsByUser = (userId, filters) => projectService.getProjectsByUser(userId, filters);
export const getProjectById = (projectId, userId) => projectService.getProjectById(projectId, userId);
export const updateProject = (projectId, data, userId) => projectService.updateProject(projectId, data, userId);
export const deleteProject = (projectId, userId) => projectService.deleteProject(projectId, userId);
export const addProjectMember = (projectId, memberData, userId) => projectService.addMember(projectId, memberData, userId);
export const updateProjectMember = (projectId, memberData, userId) => projectService.updateMember(projectId, memberData, userId);
export const removeProjectMember = (projectId, memberData, userId) => projectService.removeMember(projectId, memberData, userId);
export const toggleProjectLike = (projectId, likeData) => projectService.toggleLike(projectId, likeData);
export const getFeaturedProjects = () => projectService.getFeaturedProjects();
export const getProjectsByStatus = (status) => projectService.getProjectsByStatus(status);
export const getProjectsByTechnology = (technology) => projectService.getProjectsByTechnology(technology);
export const getEMSProjects = () => projectService.getEMSProjects();
export const searchProjects = (searchTerm, filters) => projectService.searchProjects(searchTerm, filters);
export const archiveProject = (projectId, userId) => projectService.archiveProject(projectId, userId);
export const unarchiveProject = (projectId, userId) => projectService.unarchiveProject(projectId, userId);
export const updateProjectProgress = (projectId, progress, userId) => projectService.updateProgress(projectId, progress, userId);
export const getProjectStats = (projectId) => projectService.getProjectStats(projectId);
export const getProjectsByGlobalUserId = (mongoUserId) => projectService.getProjectsByGlobalUserId(mongoUserId);

export default projectService;