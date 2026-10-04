import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { bookingService } from '../services/bookingService.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { NotFoundError } from '../utils/apiError.js'

export const createBookingSchema = z.object({
  caseId: z.string().min(1, 'Case ID is required'),
  admissionDate: z.string().min(1, 'Admission date is required'),
  packagePrice: z.number().positive('Package price must be greater than zero'),
  currency: z.string().default('USD'),
  depositAmount: z.number().optional().default(500),
  providerId: z.string().optional(),
  providerName: z.string().optional(),
  doctorId: z.string().optional(),
  doctorName: z.string().optional(),
  treatmentId: z.string().optional(),
  treatmentName: z.string().optional(),
  estimatedStayDays: z.number().optional().default(10),
  companionNotes: z.string().optional(),
  specialRequirements: z.array(z.string()).optional(),
  mockPayment: z
    .object({
      method: z.string().default('SOVEREIGN_MOCK_ESCROW'),
      holderName: z.string().optional().default('Verified Patient'),
      last4: z.string().optional().default('4242'),
    })
    .optional(),
})

export const bookingController = {
  async listBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = req.query.caseId as string
      let patientId = req.query.patientId as string
      let providerId = req.query.providerId as string

      if (req.user?.role === 'patient') {
        patientId = req.user.patientId || req.user.id
      } else if (req.user?.role === 'provider') {
        providerId = req.user.providerId || req.user.id
      }

      const bookings = await bookingService.listBookings({ caseId, patientId, providerId })
      return sendSuccess(res, bookings)
    } catch (err) {
      next(err)
    }
  },

  async getBookingById(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.getBookingById(req.params.id as string)
      if (!booking) {
        throw new NotFoundError(`Booking '${req.params.id}' not found`)
      }
      return sendSuccess(res, booking)
    } catch (err) {
      next(err)
    }
  },

  async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = req.user?.patientId || req.user?.id
      const patientName = req.user?.name

      const booking = await bookingService.createBooking({
        ...req.body,
        patientId,
        patientName,
      })

      return sendSuccess(
        res,
        booking,
        'Treatment admission officially booked with mock escrow deposit authorization',
        201
      )
    } catch (err) {
      next(err)
    }
  },
}
