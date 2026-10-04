import { Response } from 'express'

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Standard Successful API Response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message ? { message } : {}),
  })
}

/**
 * Standard Paginated API Response
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message?: string,
  statusCode = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    pagination,
    ...(message ? { message } : {}),
  })
}

/**
 * Standard Error API Response
 */
export function sendError(
  res: Response,
  code: string,
  message: string,
  details?: Record<string, unknown> | unknown[],
  statusCode = 400
): Response {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  })
}
