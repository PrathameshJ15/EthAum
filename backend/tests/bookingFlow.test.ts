import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'

describe('Phase 14: Consultation & Treatment Booking Flow', () => {
  const patientToken = 'Bearer patient-token'
  const providerToken = 'Bearer provider-token'
  let createdAptId = ''

  describe('1. Consultation Slot Discovery', () => {
    it('should retrieve available slots for a doctor on a given date', async () => {
      const res = await request(app)
        .get('/api/v1/appointments/slots?doctorId=dr-vikram-oberoi&date=2026-10-25')
        .set('Authorization', patientToken)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('availableSlots')
      expect(Array.isArray(res.body.data.availableSlots)).toBe(true)
      expect(res.body.data.availableSlots.length).toBeGreaterThan(0)
      expect(res.body.data.availableSlots).toContain('10:30 AM')
    })
  })

  describe('2. Consultation Request Flow (Patient)', () => {
    it('should allow patient to request an initial consultation with selected provider, doctor, and slot', async () => {
      const payload = {
        caseId: 'ET-8492',
        providerId: 'apex-joint-delhi',
        doctorId: 'dr-vikram-oberoi',
        consultationType: 'consultation',
        type: 'Telemedicine',
        dateTime: '2026-10-25T10:30:00Z',
        slotTime: '10:30 AM',
        notes: 'Discuss robotic joint resurfacing and pre-op clearance.',
      }

      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', patientToken)
        .send(payload)

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('REQUESTED')
      expect(res.body.data.consultationType).toBe('consultation')
      expect(res.body.data.doctorName).toBe('Dr. Vikram Oberoi, MS, FRCS')
      expect(res.body.data.providerName).toBe('Apex Orthopedic & Robotic Joint Institute')
      expect(res.body.data.slotTime).toBe('10:30 AM')

      createdAptId = res.body.data.id
    })

    it('should support requesting a follow-up consultation', async () => {
      const payload = {
        caseId: 'ET-8492',
        providerId: 'apex-joint-delhi',
        doctorId: 'dr-ananya-sharma',
        consultationType: 'follow-up',
        type: 'Telemedicine',
        dateTime: '2026-10-28T14:00:00Z',
        slotTime: '02:00 PM',
        notes: 'Pain management and anesthesia regional block consultation.',
      }

      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', patientToken)
        .send(payload)

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('REQUESTED')
      expect(res.body.data.consultationType).toBe('follow-up')
      expect(res.body.data.title).toContain('Follow-Up')
    })
  })

  describe('3. Provider Confirmation & Appointment Status Lifecycle', () => {
    it('should allow provider to confirm requested consultation and provision meeting URL', async () => {
      const res = await request(app)
        .post(`/api/v1/appointments/${createdAptId}/confirm`)
        .set('Authorization', providerToken)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('CONFIRMED')
      expect(res.body.data.meetingUrl).toBeDefined()
      expect(res.body.data.meetingUrl).toContain('meet.ethaum.health')
    })

    it('should allow marking appointment as COMPLETED after clinical session', async () => {
      const res = await request(app)
        .post(`/api/v1/appointments/${createdAptId}/complete`)
        .set('Authorization', providerToken)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('COMPLETED')
    })

    it('should support updating status to CANCELLED', async () => {
      // Create a temporary appointment to cancel
      const createRes = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', patientToken)
        .send({
          caseId: 'ET-8492',
          providerId: 'apex-joint-delhi',
          dateTime: '2026-11-01T09:00:00Z',
        })

      const tempId = createRes.body.data.id

      const cancelRes = await request(app)
        .post(`/api/v1/appointments/${tempId}/cancel`)
        .set('Authorization', patientToken)

      expect(cancelRes.status).toBe(200)
      expect(cancelRes.body.success).toBe(true)
      expect(cancelRes.body.data.status).toBe('CANCELLED')
    })

    it('should support updating status to NO_SHOW', async () => {
      // Create a temporary appointment to mark as NO_SHOW
      const createRes = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', patientToken)
        .send({
          caseId: 'ET-8492',
          providerId: 'apex-joint-delhi',
          dateTime: '2026-11-02T09:00:00Z',
        })

      const tempId = createRes.body.data.id

      const patchRes = await request(app)
        .patch(`/api/v1/appointments/${tempId}`)
        .set('Authorization', providerToken)
        .send({ status: 'NO_SHOW' })

      expect(patchRes.status).toBe(200)
      expect(patchRes.body.success).toBe(true)
      expect(patchRes.body.data.status).toBe('NO_SHOW')
    })
  })

  describe('4. Treatment Booking Flow (After Consultation)', () => {
    it('should book treatment with mock/placeholder payment and transition case to BOOKED', async () => {
      const bookingPayload = {
        admissionDate: '2026-11-20',
        packagePrice: 6500,
        currency: 'USD',
        depositAmount: 500,
        providerId: 'apex-joint-delhi',
        providerName: 'Apex Orthopedic & Robotic Joint Institute',
        doctorId: 'dr-vikram-oberoi',
        doctorName: 'Dr. Vikram Oberoi',
        treatmentName: 'Robotic Total Knee Replacement (Unilateral)',
        estimatedStayDays: 10,
        companionNotes: 'Accompanying spouse requires double recovery room and airport wheelchair transfer.',
        specialRequirements: ['Airport Chauffeur Transfer', 'Executive Suite'],
        mockPayment: {
          method: 'SOVEREIGN_MOCK_ESCROW',
          holderName: 'Eleanor Vance',
          last4: '4242',
        },
      }

      const res = await request(app)
        .post('/api/v1/cases/ET-8492/book')
        .set('Authorization', patientToken)
        .send(bookingPayload)

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('CONFIRMED')
      expect(res.body.data.admissionDate).toBe('2026-11-20')
      expect(res.body.data.paymentStatus).toBe('MOCK_ESCROW_AUTHORIZED')
      expect(res.body.data.mockPaymentRef).toContain('MOCK-ESCROW')
      expect(res.body.data.depositAmount).toBe(500)

      // Verify the case itself was transitioned to BOOKED
      const caseRes = await request(app)
        .get('/api/v1/cases/ET-8492')
        .set('Authorization', patientToken)

      expect(caseRes.status).toBe(200)
      expect(caseRes.body.data.status).toBe('BOOKED')
      expect(caseRes.body.data.journeyStage).toBe('Booked')
      expect(caseRes.body.data.bookingDetails).toBeDefined()
      expect(caseRes.body.data.bookingDetails.mockPaymentRef).toBeDefined()
    })

    it('should list confirmed treatment bookings', async () => {
      const res = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', patientToken)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
      const booking = res.body.data.find((b: any) => b.caseId === 'ET-8492')
      expect(booking).toBeDefined()
      expect(booking.paymentStatus).toBe('MOCK_ESCROW_AUTHORIZED')
    })
  })
})
