import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'

describe('Phase 32: Security & Privacy Verification Test Suite', () => {
  // Test tokens mapping to distinct actors in auth middleware
  const patient1Token = 'Bearer test-patient-token-usr-demo-patient' // maps to pat-1 / usr-demo-patient
  const patient2Token = 'Bearer test-pat-2-token'                    // maps to pat-2 / usr-other-patient
  const providerToken = 'Bearer test-provider-token'                 // maps to apex-joint-delhi / usr-demo-provider
  const unauthorizedProviderToken = 'Bearer test-unauthorized-provider' // maps to unauthorized-hospital-xyz
  const adminToken = 'Bearer test-admin-token'                       // maps to admin role

  describe('1. Authentication & Unauthenticated Access Enforcement', () => {
    it('should reject requests without authorization token on protected routes with 401', async () => {
      const endpoints = [
        { method: 'get', url: '/api/v1/cases/ET-8492' },
        { method: 'get', url: '/api/v1/medical-records' },
        { method: 'get', url: '/api/v1/appointments' },
        { method: 'get', url: '/api/v1/bookings' },
        { method: 'get', url: '/api/v1/aftercare/ET-8492' },
        { method: 'get', url: '/api/v1/travel/ET-8492' },
        { method: 'get', url: '/api/v1/payments/history' },
      ]

      for (const ep of endpoints) {
        const res = await (request(app) as any)[ep.method](ep.url)
        expect(res.status).toBe(401)
        expect(res.body.success).toBe(false)
        expect(res.body.error.code).toBe('UNAUTHORIZED')
      }
    })

    it('should reject malformed or non-Bearer authorization headers with 401', async () => {
      const res = await request(app)
        .get('/api/v1/cases/ET-8492')
        .set('Authorization', 'Basic dXNlcjpwYXNz')

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })
  })

  describe('2. Object-Level Authorization (BOLA / IDOR Defense)', () => {
    it('should prevent Patient 1 from inspecting Patient 2 Medical Case (ET-7123)', async () => {
      const res = await request(app)
        .get('/api/v1/cases/ET-7123')
        .set('Authorization', patient1Token)

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('FORBIDDEN')
    })

    it('should prevent Patient 1 from updating status of Patient 2 Medical Case (ET-7123)', async () => {
      const res = await request(app)
        .patch('/api/v1/cases/ET-7123/status')
        .set('Authorization', patient1Token)
        .send({ status: 'CANCELLED' })

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
    })

    it('should automatically force owning patientId when a patient creates a new medical case', async () => {
      const res = await request(app)
        .post('/api/v1/cases')
        .set('Authorization', patient1Token)
        .send({
          patientId: 'pat-victim-spoofed',
          patientName: 'Spoofed Victim',
          treatmentId: 'knee-replacement',
          treatmentName: 'Robotic Knee Replacement',
          medicalHistory: 'Severe osteoarthritis Grade IV',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      // Must NOT allow spoofing to pat-victim-spoofed; forces caller's patient ID (pat-1)
      expect(res.body.data.patientId).toBe('pat-1')
    })

    it('should prevent Patient 2 from accessing Patient 1 aftercare plan or directives', async () => {
      const res = await request(app)
        .get('/api/v1/aftercare/ET-8492')
        .set('Authorization', patient2Token)

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
    })

    it('should prevent Patient 2 from acknowledging Patient 1 aftercare reminder', async () => {
      const res = await request(app)
        .post('/api/v1/aftercare/ET-8492/reminders/rem-1/acknowledge')
        .set('Authorization', patient2Token)

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
    })

    it('should prevent Patient 2 from inspecting Patient 1 appointment dossier', async () => {
      const res = await request(app)
        .get('/api/v1/appointments/apt-1')
        .set('Authorization', patient2Token)

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
    })

    it('should prevent patient from unilaterally marking appointment as COMPLETED or CONFIRMED', async () => {
      const res = await request(app)
        .post('/api/v1/appointments/apt-1/complete')
        .set('Authorization', patient1Token)

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.error.message).toContain('Only healthcare providers')
    })

    it('should prevent Patient 2 from reading messages in conversation conv-1', async () => {
      const res = await request(app)
        .get('/api/v1/messages/conversations/conv-1/messages')
        .set('Authorization', patient2Token)

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('FORBIDDEN')
    })

    it('should prevent Patient 2 from viewing Patient 1 treatment booking dossier', async () => {
      const res = await request(app)
        .get('/api/v1/bookings/bk-1001')
        .set('Authorization', patient2Token)

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
    })

    it('should prevent Patient 1 from accepting or declining a quote belonging to Patient 2 (case ET-7123)', async () => {
      // First, create a quote under Patient 2's case ET-7123
      const quoteRes = await request(app)
        .post('/api/v1/quotes')
        .set('Authorization', providerToken)
        .send({
          caseId: 'ET-7123',
          treatmentId: 'cabg',
          treatmentName: 'Coronary Artery Bypass Graft',
          total: 15000,
          status: 'SUBMITTED',
        })

      const quoteId = quoteRes.body.data.id

      // Patient 1 attempts to accept Patient 2's quote
      const acceptRes = await request(app)
        .post(`/api/v1/quotes/${quoteId}/accept`)
        .set('Authorization', patient1Token)

      expect(acceptRes.status).toBe(403)
      expect(acceptRes.body.success).toBe(false)

      // Patient 1 attempts to reject Patient 2's quote
      const rejectRes = await request(app)
        .post(`/api/v1/quotes/${quoteId}/reject`)
        .set('Authorization', patient1Token)

      expect(rejectRes.status).toBe(403)
      expect(rejectRes.body.success).toBe(false)
    })
  })

  describe('3. Medical Record Privacy & Granular Access Control', () => {
    it('should block unauthorized provider from accessing private medical record (rec-1)', async () => {
      const res = await request(app)
        .get('/api/v1/medical-records/rec-1')
        .set('Authorization', unauthorizedProviderToken)

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
    })

    it('should block unauthorized provider from generating signed download URL for medical file', async () => {
      const res = await request(app)
        .get('/api/v1/medical-records/rec-1/download-url')
        .set('Authorization', unauthorizedProviderToken)

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
    })

    it('should prevent providers from modifying access permissions on patient records', async () => {
      const res = await request(app)
        .post('/api/v1/medical-records/rec-1/permissions')
        .set('Authorization', providerToken)
        .send({ providerId: 'other-provider-id' })

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
    })

    it('should create immutable audit trail log when authorized record viewing occurs', async () => {
      // Authorized patient accesses their record
      await request(app)
        .get('/api/v1/medical-records/rec-1')
        .set('Authorization', patient1Token)

      // Retrieve access logs
      const logsRes = await request(app)
        .get('/api/v1/medical-records/rec-1/access-logs')
        .set('Authorization', patient1Token)

      expect(logsRes.status).toBe(200)
      expect(logsRes.body.success).toBe(true)
      expect(Array.isArray(logsRes.body.data)).toBe(true)
      expect(logsRes.body.data.length).toBeGreaterThan(0)

      const latestLog = logsRes.body.data[0]
      expect(latestLog.recordId).toBe('rec-1')
      expect(latestLog.action).toBeDefined()
    })
  })

  describe('4. Payment Security & Anti-Tamper Enforcement', () => {
    it('should reject payment order creation if client attempts price or amount tampering', async () => {
      const res = await request(app)
        .post('/api/v1/payments/orders')
        .set('Authorization', patient1Token)
        .send({
          caseId: 'ET-8492',
          purpose: 'CONSULTATION_FEE',
          amount: 1.0, // Malicious price tampering attempt
          currency: 'USD',
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
      expect(JSON.stringify(res.body)).toContain('strictly server-determined')
    })

    it('should reject payment webhook execution when cryptographic signature is missing', async () => {
      const res = await request(app)
        .post('/api/v1/payments/webhook')
        .send({
          event: 'payment.captured',
          payload: {},
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.error.message).toContain('signature')
    })

    it('should reject payment webhook execution when cryptographic signature is forged', async () => {
      const res = await request(app)
        .post('/api/v1/payments/webhook?provider=mock')
        .set('x-mock-signature', 'forged-invalid-hmac-signature')
        .send({
          event: 'payment.captured',
          payload: { id: 'evt-test-forged' },
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should prevent Patient 2 from inspecting Patient 1 payment transactions', async () => {
      const res = await request(app)
        .get('/api/v1/payments/PAY-MOCK-ET-8492-CONSULT')
        .set('Authorization', patient2Token)

      expect([403, 404]).toContain(res.status)
      expect(res.body.success).toBe(false)
    })
  })

  describe('5. Sensitive Data Protection & Input Sanitization', () => {
    it('should strictly reject storage upload requests for unauthorized file categories', async () => {
      const res = await request(app)
        .post('/api/v1/medical-records/upload-url')
        .set('Authorization', patient1Token)
        .send({
          caseId: 'ET-8492',
          fileName: 'malicious_script.exe',
          category: 'MALICIOUS_CATEGORY_XYZ',
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should reject travel plan update if client attempts to submit passport numbers or SSNs', async () => {
      const res = await request(app)
        .patch('/api/v1/travel/ET-8492')
        .set('Authorization', patient1Token)
        .send({
          destinationCountry: 'Thailand',
          passportNumber: 'A12345678', // Forbidden personal identity attribute
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(JSON.stringify(res.body)).toContain('EthAum does not store passport numbers')
    })
  })

  describe('6. Production Error Shielding & Information Disclosure Prevention', () => {
    it('should return sanitized error structures without stack traces in production error format', async () => {
      const res = await request(app)
        .get('/api/v1/cases/NON_EXISTENT_CASE_99999')
        .set('Authorization', adminToken)

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
      expect(res.body.error).toBeDefined()
      expect(res.body.error.code).toBe('NOT_FOUND')
      // Ensure stack traces are not leaked in standardized responses
      expect(res.body.error.details?.stack).toBeUndefined()
    })
  })
})
