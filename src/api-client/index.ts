// Configure axios with authentication
import './axios-config';

// Export authentication utilities
export { setAuthToken, configureAuth } from './axios-config';

// Export all generated API hooks and functions
export * from './users/users';
export * from './projects/projects'; 
export * from './work-items/work-items';
export * from './repositories/repositories';
export * from './authentication/authentication';
export * from './github-integration/github-integration';
export * from './work-item-comments/work-item-comments';

// Export types
export * from '../types';
