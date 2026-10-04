import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import {
  groqService,
  AI_PROVIDER_MATCHING_DISCLAIMER,
  providerRelevanceSchema,
} from '../src/services/groqService.js'
import { providerMatchingService } from '../src/services/providerMatchingService.js'
import { providerService, MOCK_PROVIDERS } from '../src/services/providerService.js'
import { caseService } from '../src/services/caseService.js'
import { Provider, MedicalCase, MedicalCaseStatus } from '../src/types/index.js'

describe('Phase 12: EthAum Provider Matching System', () => {
  const originalEnvKey = process.env.GROQ_API_KEY

  beforeEach(() => {
    vi.restoreAllMocks()
    groqService.setClient(null)
  })

  afterEach(() => {
    process.env.GROQ_API_KEY = originalEnvKey
    groqService.setClient(null)
  })

  describe('1. Hard Filters Validation', () => {
    const testCase: MedicalCase = {
      id: 'CASE-TEST-1',
      patientId: 'pat-1',
      patientName: 'John Doe',
      treatmentId: 'knee-replacement',
      treatmentName: 'Robotic Total Knee Replacement',
      status: MedicalCaseStatus.MATCHING,
      journeyStage: 'Matching',
      destinationId: 'in',
      destinationName: 'India',
      budgetMin: 5000,
      budgetMax: 10000,
      currency: 'USD',
      medicalHistory: 'Severe osteoarthritis Grade IV',
      patientNotes: 'Traveling with spouse, needs companion room',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    it('rejects unaccredited providers (Verification hard filter)', () => {
      const unaccreditedProvider: Provider = {
        id: 'unaccredited-clinic',
        name: 'Unaccredited Clinic',
        city: 'Delhi',
        country: 'India',
        overview: 'Clinic without international accreditation',
        languages: ['English'],
        rating: 4.0,
        reviewCount: 10,
        accreditations: [], // Empty accreditations
        treatmentsOffered: [
          {
            treatmentId: 'knee-replacement',
            name: 'Robotic Total Knee Replacement',
            startingPriceUSD: 7200,
          },
        ],
        facilities: ['Robotic Navigation'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const passes = providerMatchingService.passesHardFilters(unaccreditedProvider, testCase, {})
      expect(passes).toBe(false)
    })

    it('rejects providers that lack the target treatment or relevant specialty', () => {
      const dentalOnlyProvider: Provider = {
        id: 'dental-center',
        name: 'Dental Care Center',
        city: 'Delhi',
        country: 'India',
        overview: 'Specialized dental clinic',
        languages: ['English'],
        rating: 4.8,
        reviewCount: 50,
        accreditations: ['JCI'],
        treatmentsOffered: [
          {
            treatmentId: 'dental-implants',
            name: 'All-on-4 Dental Implants',
            startingPriceUSD: 4500,
          },
        ],
        facilities: ['3D CBCT Scanner'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const passes = providerMatchingService.passesHardFilters(dentalOnlyProvider, testCase, {})
      expect(passes).toBe(false)
    })

    it('accepts accredited providers that offer target treatment and match destination', () => {
      const apexDelhi = MOCK_PROVIDERS.find((p) => p.id === 'apex-joint-delhi')!
      expect(apexDelhi).toBeDefined()
      const passes = providerMatchingService.passesHardFilters(apexDelhi, testCase, {
        destinationFilter: 'India',
      })
      expect(passes).toBe(true)
    })

    it('filters out providers when destination filter does not match', () => {
      const bumrungrad = MOCK_PROVIDERS.find((p) => p.id === 'bumrungrad-partner-bangkok')!
      expect(bumrungrad).toBeDefined()
      const passes = providerMatchingService.passesHardFilters(bumrungrad, testCase, {
        destinationFilter: 'India',
      })
      expect(passes).toBe(false)
    })
  })

  describe('2. Transparent Scoring Dimensions (0 - 100 Points)', () => {
    const testCase: MedicalCase = {
      id: 'CASE-TEST-KNEE',
      patientId: 'pat-1',
      patientName: 'John Doe',
      treatmentId: 'knee-replacement',
      treatmentName: 'Robotic Total Knee Replacement',
      status: MedicalCaseStatus.MATCHING,
      journeyStage: 'Matching',
      destinationId: 'in',
      destinationName: 'India',
      budgetMin: 5000,
      budgetMax: 10000,
      currency: 'USD',
      medicalHistory: 'Severe knee arthritis requiring Mako robotic navigation',
      patientNotes: 'Traveling with spouse, companion suite preferred',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    it('scores Apex Joint Center with transparent dimension breakdown', () => {
      const apexDelhi = MOCK_PROVIDERS.find((p) => p.id === 'apex-joint-delhi')!
      const { breakdown, factors } = providerMatchingService.calculateMatchScore(apexDelhi, testCase)

      // Treatment fit (max 30): exact match (20) + robotics available (10) = 30
      expect(breakdown.treatmentFit).toBe(30)
      // Destination fit (max 25): country match (20) + city match (5) = 25
      expect(breakdown.destinationFit).toBe(25)
      // Specialization fit (max 20): JCI (10) + 20+ yr lead doc (5) + dedicated center (5) = 20
      expect(breakdown.specializationFit).toBe(20)
      // Availability & Logistics (max 15): airport VIP (5) + visa (5) + translators (5) = 15
      expect(breakdown.availabilityFit).toBe(15)
      // Preference fit (max 10): package $7200 <= budgetMax $10000 (5) + companion suite (5) = 10
      expect(breakdown.preferenceFit).toBe(10)

      expect(breakdown.totalScore).toBe(100)
      expect(factors.length).toBeGreaterThanOrEqual(5)
      expect(factors.some((f) => f.includes('Robotic Total Knee Replacement'))).toBe(true)
      expect(factors).toContain('Robotic Navigation (Mako / Rosa) Available on Campus')
      expect(factors).toContain('Gold Seal JCI Accredited Hospital')
    })

    it('calculates explainable points for international alternative hub', () => {
      const medicaSur = MOCK_PROVIDERS.find((p) => p.id === 'medica-sur-mexico')!
      const { breakdown } = providerMatchingService.calculateMatchScore(medicaSur, testCase)

      // Different destination country (Mexico vs India) gets baseline alternative destination score
      expect(breakdown.destinationFit).toBe(10)
      // Still gets high treatment fit because of knee replacement capability
      expect(breakdown.treatmentFit).toBeGreaterThanOrEqual(20)
      expect(breakdown.totalScore).toBeGreaterThan(0)
      expect(breakdown.totalScore).toBeLessThanOrEqual(100)
    })
  })

  describe('3. AI Relevance Explanation & Safety Constraints', () => {
    it('verifies Groq system prompt enforces strictly NO superlatives or medical superiority', async () => {
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
                        whyRelevant:
                          'Apex Joint Replacement & Robotic Institute provides robotic knee navigation and holds international JCI accreditation aligned with the patient requirements.',
                        highlights: [
                          'Mako robotic surgical navigation on site',
                          'Gold Seal JCI and NABH accredited facility',
                          'Experienced orthopedic surgical team with over 22 years of joint replacement experience',
                        ],
                        disclaimer: AI_PROVIDER_MATCHING_DISCLAIMER,
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

      const result = await groqService.generateProviderRelevanceExplanation({
        caseSummary: 'Severe tricompartmental osteoarthritis Grade IV',
        treatmentName: 'Robotic Total Knee Replacement',
        destinationPreference: 'India',
        providerName: 'Apex Joint Replacement & Robotic Institute',
        providerCity: 'New Delhi',
        providerCountry: 'India',
        accreditations: ['JCI', 'NABH'],
        matchFactors: ['Verified Robotic Knee procedure', 'JCI Accredited'],
        offeredTreatment: 'Robotic Total Knee Replacement',
        startingPriceUSD: 7200,
        facilities: ['Mako Robotic System', 'Executive Suites'],
      })

      // Verify safety rules present in system prompt
      expect(capturedSystemPrompt).toContain('DO NOT decide or claim that this provider is the "best"')
      expect(capturedSystemPrompt).toContain('medically superior')
      expect(capturedSystemPrompt).toContain('NEVER guarantee medical outcomes')
      expect(capturedSystemPrompt).toContain('Explain WHY the provider appears relevant based ONLY on structured matching facts')

      // Verify generated output
      expect(result.whyRelevant).toContain('Apex Joint Replacement & Robotic Institute')
      expect(result.highlights).toHaveLength(3)
      expect(result.disclaimer).toBe(AI_PROVIDER_MATCHING_DISCLAIMER)
    })

    it('sanitizes and strips forbidden superlative terms if model hallucinates them', async () => {
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      whyRelevant:
                        'This is the best hospital with guaranteed outcomes and superior doctors in the country.',
                      highlights: [
                        'Ranked #1 hospital in the world',
                        'Safest orthopedic procedure',
                      ],
                      disclaimer: AI_PROVIDER_MATCHING_DISCLAIMER,
                    }),
                  },
                },
              ],
            }),
          },
        },
      }

      groqService.setClient(mockClient as any)

      const result = await groqService.generateProviderRelevanceExplanation({
        caseSummary: 'Knee replacement',
        treatmentName: 'Robotic Total Knee Replacement',
        destinationPreference: 'India',
        providerName: 'Apex Joint',
        providerCity: 'Delhi',
        providerCountry: 'India',
        accreditations: ['JCI'],
        matchFactors: ['Robotic surgery available'],
      })

      // Must NOT contain forbidden superlatives
      expect(result.whyRelevant).not.toMatch(/\bbest\b/i)
      expect(result.whyRelevant).not.toMatch(/\bguaranteed\b/i)
      expect(result.whyRelevant).not.toMatch(/\bsuperior\b/i)
      expect(result.highlights[0]).not.toMatch(/#1/)
      expect(result.highlights[1]).not.toMatch(/\bsafest\b/i)
    })

    it('validates providerRelevanceSchema with Zod', () => {
      const valid = {
        whyRelevant: 'Center provides specialized joint replacement with robotic navigation and JCI standards.',
        highlights: ['JCI accredited', 'Robotic suite'],
        disclaimer: AI_PROVIDER_MATCHING_DISCLAIMER,
      }
      const parsed = providerRelevanceSchema.safeParse(valid)
      expect(parsed.success).toBe(true)

      const invalid = {
        whyRelevant: 'Too short',
        highlights: [],
      }
      const parsedInvalid = providerRelevanceSchema.safeParse(invalid)
      expect(parsedInvalid.success).toBe(false)
    })
  })

  describe('4. Complete End-to-End Pipeline & API Endpoints', () => {
    it('executes providerMatchingService.matchProvidersForCase returning ranked matches', async () => {
      const matchResult = await providerMatchingService.matchProvidersForCase('ET-8492', {
        includeAiExplanations: false, // fallback explanation format
      })

      expect(matchResult.caseId).toBe('ET-8492')
      expect(matchResult.treatmentTarget).toBe('Total Knee Replacement (Robotic Mako/Rosa)')
      expect(matchResult.matches.length).toBeGreaterThan(0)
      expect(matchResult.disclaimer).toBe(AI_PROVIDER_MATCHING_DISCLAIMER)

      // First match should be highest score (Apex Joint Delhi)
      const topMatch = matchResult.matches[0]
      expect(topMatch.provider.id).toBe('apex-joint-delhi')
      expect(topMatch.matchScore).toBeGreaterThanOrEqual(90)
      expect(topMatch.scoringBreakdown.treatmentFit).toBeGreaterThan(0)
      expect(topMatch.trustInformation.accreditations.some((a: string) => a.includes('JCI'))).toBe(true)
      expect(topMatch.trustInformation.leadSurgeonExperienceYears).toBeGreaterThanOrEqual(20)
    })

    it('rejects unauthenticated requests to case matches API', async () => {
      const res = await request(app).get('/api/v1/cases/ET-8492/matches')
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('returns ranked provider matches via authorized GET /api/v1/cases/:id/matches', async () => {
      const res = await request(app)
        .get('/api/v1/cases/ET-8492/matches')
        .set('Authorization', 'Bearer dev-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.matches).toBeDefined()
      expect(res.body.data.matches.length).toBeGreaterThan(0)
      expect(res.body.data.disclaimer).toBe(AI_PROVIDER_MATCHING_DISCLAIMER)

      const firstMatch = res.body.data.matches[0]
      expect(firstMatch.provider.name).toBeDefined()
      expect(firstMatch.matchScore).toBeTypeOf('number')
      expect(firstMatch.scoringBreakdown).toBeDefined()
      expect(firstMatch.whyRelevant).toBeDefined()
      expect(firstMatch.trustInformation).toBeDefined()
    }, 30000)

    it('supports destination filter query parameter via GET /api/v1/providers/match/:caseId', async () => {
      const res = await request(app)
        .get('/api/v1/providers/match/ET-8492?destination=India')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.matches.length).toBeGreaterThan(0)
      // All returned matches must be in India
      res.body.data.matches.forEach((m: any) => {
        expect(m.provider.country.toLowerCase()).toBe('india')
      })
    }, 30000)
  })
})
