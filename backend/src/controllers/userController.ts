import { Request, Response, NextFunction } from 'express'
import { userService, patientService } from '../services/userService.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { NotFoundError } from '../utils/apiError.js'

export const userController = {
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id as string
      const user = await userService.getUserById(userId)
      if (!user) {
        throw new NotFoundError(`User '${userId}' not found`)
      }
      return sendSuccess(res, user)
    } catch (err) {
      next(err)
    }
  },
}

export const patientController = {
  async getPatientProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.params.userId as string) || req.user?.id || 'usr-patient-1'
      const patient = await patientService.getPatientByUserId(userId)
      if (!patient) {
        throw new NotFoundError('Patient profile not found')
      }
      return sendSuccess(res, patient)
    } catch (err) {
      next(err)
    }
  },

  async updatePatientProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.params.userId as string) || req.user?.id || 'usr-patient-1'
      const updated = await patientService.updatePatient(userId, req.body)
      if (!updated) {
        throw new NotFoundError('Patient profile not found')
      }
      return sendSuccess(res, updated, 'Patient profile updated successfully')
    } catch (err) {
      next(err)
    }
  },
}
