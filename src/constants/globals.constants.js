const env = process.env.NODE_ENV?.trim() || 'DEV'

export const currentEnv = env.toLowerCase()

const GLOBALS = {
  NODE_ENV: env,
  PORT: '',
  MONGODB_URI: '',
  JWT_SECRET: '',
  JWT_EXPIRES_IN: '',
  GITHUB_CLIENT_ID: '',
  GITHUB_CLIENT_SECRET: '',
  NEXT_AUTH_URL: '',
  NEXT_PUBLIC_URL: '',
  ORGANIZATION_NAME: ''
}

export async function loadSecrets() {
  if (currentEnv === 'prod' || currentEnv === 'production') {
    Object.keys(GLOBALS).forEach((key) => {
      if (process.env[key]) {
        GLOBALS[key] = process.env[key]
      }
    })
  }
  else if (currentEnv === 'development' || currentEnv === 'DEV') {
    // Load from .env file
    
    Object.keys(GLOBALS).forEach((key) => {
      if (process.env[key]) {
        GLOBALS[key] = process.env[key]
      }
    })
  }
}

loadSecrets();

export default GLOBALS
