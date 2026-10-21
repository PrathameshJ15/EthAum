import { Request, Response, NextFunction } from 'express'
import { userService, patientService } from '../services/userService.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { NotFoundError, ForbiddenError } from '../utils/apiError.js'

export const userController = {
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id as string
      const user = req.user
      if (user?.role !== 'admin' && user?.id !== userId) {
        throw new ForbiddenError('Access denied: You are not authorized to view this user account')
      }

      const foundUser = await userService.getUserById(userId)
      if (!foundUser) {
        throw new NotFoundError(`User '${userId}' not found`)
      }
      return sendSuccess(res, foundUser)
    } catch (err) {
      next(err)
    }
  },
}

export const patientController = {
  async getPatientProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user
      const requestedUserId = req.params.userId as string | undefined

      if (user?.role === 'patient' && requestedUserId) {
        const isSelf = requestedUserId === user.id || requestedUserId === user.patientId
        if (!isSelf) {
          const targetPatient = await patientService.getPatientByUserId(requestedUserId)
          if (
            !targetPatient ||
            (targetPatient.id !== (user.patientId || user.id) && targetPatient.userId !== user.id)
          ) {
            throw new ForbiddenError('Access denied: You are only authorized to access your own profile')
          }
        }
      }

      const userId = requestedUserId || user?.id || 'usr-patient-1'
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
      const user = req.user
      const requestedUserId = req.params.userId as string | undefined

      if (user?.role === 'patient' && requestedUserId) {
        const isSelf = requestedUserId === user.id || requestedUserId === user.patientId
        if (!isSelf) {
          const targetPatient = await patientService.getPatientByUserId(requestedUserId)
          if (
            !targetPatient ||
            (targetPatient.id !== (user.patientId || user.id) && targetPatient.userId !== user.id)
          ) {
            throw new ForbiddenError('Access denied: You are only authorized to update your own profile')
          }
        }
      } else if (user?.role !== 'admin' && user?.role !== 'patient') {
        throw new ForbiddenError('Access denied: Only the patient or administrator may update profile details')
      }

      const userId = requestedUserId || user?.id || 'usr-patient-1'
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
