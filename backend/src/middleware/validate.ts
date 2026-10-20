import { Request, Response, NextFunction } from 'express'
import { ZodTypeAny, ZodError } from 'zod'

interface RequestValidationSchema {
  body?: ZodTypeAny
  query?: ZodTypeAny
  params?: ZodTypeAny
}

export function validate(schema: RequestValidationSchema) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params)
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query)
      }
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body)
      }
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        next(error)
      } else {
        next(error)
      }
    }
  }
}
