export class ApiError extends Error {
  public statusCode: number
  public code: string
  public details?: Record<string, unknown> | unknown[]

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: Record<string, unknown> | unknown[]
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Invalid request payload', details?: Record<string, unknown> | unknown[]) {
    super(400, 'VALIDATION_ERROR', message, details)
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required') {
    super(401, 'UNAUTHORIZED', message)
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Access denied for this resource') {
    super(403, 'FORBIDDEN', message)
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, 'NOT_FOUND', message)
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict detected') {
    super(409, 'CONFLICT', message)
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'An unexpected internal server error occurred') {
    super(500, 'INTERNAL_SERVER_ERROR', message)
  }
}

export class ConfigurationError extends ApiError {
  constructor(message = 'Service configuration error') {
    super(500, 'CONFIGURATION_ERROR', message)
  }
}

export class UnsupportedDocumentError extends ApiError {
  constructor(message = 'Unsupported document format or type') {
    super(415, 'UNSUPPORTED_DOCUMENT_TYPE', message)
  }
}

export class AiProcessingError extends ApiError {
  constructor(message = 'Failed to process document with AI service', details?: Record<string, unknown> | unknown[]) {
    super(502, 'AI_PROCESSING_ERROR', message, details)
  }
}
