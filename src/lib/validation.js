import { ValidationError } from './errors.js';
import Logger from './logger.js';

const logger = new Logger('Validation');

/**
 * Validation utilities for Zod integration
 */
export const validateData = (schema, data) => {
    try {
        return schema.parse(data);
    } catch (error) {
        logger.debug('Validation error caught', {
            errorName: error.name,
            errorMessage: error.message,
            hasErrors: !!error.errors,
            errorsCount: error.errors?.length
        });

        // Handle Zod validation errors
        if (error.name === 'ZodError' && error.errors) {
            const details = error?.errors?.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
            }));

            logger.debug('Mapped ZodError details', { details });
            throw new ValidationError('Validation failed', details);
        }

        // Handle other errors (TypeError, etc.)
        logger.error('Non-Zod validation error', error);
        throw new ValidationError(
            error.message || 'Validation failed',
            [{ field: 'general', message: error.message || 'Invalid data provided' }]
        );
    }
};

export const validateWithResponse = (schema) => {
    return (data) => {
        try {
            return {
                success: true,
                data: schema.parse(data)
            };
        } catch (error) {
            return {
                success: false,
                errors: error.errors?.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                })) || []
            };
        }
    };
};

/**
 * Middleware-style validation for API routes
 */
export const withValidation = (schema) => {
    return async (request, handler) => {
        try {
            const body = await request.json();
            const validatedData = validateData(schema, body);
            request.validatedData = validatedData;
            return await handler(request);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new ValidationError('Invalid request body');
        }
    };
};
