import { Request, Response, NextFunction } from 'express'
import { notificationService } from '../services/notificationService.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { NotFoundError, UnauthorizedError } from '../utils/apiError.js'

export const notificationController = {
  async listNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'usr-patient-1'
      const notifications = await notificationService.listNotifications(userId)
      return sendSuccess(res, notifications)
    } catch (err) {
      next(err)
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new UnauthorizedError()
      }
      const success = await notificationService.markAsRead(req.params.id as string, userId)
      if (!success) {
        throw new NotFoundError('Notification not found')
      }
      return sendSuccess(res, { read: true }, 'Notification marked as read')
    } catch (err) {
      next(err)
    }
  },
}
