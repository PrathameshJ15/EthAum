import { Router } from 'express'
import {
  caseController,
  createCaseSchema,
  updateStatusSchema,
  submitCorrectionSchema,
} from '../controllers/caseController.js'
import { providerController } from '../controllers/providerController.js'
import { validate } from '../middleware/validate.js'
import { requireAuth } from '../middleware/auth.js'

export const caseRoutes = Router()

caseRoutes.get('/', requireAuth, caseController.listCases)
caseRoutes.get('/:id', requireAuth, caseController.getCaseById)
caseRoutes.post('/', requireAuth, validate({ body: createCaseSchema }), caseController.createCase)
caseRoutes.patch('/:id/status', requireAuth, validate({ body: updateStatusSchema }), caseController.updateCaseStatus)

// AI Case Coordination Summary & Patient Feedback/Correction routes
caseRoutes.post('/:id/summary/generate', requireAuth, caseController.generateSummary)
caseRoutes.get('/:id/summary', requireAuth, caseController.getSummary)
caseRoutes.post(
  '/:id/summary/corrections',
  requireAuth,
  validate({ body: submitCorrectionSchema }),
  caseController.submitCorrection
)

// Provider Matching Pipeline routes
caseRoutes.get('/:id/matches', requireAuth, (req, res, next) => {
  req.params.caseId = req.params.id
  providerController.matchProviders(req, res, next)
})
caseRoutes.post('/:id/matches', requireAuth, (req, res, next) => {
  req.params.caseId = req.params.id
  providerController.matchProviders(req, res, next)
})

// Treatment Booking route
caseRoutes.post('/:id/book', requireAuth, async (req, res, next) => {
  try {
    const { bookingController } = await import('../controllers/bookingController.js')
    req.body.caseId = req.params.id
    return bookingController.createBooking(req, res, next)
  } catch (err) {
    next(err)
  }
})

// Journey Summary & Progression
caseRoutes.get('/:id/journey', requireAuth, async (req, res, next) => {
  try {
    const { journeyController } = await import('../controllers/journeyController.js')
    req.params.caseId = req.params.id
    return journeyController.getJourneySummary(req, res, next)
  } catch (err) {
    next(err)
  }
})

// Aftercare Plan & Resources
caseRoutes.get('/:id/aftercare', requireAuth, async (req, res, next) => {
  try {
    const { aftercareController } = await import('../controllers/aftercareController.js')
    req.params.caseId = req.params.id
    return aftercareController.getAftercarePlan(req, res, next)
  } catch (err) {
    next(err)
  }
})

// Travel Assistance & Visa Coordination
caseRoutes.get('/:id/travel', requireAuth, async (req, res, next) => {
  try {
    const { travelController } = await import('../controllers/travelController.js')
    req.params.caseId = req.params.id
    return travelController.getTravelPlan(req, res, next)
  } catch (err) {
    next(err)
  }
})

caseRoutes.put('/:id/travel', requireAuth, async (req, res, next) => {
  try {
    const forbiddenKeys = ['passportNumber', 'passport_number', 'ssn', 'nationalId', 'passportPhoto']
    for (const fk of forbiddenKeys) {
      if (fk in req.body && req.body[fk] !== undefined) {
        const { ValidationError } = await import('../utils/apiError.js')
        throw new ValidationError('Security restriction: EthAum does not store passport numbers or identity credentials.')
      }
    }
    const { travelController, updateTravelPlanSchema } = await import('../controllers/travelController.js')
    const parsed = updateTravelPlanSchema.parse(req.body)
    req.body = parsed
    req.params.caseId = req.params.id
    return travelController.updateTravelPlan(req, res, next)
  } catch (err) {
    next(err)
  }
})

// Case Payment Records
caseRoutes.get('/:id/payments', requireAuth, async (req, res, next) => {
  try {
    const { paymentController } = await import('../controllers/paymentController.js')
    req.query.caseId = req.params.id
    return paymentController.listPayments(req, res, next)
  } catch (err) {
    next(err)
  }
})




