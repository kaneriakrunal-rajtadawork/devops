import { NextResponse } from 'next/server';
import { AppError } from './errors.js';

/**
 * Standardized API response utility
 */
export class ApiResponse {
  static success(data, message = 'Success', statusCode = 200) {
    return NextResponse.json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    }, { status: statusCode });
  }

  static error(error, message = null, statusCode = null) {
    // Handle AppError instances
    if (error instanceof AppError) {
      return NextResponse.json({
        success: false,
        message: message || error.message,
        code: error.code,
        ...(error.details && { details: error.details }),
        timestamp: new Date().toISOString()
      }, { status: error.statusCode });
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        })),
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        message: 'Resource already exists',
        code: 'DUPLICATE_ERROR',
        timestamp: new Date().toISOString()
      }, { status: 409 });
    }

    // Handle generic errors
    return NextResponse.json({
      success: false,
      message: message || error.message || 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }

  static created(data, message = 'Resource created successfully') {
    return this.success(data, message, 201);
  }

  static noContent(message = 'Operation completed successfully') {
    return NextResponse.json({
      success: true,
      message,
      timestamp: new Date().toISOString()
    }, { status: 204 });
  }

  static paginated(data, pagination, message = 'Success') {
    return NextResponse.json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit)
      },
      timestamp: new Date().toISOString()
    });
  }
}
