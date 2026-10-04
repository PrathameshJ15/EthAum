import { Router } from 'express'
import {
  quoteController,
  createQuoteSchema,
  askQuestionSchema,
  answerQuestionSchema,
} from '../controllers/quoteController.js'
import { requireAuth, requireProvider } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

export const quoteRoutes = Router()

// List and create quotes
quoteRoutes.get('/', requireAuth, quoteController.listQuotes)
quoteRoutes.post(
  '/',
  requireAuth,
  validate({ body: createQuoteSchema }),
  quoteController.createQuote
)

// Single quote endpoints
quoteRoutes.get('/:id', requireAuth, quoteController.getQuoteById)
quoteRoutes.put('/:id', requireAuth, quoteController.updateQuote)
quoteRoutes.post('/:id/submit', requireAuth, requireProvider, quoteController.submitQuote)
quoteRoutes.post('/:id/accept', requireAuth, quoteController.acceptQuote)
quoteRoutes.post('/:id/reject', requireAuth, quoteController.rejectQuote)

// Q&A Thread endpoints
quoteRoutes.get('/:id/questions', requireAuth, quoteController.listQuestions)
quoteRoutes.post(
  '/:id/questions',
  requireAuth,
  validate({ body: askQuestionSchema }),
  quoteController.askQuestion
)
quoteRoutes.post(
  '/:id/questions/:questionId/answer',
  requireAuth,
  validate({ body: answerQuestionSchema }),
  quoteController.answerQuestion
)
