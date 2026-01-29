import { withRoute } from '@/utils/errorHandler';
import workitemService from '@/services/workitem.service';
import { ApiResponse } from '@/lib/response';
import { AppError } from '@/lib/errors';


export const POST = withRoute(async (request, context, {params}) => {
    const body = await request.json();

    if(!Object.keys(body).includes("follow")) {
        throw new AppError("Invalid request payload",400);
    }

    const {id:workItemId} = await params;
    if(body.follow) {
        await workitemService.followWorkItem(workItemId,context.id);
        return ApiResponse.success('Work item followed successfully');
    }else {
        await workitemService.unFollowWorkItem(workItemId,context.id);
        return ApiResponse.success('Work item unfollowed successfully');
    }
}, {requireAuth:true})