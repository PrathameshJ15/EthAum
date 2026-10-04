import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import {
  groqService,
  caseCoordinationSummarySchema,
  AI_MEDICAL_DISCLAIMER,
  CaseCoordinationSummaryData,
} from '../src/services/groqService.js'
import { caseSummaryService } from '../src/services/caseSummaryService.js'
import { caseService } from '../src/services/caseService.js'
import { ValidationError, AiProcessingError } from '../src/utils/apiError.js'

describe('Phase 11: AI-Assisted Medical Case Summarization', () => {
  const originalEnvKey = process.env.GROQ_API_KEY

  beforeEach(() => {
    vi.restoreAllMocks()
    groqService.setClient(null)
  })

  afterEach(() => {
    process.env.GROQ_API_KEY = originalEnvKey
    groqService.setClient(null)
  })

  describe('1. Clinical Safety Directives & Disclaimer Verification', () => {
    it('verifies system prompt enforces non-diagnostic, non-prescriptive rules and disclaimer', async () => {
      let capturedSystemPrompt = ''

      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockImplementation(async (opts: any) => {
              capturedSystemPrompt = opts.messages[0].content
              return {
                choices: [
                  {
                    message: {
                      content: JSON.stringify({
                        caseObjective: {
                          value: 'Total Knee Replacement',
                          source: 'Patient provided',
                        },
                        patientProvidedInformation: {
                          value: 'Severe osteoarthritis Grade IV',
                          source: 'Patient provided',
                        },
                        uploadedDocumentTypes: {
                          types: ['MRI', 'X-Ray'],
                          source: 'Document extracted',
                        },
                        documentedMedicalHistory: {
                          value: 'Severe tricompartmental osteoarthritis',
                          source: 'Document extracted',
                        },
                        documentedProcedures: {
                          value: 'Not provided',
                          source: 'Not available',
                        },
                        knownMedications: {
                          items: [{ name: 'Celecoxib', dosage: '200mg', frequency: 'daily' }],
                          source: 'Document extracted',
                        },
                        missingInformation: {
                          items: ['Recent ECG', 'Blood panel within 90 days'],
                          source: 'AI summarized',
                        },
                        patientPreferences: {
                          value: 'Private room with spouse',
                          source: 'Patient provided',
                        },
                        travelCoordinationRequirements: {
                          value: 'Traveling with companion',
                          source: 'Patient provided',
                        },
                        executiveBrief: 'Patient seeking robotic knee replacement in Delhi with confirmed Grade IV osteoarthritis.',
                        disclaimer: AI_MEDICAL_DISCLAIMER,
                      }),
                    },
                  },
                ],
              }
            }),
          },
        },
      }

      groqService.setClient(mockClient as any)

      const result = await groqService.generateCaseSummary({
        caseId: 'ET-8492',
        treatmentName: 'Total Knee Replacement',
        medicalHistory: 'Severe osteoarthritis',
        recordsMetadata: [{ name: 'MRI.pdf', category: 'MRI' }],
      })

      // Verify system prompt safety rules
      expect(capturedSystemPrompt).toContain('You must NOT diagnose any illness')
      expect(capturedSystemPrompt).toContain('You must NOT recommend surgical procedures')
      expect(capturedSystemPrompt).toContain('You must NOT prescribe or adjust medications')
      expect(capturedSystemPrompt).toContain('You must NOT infer hidden or unverified medical conditions')
      expect(capturedSystemPrompt).toContain('NO INVENTED FACTS')
      expect(capturedSystemPrompt).toContain(AI_MEDICAL_DISCLAIMER)

      // Verify disclaimer in output
      expect(result.disclaimer).toBe(AI_MEDICAL_DISCLAIMER)
    })
  })

  describe('2. Strict Source Attribution & Not Provided Fallbacks', () => {
    it('accurately validates all 4 attribution sources (Patient provided, Document extracted, AI summarized, Not available)', () => {
      const validSummary: CaseCoordinationSummaryData = {
        caseObjective: { value: 'Hip Arthroscopy', source: 'Patient provided' },
        patientProvidedInformation: { value: 'Persistent groin pain for 6 months', source: 'Patient provided' },
        uploadedDocumentTypes: { types: ['MRI'], source: 'Document extracted' },
        documentedMedicalHistory: { value: 'Labral tear noted on coronal slices', source: 'Document extracted' },
        documentedProcedures: { value: 'Not provided', source: 'Not available' },
        knownMedications: { items: 'Not provided', source: 'Not available' },
        missingInformation: { items: ['Pre-operative cardiac clearance'], source: 'AI summarized' },
        patientPreferences: { value: 'Target budget $6,000 USD', source: 'Patient provided' },
        travelCoordinationRequirements: { value: 'Wheelchair assistance at airport', source: 'Patient provided' },
        executiveBrief: 'Patient with labral tear seeking arthroscopy with pre-op cardiac clearance pending.',
        disclaimer: AI_MEDICAL_DISCLAIMER,
      }

      const parseResult = caseCoordinationSummarySchema.safeParse(validSummary)
      expect(parseResult.success).toBe(true)
    })

    it('rejects summary when invalid attribution source is returned', () => {
      const invalidSummary = {
        caseObjective: { value: 'Hip Arthroscopy', source: 'Doctor guessed' }, // Invalid source
        patientProvidedInformation: { value: 'Pain', source: 'Patient provided' },
        uploadedDocumentTypes: { types: ['MRI'], source: 'Document extracted' },
        documentedMedicalHistory: { value: 'History', source: 'Document extracted' },
        documentedProcedures: { value: 'Not provided', source: 'Not available' },
        knownMedications: { items: 'Not provided', source: 'Not available' },
        missingInformation: { items: [], source: 'AI summarized' },
        patientPreferences: { value: 'None', source: 'Patient provided' },
        travelCoordinationRequirements: { value: 'None', source: 'Not available' },
        executiveBrief: 'Valid executive brief summary.',
        disclaimer: AI_MEDICAL_DISCLAIMER,
      }

      const parseResult = caseCoordinationSummarySchema.safeParse(invalidSummary)
      expect(parseResult.success).toBe(false)
    })
  })

  describe('3. Schema Validation & Malformed AI Handling', () => {
    it('throws ValidationError when Groq response fails Zod schema', async () => {
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      caseObjective: { value: 'Surgery' }, // missing source!
                      executiveBrief: 'Too short',
                    }),
                  },
                },
              ],
            }),
          },
        },
      }

      groqService.setClient(mockClient as any)

      await expect(
        groqService.generateCaseSummary({
          caseId: 'ET-8492',
          treatmentName: 'Robotic Surgery',
          recordsMetadata: [],
        })
      ).rejects.toThrow(ValidationError)
    })

    it('throws AiProcessingError when response is not valid JSON', async () => {
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: 'Internal Error: Model hallucinated raw text instead of JSON',
                  },
                },
              ],
            }),
          },
        },
      }

      groqService.setClient(mockClient as any)

      await expect(
        groqService.generateCaseSummary({
          caseId: 'ET-8492',
          treatmentName: 'Robotic Surgery',
          recordsMetadata: [],
        })
      ).rejects.toThrow(AiProcessingError)
    })
  })

  describe('4. Patient Fact Correction & Review Mechanism', () => {
    it('allows patient to submit a correction and overlays it directly on coordination summary', async () => {
      // First ensure a summary exists on ET-8492
      const initialSummary: any = {
        caseObjective: { value: 'Total Knee Replacement', source: 'Patient provided' },
        patientProvidedInformation: { value: 'Right knee pain', source: 'Patient provided' },
        uploadedDocumentTypes: { types: ['MRI'], source: 'Document extracted' },
        documentedMedicalHistory: { value: 'Grade III osteoarthritis', source: 'Document extracted' },
        documentedProcedures: { value: 'None', source: 'Not available' },
        knownMedications: {
          items: [{ name: 'Aspirin', dosage: '81mg', frequency: 'daily' }],
          source: 'Document extracted',
        },
        missingInformation: { items: ['ECG'], source: 'AI summarized' },
        patientPreferences: { value: 'None', source: 'Not available' },
        travelCoordinationRequirements: { value: 'None', source: 'Not available' },
        executiveBrief: 'Patient seeking knee replacement with Grade III osteoarthritis.',
        disclaimer: AI_MEDICAL_DISCLAIMER,
        generatedAt: new Date().toISOString(),
      }

      await caseService.updateCoordinationSummary('ET-8492', initialSummary)

      // Submit a patient correction for documentedMedicalHistory
      const { correction, summary } = await caseSummaryService.addCorrection('ET-8492', {
        sectionKey: 'documentedMedicalHistory',
        originalValue: 'Grade III osteoarthritis',
        correctedValue: 'Grade IV severe bone-on-bone osteoarthritis with varus deformity',
        reason: 'Updated based on 2026 surgical consult',
        userId: 'usr-patient-1',
      })

      expect(correction.id).toBeDefined()
      expect(correction.status).toBe('Corrected')
      expect(correction.correctedValue).toBe('Grade IV severe bone-on-bone osteoarthritis with varus deformity')

      // Verify the summary was updated with patient provided attribution
      expect(summary?.documentedMedicalHistory.value).toBe(
        'Grade IV severe bone-on-bone osteoarthritis with varus deformity'
      )
      expect(summary?.documentedMedicalHistory.source).toBe('Patient provided')
      expect(summary?.documentedMedicalHistory.notes).toContain('Corrected by patient')
    })
  })

  describe('5. HTTP API Endpoints & Access Control', () => {
    it('GET /api/v1/cases/:id/summary rejects unauthenticated requests (HTTP 401)', async () => {
      const res = await request(app).get('/api/v1/cases/ET-8492/summary')
      expect(res.status).toBe(401)
    })

    it('GET /api/v1/cases/:id/summary returns active summary and corrections with bearer token (HTTP 200)', async () => {
      const res = await request(app)
        .get('/api/v1/cases/ET-8492/summary')
        .set('Authorization', 'Bearer patient-test-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('summary')
      expect(res.body.data).toHaveProperty('corrections')
    })

    it('POST /api/v1/cases/:id/summary/corrections saves patient correction via API (HTTP 200)', async () => {
      const res = await request(app)
        .post('/api/v1/cases/ET-8492/summary/corrections')
        .set('Authorization', 'Bearer patient-test-token')
        .send({
          sectionKey: 'knownMedications',
          originalValue: 'Celecoxib 200mg',
          correctedValue: 'Celecoxib 200mg daily + Omeprazole 20mg morning',
          reason: 'Added gastroprotective medication',
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.correction.sectionKey).toBe('knownMedications')
      expect(res.body.data.correction.correctedValue).toContain('Omeprazole 20mg morning')
    })

    it('POST /api/v1/cases/:id/summary/corrections rejects missing correctedValue (HTTP 400)', async () => {
      const res = await request(app)
        .post('/api/v1/cases/ET-8492/summary/corrections')
        .set('Authorization', 'Bearer patient-test-token')
        .send({
          sectionKey: 'knownMedications',
          correctedValue: '', // empty!
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })
  })
})
