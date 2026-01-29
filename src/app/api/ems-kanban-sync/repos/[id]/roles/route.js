import { ApiResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";
import connectDB from "@/lib/mongodb";
import { getRepoById,updateRoleMember } from "@/services/repo.service";
import { getEMSUser } from "@/services/user.service";
import { ROLE_MEMBERS } from "@/constants/common.constants";
import workItemService from "@/services/workitem.service";



export async function PUT(request, { params }) {
  try {
    
    const resolvedParams = await params;
    const payload = await request.json();
    if (!payload.userId || !payload.role) {
      throw new ValidationError("User ID and role are required");
    }
    await connectDB();

    const user = await getEMSUser(payload.userId);
    if (!user) {
      return ApiResponse.error(new Error("User not found"), 404);
    }

    const repo = await getRepoById(resolvedParams.id);
    if (!repo) {
      return ApiResponse.error(new Error("Repository not found"), 404);
    }

    if(payload.role === ROLE_MEMBERS.SCRUM_MASTER) {
        workItemService.changeWorkItemsAssignedTo(repo.roles.scrumMaster, payload.userId);
    }

    await updateRoleMember(resolvedParams.id, payload);
    
    return ApiResponse.success(user, "User role updated successfully");
  } catch (error) {
    console.log(error);
    if (error instanceof ValidationError) {
      return ApiResponse.error(error);
    }
    return ApiResponse.error(new Error("Failed to update user role"));
  }
}