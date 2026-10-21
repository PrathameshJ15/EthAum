import { Router } from 'express'
import {
  travelController,
  updateTravelPlanSchema,
  toggleChecklistSchema,
} from '../controllers/travelController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

export const travelRoutes = Router()

// Public / General Visa Resource Explorer
travelRoutes.get('/visa', travelController.getVisaResources)

// Case Travel Assistance & Logistics
travelRoutes.get('/:caseId', requireAuth, travelController.getTravelPlan)
travelRoutes.put(
  '/:caseId',
  requireAuth,
  validate({ body: updateTravelPlanSchema }),
  travelController.updateTravelPlan
)
travelRoutes.patch(
  '/:caseId',
  requireAuth,
  validate({ body: updateTravelPlanSchema }),
  travelController.updateTravelPlan
)
travelRoutes.patch(
  '/:caseId/checklist/:itemId',
  requireAuth,
  validate({ body: toggleChecklistSchema }),
  travelController.toggleChecklistItem
)
