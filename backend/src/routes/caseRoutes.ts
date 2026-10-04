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



