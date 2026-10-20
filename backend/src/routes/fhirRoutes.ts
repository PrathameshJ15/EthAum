import { Router } from 'express'
import { fhirController } from '../controllers/fhirController.js'
import { requireAuth } from '../middleware/auth.js'

export const fhirRoutes = Router()

// Public / diagnostic validation endpoints
fhirRoutes.post('/validate', fhirController.validate)
fhirRoutes.get('/sample-bundle', fhirController.getSyntheticSample)

// Case-specific FHIR R4 interoperability routes
fhirRoutes.get('/cases/:id/preview', requireAuth, fhirController.previewExport)
fhirRoutes.get('/cases/:id/export', requireAuth, fhirController.exportBundle)
fhirRoutes.post('/cases/:id/import/stage', requireAuth, fhirController.stageImport)
fhirRoutes.post('/cases/:id/import/confirm', requireAuth, fhirController.confirmImport)
fhirRoutes.get('/cases/:id/operations', requireAuth, fhirController.getOperations)
