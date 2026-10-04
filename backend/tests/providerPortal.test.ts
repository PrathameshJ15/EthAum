import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'

describe('Phase 13: Provider-Side Platform End-to-End Tests', () => {
  const providerToken = 'Bearer provider-token'
  const unauthorizedProviderToken = 'Bearer unauthorized-provider-token'
  const patientToken = 'Bearer patient-token'

  describe('1. Provider Dashboard (/api/v1/providers/dashboard)', () => {
    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/v1/providers/dashboard')
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('should forbid patient role from accessing provider dashboard (403)', async () => {
      const res = await request(app)
        .get('/api/v1/providers/dashboard')
        .set('Authorization', patientToken)

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
    })

    it('should return clean dashboard metrics and data for authorized provider', async () => {
      const res = await request(app)
        .get('/api/v1/providers/dashboard')
        .set('Authorization', providerToken)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('provider')
      expect(res.body.data.provider.name).toBe('Apex Orthopedic & Robotic Joint Institute')

      // Metrics: active cases, pending cases, consultations, quotes, notifications
      expect(res.body.data).toHaveProperty('metrics')
      const { metrics } = res.body.data
      expect(metrics).toHaveProperty('activeCases')
      expect(metrics).toHaveProperty('pendingCases')
      expect(metrics).toHaveProperty('consultations')
      expect(metrics).toHaveProperty('quotes')
      expect(metrics).toHaveProperty('notifications')
      expect(typeof metrics.activeCases).toBe('number')
      expect(typeof metrics.pendingCases).toBe('number')

      // Core lists
      expect(Array.isArray(res.body.data.cases)).toBe(true)
      expect(Array.isArray(res.body.data.upcomingConsultations)).toBe(true)
      expect(Array.isArray(res.body.data.recentQuotes)).toBe(true)
    })
  })

  describe('2. Provider Profile Management', () => {
    it('should retrieve institutional profile details', async () => {
      const res = await request(app)
        .get('/api/v1/providers/profile')
        .set('Authorization', providerToken)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe('apex-joint-delhi')
      expect(res.body.data.city).toBe('New Delhi')
      expect(res.body.data.accreditations).toContain('JCI Accredited')
    })

    it('should update provider profile tagline and facilities', async () => {
      const res = await request(app)
        .patch('/api/v1/providers/profile')
        .set('Authorization', providerToken)
        .send({
          tagline: 'Premier Robotic Joint Reconstruction Hospital of Asia',
          facilities: ['Mako Robotic Navigation', 'Private VIP Recovery Floor'],
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.tagline).toBe('Premier Robotic Joint Reconstruction Hospital of Asia')
      expect(res.body.data.facilities).toContain('Mako Robotic Navigation')
    })
  })

  describe('3. Provider Treatment Offerings Management', () => {
    it('should list treatment offerings for the provider', async () => {
      const res = await request(app)
        .get('/api/v1/providers/treatments')
        .set('Authorization', providerToken)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
    })

    it('should add a new treatment procedure package', async () => {
      const newOffer = {
        treatmentId: 'custom-hip-resurfacing',
        name: 'Birmingham Hip Resurfacing (BHR) Package',
        startingPriceUSD: 7200,
        inclusions: ['Pre-op CT', 'Surgeon fee', '4 nights stay', 'Physiotherapy'],
      }

      const res = await request(app)
        .post('/api/v1/providers/treatments')
        .set('Authorization', providerToken)
        .send(newOffer)

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.treatmentId).toBe('custom-hip-resurfacing')
      expect(res.body.data.startingPriceUSD).toBe(7200)
    })

    it('should update an existing treatment offer price', async () => {
      const res = await request(app)
        .patch('/api/v1/providers/treatments/custom-hip-resurfacing')
        .set('Authorization', providerToken)
        .send({
          startingPriceUSD: 7500,
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.startingPriceUSD).toBe(7500)
    })

    it('should delete a treatment offer', async () => {
      const res = await request(app)
        .delete('/api/v1/providers/treatments/custom-hip-resurfacing')
        .set('Authorization', providerToken)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.deleted).toBe(true)
    })
  })

  describe('4. Object-Level Case Access Authorization', () => {
    it('should allow authorized provider to view assigned case (ET-8492)', async () => {
      const res = await request(app)
        .get('/api/v1/cases/ET-8492')
        .set('Authorization', providerToken)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe('ET-8492')
      expect(res.body.data.patientName).toBe('Eleanor Vance')
    })

    it('should strictly deny unauthorized provider from viewing unrelated case (403)', async () => {
      const res = await request(app)
        .get('/api/v1/cases/ET-8492')
        .set('Authorization', unauthorizedProviderToken)

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.error.message).toContain('not authorized')
    })

    it('should return only authorized cases when listing cases as a provider', async () => {
      const res = await request(app)
        .get('/api/v1/cases')
        .set('Authorization', providerToken)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      const caseIds = res.body.data.map((c: any) => c.id)
      expect(caseIds).toContain('ET-8492')
      // Shouldn't contain unassigned cases like ET-7123 (assigned to Bumrungrad)
      expect(caseIds).not.toContain('ET-7123')
    })

    it('should return empty case list for unauthorized provider with no assignments', async () => {
      const res = await request(app)
        .get('/api/v1/cases')
        .set('Authorization', unauthorizedProviderToken)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.length).toBe(0)
    })
  })

  describe('5. Sensitive Medical Record Access & Audit Logging', () => {
    it('should return authorized records for assigned case to authorized provider', async () => {
      const res = await request(app)
        .get('/api/v1/medical-records?caseId=ET-8492')
        .set('Authorization', providerToken)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
      // All returned records must have apex-joint-delhi in permissions
      res.body.data.forEach((r: any) => {
        expect(r.permissions).toContain('apex-joint-delhi')
      })
    })

    it('should return zero records for case to unauthorized provider', async () => {
      const res = await request(app)
        .get('/api/v1/medical-records?caseId=ET-8492')
        .set('Authorization', unauthorizedProviderToken)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.length).toBe(0)
    })

    it('should allow authorized provider to view record and log the access in audit logs', async () => {
      // 1. View record
      const res = await request(app)
        .get('/api/v1/medical-records/rec-1')
        .set('Authorization', providerToken)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe('rec-1')

      // 2. Check audit logs for rec-1
      const logRes = await request(app)
        .get('/api/v1/medical-records/rec-1/access-logs')
        .set('Authorization', providerToken)

      expect(logRes.status).toBe(200)
      expect(logRes.body.success).toBe(true)
      const logs = logRes.body.data
      expect(Array.isArray(logs)).toBe(true)
      const lastView = logs.find((l: any) => l.action === 'VIEW' && l.accessRole === 'provider')
      expect(lastView).toBeDefined()
    })

    it('should deny unauthorized provider from viewing unshared record (403)', async () => {
      const res = await request(app)
        .get('/api/v1/medical-records/rec-1')
        .set('Authorization', unauthorizedProviderToken)

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.error.message).toContain('Access denied')
    })
  })

  describe('6. Quote Creation by Provider', () => {
    it('should forbid patient from creating a quote (403)', async () => {
      const res = await request(app)
        .post('/api/v1/quotes')
        .set('Authorization', patientToken)
        .send({
          caseId: 'ET-8492',
          treatmentId: 'knee-replacement',
          treatmentName: 'Total Knee Replacement',
          price: 6000,
        })

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
    })

    it('should allow provider to create a formal quote for a case', async () => {
      const quotePayload = {
        caseId: 'ET-9011',
        treatmentId: 'knee-replacement',
        treatmentName: 'Robotic Knee Reconstruction Revision',
        price: 9400,
        currency: 'USD',
        inclusions: [
          'Pre-operative Revision CT Reconstruction',
          'Trabecular Metal Augments and Stems',
          '5 Nights Private Executive Room',
          'Airport Chauffeur Meet & Greet',
        ],
        estimatedStayDays: 14,
        validUntil: '2026-12-31',
      }

      const res = await request(app)
        .post('/api/v1/quotes')
        .set('Authorization', providerToken)
        .send(quotePayload)

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.providerId).toBe('apex-joint-delhi')
      expect(res.body.data.price).toBe(9400)
      expect(['SUBMITTED', 'PENDING']).toContain(res.body.data.status)
    })
  })

  describe('7. Provider Appointments Management', () => {
    it('should list upcoming appointments for the provider', async () => {
      const res = await request(app)
        .get('/api/v1/appointments')
        .set('Authorization', providerToken)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
      expect(res.body.data[0].providerId).toBe('apex-joint-delhi')
    })

    it('should update appointment status to Confirmed', async () => {
      const res = await request(app)
        .patch('/api/v1/appointments/apt-2')
        .set('Authorization', providerToken)
        .send({
          status: 'Confirmed',
          notes: 'Pre-op CT imaging verified. Patient clear for robotic revision consultation.',
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('Confirmed')
      expect(res.body.data.notes).toContain('Pre-op CT imaging verified')
    })
  })
})
