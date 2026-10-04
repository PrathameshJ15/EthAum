import { Router } from 'express'
import {
  appointmentController,
  createAppointmentSchema,
  updateAppointmentSchema,
} from '../controllers/appointmentController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

export const appointmentRoutes = Router()

// Slots availability (must be placed before /:id)
appointmentRoutes.get('/slots', requireAuth, appointmentController.getAvailableSlots)

appointmentRoutes.get('/', requireAuth, appointmentController.listAppointments)
appointmentRoutes.get('/:id', requireAuth, appointmentController.getAppointmentById)
appointmentRoutes.post(
  '/',
  requireAuth,
  validate({ body: createAppointmentSchema }),
  appointmentController.createAppointment
)
appointmentRoutes.patch(
  '/:id',
  requireAuth,
  validate({ body: updateAppointmentSchema }),
  appointmentController.updateAppointment
)
appointmentRoutes.post('/:id/confirm', requireAuth, appointmentController.confirmAppointment)
appointmentRoutes.post('/:id/complete', requireAuth, appointmentController.completeAppointment)
appointmentRoutes.post('/:id/cancel', requireAuth, appointmentController.cancelAppointment)

