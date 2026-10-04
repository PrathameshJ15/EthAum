import { Router } from 'express'
import { treatmentController } from '../controllers/treatmentController.js'

export const treatmentRoutes = Router()

treatmentRoutes.get('/', treatmentController.listTreatments)
treatmentRoutes.get('/:id', treatmentController.getTreatmentById)
