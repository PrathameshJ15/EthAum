import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { travelService, OFFICIAL_VISA_RESOURCES, DEFAULT_VISA_RESOURCE } from '../services/travelService.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { UnauthorizedError } from '../utils/apiError.js'

export const updateTravelPlanSchema = z.object({
  departureDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}/, 'Departure date must be in YYYY-MM-DD format')
    .optional(),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}/, 'Return date must be in YYYY-MM-DD format')
    .optional(),
  destinationCountry: z.string().max(100).optional(),
  destinationCity: z.string().max(100).optional(),
  travelStatus: z
    .enum(['PLANNING', 'BOOKED', 'IN_TRANSIT', 'ARRIVED', 'POST_PROCEDURE_RECOVERY', 'COMPLETED'])
    .optional(),
  coordinationNotes: z.string().max(2000).optional(),
  flightDetails: z
    .object({
      airline: z.string().max(100).optional(),
      flightNumber: z.string().max(50).optional(),
      departureAirport: z.string().max(100).optional(),
      arrivalAirport: z.string().max(100).optional(),
      departureDate: z.string().optional(),
      arrivalDate: z.string().optional(),
      bookingReference: z.string().max(50).optional(),
    })
    .optional(),
  accommodationDetails: z
    .object({
      facilityName: z.string().max(150).optional(),
      address: z.string().max(250).optional(),
      checkInDate: z.string().optional(),
      checkOutDate: z.string().optional(),
      bookingReference: z.string().max(50).optional(),
      companionIncluded: z.boolean().optional(),
      notes: z.string().max(1000).optional(),
    })
    .optional(),
  groundTransfer: z
    .object({
      transferType: z.enum(['HOSPITAL_VAN', 'PRIVATE_CAR', 'TAXI_RIDESHARE', 'SELF_ARRANGED']).optional(),
      wheelchairAccessible: z.boolean().optional(),
      flightTrackingEnabled: z.boolean().optional(),
      driverNotes: z.string().max(500).optional(),
      status: z.enum(['REQUESTED', 'CONFIRMED', 'NOT_NEEDED']).optional(),
    })
    .optional(),
  checklist: z
    .array(
      z.object({
        id: z.string(),
        task: z.string(),
        completed: z.boolean(),
        category: z.enum(['VISA', 'MEDICAL', 'LOGISTICS', 'PACKING']),
        essential: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .optional(),
})
  .passthrough()
  .superRefine((data: any, ctx) => {
    const forbiddenKeys = ['passportNumber', 'passport_number', 'ssn', 'nationalId', 'passportPhoto']
    for (const fk of forbiddenKeys) {
      if (fk in data && data[fk] !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Security restriction: EthAum does not store passport numbers or identity credentials.',
          path: [fk],
        })
      }
    }
  })

export const toggleChecklistSchema = z.object({
  completed: z.boolean({ required_error: 'completed boolean is required' }),
})

export const travelController = {
  async getTravelPlan(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required to view travel planning records')
      }

      const caseId = (req.params.caseId || req.params.id) as string
      const plan = await travelService.getTravelPlan(caseId, req.user)
      return sendSuccess(res, plan, 'Travel assistance & visa coordination plan retrieved successfully')
    } catch (err) {
      next(err)
    }
  },

  async updateTravelPlan(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required to update travel details')
      }

      const caseId = (req.params.caseId || req.params.id) as string
      const updated = await travelService.updateTravelPlan(caseId, req.body, req.user)
      return sendSuccess(res, updated, 'Travel details and preparation logistics updated successfully')
    } catch (err) {
      next(err)
    }
  },

  async toggleChecklistItem(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required to update checklist items')
      }

      const caseId = (req.params.caseId || req.params.id) as string
      const itemId = req.params.itemId as string
      const { completed } = req.body

      const updated = await travelService.toggleChecklistItem(caseId, itemId, completed, req.user)
      return sendSuccess(res, updated, 'Checklist status updated')
    } catch (err) {
      next(err)
    }
  },

  async getVisaResources(req: Request, res: Response, next: NextFunction) {
    try {
      const destination = (req.query.destination as string) || ''
      if (destination) {
        const resource = travelService.getVisaResourceForDestination(destination)
        return sendSuccess(res, resource, `Official visa guidelines for ${resource.country}`)
      }
      return sendSuccess(
        res,
        {
          destinations: OFFICIAL_VISA_RESOURCES,
          default: DEFAULT_VISA_RESOURCE,
        },
        'All official government visa resources'
      )
    } catch (err) {
      next(err)
    }
  },
}
