import { Router, Request, Response } from 'express'

export const healthRoutes = Router()

healthRoutes.get('/', (_req: Request, res: Response) => {
  return res.status(200).json({
    status: 'ok',
    service: 'EthAum API',
  })
})
