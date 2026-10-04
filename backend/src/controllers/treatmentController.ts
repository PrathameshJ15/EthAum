import { Request, Response, NextFunction } from 'express'
import { treatmentService } from '../services/treatmentService.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { NotFoundError } from '../utils/apiError.js'

export const treatmentController = {
  async listTreatments(req: Request, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as string
      const search = req.query.search as string
      const treatments = await treatmentService.listTreatments({ category, search })
      return sendSuccess(res, treatments)
    } catch (err) {
      next(err)
    }
  },

  async getTreatmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const treatmentId = req.params.id as string
      const treatment = await treatmentService.getTreatmentById(treatmentId)
      if (!treatment) {
        throw new NotFoundError(`Treatment '${treatmentId}' not found`)
      }
      return sendSuccess(res, treatment)
    } catch (err) {
      next(err)
    }
  },
}
