export const GITHUB_REST = {
  INVITATIONS:{
    POST:'POST /orgs/{org}/invitations'
  },
  REPOS:{
    POST:'POST /orgs/{org}/repos',
    GET: 'GET /repos/{owner}/{repo}',
    GET_CONTENTS: 'GET /repos/{owner}/{repo}/contents/{path}',
    BRANCHES:{
      LIST:'GET /repos/{owner}/{repo}/branches'
    },
    GET_README:'GET /repos/{owner}/{repo}/readme'
  },
  USERS:{
    GET_BY_USERNAME:'GET /users/{username}'
  },
  TEAMS:{
    POST:'POST /orgs/{org}/teams'
  },
  MEMBERS:{
    PUT:'PUT /orgs/{org}/teams/{team_slug}/memberships/{username}',
    DELETE: 'DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}'
  },
  COLLABORATORS:{
    PUT:'PUT /repos/{owner}/{repo}/collaborators/{username}',
    DELETE:'DELETE /repos/{owner}/{repo}/collaborators/{username}'
  }
}