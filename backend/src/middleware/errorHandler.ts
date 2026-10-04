import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { ApiError } from '../utils/apiError.js'
import { sendError } from '../utils/apiResponse.js'
import { env } from '../config/env.js'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  // Handle custom ApiError
  if (err instanceof ApiError) {
    return sendError(res, err.code, err.message, err.details, err.statusCode)
  }

  // Handle Zod schema validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    return sendError(res, 'VALIDATION_ERROR', 'Validation failed for request data', formattedErrors, 400)
  }

  // Generic unhandled exceptions
  const isProduction = env.NODE_ENV === 'production'
  const message = isProduction ? 'An unexpected server error occurred' : err.message
  const details = isProduction ? undefined : { stack: err.stack }

  return sendError(res, 'INTERNAL_SERVER_ERROR', message, details, 500)
}
