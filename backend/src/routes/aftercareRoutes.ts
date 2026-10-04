import { Router } from 'express'
import { aftercareController } from '../controllers/aftercareController.js'
import { requireAuth } from '../middleware/auth.js'

export const aftercareRoutes = Router()

// All aftercare endpoints require authenticated patient/provider/admin access
aftercareRoutes.get('/:caseId', requireAuth, aftercareController.getAftercarePlan)
aftercareRoutes.get('/:caseId/reminders', requireAuth, aftercareController.listReminders)
aftercareRoutes.post(
  '/:caseId/reminders/:reminderId/acknowledge',
  requireAuth,
  aftercareController.acknowledgeReminder
)
aftercareRoutes.get(
  '/:caseId/recovery-directives',
  requireAuth,
  aftercareController.getRecoveryDirectives
)
aftercareRoutes.get('/:caseId/documents', requireAuth, aftercareController.listDocuments)
aftercareRoutes.get('/:caseId/messages', requireAuth, aftercareController.listMessages)
aftercareRoutes.post('/:caseId/messages', requireAuth, aftercareController.sendMessage)
