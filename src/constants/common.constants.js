export const GITHUB_REQUIRED_SCOPES = ['user', 'repo', 'read:org'];

export const ROLE_MEMBERS = {
    SCRUM_MASTER: 'Scrum Master',
    DEPARTMENT_LEAD: 'Department Lead'
}

export const REASONS = {
    ADDED_TO_BACKLOG: 'Added To Backlog',
    STARTED: 'Started',
    COMPLETED: 'Completed',
    CUT: 'Cut',
    DEFERRED: 'Deferred',
    OBSOLETE: 'Obsolete'
}

export const STATES = {
    TODO: 'To Do',
    DOING: 'Doing',
    DONE: 'Done'
}

export const WORKITEMTYPE = {
    TASK: 'Task',
    EPIC: 'Epic',
    ISSUE: 'Issue'
}

export const SEVERITIES = {
    High: 1,
    Medium: 2,
    Low: 3
}

export const WORKITEMLISTTYPES = {
    ASSIGNED_TO_ME:"assignedToMe",
    FOLLOWING:"following",
    MENTIONED:"mentioned",
    MY_ACTIVITY:"myActivity",
    RECENTLY_UPDATED:"recentlyUpdated",
    RECENTLY_COMPLETED:"recentlyCompleted",
    RECENTLY_CREATED:"recentlyCreated"
}

export const WORKITEMTYPE_COLORS = {
    [WORKITEMTYPE.TASK.toLowerCase()]: 'rgb(164,136,10)',
    [WORKITEMTYPE.EPIC.toLowerCase()]: 'rgb(224,108,0)',
    [WORKITEMTYPE.ISSUE.toLowerCase()]: 'rgb(51,153,71)',
}

export const WORKITEM_PAGE_TYPE = {
    MODAL:"MODAL",
    PAGE: "PAGE"
}

export const FEATURES = {
    WORKITEMS:"WORKITEMS",
    BOARDS:"BOARDS",
    REPOS:"REPOS",
    PROJECTS:"PROJECTS",
    
}

export const ROUTES = {
    WORK_ITEMS:{
        LIST:'/work-items'
    }
}