import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { medicalRecordService } from '../src/services/medicalRecordService.js'

describe('Supabase Foundation & Medical Records Access Control', () => {
  // 1. User Authentication
  describe('1. User Authentication & Role Verification', () => {
    it('should reject unauthenticated request to /auth/me with 401', async () => {
      const res = await request(app).get('/api/v1/auth/me')
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('UNAUTHORIZED')
    })

    it('should authenticate patient and return profile with role', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer patient-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.role).toBe('patient')
      expect(res.body.data.email).toBe('patient@ethaum.com')
    })

    it('should authenticate provider and attach hospital credentials', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer provider-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.role).toBe('provider')
      expect(res.body.data.providerId).toBe('apex-joint-delhi')
    })
  })

  // 2. Patient Profile
  describe('2. Patient Profile Management', () => {
    it('should retrieve sovereign patient profile', async () => {
      const res = await request(app)
        .get('/api/v1/patients/profile')
        .set('Authorization', 'Bearer patient-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.gender).toBe('Female')
      expect(res.body.data.medicalSummary).toContain('osteoarthritis')
    })

    it('should update patient medical profile', async () => {
      const res = await request(app)
        .patch('/api/v1/patients/usr-patient-1/profile')
        .set('Authorization', 'Bearer patient-token')
        .send({
          companionTraveling: true,
          medicalSummary: 'Updated preoperative evaluation: candidate for robotic surgery.',
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.companionTraveling).toBe(true)
      expect(res.body.data.medicalSummary).toContain('robotic surgery')
    })
  })

  // 3. Case Creation & 4. Case Ownership
  describe('3. Case Creation & 4. Case Ownership', () => {
    let createdCaseId: string

    it('should create medical coordination case in DRAFT status', async () => {
      const res = await request(app)
        .post('/api/v1/cases')
        .set('Authorization', 'Bearer patient-token')
        .send({
          patientId: 'pat-1',
          patientName: 'Eleanor Vance',
          treatmentId: 'knee-replacement',
          treatmentName: 'Total Knee Replacement (Robotic Mako/Rosa)',
          destinationId: 'india',
          destinationName: 'New Delhi, India',
          budgetMin: 6000,
          budgetMax: 9000,
          currency: 'USD',
          preferredDate: '2026-12-01',
          medicalHistory: 'Severe cartilage loss medial compartment. Grade IV OA.',
          patientNotes: 'Prefers Apollo or Max Hospital joint replacement center.',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toMatch(/^ET-\d+/)
      expect(res.body.data.status).toBe('DRAFT')
      expect(res.body.data.patientId).toBe('pat-1')
      createdCaseId = res.body.data.id
    })

    it('should enforce patient case ownership when listing cases', async () => {
      const res = await request(app)
        .get('/api/v1/cases?patientId=pat-1')
        .set('Authorization', 'Bearer patient-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      const ownedCase = res.body.data.find((c: any) => c.id === 'ET-8492')
      expect(ownedCase).toBeDefined()
      expect(ownedCase.patientId).toBe('pat-1')
    })
  })

  // 5. Record Upload Authorization & Storage
  describe('5. Record Upload Authorization & Storage Signed URLs', () => {
    it('should reject upload URL request with invalid category', async () => {
      const res = await request(app)
        .post('/api/v1/medical-records/upload-url')
        .set('Authorization', 'Bearer patient-token')
        .send({
          caseId: 'ET-8492',
          fileName: 'report.pdf',
          category: 'InvalidNonMedicalCategory',
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should authorize upload and return secure signed upload URL for private bucket', async () => {
      const res = await request(app)
        .post('/api/v1/medical-records/upload-url')
        .set('Authorization', 'Bearer patient-token')
        .send({
          caseId: 'ET-8492',
          fileName: 'PostOp_Knee_MRI_Coronal.pdf',
          category: 'MRI',
          type: 'DICOM Coronal Imaging',
          size: '18.4 MB',
          sizeBytes: 19293798,
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.uploadUrl).toBeDefined()
      expect(res.body.data.bucket).toBe('medical-records')
      expect(res.body.data.storagePath).toContain('patients/pat-1/cases/ET-8492/')
      expect(res.body.data.record).toBeDefined()
      expect(res.body.data.record.category).toBe('MRI')
    })

    it('should generate signed download URL for authorized viewer and log DOWNLOAD action', async () => {
      const res = await request(app)
        .get('/api/v1/medical-records/rec-1/download-url')
        .set('Authorization', 'Bearer patient-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.downloadUrl).toBeDefined()
      expect(res.body.data.storagePath).toBe('patients/pat-1/cases/ET-8492/mri_coronal.pdf')

      // Verify audit log
      const logs = await medicalRecordService.getAccessLogs('rec-1')
      const downloadLog = logs.find((l) => l.action === 'DOWNLOAD')
      expect(downloadLog).toBeDefined()
    })
  })

  // 6. Provider Record Access Control
  describe('6. Provider Record Access Control', () => {
    it('should allow authorized provider (apex-joint-delhi) to access shared record rec-1', async () => {
      const res = await request(app)
        .get('/api/v1/medical-records/rec-1')
        .set('Authorization', 'Bearer provider-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe('rec-1')
    })

    it('should deny unauthorized provider access to record rec-1 with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/medical-records/rec-1')
        .set('Authorization', 'Bearer unauthorized-provider-token')

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('FORBIDDEN')
      expect(res.body.error.message).toContain('Access denied')
    })
  })

  // 7. Permission Revocation & Granting
  describe('7. Permission Granting & Revocation', () => {
    const testProviderId = 'bangkok-ortho-specialist'

    it('should allow patient to grant explicit permission to a provider', async () => {
      const res = await request(app)
        .post('/api/v1/medical-records/rec-1/permissions')
        .set('Authorization', 'Bearer patient-token')
        .send({
          providerId: testProviderId,
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.providerId).toBe(testProviderId)
      expect(res.body.data.status).toBe('ACTIVE')

      // Verify provider now has access
      const hasPerm = await medicalRecordService.hasActivePermission('rec-1', testProviderId)
      expect(hasPerm).toBe(true)
    })

    it('should allow patient to revoke explicit permission from a provider', async () => {
      const res = await request(app)
        .delete(`/api/v1/medical-records/rec-1/permissions/${testProviderId}`)
        .set('Authorization', 'Bearer patient-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('REVOKED')

      // Verify provider no longer has active permission
      const hasPerm = await medicalRecordService.hasActivePermission('rec-1', testProviderId)
      expect(hasPerm).toBe(false)
    })
  })

  // 8. Access Logging & HIPAA/GDPR Auditability
  describe('8. Access Logging & Auditing', () => {
    it('should retrieve complete auditable access logs for a medical record', async () => {
      const res = await request(app)
        .get('/api/v1/medical-records/rec-1/access-logs')
        .set('Authorization', 'Bearer patient-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)

      // Ensure actions are recorded
      const actions = res.body.data.map((l: any) => l.action)
      expect(actions).toContain('SHARE_GRANTED')
      expect(actions).toContain('SHARE_REVOKED')
    })
  })
})
