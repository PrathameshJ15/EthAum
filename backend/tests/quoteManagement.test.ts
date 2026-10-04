import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'

describe('Quote Management System End-to-End Tests', () => {
  const patientToken = 'Bearer test-patient-token-usr-demo-patient'
  const providerToken = 'Bearer test-provider-token-usr-demo-provider'
  const unauthorizedToken = 'Bearer test-unauthorized-provider'

  describe('1. Provider Flow: Create Quote with Comprehensive Fields', () => {
    it('should create a draft quote with full itemization', async () => {
      const draftPayload = {
        caseId: 'ET-8492',
        treatmentId: 'knee-replacement',
        treatmentName: 'Robotic Unilateral Knee Arthroplasty',
        consultation: {
          description: 'Virtual pre-surgical planning consultation',
          cost: 250,
        },
        diagnostics: {
          description: 'High-resolution coronal MRI and weight-bearing radiograph workup',
          cost: 550,
        },
        accommodation: {
          applicable: true,
          roomType: 'Deluxe Private Suite with Companion Bed',
          nights: 4,
          cost: 1100,
          notes: 'Full companion amenities included',
        },
        otherServices: {
          description: 'Airport chauffeur transfer, in-hospital physiotherapy, and bilingual liaison',
          cost: 800,
          items: ['Airport pickup', 'Physical therapy', 'Liaison officer'],
        },
        total: 6200,
        currency: 'USD',
        validity: '2026-12-31',
        notes: 'Robotic arm navigation with cruciate-retaining implant.',
        exclusions: [
          'International flights and visas',
          'Treatment of unrelated chronic medical comorbidities',
        ],
        status: 'DRAFT',
      }

      const res = await request(app)
        .post('/api/v1/quotes')
        .set('Authorization', providerToken)
        .send(draftPayload)

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('DRAFT')
      expect(res.body.data.consultation.cost).toBe(250)
      expect(res.body.data.diagnostics.cost).toBe(550)
      expect(res.body.data.accommodation.applicable).toBe(true)
      expect(res.body.data.accommodation.nights).toBe(4)
      expect(res.body.data.total).toBe(6200)
      expect(res.body.data.currency).toBe('USD')
      expect(res.body.data.validity).toBe('2026-12-31')
      expect(res.body.data.exclusions).toHaveLength(2)
      expect(res.body.data.providerId).toBe('apex-joint-delhi')
    })

    it('should allow provider to submit a draft quote to the patient', async () => {
      // 1. Create a draft
      const createRes = await request(app)
        .post('/api/v1/quotes')
        .set('Authorization', providerToken)
        .send({
          caseId: 'ET-8492',
          treatmentId: 'knee-replacement',
          treatmentName: 'Robotic Total Knee Arthroplasty',
          total: 6800,
          status: 'DRAFT',
          validity: '2026-12-31',
        })
      expect(createRes.status).toBe(201)
      const quoteId = createRes.body.data.id

      // 2. Submit the quote
      const submitRes = await request(app)
        .post(`/api/v1/quotes/${quoteId}/submit`)
        .set('Authorization', providerToken)

      expect(submitRes.status).toBe(200)
      expect(submitRes.body.success).toBe(true)
      expect(submitRes.body.data.status).toBe('SUBMITTED')
    })
  })

  describe('2. Patient Flow: View Quotes & Visibility Restrictions', () => {
    it('patient should view only submitted/accepted/rejected quotes, never draft quotes', async () => {
      // Create a draft quote first
      await request(app)
        .post('/api/v1/quotes')
        .set('Authorization', providerToken)
        .send({
          caseId: 'ET-8492',
          treatmentId: 'knee-replacement',
          treatmentName: 'Internal Provider Draft Only',
          total: 7000,
          status: 'DRAFT',
        })

      // Patient requests quotes
      const res = await request(app)
        .get('/api/v1/quotes?caseId=ET-8492')
        .set('Authorization', patientToken)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)

      // Ensure no DRAFT quotes are leaked to the patient
      const draftQuotes = res.body.data.filter((q: any) => q.status === 'DRAFT')
      expect(draftQuotes.length).toBe(0)
    })
  })

  describe('3. Patient Flow: Ask Questions on Quote', () => {
    it('should allow patient to ask a question regarding a specific quote', async () => {
      const askRes = await request(app)
        .post('/api/v1/quotes/quo-1/questions')
        .set('Authorization', patientToken)
        .send({
          question: 'Is post-operative physiotherapy provided in English by a licensed therapist?',
        })

      expect(askRes.status).toBe(201)
      expect(askRes.body.success).toBe(true)
      expect(askRes.body.data.question).toContain('physiotherapy provided in English')
      expect(askRes.body.data.status).toBe('OPEN')
      const questionId = askRes.body.data.id

      // Provider answers the question
      const answerRes = await request(app)
        .post(`/api/v1/quotes/quo-1/questions/${questionId}/answer`)
        .set('Authorization', providerToken)
        .send({
          answer: 'Yes, our rehabilitation department has internationally accredited, fluent English physiotherapists.',
        })

      expect(answerRes.status).toBe(200)
      expect(answerRes.body.success).toBe(true)
      expect(answerRes.body.data.status).toBe('ANSWERED')
      expect(answerRes.body.data.answer).toContain('internationally accredited')
    })
  })

  describe('4. Patient Flow: Select Provider & Quote Acceptance', () => {
    it('accepting a quote should transition status to ACCEPTED, reject competing quotes, and update case', async () => {
      // Create competing submitted quote for case ET-8492
      const quote2Res = await request(app)
        .post('/api/v1/quotes')
        .set('Authorization', providerToken)
        .send({
          caseId: 'ET-8492',
          treatmentId: 'knee-replacement',
          treatmentName: 'Alternative Knee Arthroplasty',
          total: 7500,
          status: 'SUBMITTED',
          validity: '2026-12-31',
        })
      const competingQuoteId = quote2Res.body.data.id

      // Patient accepts quo-1
      const acceptRes = await request(app)
        .post('/api/v1/quotes/quo-1/accept')
        .set('Authorization', patientToken)

      expect(acceptRes.status).toBe(200)
      expect(acceptRes.body.success).toBe(true)
      expect(acceptRes.body.data.status).toBe('ACCEPTED')
      expect(acceptRes.body.message).toContain('No payment processed')

      // Verify the competing quote status is now REJECTED
      const compRes = await request(app)
        .get(`/api/v1/quotes/${competingQuoteId}`)
        .set('Authorization', patientToken)

      expect(compRes.status).toBe(200)
      expect(compRes.body.data.status).toBe('REJECTED')

      // Verify Case status is PROVIDER_SELECTED
      const caseRes = await request(app)
        .get('/api/v1/cases/ET-8492')
        .set('Authorization', patientToken)

      expect(caseRes.status).toBe(200)
      expect(caseRes.body.data.status).toBe('PROVIDER_SELECTED')
      expect(caseRes.body.data.selectedProviderId).toBe('apex-joint-delhi')
    })

    it('should allow patient to decline/reject a quote with optional reason', async () => {
      // Create quote to decline
      const quoteRes = await request(app)
        .post('/api/v1/quotes')
        .set('Authorization', providerToken)
        .send({
          caseId: 'ET-7123',
          treatmentId: 'cabg',
          treatmentName: 'Coronary Artery Bypass Graft',
          total: 18000,
          status: 'SUBMITTED',
          validity: '2026-12-31',
        })
      const qId = quoteRes.body.data.id

      const rejectRes = await request(app)
        .post(`/api/v1/quotes/${qId}/reject`)
        .set('Authorization', patientToken)
        .send({
          reason: 'Decided to explore options closer to home.',
        })

      expect(rejectRes.status).toBe(200)
      expect(rejectRes.body.success).toBe(true)
      expect(rejectRes.body.data.status).toBe('REJECTED')
    })
  })
})
