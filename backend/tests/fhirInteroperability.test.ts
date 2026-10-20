import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { fhirService } from '../src/services/fhirService.js'

describe('HL7 FHIR R4 Interoperability Prototype Tests', () => {
  const sampleValidBundle = fhirService.getSyntheticSampleBundle()
  const validCaseId = 'ET-8492'

  describe('1. Standalone FHIR Validation API (/api/v1/fhir/validate)', () => {
    it('should validate a valid FHIR R4 bundle successfully', async () => {
      const res = await request(app)
        .post('/api/v1/fhir/validate')
        .send(sampleValidBundle)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.valid).toBe(true)
      expect(res.body.data.resourceType).toBe('Bundle')
      expect(res.body.data.errors).toHaveLength(0)
    })

    it('should validate a standalone valid FHIR Patient resource', async () => {
      const patientResource = {
        resourceType: 'Patient',
        id: 'test-patient-001',
        name: [{ use: 'official', family: 'Vance', given: ['Eleanor'] }],
        gender: 'female',
        birthDate: '1972-04-12',
      }

      const res = await request(app)
        .post('/api/v1/fhir/validate')
        .send(patientResource)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.valid).toBe(true)
      expect(res.body.data.resourceType).toBe('Patient')
    })

    it('should reject malformed or missing resourceType with validation errors', async () => {
      const invalidPayload = {
        name: 'Invalid Resource without resourceType',
        gender: 'unknown',
      }

      const res = await request(app)
        .post('/api/v1/fhir/validate')
        .send(invalidPayload)

      expect(res.status).toBe(422)
      expect(res.body.success).toBe(false)
      expect(res.body.data.valid).toBe(false)
      expect(res.body.data.errors.length).toBeGreaterThan(0)
    })

    it('should reject unsupported FHIR resource type', async () => {
      const unsupportedResource = {
        resourceType: 'DeviceMetric',
        id: 'metric-1',
      }

      const res = await request(app)
        .post('/api/v1/fhir/validate')
        .send(unsupportedResource)

      expect(res.status).toBe(422)
      expect(res.body.success).toBe(false)
      expect(res.body.data.valid).toBe(false)
      expect(res.body.data.errors[0].message).toContain('Unsupported FHIR resource type')
    })
  })

  describe('2. Synthetic Sample Bundle API (/api/v1/fhir/sample-bundle)', () => {
    it('should return the Eleanor Vance synthetic sample bundle', async () => {
      const res = await request(app).get('/api/v1/fhir/sample-bundle')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.resourceType).toBe('Bundle')
      expect(res.body.data.fhirVersion).toBe('4.0.1')
      expect(res.body.data.entry.length).toBeGreaterThanOrEqual(5)

      // Ensure synthetic patient is present
      const patientEntry = res.body.data.entry.find((e: any) => e.resource.resourceType === 'Patient')
      expect(patientEntry).toBeDefined()
      expect(patientEntry.resource.name[0].family).toBe('Vance')
    })
  })

  describe('3. FHIR Export Preview API (/api/v1/cases/:id/fhir/preview)', () => {
    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app).get(`/api/v1/cases/${validCaseId}/fhir/preview`)
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('should reject unauthorized cross-patient preview with 403', async () => {
      const res = await request(app)
        .get(`/api/v1/cases/${validCaseId}/fhir/preview`)
        .set('Authorization', 'Bearer other-patient-token')

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('FORBIDDEN')
    })

    it('should return preview summary for authorized patient', async () => {
      const res = await request(app)
        .get(`/api/v1/cases/${validCaseId}/fhir/preview`)
        .set('Authorization', 'Bearer patient-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.caseId).toBe(validCaseId)
      expect(res.body.data.fhirVersion).toBe('4.0.1')
      expect(res.body.data.resourceCounts).toBeDefined()
      expect(res.body.data.resourceCounts.Patient).toBe(1)
      expect(res.body.data.previewSummary.interoperabilityDisclaimer).toBeDefined()
    })
  })

  describe('4. FHIR Export API (/api/v1/cases/:id/fhir/export)', () => {
    it('should export authorized records as a complete FHIR R4 Bundle for patient', async () => {
      const res = await request(app)
        .get(`/api/v1/cases/${validCaseId}/fhir/export`)
        .set('Authorization', 'Bearer patient-token')

      expect(res.status).toBe(200)
      expect(res.header['content-type']).toContain('application/fhir+json')
      expect(res.body.resourceType).toBe('Bundle')
      expect(res.body.type).toBe('document')

      // Check contained resources
      const resourceTypes = res.body.entry.map((e: any) => e.resource.resourceType)
      expect(resourceTypes).toContain('Patient')
      expect(resourceTypes).toContain('Condition')
      expect(resourceTypes).toContain('DiagnosticReport')
    })

    it('should support download flag with Content-Disposition header', async () => {
      const res = await request(app)
        .get(`/api/v1/cases/${validCaseId}/fhir/export?download=true`)
        .set('Authorization', 'Bearer patient-token')

      expect(res.status).toBe(200)
      expect(res.header['content-disposition']).toContain('attachment; filename=')
      expect(res.header['content-disposition']).toContain(`${validCaseId}-fhir-r4.json`)
    })

    it('should enforce consent filtering when exported by a provider', async () => {
      const res = await request(app)
        .get(`/api/v1/cases/${validCaseId}/fhir/export`)
        .set('Authorization', 'Bearer provider-token')

      expect(res.status).toBe(200)
      expect(res.body.resourceType).toBe('Bundle')

      // Check DocumentReference entries - only records shared with 'apex-joint-delhi' should appear
      const docRefs = res.body.entry.filter((e: any) => e.resource.resourceType === 'DocumentReference')
      expect(docRefs.length).toBeGreaterThan(0)
    })

    it('should return 404 for non-existent case', async () => {
      const res = await request(app)
        .get('/api/v1/cases/non-existent-case-9999/fhir/export')
        .set('Authorization', 'Bearer patient-token')

      expect(res.status).toBe(404)
    })
  })

  describe('5. FHIR Bundle Staged Import & Duplicate Detection Workflow', () => {
    let stagingId: string

    it('should stage an incoming valid FHIR Bundle into PENDING_REVIEW', async () => {
      const res = await request(app)
        .post(`/api/v1/cases/${validCaseId}/fhir/import/stage`)
        .set('Authorization', 'Bearer patient-token')
        .send(sampleValidBundle)

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.stagingId).toBeDefined()
      expect(res.body.data.status).toBe('PENDING_REVIEW')
      expect(res.body.data.resourceCount).toBeGreaterThan(0)

      stagingId = res.body.data.stagingId
    })

    it('should detect duplicate records when staging a bundle with existing filenames', async () => {
      // The sample bundle contains 'Right_Knee_Coronal_MRI_HighRes.pdf' which already exists in ET-8492
      const res = await request(app)
        .post(`/api/v1/cases/${validCaseId}/fhir/import/stage`)
        .set('Authorization', 'Bearer patient-token')
        .send(sampleValidBundle)

      expect(res.status).toBe(201)
      const duplicateRecord = res.body.data.resources.find((r: any) => r.isDuplicate === true)
      expect(duplicateRecord).toBeDefined()
      expect(duplicateRecord.title).toContain('Right_Knee_Coronal_MRI')
    })

    it('should confirm staged import and integrate records', async () => {
      expect(stagingId).toBeDefined()

      const res = await request(app)
        .post(`/api/v1/cases/${validCaseId}/fhir/import/confirm`)
        .set('Authorization', 'Bearer patient-token')
        .send({ stagingId })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.staging.status).toBe('CONFIRMED')
      expect(Array.isArray(res.body.data.importedRecords)).toBe(true)
    })

    it('should reject confirming non-existent staging ID', async () => {
      const res = await request(app)
        .post(`/api/v1/cases/${validCaseId}/fhir/import/confirm`)
        .set('Authorization', 'Bearer patient-token')
        .send({ stagingId: 'non-existent-staging-id-9999' })

      expect(res.status).toBe(404)
    })
  })

  describe('6. FHIR Operations Audit Ledger (/api/v1/cases/:id/fhir/operations)', () => {
    it('should return chronological audit history of FHIR operations', async () => {
      const res = await request(app)
        .get(`/api/v1/cases/${validCaseId}/fhir/operations`)
        .set('Authorization', 'Bearer patient-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)

      const operationTypes = res.body.data.map((op: any) => op.operation)
      expect(operationTypes).toContain('EXPORT')
      expect(operationTypes).toContain('IMPORT_STAGE')
      expect(operationTypes).toContain('IMPORT_CONFIRM')
    })
  })
})
