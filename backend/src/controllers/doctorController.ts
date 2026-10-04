import { Request, Response, NextFunction } from 'express'
import { doctorService } from '../services/doctorService.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { NotFoundError } from '../utils/apiError.js'

export const doctorController = {
  async listDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const providerId = req.query.providerId as string
      const specialty = req.query.specialty as string
      const doctors = await doctorService.listDoctors({ providerId, specialty })
      return sendSuccess(res, doctors)
    } catch (err) {
      next(err)
    }
  },

  async getDoctorById(req: Request, res: Response, next: NextFunction) {
    try {
      const docId = req.params.id as string
      const doctor = await doctorService.getDoctorById(docId)
      if (!doctor) {
        throw new NotFoundError(`Doctor specialist '${docId}' not found`)
      }
      return sendSuccess(res, doctor)
    } catch (err) {
      next(err)
    }
  },
}
