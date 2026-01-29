import { ApiResponse } from "@/lib/api-response";
import { getUserProfile } from "@/services/user.service";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    if (!id) {
      throw new ValidationError("User ID is required");
    }

    const user = await getUserProfile(id);
    if (!user) {
      return ApiResponse.error(new Error("User not found"), 404);
    }

    return ApiResponse.success(user, "User retrieved successfully");
  } catch (error) {
    if (error instanceof ValidationError) {
      return ApiResponse.error(error);
    }
    return ApiResponse.error(new Error("Failed to fetch user"));
  }
}