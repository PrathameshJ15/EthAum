import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'

describe('Critical User Flow: Rahul\'s Complete Patient Journey', () => {
  let rahulToken: string
  let rahulUser: any
  let caseId: string
  let recordId: string
  let quoteId: string
  let appointmentId: string

  // Step 1: Rahul Creates Account
  it('Step 1: Rahul creates a patient account', async () => {
    const signupPayload = {
      email: `rahul.test.${Date.now()}@example.com`,
      password: 'SecurePassword#2026',
      name: 'Rahul Sharma',
      role: 'patient',
      phone: '+91 98765 43210',
      country: 'India',
    }

    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send(signupPayload)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.user.name).toBe('Rahul Sharma')
    expect(res.body.data.user.role).toBe('patient')
    expect(res.body.data.token).toBeDefined()

    rahulToken = res.body.data.token
    rahulUser = res.body.data.user
  })

  // Step 2: Rahul Creates Knee Replacement Medical Case
  it('Step 2: Rahul creates knee replacement Medical Case', async () => {
    const casePayload = {
      patientId: rahulUser.id,
      patientName: rahulUser.name,
      treatmentId: 'knee-replacement',
      treatmentName: 'Bilateral Robotic Total Knee Arthroplasty',
      destinationId: 'delhi',
      destinationName: 'Delhi, India',
      budgetMin: 5500,
      budgetMax: 7500,
      currency: 'USD',
      preferredDate: '2026-11-15',
      medicalHistory: 'Severe bilateral osteoarthritis Grade IV with significant medial joint collapse. Severe pain on weight bearing.',
      patientNotes: 'Requests Mako robotic joint replacement and companion suite.',
    }

    const res = await request(app)
      .post('/api/v1/cases')
      .set('Authorization', `Bearer ${rahulToken}`)
      .send(casePayload)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBeDefined()
    expect(res.body.data.patientName).toBe('Rahul Sharma')
    expect(res.body.data.treatmentId).toBe('knee-replacement')

    caseId = res.body.data.id
  })

  // Step 3: Rahul Uploads Fictional Diagnostic Records
  it('Step 3: Rahul uploads fictional diagnostic records', async () => {
    const uploadPayload = {
      caseId,
      fileName: 'Rahul_Bilateral_Knee_Coronal_MRI.pdf',
      category: 'MRI',
      type: 'Magnetic Resonance Imaging',
      size: '14.2 MB',
      sizeBytes: 14889984,
    }

    const res = await request(app)
      .post('/api/v1/medical-records/upload-url')
      .set('Authorization', `Bearer ${rahulToken}`)
      .send(uploadPayload)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.uploadUrl).toBeDefined()
    expect(res.body.data.record).toBeDefined()
    expect(res.body.data.record.caseId).toBe(caseId)

    recordId = res.body.data.record.id
  })

  // Step 4: AI Organizes Documents (Groq Document Intelligence)
  it('Step 4: AI organizes and analyzes uploaded documents', async () => {
    const docText = `
PATIENT DIAGNOSTIC REPORT
Patient: Rahul Sharma | Modality: Bilateral Knee High-Res MRI
Clinical Indication: Severe bilateral gonarthrosis
Findings: Extensive cartilage delamination and bare bone contact over medial compartments bilaterally.
Tricompartmental marginal osteophytosis. Joint space narrowing >80%.
Current Medications: Celecoxib 200mg daily, Paracetamol PRN.
Pending Requirements: Pre-operative electrocardiogram (ECG) and complete metabolic panel.
`
    const res = await request(app)
      .post(`/api/v1/medical-records/${recordId}/analyze-ai`)
      .set('Authorization', `Bearer ${rahulToken}`)
      .send({
        documentText: docText,
        caseContext: 'Bilateral Robotic Total Knee Arthroplasty candidate',
      })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.analysis).toBeDefined()
    expect(res.body.data.analysis.documentType).toBe('MRI')
    expect(res.body.data.analysis.summary).toBeDefined()
    expect(res.body.data.analysis.confidence).toBeGreaterThanOrEqual(0.7)
    expect(res.body.data.analysis.missingInformation.length).toBeGreaterThan(0)
  }, 30000)

  // Step 5 & 6: AI Creates Case Summary & Identifies Missing Info
  it('Steps 5 & 6: AI creates structured case summary and identifies missing information', async () => {
    const res = await request(app)
      .post(`/api/v1/cases/${caseId}/summary/generate`)
      .set('Authorization', `Bearer ${rahulToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.summary).toBeDefined()

    const summary = res.body.data.summary
    expect(summary.caseObjective).toBeDefined()
    expect(summary.executiveBrief).toBeDefined()
    expect(summary.missingInformation).toBeDefined()
    expect(summary.missingInformation.value).not.toBe('')
    expect(summary.disclaimer).toContain('AI-generated information is for coordination and informational purposes')
  }, 30000)

  // Step 7: Providers Matched
  it('Step 7: Providers matched using transparent criteria and AI explanation', async () => {
    const res = await request(app)
      .get(`/api/v1/cases/${caseId}/matches`)
      .set('Authorization', `Bearer ${rahulToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.matches).toBeDefined()
    expect(Array.isArray(res.body.data.matches)).toBe(true)
    expect(res.body.data.matches.length).toBeGreaterThan(0)

    const topMatch = res.body.data.matches[0]
    expect(topMatch.provider).toBeDefined()
    expect(topMatch.matchScore).toBeGreaterThanOrEqual(50)
    expect(topMatch.whyRelevant).toBeDefined()
    expect(topMatch.scoringBreakdown).toBeDefined()
  }, 30000)

  // Step 8: Quotes Received
  it('Step 8: Hospital provider submits quote for Rahul\'s case', async () => {
    const quotePayload = {
      caseId,
      providerId: 'apex-joint-delhi',
      providerName: 'Apex Orthopedic & Robotic Joint Institute',
      treatmentId: 'knee-replacement',
      treatmentName: 'Bilateral Robotic Total Knee Arthroplasty',
      currency: 'USD',
      total: 6500,
      consultation: {
        description: 'Comprehensive pre-operative video evaluation',
        cost: 300,
      },
      diagnostics: {
        description: 'Pre-op 3D CT scan for robotic arm mapping',
        cost: 600,
      },
      accommodation: {
        roomType: 'Deluxe Private Suite with Companion Bed',
        nights: 5,
        cost: 1200,
        applicable: true,
        notes: 'Includes companion meals and nurse monitoring',
      },
      otherServices: {
        description: 'Airport chauffeur transfers and inpatient physical therapy',
        cost: 900,
      },
      notes: 'Robotic arm-assisted cruciate retaining knee arthroplasty with Stryker Mako.',
      exclusions: 'Personal airfare and non-medical hotel stays',
      validity: '2026-12-31',
    }

    const res = await request(app)
      .post('/api/v1/quotes')
      .set('Authorization', 'Bearer provider-token')
      .send(quotePayload)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBeDefined()
    expect(res.body.data.total).toBe(6500)

    quoteId = res.body.data.id

    // Submit quote so patient can inspect
    await request(app)
      .post(`/api/v1/quotes/${quoteId}/submit`)
      .set('Authorization', 'Bearer provider-token')
  })

  // Step 9: Patient Compares Quotes
  it('Step 9: Patient retrieves and compares institutional quotes', async () => {
    const res = await request(app)
      .get(`/api/v1/quotes?caseId=${caseId}`)
      .set('Authorization', `Bearer ${rahulToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)

    const quote = res.body.data.find((q: any) => q.id === quoteId)
    expect(quote).toBeDefined()
    expect(quote.total).toBe(6500)
    expect(quote.accommodation.roomType).toContain('Deluxe')
    expect(quote.consultation.cost).toBe(300)
  })

  // Step 10: Selects Provider
  it('Step 10: Rahul accepts the quote and confirms provider selection', async () => {
    const res = await request(app)
      .post(`/api/v1/quotes/${quoteId}/accept`)
      .set('Authorization', `Bearer ${rahulToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('ACCEPTED')
  })

  // Step 11: Books Consultation
  it('Step 11: Rahul requests pre-surgical surgeon consultation and provider confirms', async () => {
    // Check slot availability
    const slotsRes = await request(app)
      .get('/api/v1/appointments/slots?doctorId=dr-vikram-oberoi&date=2026-10-25')
      .set('Authorization', `Bearer ${rahulToken}`)

    expect(slotsRes.status).toBe(200)
    expect(slotsRes.body.data.availableSlots.length).toBeGreaterThan(0)

    // Patient requests consultation
    const aptRes = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${rahulToken}`)
      .send({
        caseId,
        doctorId: 'dr-vikram-oberoi',
        providerId: 'apex-joint-delhi',
        dateTime: '2026-10-25T10:30:00Z',
        consultationType: 'consultation',
        format: 'Telemedicine',
        notes: 'Discussion of robotic bone cuts and recovery timeline.',
      })

    expect(aptRes.status).toBe(201)
    expect(aptRes.body.data.status).toBe('REQUESTED')
    appointmentId = aptRes.body.data.id

    // Provider confirms consultation
    const confirmRes = await request(app)
      .post(`/api/v1/appointments/${appointmentId}/confirm`)
      .set('Authorization', 'Bearer provider-token')

    expect(confirmRes.status).toBe(200)
    expect(confirmRes.body.data.status).toBe('CONFIRMED')
    expect(confirmRes.body.data.meetingUrl).toContain('meet.ethaum')

    // Consultation completed by surgeon
    const completeRes = await request(app)
      .post(`/api/v1/appointments/${appointmentId}/complete`)
      .set('Authorization', 'Bearer provider-token')

    expect(completeRes.status).toBe(200)
    expect(completeRes.body.data.status).toBe('COMPLETED')
  })

  // Step 12: Books Treatment (Mock Escrow Placeholder)
  it('Step 12: Rahul books treatment with simulated mock escrow authorization', async () => {
    const bookingPayload = {
      admissionDate: '2026-11-15',
      packagePrice: 6500,
      currency: 'USD',
      depositAmount: 500,
      estimatedStayDays: 10,
      providerId: 'apex-joint-delhi',
      providerName: 'Apex Orthopedic & Robotic Joint Institute',
      doctorId: 'dr-vikram-oberoi',
      doctorName: 'Dr. Vikram Oberoi',
      treatmentId: 'knee-replacement',
      treatmentName: 'Bilateral Robotic Total Knee Arthroplasty',
      companionNotes: 'Wife traveling along, requires companion suite and kosher/vegetarian meals.',
      specialRequirements: ['Airport Chauffeur Transfer', 'Private Recovery Suite'],
      mockPayment: {
        method: 'SOVEREIGN_MOCK_ESCROW',
        holderName: 'Rahul Sharma',
        last4: '4242',
      },
    }

    const res = await request(app)
      .post(`/api/v1/cases/${caseId}/book`)
      .set('Authorization', `Bearer ${rahulToken}`)
      .send(bookingPayload)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('CONFIRMED')
    expect(res.body.data.mockPaymentRef).toMatch(/^MOCK-ESCROW-/)
    expect(res.body.data.paymentStatus).toBe('MOCK_ESCROW_AUTHORIZED')

    // Verify medical case itself was transitioned to BOOKED
    const caseRes = await request(app)
      .get(`/api/v1/cases/${caseId}`)
      .set('Authorization', `Bearer ${rahulToken}`)

    expect(caseRes.status).toBe(200)
    expect(caseRes.body.data.status).toBe('BOOKED')
    expect(caseRes.body.data.journeyStage).toBe('Booked')
    expect(caseRes.body.data.bookingDetails.paymentStatus).toBe('MOCK_ESCROW_AUTHORIZED')
  })

  // Step 13: Journey Updates (Treatment Stage)
  it('Step 13: Case journey advances to Treatment stage', async () => {
    const res = await request(app)
      .patch(`/api/v1/journey/${caseId}/stage`)
      .set('Authorization', `Bearer ${rahulToken}`)
      .send({ status: 'TREATMENT', stage: 'Treatment' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.currentStage.id).toBe('TREATMENT')
  })

  // Step 14: Aftercare
  it('Step 14: Case journey advances to Aftercare with rapid recovery protocol', async () => {
    // Advance to aftercare stage
    const stageRes = await request(app)
      .patch(`/api/v1/journey/${caseId}/stage`)
      .set('Authorization', `Bearer ${rahulToken}`)
      .send({ status: 'AFTERCARE', stage: 'Aftercare' })

    expect(stageRes.status).toBe(200)
    expect(stageRes.body.data.currentStage.id).toBe('AFTERCARE')

    // Retrieve aftercare plan
    const planRes = await request(app)
      .get(`/api/v1/aftercare/${caseId}`)
      .set('Authorization', `Bearer ${rahulToken}`)

    expect(planRes.status).toBe(200)
    expect(planRes.body.data).toBeDefined()
    expect(planRes.body.data.reminders.length).toBeGreaterThan(0)

    // Retrieve reminders and acknowledge
    const remindersRes = await request(app)
      .get(`/api/v1/aftercare/${caseId}/reminders`)
      .set('Authorization', `Bearer ${rahulToken}`)

    expect(remindersRes.status).toBe(200)
    expect(Array.isArray(remindersRes.body.data)).toBe(true)
    if (remindersRes.body.data.length > 0) {
      const remId = remindersRes.body.data[0].id
      const ackRes = await request(app)
        .post(`/api/v1/aftercare/${caseId}/reminders/${remId}/acknowledge`)
        .set('Authorization', `Bearer ${rahulToken}`)

      expect(ackRes.status).toBe(200)
      expect(['COMPLETED', 'ACKNOWLEDGED', 'acknowledged']).toContain(ackRes.body.data.status)
    }
  })

  // Step 15: Completed
  it('Step 15: Case journey successfully finishes at Completed stage', async () => {
    const res = await request(app)
      .patch(`/api/v1/journey/${caseId}/stage`)
      .set('Authorization', `Bearer ${rahulToken}`)
      .send({ status: 'COMPLETED', stage: 'Completed' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.currentStage.id).toBe('COMPLETED')

    // Confirm final case status
    const caseRes = await request(app)
      .get(`/api/v1/cases/${caseId}`)
      .set('Authorization', `Bearer ${rahulToken}`)

    expect(caseRes.status).toBe(200)
    expect(caseRes.body.data.status).toBe('COMPLETED')
  })
})
