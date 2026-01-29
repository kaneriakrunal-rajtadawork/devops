import { ApiResponse } from "@/lib/api-response";
import { withRoute } from "@/utils/errorHandler.js";
import {createApiClient} from "@/lib/axiosClientGenerator";


export const GET = withRoute(async (request, context, {params}) => {
    
    const emsApiClient = createApiClient(process.env.NEXT_EMS_BASE_URL,'EMS_KANBAN_API_KEY');
    const {id} = await params;
    const departmentDetails = await emsApiClient.get(`/ems-kanban-sync/department/${id}`);
    return ApiResponse.success(departmentDetails.data,"Department Details fetched successfully.");
},{requireAuth:false})