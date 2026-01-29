import z from "zod";
import { objectId } from "@/lib/validations";
import { FEATURES, WORKITEMLISTTYPES, WORKITEMTYPE } from "@/constants/common.constants";

export const workItemListSchema = z.object({
    project: objectId.describe("Project ID is required"),
    repo: objectId.describe("Repository ID is required"),
    assignedTo: objectId.optional(),
    search: z.string().optional(),
    status: z.enum(Object.values(WORKITEMLISTTYPES)).optional(),
    state: z.array(z.string().trim()).optional().default([]),
    type: z.array(z.enum(Object.values(WORKITEMTYPE))).optional().default([]),
    isDeleted: z.boolean().optional().default(false),
    area:z.array(z.string().trim()).optional().default([]),
    tags: z.object({tags:z.array(z.string().trim()).optional().default([]),operator:z.enum(['and','or']).optional().default('and')}).optional().default({tags:[],operator:'and'}),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.string().optional().default('desc'),
    assignedUsers: z.array(z.string().trim()).optional().default([]),
    pagination:z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
    }).default({
        page:1,
        limit:20
    }),
    // feature: z.enum(Object.values(FEATURES)).optional().default(FEATURES.WORKITEMS)
})