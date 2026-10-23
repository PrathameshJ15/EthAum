import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'

describe('Phase 28: Video Consultation & Telemedicine Integration', () => {
  const patientToken = 'Bearer patient-token'
  const providerToken = 'Bearer provider-token'
  const otherPatientToken = 'Bearer other-patient-token'
  const unauthorizedProviderToken = 'Bearer unauthorized-provider-token'
  const adminToken = 'Bearer admin-token'

  let activeAptId: string
  let cancelledAptId: string

  // Step 1: Create an appointment for testing
  it('should set up a valid confirmed appointment for telemedicine session', async () => {
    const payload = {
      caseId: 'ET-8492',
      patientId: 'pat-1',
      providerId: 'apex-joint-delhi',
      doctorId: 'dr-vikram-oberoi',
      doctorName: 'Dr. Vikram Oberoi',
      providerName: 'Apex Orthopedic & Robotic Joint Institute',
      consultationType: 'consultation',
      type: 'Telemedicine',
      dateTime: '2026-10-30T10:00:00Z',
      slotTime: '10:30 AM',
      notes: 'Initial clinical assessment for bilateral knee replacement.',
      status: 'CONFIRMED',
    }

    const res = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', patientToken)
      .send(payload)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBeDefined()
    activeAptId = res.body.data.id
  })

  // Step 2: Patient generates or joins video session
  it('should allow authorized patient to initialize and join video consultation session', async () => {
    const res = await request(app)
      .post(`/api/v1/appointments/${activeAptId}/video-session`)
      .set('Authorization', patientToken)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    const session = res.body.data

    expect(session.appointmentId).toBe(activeAptId)
    expect(session.caseId).toBe('ET-8492')
    expect(session.status).toBe('ACTIVE')
    expect(session.roomUrl).toBeDefined()
    expect(session.sessionToken).toBeDefined()
    expect(session.participantRole).toBe('patient')
    expect(session.isOwner).toBe(false)
    expect(session.enableRecording).toBe(false) // HIPAA Privacy rule: never record by default
    expect(session.enableScreenshare).toBe(true)
    expect(session.enableChat).toBe(true)
    expect(session.provider).toMatch(/^(daily|webrtc-e2ee)$/)

    // Security check: backend provider API secret must NEVER be exposed
    expect(JSON.stringify(res.body)).not.toContain('DAILY_API_KEY')
  })

  // Step 3: Provider joins video session with owner privileges
  it('should allow authorized provider/doctor to join video session with host controls', async () => {
    const res = await request(app)
      .post(`/api/v1/appointments/${activeAptId}/video-session`)
      .set('Authorization', providerToken)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    const session = res.body.data

    expect(session.appointmentId).toBe(activeAptId)
    expect(session.isOwner).toBe(true)
    expect(session.participantRole).toBe('provider')
    expect(session.enableRecording).toBe(false)
  })

  // Step 4: Admin joins session
  it('should allow platform admin to access session for clinical coordination', async () => {
    const res = await request(app)
      .post(`/api/v1/appointments/${activeAptId}/video-session`)
      .set('Authorization', adminToken)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.isOwner).toBe(true)
  })

  // Step 5: Unauthorized patient is rejected
  it('should reject unauthorized patient from joining another patient session with 403 Forbidden', async () => {
    const res = await request(app)
      .post(`/api/v1/appointments/${activeAptId}/video-session`)
      .set('Authorization', otherPatientToken)

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
    expect(res.body.error.message).toContain('Access Denied')
  })

  // Step 6: Unauthorized provider is rejected
  it('should reject unauthorized provider from accessing another clinic session with 403 Forbidden', async () => {
    const res = await request(app)
      .post(`/api/v1/appointments/${activeAptId}/video-session`)
      .set('Authorization', unauthorizedProviderToken)

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
    expect(res.body.error.message).toContain('Access Denied')
  })

  // Step 7: Retrieve active session
  it('should retrieve active session status for authorized participant', async () => {
    const res = await request(app)
      .get(`/api/v1/appointments/${activeAptId}/video-session`)
      .set('Authorization', patientToken)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('ACTIVE')
    expect(res.body.data.appointmentId).toBe(activeAptId)
  })

  // Step 8: Rejection on non-existent appointment
  it('should return 404 for video session on non-existent appointment', async () => {
    const res = await request(app)
      .post('/api/v1/appointments/apt-non-existent-9999/video-session')
      .set('Authorization', patientToken)

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })

  // Step 9: Rejection on CANCELLED appointment
  it('should reject video session creation on CANCELLED appointment with 400', async () => {
    // Create and cancel an appointment
    const createRes = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', patientToken)
      .send({
        caseId: 'ET-8492',
        patientId: 'pat-1',
        providerId: 'apex-joint-delhi',
        dateTime: '2026-11-05T14:00:00Z',
      })
    cancelledAptId = createRes.body.data.id

    await request(app)
      .post(`/api/v1/appointments/${cancelledAptId}/cancel`)
      .set('Authorization', patientToken)

    const sessionRes = await request(app)
      .post(`/api/v1/appointments/${cancelledAptId}/video-session`)
      .set('Authorization', patientToken)

    expect(sessionRes.status).toBe(400)
    expect(sessionRes.body.success).toBe(false)
    expect(sessionRes.body.error.message).toContain('CANCELLED')
  })

  // Step 10: End video session and verify transition to COMPLETED
  it('should allow provider to end video session, updating appointment status to COMPLETED', async () => {
    const res = await request(app)
      .post(`/api/v1/appointments/${activeAptId}/video-session/end`)
      .set('Authorization', providerToken)
      .send({ notes: 'Patient approved for Bilateral Mako Robotic Knee Arthroplasty.' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.appointment.status).toBe('COMPLETED')
    expect(res.body.data.session.status).toBe('COMPLETED')

    // Verify appointment query reflects completed status
    const aptRes = await request(app)
      .get(`/api/v1/appointments/${activeAptId}`)
      .set('Authorization', patientToken)

    expect(aptRes.status).toBe(200)
    expect(aptRes.body.data.status).toBe('COMPLETED')
  })

  // Step 11: Rejection on COMPLETED appointment
  it('should reject creating a new video session on an already COMPLETED appointment with 400', async () => {
    const res = await request(app)
      .post(`/api/v1/appointments/${activeAptId}/video-session`)
      .set('Authorization', patientToken)

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.error.message).toContain('COMPLETED')
  })
})
