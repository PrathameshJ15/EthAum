import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { appointmentService } from '../services/appointmentService.js'
import { doctorService } from '../services/doctorService.js'
import { providerService } from '../services/providerService.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { NotFoundError, ValidationError } from '../utils/apiError.js'
import { AppointmentStatus } from '../types/index.js'

export const createAppointmentSchema = z.object({
  caseId: z.string().min(1, 'Case ID is required'),
  patientId: z.string().optional(),
  providerId: z.string().min(1, 'Provider ID is required'),
  providerName: z.string().optional(),
  doctorId: z.string().optional(),
  doctorName: z.string().optional(),
  specialty: z.string().optional(),
  consultationType: z.enum(['consultation', 'follow-up']).default('consultation'),
  title: z.string().optional(),
  type: z.enum(['Telemedicine', 'In-Person Consultation', 'Pre-Op Assessment']).default('Telemedicine'),
  dateTime: z.string().min(1, 'Scheduled date and time is required'),
  slotTime: z.string().optional(),
  notes: z.string().optional(),
  status: z
    .enum([
      'REQUESTED',
      'CONFIRMED',
      'COMPLETED',
      'CANCELLED',
      'NO_SHOW',
      'Scheduled',
      'Confirmed',
      'Completed',
      'Cancelled',
    ])
    .optional(),
})

export const updateAppointmentSchema = z.object({
  status: z
    .enum([
      'REQUESTED',
      'CONFIRMED',
      'COMPLETED',
      'CANCELLED',
      'NO_SHOW',
      'Scheduled',
      'Confirmed',
      'Completed',
      'Cancelled',
      'Rescheduled',
    ])
    .optional(),
  dateTime: z.string().optional(),
  slotTime: z.string().optional(),
  meetingUrl: z.string().optional(),
  notes: z.string().optional(),
})

export const appointmentController = {
  async listAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = req.query.caseId as string
      const patientId = req.query.patientId as string
      const status = req.query.status as AppointmentStatus | undefined
      let providerId = req.query.providerId as string
      if (!providerId && req.user?.role === 'provider') {
        providerId = req.user.providerId || req.user.id
      }
      const appointments = await appointmentService.listAppointments({
        caseId,
        patientId,
        providerId,
        status,
      })
      return sendSuccess(res, appointments)
    } catch (err) {
      next(err)
    }
  },

  async getAppointmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const apt = await appointmentService.getAppointmentById(req.params.id as string)
      if (!apt) {
        throw new NotFoundError(`Appointment '${req.params.id}' not found`)
      }
      return sendSuccess(res, apt)
    } catch (err) {
      next(err)
    }
  },

  async getAvailableSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = (req.query.doctorId as string) || 'dr-vikram-oberoi'
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0]
      const slots = await appointmentService.getAvailableSlots(doctorId, date)
      return sendSuccess(res, { doctorId, date, availableSlots: slots })
    } catch (err) {
      next(err)
    }
  },

  async createAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = req.body.patientId || req.user?.patientId || req.user?.id || 'pat-1'
      let doctorName = req.body.doctorName
      let specialty = req.body.specialty
      if (req.body.doctorId && !doctorName) {
        const doc = await doctorService.getDoctorById(req.body.doctorId)
        if (doc) {
          doctorName = doc.name
          specialty = doc.specialty
        }
      }

      let providerName = req.body.providerName
      if (req.body.providerId && !providerName) {
        const prov = await providerService.getProviderById(req.body.providerId)
        if (prov) {
          providerName = prov.name
        }
      }

      const consultationType = req.body.consultationType || 'consultation'
      const title =
        req.body.title ||
        (consultationType === 'follow-up'
          ? 'Post-Procedure Follow-Up Consultation'
          : 'Pre-Surgical Video Consultation')

      const apt = await appointmentService.createAppointment({
        ...req.body,
        patientId,
        doctorName: doctorName || 'Clinical Specialist',
        specialty,
        providerName: providerName || 'Partner Hospital',
        title,
        status: req.body.status || 'REQUESTED',
      })

      return sendSuccess(res, apt, 'Consultation appointment scheduled successfully', 201)
    } catch (err) {
      next(err)
    }
  },

  async updateAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const apt = await appointmentService.updateAppointment(req.params.id as string, req.body)
      if (!apt) {
        throw new NotFoundError(`Appointment '${req.params.id}' not found`)
      }
      return sendSuccess(res, apt, 'Appointment updated successfully')
    } catch (err) {
      next(err)
    }
  },

  async confirmAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const apt = await appointmentService.updateAppointment(req.params.id as string, {
        status: 'CONFIRMED',
      })
      if (!apt) {
        throw new NotFoundError(`Appointment '${req.params.id}' not found`)
      }
      return sendSuccess(res, apt, 'Consultation confirmed by hospital')
    } catch (err) {
      next(err)
    }
  },

  async completeAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const apt = await appointmentService.updateAppointment(req.params.id as string, {
        status: 'COMPLETED',
      })
      if (!apt) {
        throw new NotFoundError(`Appointment '${req.params.id}' not found`)
      }
      return sendSuccess(res, apt, 'Consultation marked as completed')
    } catch (err) {
      next(err)
    }
  },

  async cancelAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const apt = await appointmentService.updateAppointment(req.params.id as string, {
        status: 'CANCELLED',
      })
      if (!apt) {
        throw new NotFoundError(`Appointment '${req.params.id}' not found`)
      }
      return sendSuccess(res, apt, 'Consultation cancelled successfully')
    } catch (err) {
      next(err)
    }
  },
}

