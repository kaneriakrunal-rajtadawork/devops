import { ApiResponse } from "@/lib/api-response";
import { loginUser } from "@/services/user.service";
import { withValidation } from "@/lib/validation";
import { loginSchema } from "@/lib/validations";
import { initGithubOctokit } from '@/config/githubService.config';

/**
 * POST /api/auth/signin - User login
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const result = await loginUser(body);

    // Initialize GitHub Octokit if user has access token
    if (result.user.hasGitHubIntegration) {
      await initGithubOctokit(result.user.id);
    }

    return ApiResponse.success(result, "Login successful");
  } catch (error) {
    console.error('Signin Error:', error);
    return ApiResponse.error(error);
  }
} 