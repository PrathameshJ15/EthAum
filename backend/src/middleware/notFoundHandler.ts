import { Request, Response } from 'express'
import { sendError } from '../utils/apiResponse.js'

export function notFoundHandler(req: Request, res: Response): Response {
  return sendError(
    res,
    'NOT_FOUND',
    `Cannot ${req.method} ${req.originalUrl} — route not found on EthAum API`,
    undefined,
    404
  )
}
