import { NotFoundError, DatabaseError } from "@/lib/errors";
import { validateData } from "@/lib/validation";
import Logger from "@/lib/logger";

/**
 * Base service class with common CRUD operations
 * Note: connectDB is handled by withRoute wrapper, no need to call it here
 */
export class BaseService {
    constructor(model, modelName) {
        this.model = model;
        this.modelName = modelName || model.modelName || 'Resource';
        this.logger = new Logger(modelName || 'BaseService');
    }

    // ==================== Helper Methods ====================

    /**
     * Find by ID or throw NotFoundError
     */
    async findByIdOrThrow(id, resourceName) {
        const doc = await this.findById(id);
        if (!doc) {
            throw new NotFoundError(resourceName ?? this.modelName);
        }
        return doc;
    }

    /**
     * Create with Zod validation
     */
    async createWithValidation(schema, data) {
        const validated = validateData(schema, data);
        return await this.create(validated);
    }

    /**
     * Update with Zod validation
     */
    async updateWithValidation(id, schema, data) {
        const validated = validateData(schema, data);
        return await this.update(id, validated);
    }

    /**
     * Apply query options to a mongoose query
     */
    _applyQueryOptions(query, options = {}) {
        const { populate, select, sort, limit, skip, lean } = options;

        if (populate) query = query.populate(populate);
        if (select) query = query.select(select);
        if (sort) query = query.sort(sort);
        if (limit) query = query.limit(limit);
        if (skip) query = query.skip(skip);
        if (lean) query = query.lean();

        return query;
    }


    buildMongoQuery(filters, filterConfig, context = {}) {
        const query = {};

        for (const key in filters) {
            const value = filters[key];

            // skip empty values
            if (
                value === undefined ||
                value === null ||
                value === "" ||
                (Array.isArray(value) && value.length === 0)
            ) {
                continue;
            }

            if (filterConfig[key]) {
                filterConfig[key](value, query, context);
            } else {
                query[key] = value;
            }
        }

        return query;
    }

    async findWithFilters(filters, filterConfig, validationSchema, context = {}) {
        // 1. Validate incoming filters via Zod
        if (validationSchema) {
            const validatedData = validateData(validationSchema, filters);

            filters = validatedData; // normalized data
        }

        // 2. Extract pagination and sort options BEFORE building query
        const { pagination = {}, sortBy, sortOrder, ...filterableData } = filters;

        const page = pagination.page ?? 1;
        const limit = pagination.limit ?? 20;

        const sort = sortBy
            ? { [sortBy]: sortOrder === "asc" ? 1 : -1 }
            : { createdAt: -1 };

        // 3. Build MongoDB query from only filterable fields (excludes pagination/sort)
        const mongoQuery = this.buildMongoQuery(filterableData, filterConfig, context);

        this.logger.info("mongoQuery", mongoQuery);
        this.logger.info("pagination", { page, limit, sort });

        // 4. Extract populate and other query options from context
        const { populate, select, lean } = context;

        this.logger.info("populate", populate);
        this.logger.info("select", select);
        this.logger.info("lean", lean);

        return await this.paginate(mongoQuery, {
            page,
            limit,
            sort,
            populate,
            select,
            lean
        })

    }


    // ==================== CRUD Operations ====================

    /**
     * Create a new document
     */
    async create(data) {
    console.log('🟢 [BaseService] create() started for', this.modelName);
    
        try {
            console.log('🟡 [BaseService] Creating document instance...');
            const document = new this.model(data);
            console.log('🟢 [BaseService] Document instance created');
            
            console.log('🟡 [BaseService] Calling document.save()...');
            const saved = await document.save();
            console.log('🟢 [BaseService] Document saved successfully:', saved._id);
            
            return saved;
        } catch (error) {
            console.error("🔴 [BaseService] Error in create():", error);
            if (error.code === 11000) {
                throw new DatabaseError(`${this.modelName} already exists`);
            }
            if (error.name === 'ValidationError') {
                throw error;
            }
            throw new DatabaseError(`Failed to create ${this.modelName}: ${error.message}`);
        }
    }   

    /**
     * Find document by ID
     * Returns null if not found (use findByIdOrThrow to throw)
     */
    async findById(id, options = {}) {
        try {
            // Handle string or populate options for backward compatibility
            if (typeof options === 'string') {
                options = { populate: options };
            }

            let query = this.model.findById(id);
            query = this._applyQueryOptions(query, options);

            return await query;
        } catch (error) {
            if (error.name === 'CastError') {
                return null; // Invalid ID format
            }
            throw new DatabaseError(`Failed to fetch ${this.modelName}: ${error.message}`);
        }
    }

    /**
     * Find one document matching filter
     */
    async findOne(filter, options = {}) {
        try {
            let query = this.model.findOne(filter);
            query = this._applyQueryOptions(query, options);
            return await query;
        } catch (error) {
            throw new DatabaseError(`Failed to find ${this.modelName}: ${error.message}`);
        }
    }

    /**
     * Find multiple documents
     */
    async findMany(filter = {}, options = {}) {
        try {
            let query = this.model.find(filter);
            query = this._applyQueryOptions(query, options);
            return await query;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch ${this.modelName} list: ${error.message}`);
        }
    }

    /**
     * Update document by ID (uses findByIdAndUpdate - doesn't trigger pre-save hooks)
     */
    async update(id, data) {
        try {
            const document = await this.model.findByIdAndUpdate(
                id,
                data,
                { new: true, runValidators: true }
            );

            if (!document) {
                throw new NotFoundError(`${this.modelName} not found`);
            }

            return document;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            if (error.name === 'ValidationError') throw error;
            throw new DatabaseError(`Failed to update ${this.modelName}: ${error.message}`);
        }
    }

    /**
     * Soft delete - set isDeleted flag
     */
    async softDelete(id) {
        try {
            const document = await this.model.findByIdAndUpdate(
                id,
                { isDeleted: true, deletedAt: new Date() },
                { new: true }
            );

            if (!document) {
                throw new NotFoundError(`${this.modelName} not found`);
            }

            return document;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError(`Failed to soft delete ${this.modelName}: ${error.message}`);
        }
    }

    /**
     * Hard delete - permanently remove from database
     */
    async delete(id) {
        try {
            const document = await this.model.findByIdAndDelete(id);

            if (!document) {
                throw new NotFoundError(`${this.modelName} not found`);
            }

            return document;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError(`Failed to delete ${this.modelName}: ${error.message}`);
        }
    }

    // ==================== Utility Operations ====================

    /**
     * Count documents matching filter
     */
    async count(filter = {}) {
        try {
            return await this.model.countDocuments(filter);
        } catch (error) {
            throw new DatabaseError(`Failed to count ${this.modelName}: ${error.message}`);
        }
    }

    /**
     * Check if document exists
     */
    async exists(filter) {
        try {
            const document = await this.model.findOne(filter).select('_id').lean();
            return !!document;
        } catch (error) {
            throw new DatabaseError(`Failed to check ${this.modelName} existence: ${error.message}`);
        }
    }

    /**
     * Run aggregation pipeline
     */
    async aggregate(pipeline) {
        try {
            return await this.model.aggregate(pipeline);
        } catch (error) {
            throw new DatabaseError(`Failed to aggregate ${this.modelName}: ${error.message}`);
        }
    }

    /**
     * Paginated query with metadata
     */
    async paginate(filter = {}, options = {}) {
        const { page = 1, limit = 10, ...queryOptions } = options;
        const skip = (page - 1) * limit;

        try {
            const [data, total] = await Promise.all([
                this.findMany(filter, { ...queryOptions, limit, skip }),
                this.count(filter)
            ]);

            this.logger.info("queryOptions", queryOptions);
            this.logger.info("total", total);

            return {
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            throw new DatabaseError(`Failed to paginate ${this.modelName}: ${error.message}`);
        }
    }
}
