import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'
import { app } from '../src/app.js'
import { medicalRecordService } from '../src/services/medicalRecordService.js'
import { requireRecordAccess } from '../src/middleware/recordAuth.js'
import { errorHandler } from '../src/middleware/errorHandler.js'

describe('Medical Records Security & Object-Level Access Control', () => {
  it('should reject unauthenticated request with 401', async () => {
    const response = await request(app).get('/api/v1/medical-records/rec-1')

    expect(response.status).toBe(401)
    expect(response.body.success).toBe(false)
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })

  it('should return 404 for non-existent record ID', async () => {
    const response = await request(app)
      .get('/api/v1/medical-records/rec-999999')
      .set('Authorization', 'Bearer patient-token')

    expect(response.status).toBe(404)
    expect(response.body.success).toBe(false)
    expect(response.body.error.code).toBe('NOT_FOUND')
  })

  it('should allow patient to access their own medical record (rec-1)', async () => {
    const response = await request(app)
      .get('/api/v1/medical-records/rec-1')
      .set('Authorization', 'Bearer patient-token')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.id).toBe('rec-1')
    expect(response.body.data.patientId).toBe('pat-1')
    expect(response.body.data.name).toBe('Right_Knee_Coronal_MRI_HighRes.pdf')
  })

  it('should allow provider with explicit permissions to access record (rec-1)', async () => {
    const response = await request(app)
      .get('/api/v1/medical-records/rec-1')
      .set('Authorization', 'Bearer provider-token')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.id).toBe('rec-1')
  })

  it('should deny provider when provider is not in permission list', async () => {
    // Create an isolated route with an unauthorized provider mock
    const testApp = express()
    testApp.use(express.json())

    testApp.get(
      '/test-records/:id',
      (req, _res, next) => {
        req.user = {
          id: 'usr-unauthorized-provider',
          email: 'unauthorized@hospital.com',
          role: 'provider',
          providerId: 'unauthorized-hospital-xyz',
        }
        next()
      },
      requireRecordAccess,
      (req, res) => {
        res.json({ success: true, data: (req as any).medicalRecord })
      }
    )

    testApp.use(errorHandler)

    const response = await request(testApp).get('/test-records/rec-1')

    expect(response.status).toBe(403)
    expect(response.body.success).toBe(false)
    expect(response.body.error.code).toBe('FORBIDDEN')
    expect(response.body.error.message).toContain('Access denied')
  })

  it('should audit and log access when admin views medical record', async () => {
    const response = await request(app)
      .get('/api/v1/medical-records/rec-1')
      .set('Authorization', 'Bearer admin-token')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)

    // Check access logs
    const logs = await medicalRecordService.getAccessLogs('rec-1')
    expect(logs.length).toBeGreaterThan(0)
    const adminLog = logs.find((l) => l.accessRole === 'admin')
    expect(adminLog).toBeDefined()
    expect(adminLog?.action).toBe('VIEW')
  })

  it('should allow patient to update record permissions', async () => {
    const response = await request(app)
      .patch('/api/v1/medical-records/rec-1/permissions')
      .set('Authorization', 'Bearer patient-token')
      .send({
        providerIds: ['apex-joint-delhi', 'horizon-bangkok', 'new-clinic-id'],
      })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.permissions).toContain('new-clinic-id')
  })
})
