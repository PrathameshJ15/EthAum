import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { quoteService } from '../services/quoteService.js'
import { providerService } from '../services/providerService.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { NotFoundError, UnauthorizedError, ForbiddenError, ValidationError } from '../utils/apiError.js'

export const createQuoteSchema = z.object({
  caseId: z.string().min(1, 'Case ID is required'),
  treatmentId: z.string().min(1, 'Treatment ID is required'),
  treatmentName: z.string().min(1, 'Treatment name is required'),
  price: z.number().positive().optional(),
  total: z.number().positive().optional(),
  currency: z.string().optional().default('USD'),
  consultation: z
    .object({
      description: z.string().optional().default('Pre-operative specialist clinical consultation'),
      cost: z.number().nonnegative().optional().default(0),
    })
    .optional(),
  diagnostics: z
    .object({
      description: z.string().optional().default('Pre-admission diagnostics and laboratory workup'),
      cost: z.number().nonnegative().optional().default(0),
    })
    .optional(),
  accommodation: z
    .object({
      applicable: z.boolean().default(true),
      roomType: z.string().optional(),
      nights: z.number().nonnegative().optional(),
      cost: z.number().nonnegative().optional(),
      notes: z.string().optional(),
    })
    .optional(),
  otherServices: z
    .object({
      description: z.string().optional().default('Support services, transfers & coordination'),
      cost: z.number().nonnegative().optional().default(0),
      items: z.array(z.string()).optional(),
    })
    .optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.union([z.array(z.string()), z.string()]).optional(),
  notes: z.string().optional(),
  estimatedStayDays: z.number().optional(),
  validity: z.string().optional(),
  validUntil: z.string().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'PENDING']).optional(),
})

export const askQuestionSchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters long'),
})

export const answerQuestionSchema = z.object({
  answer: z.string().min(2, 'Answer must be at least 2 characters long'),
})

export const quoteController = {
  async listQuotes(req: Request, res: Response, next: NextFunction) {
    try {
      const providerIdParam = req.query.providerId as string | undefined
      if (providerIdParam) {
        const quotes = await quoteService.listQuotesByProvider(providerIdParam)
        return sendSuccess(res, quotes)
      }

      const user = req.user
      const role = user?.role || 'patient'

      if (role === 'provider') {
        const pId = user?.providerId || user?.id || 'apex-joint-delhi'
        // If caseId is explicitly provided in query, list for case from provider perspective
        const caseIdParam = req.query.caseId as string | undefined
        if (caseIdParam) {
          const quotes = await quoteService.listQuotesByCase(caseIdParam, 'provider', pId)
          return sendSuccess(res, quotes)
        }
        const quotes = await quoteService.listQuotesByProvider(pId)
        return sendSuccess(res, quotes)
      }

      // Default: patient view for specified case
      const caseId = (req.query.caseId as string) || 'ET-8492'
      const quotes = await quoteService.listQuotesByCase(caseId, 'patient')
      return sendSuccess(res, quotes)
    } catch (err) {
      next(err)
    }
  },

  async getQuoteById(req: Request, res: Response, next: NextFunction) {
    try {
      const quoteId = req.params.id as string
      const quote = await quoteService.getQuoteById(quoteId)
      if (!quote) {
        throw new NotFoundError(`Quote '${quoteId}' not found`)
      }
      return sendSuccess(res, quote)
    } catch (err) {
      next(err)
    }
  },

  async createQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user
      if (!user) throw new UnauthorizedError()
      if (user.role !== 'provider' && user.role !== 'admin') {
        throw new ForbiddenError('Only authenticated providers can create quotes')
      }

      const providerId = user.providerId || user.id
      const provider = await providerService.getProviderById(providerId)
      const providerName = provider?.name || user.name || 'Healthcare Provider'

      const newQuote = await quoteService.createQuote({
        ...req.body,
        providerId,
        providerName,
        providerCity: provider?.city,
        providerCountry: provider?.country,
        providerFlag: provider?.flag,
        providerAccreditation: provider?.accreditations?.join(' & '),
        providerRating: provider?.rating,
      })

      const statusMsg =
        newQuote.status === 'DRAFT'
          ? 'Quote saved as draft successfully'
          : 'Institutional quote created and submitted successfully to patient'

      return sendSuccess(res, newQuote, statusMsg, 201)
    } catch (err) {
      next(err)
    }
  },

  async updateQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user
      if (!user) throw new UnauthorizedError()
      if (user.role !== 'provider' && user.role !== 'admin') {
        throw new ForbiddenError('Only providers can update quotes')
      }

      const quoteId = req.params.id as string
      const providerId = user.providerId || user.id
      const updated = await quoteService.updateQuote(quoteId, req.body, providerId)
      if (!updated) {
        throw new NotFoundError(`Quote '${quoteId}' not found`)
      }

      return sendSuccess(res, updated, 'Quote updated successfully')
    } catch (err) {
      next(err)
    }
  },

  async submitQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user
      if (!user) throw new UnauthorizedError()
      if (user.role !== 'provider' && user.role !== 'admin') {
        throw new ForbiddenError('Only providers can submit quotes')
      }

      const quoteId = req.params.id as string
      const providerId = user.providerId || user.id
      const submitted = await quoteService.submitQuote(quoteId, providerId)
      if (!submitted) {
        throw new NotFoundError(`Quote '${quoteId}' not found`)
      }

      return sendSuccess(res, submitted, 'Quote submitted to patient successfully')
    } catch (err) {
      next(err)
    }
  },

  async acceptQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = req.user?.id
      if (!patientId) {
        throw new UnauthorizedError()
      }
      const quoteId = req.params.id as string
      const quote = await quoteService.acceptQuote(quoteId, patientId)
      if (!quote) {
        throw new NotFoundError(`Quote '${quoteId}' not found`)
      }
      return sendSuccess(
        res,
        quote,
        `Institutional quote accepted. Provider '${quote.providerName}' selected for this case. No payment processed.`
      )
    } catch (err) {
      next(err)
    }
  },

  async rejectQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = req.user?.id
      if (!patientId) {
        throw new UnauthorizedError()
      }
      const quoteId = req.params.id as string
      const reason = req.body?.reason as string | undefined
      const quote = await quoteService.rejectQuote(quoteId, patientId, reason)
      if (!quote) {
        throw new NotFoundError(`Quote '${quoteId}' not found`)
      }
      return sendSuccess(res, quote, 'Quote declined successfully')
    } catch (err) {
      next(err)
    }
  },

  async listQuestions(req: Request, res: Response, next: NextFunction) {
    try {
      const quoteId = req.params.id as string
      const quote = await quoteService.getQuoteById(quoteId)
      if (!quote) {
        throw new NotFoundError(`Quote '${quoteId}' not found`)
      }
      return sendSuccess(res, quote.questions || [])
    } catch (err) {
      next(err)
    }
  },

  async askQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user
      if (!user) throw new UnauthorizedError()

      const quoteId = req.params.id as string
      const questionText = req.body.question as string
      if (!questionText || questionText.trim().length < 3) {
        throw new ValidationError('Question text is required (at least 3 characters)')
      }

      const patientId = user.id
      const patientName = user.name || 'Patient'

      const question = await quoteService.addQuestion(quoteId, patientId, patientName, questionText)
      if (!question) {
        throw new NotFoundError(`Quote '${quoteId}' not found`)
      }

      return sendSuccess(res, question, 'Question submitted to healthcare provider', 201)
    } catch (err) {
      next(err)
    }
  },

  async answerQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user
      if (!user) throw new UnauthorizedError()
      if (user.role !== 'provider' && user.role !== 'admin') {
        throw new ForbiddenError('Only authenticated providers can answer quote inquiries')
      }

      const quoteId = req.params.id as string
      const questionId = req.params.questionId as string
      const answerText = req.body.answer as string
      if (!answerText || answerText.trim().length < 2) {
        throw new ValidationError('Answer text is required')
      }

      const providerName = user.name || 'Medical Specialist'
      const answered = await quoteService.answerQuestion(quoteId, questionId, providerName, answerText)
      if (!answered) {
        throw new NotFoundError(`Question '${questionId}' or quote '${quoteId}' not found`)
      }

      return sendSuccess(res, answered, 'Response submitted to patient')
    } catch (err) {
      next(err)
    }
  },
}
