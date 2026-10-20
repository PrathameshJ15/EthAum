import { Request, Response, NextFunction } from 'express'
import { journeyService } from '../services/journeyService.js'
import { caseService } from '../services/caseService.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { NotFoundError, ValidationError, UnauthorizedError, ForbiddenError } from '../utils/apiError.js'
import { MedicalCaseStatus, MedicalCaseStatusType, UserRole } from '../types/index.js'

async function verifyJourneyCaseAccess(caseId: string, user?: any): Promise<boolean> {
  if (!user) {
    throw new UnauthorizedError('Authentication required')
  }
  const userRole = (user.role || '').toLowerCase()
  if (userRole === 'admin') return true

  const c = await caseService.getCaseById(caseId)
  if (!c) {
    throw new NotFoundError(`Case #${caseId} not found`)
  }

  if (userRole === 'patient') {
    const patientId = user.patientId || user.id
    if (c.patientId !== patientId) {
      throw new ForbiddenError('Access denied: You are not authorized to access journey records for this case')
    }
  } else if (userRole === 'provider') {
    const providerId = user.providerId || user.id
    const isAuthorized = await caseService.isProviderAuthorizedForCase(caseId, providerId)
    if (!isAuthorized) {
      throw new ForbiddenError('Access denied: You are not authorized to access journey records for this case')
    }
  }
  return true
}

export const journeyController = {
  async getJourneyEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = (req.query.caseId as string) || (req.params.caseId as string) || 'ET-8492'
      await verifyJourneyCaseAccess(caseId, req.user)
      const events = await journeyService.getJourneyEvents(caseId)
      return sendSuccess(res, events)
    } catch (err) {
      next(err)
    }
  },

  async getJourneySummary(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = String(req.params.caseId || req.query.caseId || 'ET-8492')
      await verifyJourneyCaseAccess(caseId, req.user)
      const summary = await journeyService.getJourneySummary(caseId)
      return sendSuccess(res, summary)
    } catch (err) {
      next(err)
    }
  },

  async updateStage(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = String(req.params.caseId || req.body.caseId || 'ET-8492')
      await verifyJourneyCaseAccess(caseId, req.user)
      const { stage, status } = req.body

      const targetStatus: MedicalCaseStatusType = (status || stage) as MedicalCaseStatusType
      if (!targetStatus || !Object.values(MedicalCaseStatus).includes(targetStatus)) {
        throw new ValidationError(`Invalid stage status: ${targetStatus}`)
      }

      const updatedCase = await caseService.updateCaseStatus(
        caseId,
        targetStatus,
        (req.user?.role as UserRole) || 'patient'
      )
      if (!updatedCase) {
        throw new NotFoundError(`Case #${caseId} not found`)
      }

      const summary = await journeyService.getJourneySummary(caseId)
      return sendSuccess(res, summary, 'Journey stage updated successfully')
    } catch (err) {
      next(err)
    }
  },
}
