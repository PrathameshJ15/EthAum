import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'
import { CANONICAL_JOURNEY_STAGES } from '../src/services/journeyService.js'

describe('Phase 14: Complete Medical Case Journey & Aftercare Experience', () => {
  describe('1. 11-Stage Canonical Journey Pipeline', () => {
    it('verifies all 11 stages exist in exact sequential order', () => {
      const expectedStages = [
        'DRAFT',
        'RECORDS',
        'QUALIFICATION',
        'MATCHING',
        'QUOTES',
        'PROVIDER',
        'CONSULTATION',
        'BOOKED',
        'TREATMENT',
        'AFTERCARE',
        'COMPLETED',
      ]

      const actualIds = CANONICAL_JOURNEY_STAGES.map((s) => s.id)
      expect(actualIds).toEqual(expectedStages)
      expect(CANONICAL_JOURNEY_STAGES.length).toBe(11)
    })

    it('returns complete journey summary via GET /api/v1/journey/:caseId/summary', async () => {
      const res = await request(app)
        .get('/api/v1/journey/ET-8492/summary')
        .set('Authorization', 'Bearer patient-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      const summary = res.body.data
      expect(summary.caseId).toBe('ET-8492')
      expect(summary.currentStage).toBeDefined()
      expect(summary.currentStage.id).toBeDefined()
      expect(summary.completedStages).toBeInstanceOf(Array)
      expect(summary.allStages).toHaveLength(11)

      // Verify Next Action is provided
      expect(summary.nextAction).toBeDefined()
      expect(summary.nextAction.title).toBeDefined()
      expect(summary.nextAction.actionLabel).toBeDefined()

      // Verify Important Dates are provided
      expect(summary.importantDates).toBeDefined()
      expect(summary.importantDates.intakeDate).toBeDefined()
      expect(summary.importantDates.consultationDate).toBeDefined()
      expect(summary.importantDates.admissionDate).toBeDefined()

      // Verify Provider details are present
      expect(summary.provider).toBeDefined()
      expect(summary.provider.name).toContain('Apex')
      expect(summary.provider.doctorName).toBe('Dr. Vikram Oberoi')

      // Verify Treatment details are present
      expect(summary.treatment).toBeDefined()
      expect(summary.treatment.name).toContain('Knee')

      // Verify Appointments list is present
      expect(summary.appointments).toBeInstanceOf(Array)
      expect(summary.appointments.length).toBeGreaterThan(0)
    })

    it('allows updating journey stage via PATCH /api/v1/journey/:caseId/stage', async () => {
      const res = await request(app)
        .patch('/api/v1/journey/ET-8492/stage')
        .set('Authorization', 'Bearer patient-token')
        .send({ status: 'AFTERCARE' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.currentStage.id).toBe('AFTERCARE')
      expect(res.body.data.currentStage.progressPercent).toBeGreaterThanOrEqual(90)
      expect(res.body.data.completedStages).toContain('TREATMENT')
      expect(res.body.data.completedStages).toContain('BOOKED')
      expect(res.body.data.nextAction.actionType).toBe('VIEW_AFTERCARE')
    })

    it('rejects invalid journey stage update', async () => {
      const res = await request(app)
        .patch('/api/v1/journey/ET-8492/stage')
        .set('Authorization', 'Bearer patient-token')
        .send({ status: 'NON_EXISTENT_STAGE' })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })
  })

  describe('2. Coordination-Focused Aftercare Support', () => {
    it('retrieves comprehensive aftercare plan via GET /api/v1/aftercare/:caseId', async () => {
      const res = await request(app)
        .get('/api/v1/aftercare/ET-8492')
        .set('Authorization', 'Bearer patient-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      const plan = res.body.data
      expect(plan.caseId).toBe('ET-8492')
      expect(plan.leadPhysician).toBe('Dr. Vikram Oberoi')
      expect(plan.leadPhysiotherapist).toBe('Meera Rao, MPT')
      expect(plan.careCoordinator).toBeDefined()
      expect(plan.careCoordinator.name).toBe('Ananya Roy')

      // Support 1: Follow-up reminders
      expect(plan.reminders).toBeInstanceOf(Array)
      expect(plan.reminders.length).toBeGreaterThan(0)
      expect(plan.reminders[0].daysPostOp).toBeDefined()

      // Support 2: Recovery directives explicitly provided by authorized professionals
      expect(plan.directives).toBeInstanceOf(Array)
      expect(plan.directives.length).toBeGreaterThan(0)

      // Support 3: Documents
      expect(plan.documents).toBeInstanceOf(Array)
      expect(plan.documents.length).toBeGreaterThan(0)

      // Support 4: Communication
      expect(plan.messages).toBeInstanceOf(Array)
      expect(plan.messages.length).toBeGreaterThan(0)

      // Emergency Contacts
      expect(plan.emergencyContact).toBeDefined()
      expect(plan.emergencyContact.hospitalHelpline).toBeDefined()
    })

    it('verifies recovery instructions are doctor-authorized and strictly NOT AI-generated', async () => {
      const res = await request(app)
        .get('/api/v1/aftercare/ET-8492/recovery-directives')
        .set('Authorization', 'Bearer patient-token')

      expect(res.status).toBe(200)
      const directives = res.body.data
      expect(directives.length).toBeGreaterThan(0)

      directives.forEach((directive: any) => {
        expect(directive.isDoctorVerified).toBe(true)
        expect(directive.authorizingDoctor).toBe('Dr. Vikram Oberoi')
        expect(directive.disclaimer).toContain('not AI-generated')
        expect(directive.directives.length).toBeGreaterThan(0)
        expect(directive.warningSignsWhenToContactEmergency.length).toBeGreaterThan(0)
      })
    })

    it('allows patient to acknowledge a follow-up reminder', async () => {
      const res = await request(app)
        .post('/api/v1/aftercare/ET-8492/reminders/rem-2/acknowledge')
        .set('Authorization', 'Bearer patient-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe('rem-2')
      expect(res.body.data.status).toBe('COMPLETED')
      expect(res.body.data.acknowledgedAt).toBeDefined()
    })

    it('allows patient to send a coordination message to provider care team', async () => {
      const res = await request(app)
        .post('/api/v1/aftercare/ET-8492/messages')
        .set('Authorization', 'Bearer patient-token')
        .send({
          content: 'Could you please confirm the time for my Day 14 video consultation?',
          senderName: 'Eleanor Vance',
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.content).toBe(
        'Could you please confirm the time for my Day 14 video consultation?'
      )
      expect(res.body.data.senderName).toBe('Eleanor Vance')
      expect(res.body.data.timestamp).toBeDefined()
    })

    it('accesses aftercare plan through case subroute GET /api/v1/cases/:id/aftercare', async () => {
      const res = await request(app)
        .get('/api/v1/cases/ET-8492/aftercare')
        .set('Authorization', 'Bearer patient-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.providerName).toContain('Apex')
    })
  })
})
