import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'

describe('Phase 29: Travel & Visa Assistance Module', () => {
  describe('1. Retrieval & Official Visa Resources', () => {
    it('retrieves travel assistance plan with official government visa resources for an authorized patient', async () => {
      const res = await request(app)
        .get('/api/v1/cases/ET-8492/travel')
        .set('Authorization', 'Bearer patient-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toBeDefined()
      expect(res.body.data.caseId).toBe('ET-8492')
      expect(res.body.data.destinationCountry).toBe('India')

      // Verify official visa resource structure
      const visaInfo = res.body.data.visaInfo
      expect(visaInfo).toBeDefined()
      expect(visaInfo.portalName).toContain('Indian Visa Online')
      expect(visaInfo.portalUrl).toBe('https://indianvisaonline.gov.in/evisa/tvoa.html')
      expect(visaInfo.visaType).toContain('e-Medical Visa')
      expect(visaInfo.invitationLetterRequired).toBe(true)
      expect(visaInfo.disclaimer).toContain('EthAum is a healthcare coordination platform and does not issue visas')

      // Verify checklist items
      expect(Array.isArray(res.body.data.checklist)).toBe(true)
      expect(res.body.data.checklist.length).toBeGreaterThanOrEqual(5)
      const passportCheck = res.body.data.checklist.find((c: any) => c.id === 'chk-1')
      expect(passportCheck).toBeDefined()
      expect(passportCheck.essential).toBe(true)
    })

    it('returns official visa information for specific destinations via public /api/v1/travel/visa endpoint', async () => {
      const res = await request(app).get('/api/v1/travel/visa?destination=thailand')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.country).toBe('Thailand')
      expect(res.body.data.portalUrl).toBe('https://www.thaievisa.go.th')
      expect(res.body.data.disclaimer).toContain('EthAum does not guarantee visa approval')
    })

    it('returns all official destination visa resources when no parameter is provided', async () => {
      const res = await request(app).get('/api/v1/travel/visa')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.destinations).toBeDefined()
      expect(res.body.data.destinations.india).toBeDefined()
      expect(res.body.data.destinations.thailand).toBeDefined()
      expect(res.body.data.destinations.turkey).toBeDefined()
      expect(res.body.data.destinations.mexico).toBeDefined()
    })
  })

  describe('2. Travel Details & Logistics Updates', () => {
    it('allows patient owner to update planned travel dates, accommodation, and coordination notes', async () => {
      const updatePayload = {
        departureDate: '2026-11-14',
        returnDate: '2026-11-28',
        travelStatus: 'IN_TRANSIT',
        coordinationNotes: 'Flight delayed by 30 minutes; hospital chauffeur notified via WhatsApp.',
        flightDetails: {
          airline: 'Air India',
          flightNumber: 'AI 102',
          departureAirport: 'JFK',
          arrivalAirport: 'DEL',
          bookingReference: 'AI-77894',
        },
        accommodationDetails: {
          facilityName: 'The Leela Palace Recovery Suites',
          address: 'Diplomatic Enclave, Chanakyapuri, New Delhi',
          checkInDate: '2026-11-15',
          checkOutDate: '2026-11-28',
          bookingReference: 'LEELA-99120',
          companionIncluded: true,
          notes: 'Ground floor mobility room confirmed.',
        },
      }

      const res = await request(app)
        .put('/api/v1/cases/ET-8492/travel')
        .set('Authorization', 'Bearer patient-token')
        .send(updatePayload)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.departureDate).toBe('2026-11-14')
      expect(res.body.data.returnDate).toBe('2026-11-28')
      expect(res.body.data.travelStatus).toBe('IN_TRANSIT')
      expect(res.body.data.coordinationNotes).toContain('Flight delayed by 30 minutes')
      expect(res.body.data.accommodationDetails.facilityName).toContain('The Leela Palace')
    })

    it('allows patient to toggle travel checklist items', async () => {
      const res = await request(app)
        .patch('/api/v1/travel/ET-8492/checklist/chk-3')
        .set('Authorization', 'Bearer patient-token')
        .send({ completed: true })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      const item = res.body.data.checklist.find((c: any) => c.id === 'chk-3')
      expect(item.completed).toBe(true)
    })
  })

  describe('3. Security, Patient Isolation & Input Validation', () => {
    it('blocks unauthenticated requests to case travel details (returns 401)', async () => {
      const res = await request(app).get('/api/v1/cases/ET-8492/travel')
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('UNAUTHORIZED')
    })

    it('prevents a patient from viewing another patient\'s travel information (returns 403)', async () => {
      const res = await request(app)
        .get('/api/v1/cases/ET-8492/travel')
        .set('Authorization', 'Bearer other-patient-token')

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('FORBIDDEN')
      expect(res.body.error.message).toContain('Access denied: You can only view travel information for your own cases')
    })

    it('prevents a patient from modifying another patient\'s travel information (returns 403)', async () => {
      const res = await request(app)
        .put('/api/v1/cases/ET-8492/travel')
        .set('Authorization', 'Bearer other-patient-token')
        .send({ travelStatus: 'COMPLETED' })

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('FORBIDDEN')
    })

    it('rejects attempts to store unnecessary sensitive passport numbers (security boundary)', async () => {
      const res = await request(app)
        .put('/api/v1/cases/ET-8492/travel')
        .set('Authorization', 'Bearer patient-token')
        .send({
          passportNumber: 'A12345678', // prohibited field
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.error.message).toContain('Security restriction')
    })

    it('rejects invalid date formats in travel updates (returns 400 validation error)', async () => {
      const res = await request(app)
        .put('/api/v1/cases/ET-8492/travel')
        .set('Authorization', 'Bearer patient-token')
        .send({
          departureDate: '15/11/2026', // invalid format, expects YYYY-MM-DD
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('returns 404 for a non-existent case', async () => {
      const res = await request(app)
        .get('/api/v1/cases/ET-NON-EXISTENT-CASE/travel')
        .set('Authorization', 'Bearer patient-token')

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
    })
  })
})
