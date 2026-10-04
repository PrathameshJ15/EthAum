import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import {
  groqService,
  sanitizeMedicalText,
  validateDocumentExtension,
  documentIntelligenceSchema,
  AI_MEDICAL_DISCLAIMER,
} from '../src/services/groqService.js'
import {
  ConfigurationError,
  UnsupportedDocumentError,
  AiProcessingError,
  ValidationError,
} from '../src/utils/apiError.js'

describe('Phase 10: Groq AI Document Intelligence Service', () => {
  const originalEnvKey = process.env.GROQ_API_KEY

  beforeEach(() => {
    vi.restoreAllMocks()
    groqService.setClient(null)
  })

  afterEach(() => {
    process.env.GROQ_API_KEY = originalEnvKey
    groqService.setClient(null)
  })

  describe('1. Data Minimization & Privacy Sanitization', () => {
    it('strips emails, phone numbers, and explicit patient names from clinical text', () => {
      const rawText =
        'Patient Name: Eleanor Vance. Contact: eleanor.vance@example.com, Phone: +44 7911 123456. ' +
        'Evaluated for bilateral severe osteoarthritis. Prescribed Lisinopril 10mg daily.'

      const sanitized = sanitizeMedicalText(rawText)

      expect(sanitized).not.toContain('eleanor.vance@example.com')
      expect(sanitized).not.toContain('+44 7911 123456')
      expect(sanitized).not.toContain('Eleanor Vance')
      expect(sanitized).toContain('[REDACTED_EMAIL]')
      expect(sanitized).toContain('[REDACTED_PHONE]')
      expect(sanitized).toContain('[ANONYMIZED_PATIENT]')
      expect(sanitized).toContain('osteoarthritis')
      expect(sanitized).toContain('Lisinopril 10mg')
    })
  })

  describe('2. Unsupported Document Format Handling', () => {
    it('accepts supported medical file extensions (.pdf, .dcm, .jpg, .png, .txt)', () => {
      expect(() => validateDocumentExtension('knee_mri.pdf')).not.toThrow()
      expect(() => validateDocumentExtension('ct_scan.dcm')).not.toThrow()
      expect(() => validateDocumentExtension('xray_chest.jpg')).not.toThrow()
      expect(() => validateDocumentExtension('pathology.png')).not.toThrow()
      expect(() => validateDocumentExtension('clinical_notes.txt')).not.toThrow()
    })

    it('rejects unsupported extensions (.exe, .mp3, .bin, .zip) with UnsupportedDocumentError', () => {
      expect(() => validateDocumentExtension('malicious.exe')).toThrow(UnsupportedDocumentError)
      expect(() => validateDocumentExtension('recording.mp3')).toThrow(UnsupportedDocumentError)
      expect(() => validateDocumentExtension('payload.bin')).toThrow(UnsupportedDocumentError)
      expect(() => validateDocumentExtension('archive.zip')).toThrow(UnsupportedDocumentError)
      expect(() => validateDocumentExtension('file_without_extension')).toThrow(
        UnsupportedDocumentError
      )
    })
  })

  describe('3. Missing API Key Handling', () => {
    it('throws ConfigurationError when GROQ_API_KEY is not configured in environment', async () => {
      delete process.env.GROQ_API_KEY

      await expect(
        groqService.analyzeDocument({
          documentName: 'Right_Knee_Coronal_MRI.pdf',
          documentText: 'Grade IV osteoarthritis in medial joint.',
        })
      ).rejects.toThrow(ConfigurationError)
    })
  })

  describe('4. Valid Document Processing with Structured Output', () => {
    it('successfully extracts structured document intelligence conforming to schema', async () => {
      process.env.GROQ_API_KEY = 'gsk_mock_test_key_for_unit_tests'

      const mockAiOutput = {
        documentType: 'MRI',
        confidence: 0.98,
        relevantDates: ['2026-09-12'],
        mentionedConditions: ['Tricompartmental osteoarthritis Grade IV', 'Medial joint space collapse'],
        mentionedProcedures: ['Previous arthroscopic debridement'],
        medications: [
          { name: 'Lisinopril', dosage: '10mg', frequency: 'Daily' },
          { name: 'Celecoxib', dosage: '200mg', frequency: 'PRN' },
        ],
        missingInformation: ['Pre-operative 12-lead ECG', 'HbA1c Blood Panel within 90 days'],
        summary:
          'High-resolution coronal MRI confirming Grade IV osteoarthritic changes with intact posterior cruciate ligament.',
        disclaimer: AI_MEDICAL_DISCLAIMER,
      }

      // Mock Groq SDK client response
      const mockGroq = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: JSON.stringify(mockAiOutput),
                  },
                },
              ],
            }),
          },
        },
      }

      groqService.setClient(mockGroq as any)

      const result = await groqService.analyzeDocument({
        documentName: 'Right_Knee_Coronal_MRI.pdf',
        documentText: 'MRI shows severe medial joint collapse. Patient takes Lisinopril 10mg daily.',
        declaredCategory: 'MRI',
      })

      expect(result.documentType).toBe('MRI')
      expect(result.confidence).toBe(0.98)
      expect(result.relevantDates).toContain('2026-09-12')
      expect(result.mentionedConditions).toContain('Tricompartmental osteoarthritis Grade IV')
      expect(result.medications.length).toBe(2)
      expect(result.medications[0].name).toBe('Lisinopril')
      expect(result.missingInformation).toContain('Pre-operative 12-lead ECG')
      expect(result.summary).toContain('High-resolution coronal MRI')
      expect(result.disclaimer).toBe(AI_MEDICAL_DISCLAIMER)
      expect(result.processedAt).toBeDefined()
    })
  })

  describe('5. Malformed AI Response Handling', () => {
    it('rejects AI response that fails schema validation without blindly saving it', async () => {
      process.env.GROQ_API_KEY = 'gsk_mock_test_key'

      // Malformed output missing mandatory summary and with invalid confidence (> 1)
      const invalidAiOutput = {
        documentType: 'InvalidTypeXYZ',
        confidence: 5.5,
        summary: 'too short', // < 10 chars
      }

      const mockGroq = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: JSON.stringify(invalidAiOutput) } }],
            }),
          },
        },
      }

      groqService.setClient(mockGroq as any)

      await expect(
        groqService.analyzeDocument({
          documentName: 'Report.pdf',
          documentText: 'Some clinical text',
        })
      ).rejects.toThrow(ValidationError)
    })

    it('rejects non-JSON response from model with controlled AiProcessingError', async () => {
      process.env.GROQ_API_KEY = 'gsk_mock_test_key'

      const mockGroq = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: 'Internal error: model produced raw plain text instead of json' } }],
            }),
          },
        },
      }

      groqService.setClient(mockGroq as any)

      await expect(
        groqService.analyzeDocument({
          documentName: 'Scan.pdf',
          documentText: 'Valid text',
        })
      ).rejects.toThrow(AiProcessingError)
    })
  })

  describe('6. API Failure & Timeout Handling', () => {
    it('catches Groq upstream API error and throws controlled AiProcessingError', async () => {
      process.env.GROQ_API_KEY = 'gsk_mock_test_key'

      const mockGroq = {
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue(new Error('Rate limit exceeded: 429 Too Many Requests')),
          },
        },
      }

      groqService.setClient(mockGroq as any)

      await expect(
        groqService.analyzeDocument({
          documentName: 'BloodReport.pdf',
          documentText: 'HbA1c: 5.8%',
        })
      ).rejects.toThrow(AiProcessingError)
    })

    it('handles timeout error gracefully with specific timeout message', async () => {
      process.env.GROQ_API_KEY = 'gsk_mock_test_key'

      const timeoutError = new Error('Request timed out')
      timeoutError.name = 'APIConnectionTimeoutError'

      const mockGroq = {
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue(timeoutError),
          },
        },
      }

      groqService.setClient(mockGroq as any)

      await expect(
        groqService.analyzeDocument({
          documentName: 'CT_Scan.dcm',
          documentText: 'CT volume slices',
        })
      ).rejects.toThrow(/timed out/i)
    })
  })

  describe('7. HTTP API Endpoint & Authorization Tests', () => {
    it('POST /api/v1/medical-records/analyze-text rejects unauthorized requests without token (HTTP 401)', async () => {
      const res = await request(app)
        .post('/api/v1/medical-records/analyze-text')
        .send({
          documentName: 'Knee_MRI.pdf',
          documentText: 'Severe osteoarthritis',
        })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('POST /api/v1/medical-records/:id/analyze-ai rejects unauthorized requests without token (HTTP 401)', async () => {
      const res = await request(app)
        .post('/api/v1/medical-records/rec-1/analyze-ai')
        .send({
          caseContext: 'Orthopedic evaluation',
        })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('POST /api/v1/medical-records/:id/analyze-ai rejects unauthorized provider without access (HTTP 403)', async () => {
      const res = await request(app)
        .post('/api/v1/medical-records/rec-1/analyze-ai')
        .set('Authorization', 'Bearer ethaum_unauthorized-provider_token')
        .send({
          caseContext: 'Orthopedic evaluation',
        })

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
    })

    it('POST /api/v1/medical-records/analyze-text validates file extension before calling Groq', async () => {
      const res = await request(app)
        .post('/api/v1/medical-records/analyze-text')
        .set('Authorization', 'Bearer ethaum_patient_token_usr-patient-1')
        .send({
          documentName: 'malicious_script.sh',
          documentText: 'echo Hello',
        })

      expect(res.status).toBe(415)
      expect(res.body.error.code).toBe('UNSUPPORTED_DOCUMENT_TYPE')
    })
  })
})
