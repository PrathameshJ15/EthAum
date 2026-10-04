import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { caseService } from '../services/caseService.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { NotFoundError, ForbiddenError } from '../utils/apiError.js'
import { MedicalCaseStatus } from '../types/index.js'
import { caseSummaryService } from '../services/caseSummaryService.js'

export const createCaseSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  patientName: z.string().min(1, 'Patient name is required'),
  treatmentId: z.string().min(1, 'Treatment ID is required'),
  treatmentName: z.string().min(1, 'Treatment name is required'),
  destinationId: z.string().optional(),
  destinationName: z.string().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  currency: z.string().default('USD'),
  preferredDate: z.string().optional(),
  medicalHistory: z.string().min(5, 'Medical history context is required'),
  patientNotes: z.string().optional(),
})

export const updateStatusSchema = z.object({
  status: z.nativeEnum(MedicalCaseStatus),
})

export const submitCorrectionSchema = z.object({
  sectionKey: z.string().min(1, 'Section key is required'),
  originalValue: z.string().optional(),
  correctedValue: z.string().min(1, 'Corrected value is required'),
  reason: z.string().optional(),
})

export const caseController = {
  async listCases(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user
      let patientId = req.query.patientId as string | undefined
      let providerId = req.query.providerId as string | undefined

      if (user?.role === 'patient') {
        patientId = user.patientId || user.id
      } else if (user?.role === 'provider') {
        providerId = user.providerId || user.id
      }

      const cases = await caseService.listCases({ patientId, providerId })
      return sendSuccess(res, cases)
    } catch (err) {
      next(err)
    }
  },

  async getCaseById(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = req.params.id as string
      const c = await caseService.getCaseById(caseId)
      if (!c) {
        throw new NotFoundError(`Case #${caseId} was not found`)
      }

      const user = req.user
      if (user?.role === 'patient' && c.patientId !== user.patientId && c.patientId !== user.id) {
        throw new ForbiddenError('Access denied to this case')
      }
      if (user?.role === 'provider') {
        const providerId = user.providerId || user.id
        const isAuthorized = await caseService.isProviderAuthorizedForCase(caseId, providerId)
        if (!isAuthorized) {
          throw new ForbiddenError('Access denied: You are not authorized to view this medical case')
        }
      }

      return sendSuccess(res, c)
    } catch (err) {
      next(err)
    }
  },

  async createCase(req: Request, res: Response, next: NextFunction) {
    try {
      const newCase = await caseService.createCase(req.body)
      return sendSuccess(res, newCase, 'Medical case created successfully', 201)
    } catch (err) {
      next(err)
    }
  },

  async updateCaseStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body
      const userRole = (req.user?.role?.toLowerCase() || 'patient') as 'patient' | 'provider' | 'admin'
      const caseId = req.params.id as string
      const updated = await caseService.updateCaseStatus(caseId, status, userRole)
      if (!updated) {
        throw new NotFoundError(`Case #${caseId} was not found`)
      }
      return sendSuccess(res, updated, `Case status updated to ${status}`)
    } catch (err) {
      next(err)
    }
  },

  async generateSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = req.params.id as string
      const c = await caseService.getCaseById(caseId)
      if (!c) {
        throw new NotFoundError(`Case #${caseId} was not found`)
      }
      if (req.user?.role === 'patient' && req.user.patientId && c.patientId !== req.user.patientId) {
        throw new ForbiddenError('You can only generate summaries for your own cases')
      }
      const result = await caseSummaryService.generateCaseSummary(caseId)
      return sendSuccess(res, result, 'Case coordination summary generated successfully')
    } catch (err) {
      next(err)
    }
  },

  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = req.params.id as string
      const c = await caseService.getCaseById(caseId)
      if (!c) {
        throw new NotFoundError(`Case #${caseId} was not found`)
      }
      if (req.user?.role === 'patient' && req.user.patientId && c.patientId !== req.user.patientId) {
        throw new ForbiddenError('Access denied to this case summary')
      }
      const result = await caseSummaryService.getCaseSummary(caseId)
      return sendSuccess(res, result, 'Case coordination summary retrieved successfully')
    } catch (err) {
      next(err)
    }
  },

  async submitCorrection(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = req.params.id as string
      const c = await caseService.getCaseById(caseId)
      if (!c) {
        throw new NotFoundError(`Case #${caseId} was not found`)
      }
      if (req.user?.role === 'patient' && req.user.patientId && c.patientId !== req.user.patientId) {
        throw new ForbiddenError('You can only submit corrections for your own cases')
      }
      const { sectionKey, originalValue, correctedValue, reason } = req.body
      const result = await caseSummaryService.addCorrection(caseId, {
        sectionKey,
        originalValue,
        correctedValue,
        reason,
        userId: req.user?.id || 'anonymous',
      })
      return sendSuccess(res, result, 'Summary correction saved and applied successfully')
    } catch (err) {
      next(err)
    }
  },
}
