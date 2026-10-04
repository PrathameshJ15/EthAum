import { Router } from 'express'
import { notificationController } from '../controllers/notificationController.js'
import { requireAuth } from '../middleware/auth.js'

export const notificationRoutes = Router()

notificationRoutes.get('/', requireAuth, notificationController.listNotifications)
notificationRoutes.patch('/:id/read', requireAuth, notificationController.markAsRead)
