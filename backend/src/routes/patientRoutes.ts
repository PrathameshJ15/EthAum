import { Router } from 'express'
import { patientController } from '../controllers/userController.js'
import { requireAuth } from '../middleware/auth.js'

export const patientRoutes = Router()

patientRoutes.get('/profile', requireAuth, patientController.getPatientProfile)
patientRoutes.get('/:userId/profile', requireAuth, patientController.getPatientProfile)
patientRoutes.patch('/:userId/profile', requireAuth, patientController.updatePatientProfile)
