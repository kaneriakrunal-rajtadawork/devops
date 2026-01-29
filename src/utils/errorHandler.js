import { ApiResponse } from '@/lib/api-response';
import { AppError, ValidationError, NotFoundError, UnauthorizedError, DatabaseError, ForbiddenError } from '@/lib/errors.js';
import connectDB from '@/lib/mongodb';
import * as jose from 'jose';
import Logger from '@/lib/logger';
import requestLogger from '@/lib/request-logger';

const logger = new Logger('ErrorHandler');

function isAbortError(error, request) {
    return (
        error?.message === 'aborted' ||
        error?.code === 'ECONNRESET' ||
        request?.signal?.aborted === true
    );
}

export async function decodeJWT(request) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = await jose.jwtVerify(
            token,
            new TextEncoder().encode(process.env.JWT_SECRET)
        );

        return decoded.payload;
    } catch (error) {
        console.error('JWT verification error:', error);

        if (error.code === 'ERR_JWT_EXPIRED') {
            const expiredError = new ForbiddenError('Token has expired. Please login again.');
            expiredError.code = 'TOKEN_EXPIRED';
            expiredError.redirectUrl = process.env.LOGIN_REDIRECT_URL || '/login';
            throw expiredError;
        }

        throw new ForbiddenError('Invalid or expired token');
    }
}

export function extractUserFromPayload(payload) {
    return {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        userId: payload.userId,
        githubUsername: payload.githubUsername,
        githubAccessToken: payload.githubAccessToken
    };
}

export function handleApiError(error) {
    logger.error('API Error:', error);

    if (error.status === 401 || error.message?.includes('Authentication required')) {
        return ApiResponse.error('Authentication required', 401);
    }

    if (error instanceof ValidationError || error.name === 'ZodError') {
        logger.debug('Handling ValidationError', {
            isInstance: error instanceof ValidationError,
            name: error.name,
            hasErrors: !!error.errors,
            errors: error.errors,
            errorType: typeof error.errors
        });

        return ApiResponse.error(
            'Validation failed',
            400,
            error.errors || error.issues || []
        );
    }

    if (error instanceof NotFoundError) {
        return ApiResponse.error(error.message, 404);
    }

    if(error instanceof UnauthorizedError) {
        return ApiResponse.error(error.message, 403);
    }

    if (error instanceof ForbiddenError) {
        return ApiResponse.error(error.message, 401, {
            code: error.code || 'FORBIDDEN',
            redirectUrl: error.redirectUrl || null
        });
    }

    if (error instanceof DatabaseError) {
        return ApiResponse.error('Database operation failed', 500);
    }

    if (error instanceof AppError) {
        return ApiResponse.error(
            error.message,
            error.statusCode || 500,
            error.errors
        );
    }

    if (error.name === 'ValidationError' && error.errors) {
        const messages = Object.values(error.errors).map(err => err.message);
        return ApiResponse.error('Validation failed', 400, messages);
    }

    if (error.name === 'CastError') {
        return ApiResponse.error(`Invalid ${error.path}: ${error.value}`, 400);
    }

    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || 'field';
        return ApiResponse.error(`Duplicate value for ${field}`, 409);
    }

    return ApiResponse.error(error.message || 'Internal server error', 500);
}

export function asyncHandler(handler) {
    return async (...args) => {
        const request = args[0];
        
        try {
            return await handler(...args);
        } catch (error) {
            console.log('request',request);
            if (isAbortError(error, request)) {
                logger.warn('Request aborted by client', {
                    url: request?.url,
                    method: request?.method
                });
            }
            return handleApiError(error);
        }
    };
}

export function withRoute(handler, options = {}) {
    const { requireAuth: authRequired = false, optionalAuth = false } = options;

    return asyncHandler(async (request, ...args) => {
        const url = request.url;
        const method = request.method;
        const requestId = requestLogger.logStart(request, null);
        
        try {
            // 🟢 SIMPLIFIED: Just await the DB connection.
            // Mongoose's internal 'serverSelectionTimeoutMS' (set in mongodb.js) 
            // will handle the timeout logic safely.
            await connectDB();
            
            let context = {};

            if (authRequired || optionalAuth) {
                const payload = await decodeJWT(request);

                if (authRequired && !payload) {
                    throw new UnauthorizedError('Authentication required. Please provide a valid bearer token.');
                }

                if (payload) {
                    const user = extractUserFromPayload(payload);
                    context = user;
                }
            }

            const response = await handler(request, context, ...args);
            requestLogger.logEnd(requestId, response.status);
            return response;
            
        } catch (error) {
            console.error(`🔴 [withRoute] ERROR in ${method} ${url}:`, error.message);
            
            // ❌ DELETED THE CACHE RESET LOGIC HERE
            // Do not manually reset global.mongoose. 
            // If the DB is down, Mongoose will auto-reconnect on the next request.
            
            requestLogger.logEnd(requestId, 500);
            throw error;
        }
    });
}