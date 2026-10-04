import { TreatmentBooking, MedicalCaseStatus } from '../types/index.js'
import { caseService } from './caseService.js'
import { journeyService } from './journeyService.js'
import { appointmentService } from './appointmentService.js'
import { NotFoundError, ValidationError } from '../utils/apiError.js'

const MOCK_BOOKINGS: TreatmentBooking[] = [
  {
    id: 'bk-1001',
    caseId: 'ET-8492',
    patientId: 'pat-1',
    patientName: 'Eleanor Vance',
    providerId: 'apex-joint-delhi',
    providerName: 'Apex Orthopedic & Robotic Joint Institute',
    doctorId: 'dr-vikram-oberoi',
    doctorName: 'Dr. Vikram Oberoi',
    treatmentId: 'knee-replacement',
    treatmentName: 'Total Knee Replacement (Robotic Mako/Rosa)',
    admissionDate: '2026-11-15',
    estimatedStayDays: 10,
    packagePrice: 6500,
    currency: 'USD',
    depositAmount: 500,
    mockPaymentRef: 'MOCK-ESCROW-TX9402',
    paymentStatus: 'MOCK_ESCROW_AUTHORIZED',
    companionNotes: 'Requires private executive suite accommodating traveling spouse.',
    specialRequirements: ['Airport Chauffeur Transfer', 'Post-Op Physical Therapy'],
    status: 'CONFIRMED',
    createdAt: '2026-10-02T12:00:00Z',
  },
]

export interface CreateBookingInput {
  caseId: string
  patientId?: string
  patientName?: string
  providerId?: string
  providerName?: string
  doctorId?: string
  doctorName?: string
  treatmentId?: string
  treatmentName?: string
  admissionDate: string
  estimatedStayDays?: number
  packagePrice: number
  currency?: string
  depositAmount?: number
  companionNotes?: string
  specialRequirements?: string[]
  mockPayment?: {
    method?: string
    holderName?: string
    last4?: string
  }
}

export const bookingService = {
  async listBookings(filters?: {
    patientId?: string
    providerId?: string
    caseId?: string
  }): Promise<TreatmentBooking[]> {
    let result = [...MOCK_BOOKINGS]
    if (filters?.caseId) {
      result = result.filter((b) => b.caseId === filters.caseId)
    }
    if (filters?.patientId) {
      result = result.filter((b) => b.patientId === filters.patientId)
    }
    if (filters?.providerId) {
      result = result.filter((b) => b.providerId === filters.providerId)
    }
    return result
  },

  async getBookingById(id: string): Promise<TreatmentBooking | null> {
    const booking = MOCK_BOOKINGS.find((b) => b.id === id)
    return booking || null
  },

  async createBooking(input: CreateBookingInput): Promise<TreatmentBooking> {
    const c = await caseService.getCaseById(input.caseId)
    if (!c) {
      throw new NotFoundError(`Case #${input.caseId} not found`)
    }

    const patientId = input.patientId || c.patientId
    const patientName = input.patientName || c.patientName
    const providerId = input.providerId || c.selectedProviderId || 'apex-joint-delhi'
    const providerName = input.providerName || c.selectedProviderName || 'Partner Hospital'
    const treatmentId = input.treatmentId || c.treatmentId
    const treatmentName = input.treatmentName || c.treatmentName
    const packagePrice = input.packagePrice || c.budgetMin || 6500
    const currency = input.currency || c.currency || 'USD'
    const depositAmount = input.depositAmount || 500

    // Generate mock escrow transaction reference (strictly simulated placeholder - NO REAL PAYMENT GATEWAY)
    const mockRef = `MOCK-ESCROW-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`

    const newBooking: TreatmentBooking = {
      id: `bk-${Date.now()}`,
      caseId: c.id,
      patientId,
      patientName,
      providerId,
      providerName,
      doctorId: input.doctorId,
      doctorName: input.doctorName,
      treatmentId,
      treatmentName,
      admissionDate: input.admissionDate,
      estimatedStayDays: input.estimatedStayDays || 10,
      packagePrice,
      currency,
      depositAmount,
      mockPaymentRef: mockRef,
      paymentStatus: 'MOCK_ESCROW_AUTHORIZED',
      companionNotes: input.companionNotes || c.patientNotes,
      specialRequirements: input.specialRequirements || [],
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    }

    MOCK_BOOKINGS.push(newBooking)

    // 1. Update Case Status & Journey Stage to BOOKED
    c.status = MedicalCaseStatus.BOOKED
    c.journeyStage = 'Booked'
    c.selectedProviderId = providerId
    c.selectedProviderName = providerName
    c.bookingDetails = newBooking
    c.updatedAt = new Date().toISOString()

    // 2. Add Journey Event
    await journeyService.addJourneyEvent({
      caseId: c.id,
      stage: 'Booked',
      title: 'Treatment & Admission Confirmed',
      description: `Hospital admission confirmed for ${newBooking.admissionDate} at ${newBooking.providerName}. Simulated escrow reserve of $${newBooking.depositAmount} USD authorized (Ref: ${newBooking.mockPaymentRef}).`,
      actorRole: 'patient',
      timestamp: new Date().toISOString(),
    })

    // 3. Schedule Pre-Op Admission Consultation in appointmentService
    try {
      await appointmentService.createAppointment({
        caseId: c.id,
        patientId,
        providerId,
        providerName,
        doctorId: input.doctorId,
        doctorName: input.doctorName || 'Clinical Surgical Team',
        title: 'Hospital Admission & Pre-Op Surgical Workup',
        type: 'Pre-Op Assessment',
        consultationType: 'follow-up',
        dateTime: `${newBooking.admissionDate}T08:30:00Z`,
        slotTime: '08:30 AM',
        status: 'CONFIRMED',
        notes: `Confirmed admission for ${treatmentName}. Escrow deposit secured.`,
      })
    } catch {
      // ignore
    }

    return newBooking
  },
}
