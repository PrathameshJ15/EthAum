import { Appointment, AppointmentStatus, MedicalCaseStatus } from '../types/index.js'
import { journeyService } from './journeyService.js'

const DEFAULT_DAILY_SLOTS = [
  '09:00 AM',
  '10:30 AM',
  '11:45 AM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
]

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    caseId: 'ET-8492',
    patientId: 'pat-1',
    providerId: 'apex-joint-delhi',
    providerName: 'Apex Orthopedic & Robotic Joint Institute',
    doctorId: 'dr-vikram-oberoi',
    doctorName: 'Dr. Vikram Oberoi',
    title: 'Pre-Surgical Video Consultation',
    specialty: 'Adult Knee & Hip Reconstruction',
    consultationType: 'consultation',
    type: 'Telemedicine',
    dateTime: '2026-10-14T14:30:00Z',
    slotTime: '02:00 PM',
    meetingUrl: 'https://meet.ethaum.health/room/ET-8492-SURG',
    status: 'CONFIRMED',
    notes: 'Review coronal MRI and discuss Mako robotic planning.',
    createdAt: '2026-10-01T14:30:00Z',
  },
  {
    id: 'apt-2',
    caseId: 'ET-9011',
    patientId: 'pat-4',
    providerId: 'apex-joint-delhi',
    providerName: 'Apex Orthopedic & Robotic Joint Institute',
    doctorId: 'dr-vikram-oberoi',
    doctorName: 'Dr. Vikram Oberoi',
    title: 'Revision Knee Arthroplasty Assessment',
    specialty: 'Adult Knee & Hip Reconstruction',
    consultationType: 'consultation',
    type: 'Telemedicine',
    dateTime: '2026-10-18T11:00:00Z',
    slotTime: '11:45 AM',
    meetingUrl: 'https://meet.ethaum.health/room/ET-9011-REV',
    status: 'REQUESTED',
    notes: 'Discuss bone loss management and tantalum cone options.',
    createdAt: '2026-10-02T16:00:00Z',
  },
]

export const appointmentService = {
  async listAppointments(filters?: {
    caseId?: string
    patientId?: string
    providerId?: string
    status?: AppointmentStatus
  }): Promise<Appointment[]> {
    let result = [...MOCK_APPOINTMENTS]
    if (filters?.caseId) {
      result = result.filter((a) => a.caseId === filters.caseId)
    }
    if (filters?.patientId) {
      result = result.filter((a) => a.patientId === filters.patientId)
    }
    if (filters?.providerId) {
      result = result.filter((a) => a.providerId === filters.providerId)
    }
    if (filters?.status) {
      result = result.filter((a) => a.status === filters.status)
    }
    return result
  },

  async getAppointmentById(id: string): Promise<Appointment | null> {
    const a = MOCK_APPOINTMENTS.find((item) => item.id === id)
    return a || null
  },

  async getAvailableSlots(doctorId: string, dateStr: string): Promise<string[]> {
    const booked = MOCK_APPOINTMENTS.filter((a) => {
      if (a.doctorId !== doctorId) return false
      if (a.status === 'CANCELLED') return false
      const aptDate = a.dateTime.split('T')[0]
      return aptDate === dateStr
    })

    const bookedSlots = booked.map((b) => b.slotTime || '').filter(Boolean)
    return DEFAULT_DAILY_SLOTS.filter((slot) => !bookedSlots.includes(slot))
  },

  async createAppointment(
    data: Omit<Appointment, 'id' | 'createdAt'> & { status?: AppointmentStatus }
  ): Promise<Appointment> {
    const status: AppointmentStatus = data.status || 'REQUESTED'
    const newAppointment: Appointment = {
      ...data,
      id: `apt-${Date.now()}`,
      status,
      consultationType: data.consultationType || 'consultation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (status === 'CONFIRMED' && !newAppointment.meetingUrl) {
      newAppointment.meetingUrl = `https://meet.ethaum.health/room/${newAppointment.caseId}-${newAppointment.id}`
    }

    MOCK_APPOINTMENTS.push(newAppointment)

    // Add journey event
    try {
      const typeLabel = newAppointment.consultationType === 'follow-up' ? 'Follow-Up' : 'Consultation'
      await journeyService.addJourneyEvent({
        caseId: newAppointment.caseId,
        stage: 'Consultation',
        title: `${typeLabel} ${status === 'CONFIRMED' ? 'Confirmed' : 'Requested'}`,
        description: `${typeLabel} session with ${newAppointment.doctorName || 'specialist'} (${newAppointment.type}) on ${new Date(newAppointment.dateTime).toLocaleDateString()}${newAppointment.slotTime ? ` at ${newAppointment.slotTime}` : ''}.`,
        actorRole: 'patient',
        timestamp: new Date().toISOString(),
      })
    } catch {
      // ignore journey failure
    }

    // Update case status if in earlier stage
    try {
      const { caseService } = await import('./caseService.js')
      const c = await caseService.getCaseById(newAppointment.caseId)
      if (c && ['DRAFT', 'RECORDS_PENDING', 'QUALIFICATION', 'MATCHING', 'QUOTES_RECEIVED', 'PROVIDER_SELECTED'].includes(c.status)) {
        await caseService.updateCaseStatus(newAppointment.caseId, MedicalCaseStatus.CONSULTATION, 'patient')
      }
    } catch {
      // ignore
    }

    return newAppointment
  },

  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment | null> {
    const apt = MOCK_APPOINTMENTS.find((item) => item.id === id)
    if (!apt) return null

    const oldStatus = apt.status
    Object.assign(apt, data, { updatedAt: new Date().toISOString() })

    if (apt.status === 'CONFIRMED' && !apt.meetingUrl) {
      apt.meetingUrl = `https://meet.ethaum.health/room/${apt.caseId}-${apt.id}`
    }

    // Add journey event if status changed
    if (data.status && data.status !== oldStatus) {
      try {
        const typeLabel = apt.consultationType === 'follow-up' ? 'Follow-Up Consultation' : 'Consultation'
        let title = `${typeLabel} Status Updated: ${apt.status}`
        let description = `${typeLabel} with ${apt.doctorName || 'specialist'} has been updated to ${apt.status}.`

        if (apt.status === 'CONFIRMED') {
          title = `${typeLabel} Confirmed by Hospital`
          description = `Clinical session confirmed by ${apt.providerName || 'hospital'}. Encrypted meeting room active.`
        } else if (apt.status === 'COMPLETED') {
          title = `${typeLabel} Completed`
          description = `Clinical consultation completed with ${apt.doctorName || 'surgeon'}. Patient is cleared to proceed with treatment booking.`
        } else if (apt.status === 'CANCELLED') {
          title = `${typeLabel} Cancelled`
          description = `Appointment on ${new Date(apt.dateTime).toLocaleDateString()} was cancelled.`
        } else if (apt.status === 'NO_SHOW') {
          title = `${typeLabel} No-Show Recorded`
          description = `Patient was not present for scheduled consultation slot.`
        }

        await journeyService.addJourneyEvent({
          caseId: apt.caseId,
          stage: 'Consultation',
          title,
          description,
          actorRole: 'provider',
          timestamp: new Date().toISOString(),
        })
      } catch {
        // ignore
      }
    }

    return apt
  },
}
