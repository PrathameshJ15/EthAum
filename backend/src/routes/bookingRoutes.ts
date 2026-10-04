import { Router } from 'express'
import { bookingController, createBookingSchema } from '../controllers/bookingController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

export const bookingRoutes = Router()

bookingRoutes.get('/', requireAuth, bookingController.listBookings)
bookingRoutes.get('/:id', requireAuth, bookingController.getBookingById)
bookingRoutes.post(
  '/',
  requireAuth,
  validate({ body: createBookingSchema }),
  bookingController.createBooking
)
