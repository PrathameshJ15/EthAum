import { Router } from 'express'
import { journeyController } from '../controllers/journeyController.js'
import { requireAuth } from '../middleware/auth.js'

export const journeyRoutes = Router()

// Journey event logs
journeyRoutes.get('/', requireAuth, journeyController.getJourneyEvents)
journeyRoutes.get('/events/:caseId', requireAuth, journeyController.getJourneyEvents)

// Complete 11-stage journey summary & state
journeyRoutes.get('/:caseId/summary', requireAuth, journeyController.getJourneySummary)
journeyRoutes.patch('/:caseId/stage', requireAuth, journeyController.updateStage)

// Fallback caseId route
journeyRoutes.get('/:caseId', requireAuth, journeyController.getJourneyEvents)
