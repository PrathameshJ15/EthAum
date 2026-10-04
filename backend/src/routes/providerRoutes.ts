import { Router } from 'express'
import {
  providerController,
  updateProfileSchema,
  createTreatmentSchema,
  updateTreatmentSchema,
} from '../controllers/providerController.js'
import { requireAuth, requireProvider } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

export const providerRoutes = Router()

// Public provider listings & matching
providerRoutes.get('/', providerController.listProviders)
providerRoutes.get('/match/:caseId', providerController.matchProviders)
providerRoutes.post('/match', providerController.matchProviders)

// Provider Portal Endpoints (Authenticated Provider)
providerRoutes.get('/dashboard', requireAuth, requireProvider, providerController.getDashboard)
providerRoutes.get('/profile', requireAuth, requireProvider, providerController.getProfile)
providerRoutes.patch(
  '/profile',
  requireAuth,
  requireProvider,
  validate({ body: updateProfileSchema }),
  providerController.updateProfile
)

// Provider Treatments Management
providerRoutes.get('/treatments', requireAuth, requireProvider, providerController.listTreatments)
providerRoutes.post(
  '/treatments',
  requireAuth,
  requireProvider,
  validate({ body: createTreatmentSchema }),
  providerController.createTreatment
)
providerRoutes.patch(
  '/treatments/:treatmentId',
  requireAuth,
  requireProvider,
  validate({ body: updateTreatmentSchema }),
  providerController.updateTreatment
)
providerRoutes.delete(
  '/treatments/:treatmentId',
  requireAuth,
  requireProvider,
  providerController.deleteTreatment
)

// Individual provider lookup (must follow named paths)
providerRoutes.get('/:id', providerController.getProviderById)

