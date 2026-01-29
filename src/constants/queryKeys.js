export const QUERY_KEYS = {
    WORK_ITEMS: "workItems",
    PROJECTS: 'projects',
    USERS: 'users',
    COMMENTS: 'comments',
};

export const workItemKeys = {
    // Root
    all: [QUERY_KEYS.WORK_ITEMS],
    
    // Project scope
    project: (projectId) => [
        ...workItemKeys.all,
        'project',
        projectId,
    ],
    
    // Repo / Team scope
    repo: (projectId, repoId) => [
        ...workItemKeys.project(projectId),
        'repo',
        repoId,
    ],

    // Board scope (NO filters here)
    board: (projectId, repoId) => [
        ...workItemKeys.repo(projectId, repoId),
        'board',
    ],
    // Board view (filters only)
    boardView: (projectId, repoId, filters) => [
        ...workItemKeys.board(projectId, repoId),
        'view',
        filters,
    ],

    // Backlog scope
    backlog: (projectId, repoId) => [
        ...workItemKeys.repo(projectId, repoId),
        'backlog',
    ],

    backlogView: (projectId, repoId, filters) => [
        ...workItemKeys.backlog(projectId, repoId),
        'view',
        filters,
    ],

    // Detail scope
    details: () => [...workItemKeys.all, 'detail'],
    detail: (id) => [...workItemKeys.details(), id],
}

export const commentKeys = {
    all:[QUERY_KEYS.COMMENTS],
    // Scoped to ONE work item
    workItem:(workItemId) => [
        ...commentKeys.all,
        'workItem',
        workItemId
    ],
    // List of comments
    list: (workItemId) => [
        ...commentKeys.workItem(workItemId),
        'list',
    ],

    // single comment
    detail: (workItemId, commentId) => [
    ...commentKeys.workItem(workItemId),
    'detail',
    commentId,
  ],
}