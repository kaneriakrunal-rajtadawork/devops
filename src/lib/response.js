/**
 * Standardized API response utility
 */

export class ApiResponse {
  /**
   * Create a successful response
   */
  static success(data = null, message = 'Success', statusCode = 200) {
    return new Response(
      JSON.stringify({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
      }),
      {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  /**
   * Create an error response
   */
  static error(message = 'An error occurred', statusCode = 500, errors = null, code = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    if (code) {
      response.code = code;
    }

    return new Response(
      JSON.stringify(response),
      {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  /**
   * Create a paginated response
   */
  static paginated(data, pagination, message = 'Data retrieved successfully') {
    return new Response(
      JSON.stringify({
        success: true,
        message,
        data,
        pagination,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  /**
   * Create a validation error response
   */
  static validationError(errors, message = 'Validation failed') {
    return this.error(message, 400, errors, 'VALIDATION_ERROR');
  }

  /**
   * Create an unauthorized response
   */
  static unauthorized(message = 'Unauthorized access') {
    return this.error(message, 401, null, 'UNAUTHORIZED');
  }

  /**
   * Create a forbidden response
   */
  static forbidden(message = 'Access forbidden') {
    return this.error(message, 403, null, 'FORBIDDEN');
  }

  /**
   * Create a not found response
   */
  static notFound(message = 'Resource not found') {
    return this.error(message, 404, null, 'NOT_FOUND');
  }

  /**
   * Create a conflict response
   */
  static conflict(message = 'Resource already exists') {
    return this.error(message, 409, null, 'CONFLICT');
  }

  /**
   * Create an internal server error response
   */
  static serverError(message = 'Internal server error') {
    return this.error(message, 500, null, 'INTERNAL_ERROR');
  }
}
