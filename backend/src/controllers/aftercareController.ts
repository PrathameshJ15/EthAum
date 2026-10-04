import { Request, Response, NextFunction } from 'express'
import { aftercareService } from '../services/aftercareService.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { ValidationError, NotFoundError } from '../utils/apiError.js'

export const aftercareController = {
  async getAftercarePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = String(req.params.caseId || req.query.caseId || 'ET-8492')
      const plan = await aftercareService.getAftercarePlan(caseId)
      return sendSuccess(res, plan)
    } catch (err) {
      next(err)
    }
  },

  async listReminders(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = String(req.params.caseId || req.query.caseId || 'ET-8492')
      const reminders = await aftercareService.listReminders(caseId)
      return sendSuccess(res, reminders)
    } catch (err) {
      next(err)
    }
  },

  async acknowledgeReminder(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = String(req.params.caseId || req.query.caseId || 'ET-8492')
      const reminderId = String(req.params.reminderId || '')
      if (!reminderId) {
        throw new ValidationError('reminderId is required')
      }

      const updated = await aftercareService.acknowledgeReminder(caseId, reminderId)
      return sendSuccess(res, updated, 'Aftercare reminder acknowledged successfully')
    } catch (err) {
      next(err)
    }
  },

  async getRecoveryDirectives(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = String(req.params.caseId || req.query.caseId || 'ET-8492')
      const directives = await aftercareService.getRecoveryDirectives(caseId)
      return sendSuccess(res, directives)
    } catch (err) {
      next(err)
    }
  },

  async listDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = String(req.params.caseId || req.query.caseId || 'ET-8492')
      const docs = await aftercareService.listDocuments(caseId)
      return sendSuccess(res, docs)
    } catch (err) {
      next(err)
    }
  },

  async listMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = String(req.params.caseId || req.query.caseId || 'ET-8492')
      const messages = await aftercareService.listMessages(caseId)
      return sendSuccess(res, messages)
    } catch (err) {
      next(err)
    }
  },

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = String(req.params.caseId || req.body.caseId || 'ET-8492')
      const { content, senderName } = req.body

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        throw new ValidationError('Message content is required')
      }

      const user = req.user
      const role = (user?.role?.toLowerCase() || 'patient') as
        | 'patient'
        | 'coordinator'
        | 'physiotherapist'
        | 'doctor'
      const name = senderName || user?.name || 'Patient'

      const newMsg = await aftercareService.sendMessage(caseId, {
        senderRole: role,
        senderName: name,
        content: content.trim(),
      })

      return sendSuccess(res, newMsg, 'Aftercare message sent successfully')
    } catch (err) {
      next(err)
    }
  },
}
