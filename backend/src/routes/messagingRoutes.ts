import { Router } from 'express'
import {
  messagingController,
  sendMessageSchema,
} from '../controllers/messagingController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

export const messagingRoutes = Router()

messagingRoutes.get('/conversations', requireAuth, messagingController.listConversations)
messagingRoutes.get('/conversations/:conversationId/messages', requireAuth, messagingController.getMessages)
messagingRoutes.post('/messages', requireAuth, validate({ body: sendMessageSchema }), messagingController.sendMessage)
