import { AppError, UnauthorizedError, ForbiddenError } from '@/lib/errors.js';
import { HttpStatusCode } from 'axios';

/**
 * NOTE: These helpers are now DEPRECATED and kept only for backward compatibility
 * with any code that might still use them directly.
 * 
 * The new approach is to use withRoute() which decodes JWT directly.
 * No need to read from headers since we don't set them anymore.
 */

/**
 * @deprecated Use withRoute with requireAuth option instead
 */
export function getUserFromRequest(request) {
    console.warn('getUserFromRequest is deprecated. Use withRoute with optionalAuth instead.');
    return null;
}

/**
 * @deprecated Use withRoute with requireAuth option instead
 */
export function isAuthenticated(request) {
    console.warn('isAuthenticated is deprecated. Use withRoute with requireAuth instead.');
    return false;
}

/**
 * @deprecated Use withRoute with requireAuth option instead
 */
export function requireAuth(request) {
    console.warn('requireAuth is deprecated. Use withRoute with requireAuth: true instead.');
    throw new UnauthorizedError('Authentication required. Please use withRoute wrapper.');
}

/**
 * @deprecated Use withRoute with requireAuth and manual role checking instead
 */
export function hasRole(request, role) {
    console.warn('hasRole is deprecated.');
    return false;
}

/**
 * @deprecated Use withRoute with requireAuth and manual role checking instead
 */
export function requireRole(request, role) {
    console.warn('requireRole is deprecated.');
    throw new UnauthorizedError('Use withRoute wrapper for authentication.');
}

/**
 * @deprecated Use withRoute with requireAuth and manual role checking instead
 */
export function hasAnyRole(request, roles) {
    console.warn('hasAnyRole is deprecated.');
    return false;
}

/**
 * @deprecated Use withRoute with requireAuth and manual role checking instead
 */
export function requireAnyRole(request, roles) {
    console.warn('requireAnyRole is deprecated.');
    throw new UnauthorizedError('Use withRoute wrapper for authentication.');
}

/**
 * Check if user is a Scrum Master or Department Lead for a specific repo
 * This helper is still useful for service layer authorization
 * 
 * @param {string} userId - User ID to check
 * @param {Object} repo - Repo object with roles field
 * @returns {boolean} True if user is Scrum Master or Department Lead
 */
export function isRepoAdmin(userId, repo) {
    if (!userId || !repo || !repo.roles) return false;

    const scrumMaster = repo.roles.scrumMaster?.toString();
    const departmentLead = repo.roles.departmentLead?.toString();

    return userId === scrumMaster || userId === departmentLead;
}

export function isRepoMember(userId, repo) {
    if(!userId || !repo || !repo.members || !repo.roles) {
        return false;
    }

    return repo.members.includes(userId) || isRepoAdmin(userId, repo);
}

export function isProjectMember(userId, project) {
    if(!userId || !project || !project.members || !project.projectCreatorId) {
        return false;
    }

    return project.members.includes(userId) || project.projectCreatorId?.toString() === userId;
}

/**
 * Require user to be Scrum Master or Department Lead for a repo
 * This helper is still useful for service layer authorization
 * 
 * @param {string} userId - User ID to check
 * @param {Object} repo - Repo object with roles field
 * @throws {UnauthorizedError} If user is not a repo admin
 */
export function requireRepoAdmin(userId, repo) {
    if (!isRepoAdmin(userId, repo)) {
        throw new UnauthorizedError(
            `Access denied. You must be a Scrum Master or Department Lead to perform this action.`
        );
    }
}

/**
 * Check if the user is a member or has role in repo
 * This helper is still useful for service layer authorization
 * 
 * @param {string} userId - User ID to check (EMS User ID)
 * @param {Object} repo - Repo object with roles field
 * @throws {UnauthorizedError} If user is not a repo member
 */
export function requireRepoMember(userId, repo) {
    if(!isRepoMember(userId,repo)) {
        throw new UnauthorizedError(
            `Access denied. You must be a member or have role in repo to perform this action.`
        );
    }
}


/**
 * Check if the user is a member or has role in project
 * This helper is still useful for service layer authorization
 * 
 * @param {string} userId - User ID to check (EMS User ID)
 * @param {Object} project - Project object with members field
 * @throws {UnauthorizedError} If user is not a project member
 */
export function requireProjectMember(userId,project) {
    if(!isProjectMember(userId, project)) {
        throw new UnauthorizedError(
            `Access denied. You must be a member or have role in project to perform this action.`
        );
    }
}


export function requireOrganizationMember(userId, project, repo) {
   
    const isMember = isRepoAdmin(userId,repo) || isRepoMember(userId,repo) || isProjectMember(userId,project);

    if(!isMember) {
        throw new UnauthorizedError(
            `Access denied. You must be a member or have role in project or repo to perform this action.`
        );
    }

}