import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { providerService } from '../services/providerService.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { NotFoundError, ForbiddenError, UnauthorizedError, ValidationError } from '../utils/apiError.js'
import { providerMatchingService } from '../services/providerMatchingService.js'

export const updateProfileSchema = z.object({
  name: z.string().optional(),
  tagline: z.string().optional(),
  overview: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  beds: z.number().optional(),
  facilities: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  internationalSupport: z
    .object({
      airportConcierge: z.string().optional(),
      visaAssistance: z.string().optional(),
      translators: z.string().optional(),
      accommodation: z.string().optional(),
    })
    .optional(),
})

export const createTreatmentSchema = z.object({
  treatmentId: z.string().min(1, 'Treatment ID is required'),
  name: z.string().min(1, 'Treatment name is required'),
  startingPriceUSD: z.number().positive('Starting price must be greater than zero'),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).optional(),
})

export const updateTreatmentSchema = z.object({
  name: z.string().optional(),
  startingPriceUSD: z.number().positive().optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
})

export const providerController = {
  async listProviders(req: Request, res: Response, next: NextFunction) {
    try {
      const country = req.query.country as string
      const search = req.query.search as string
      const providers = await providerService.listProviders({ country, search })
      return sendSuccess(res, providers)
    } catch (err) {
      next(err)
    }
  },

  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      if (req.user.role !== 'provider' && req.user.role !== 'admin') {
        throw new ForbiddenError('Only authenticated providers can access the provider dashboard')
      }

      const providerId = req.user.providerId || req.user.id
      const dashboard = await providerService.getProviderDashboard(providerId)
      return sendSuccess(res, dashboard, 'Provider dashboard loaded successfully')
    } catch (err) {
      next(err)
    }
  },

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      const providerId = req.user.providerId || req.user.id
      const provider = await providerService.getProviderById(providerId)
      if (!provider) {
        throw new NotFoundError(`Provider profile for '${providerId}' not found`)
      }
      return sendSuccess(res, provider)
    } catch (err) {
      next(err)
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      if (req.user.role !== 'provider' && req.user.role !== 'admin') {
        throw new ForbiddenError('Only providers can update their profile')
      }

      const providerId = req.user.providerId || req.user.id
      const updated = await providerService.updateProvider(providerId, req.body)
      if (!updated) {
        throw new NotFoundError(`Provider '${providerId}' not found`)
      }
      return sendSuccess(res, updated, 'Provider profile updated successfully')
    } catch (err) {
      next(err)
    }
  },

  async listTreatments(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      const providerId = req.user.providerId || req.user.id
      const treatments = await providerService.getTreatments(providerId)
      return sendSuccess(res, treatments)
    } catch (err) {
      next(err)
    }
  },

  async createTreatment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      if (req.user.role !== 'provider' && req.user.role !== 'admin') {
        throw new ForbiddenError('Only providers can manage treatment offerings')
      }

      const providerId = req.user.providerId || req.user.id
      const treatment = await providerService.addTreatment(providerId, req.body)
      if (!treatment) {
        throw new NotFoundError(`Provider '${providerId}' not found`)
      }
      return sendSuccess(res, treatment, 'Treatment offering added successfully', 201)
    } catch (err) {
      next(err)
    }
  },

  async updateTreatment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      if (req.user.role !== 'provider' && req.user.role !== 'admin') {
        throw new ForbiddenError('Only providers can manage treatment offerings')
      }

      const providerId = req.user.providerId || req.user.id
      const treatmentId = req.params.treatmentId as string
      const updated = await providerService.updateTreatment(providerId, treatmentId, req.body)
      if (!updated) {
        throw new NotFoundError(`Treatment '${treatmentId}' not found for provider '${providerId}'`)
      }
      return sendSuccess(res, updated, 'Treatment offering updated successfully')
    } catch (err) {
      next(err)
    }
  },

  async deleteTreatment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError()
      if (req.user.role !== 'provider' && req.user.role !== 'admin') {
        throw new ForbiddenError('Only providers can manage treatment offerings')
      }

      const providerId = req.user.providerId || req.user.id
      const treatmentId = req.params.treatmentId as string
      const deleted = await providerService.deleteTreatment(providerId, treatmentId)
      if (!deleted) {
        throw new NotFoundError(`Treatment '${treatmentId}' not found for provider '${providerId}'`)
      }
      return sendSuccess(res, { deleted: true }, 'Treatment offering deleted successfully')
    } catch (err) {
      next(err)
    }
  },

  async getProviderById(req: Request, res: Response, next: NextFunction) {
    try {
      const providerId = req.params.id as string
      const provider = await providerService.getProviderById(providerId)
      if (!provider) {
        throw new NotFoundError(`Hospital provider '${providerId}' not found`)
      }
      return sendSuccess(res, provider)
    } catch (err) {
      next(err)
    }
  },

  async matchProviders(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = (req.params.caseId || req.params.id || req.query.caseId || req.body.caseId) as string
      if (!caseId) {
        throw new ValidationError('Case ID is required to match providers')
      }
      const destinationFilter = (req.query.destination || req.body.destinationFilter) as string | undefined
      const maxResults = req.query.maxResults ? parseInt(req.query.maxResults as string, 10) : undefined
      const includeAiExplanations = req.query.includeAi !== 'false' && req.body.includeAiExplanations !== false

      const result = await providerMatchingService.matchProvidersForCase(caseId, {
        destinationFilter,
        maxResults,
        includeAiExplanations,
      })

      return sendSuccess(res, result, 'Provider matches evaluated and ranked successfully')
    } catch (err) {
      next(err)
    }
  },
}
