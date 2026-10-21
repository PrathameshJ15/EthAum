import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { messagingService } from '../services/messagingService.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { UnauthorizedError, NotFoundError, ForbiddenError } from '../utils/apiError.js'

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  content: z.string().min(1, 'Message content cannot be empty'),
  attachments: z.array(z.string()).optional(),
})

export const messagingController = {
  async listConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || req.user?.patientId || 'usr-patient-1'
      const conversations = await messagingService.listConversations(userId)
      return sendSuccess(res, conversations)
    } catch (err) {
      next(err)
    }
  },

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const conversationId = req.params.conversationId as string
      const conv = await messagingService.getConversation(conversationId)
      if (!conv) {
        throw new NotFoundError(`Conversation '${conversationId}' not found`)
      }

      const user = req.user
      if (user?.role !== 'admin') {
        const userId = user?.id
        const patientId = user?.patientId
        const providerId = user?.providerId
        const isParticipant =
          (userId && conv.participantIds.includes(userId)) ||
          (patientId && conv.participantIds.includes(patientId)) ||
          (providerId && conv.participantIds.includes(providerId))

        if (!isParticipant) {
          throw new ForbiddenError('Access denied: You are not a participant in this conversation')
        }
      }

      const messages = await messagingService.getMessages(conversationId)
      return sendSuccess(res, messages)
    } catch (err) {
      next(err)
    }
  },

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError()
      }

      const conv = await messagingService.getConversation(req.body.conversationId)
      if (!conv) {
        throw new NotFoundError(`Conversation '${req.body.conversationId}' not found`)
      }

      if (req.user.role !== 'admin') {
        const userId = req.user.id
        const patientId = req.user.patientId
        const providerId = req.user.providerId
        const isParticipant =
          (userId && conv.participantIds.includes(userId)) ||
          (patientId && conv.participantIds.includes(patientId)) ||
          (providerId && conv.participantIds.includes(providerId))

        if (!isParticipant) {
          throw new ForbiddenError('Access denied: You cannot send messages to this conversation')
        }
      }

      const message = await messagingService.sendMessage({
        conversationId: req.body.conversationId,
        senderId: req.user.id,
        senderName: req.user.name || 'Coordinator',
        senderRole: req.user.role,
        content: req.body.content,
        attachments: req.body.attachments,
      })
      return sendSuccess(res, message, 'Message sent successfully', 201)
    } catch (err) {
      next(err)
    }
  },
}
