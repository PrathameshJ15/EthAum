import { Groq } from 'groq-sdk'
import { z } from 'zod'
import { env } from '../config/env.js'
import {
  ConfigurationError,
  UnsupportedDocumentError,
  AiProcessingError,
  ValidationError,
} from '../utils/apiError.js'

export const AI_MEDICAL_DISCLAIMER =
  'AI-generated information is for coordination and informational purposes and does not replace professional medical advice.'

export const SUPPORTED_EXTENSIONS = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.tiff',
  '.tif',
  '.dcm',
  '.dicom',
  '.txt',
]

export const SUPPORTED_DOCUMENT_TYPES = [
  'MRI',
  'X-Ray',
  'CT Scan',
  'Blood Report',
  'Prescription',
  'Medical History',
  'Discharge Summary',
  'Clinical Notes',
  'Other',
] as const

export type DocumentType = (typeof SUPPORTED_DOCUMENT_TYPES)[number]

/**
 * Structured Output Validation Schema for Medical Document Intelligence
 */
export const documentIntelligenceSchema = z.object({
  documentType: z.enum(SUPPORTED_DOCUMENT_TYPES),
  confidence: z.number().min(0).max(1),
  relevantDates: z.array(z.string()).default([]),
  mentionedConditions: z.array(z.string()).default([]),
  mentionedProcedures: z.array(z.string()).default([]),
  medications: z
    .array(
      z.object({
        name: z.string(),
        dosage: z.string().optional(),
        frequency: z.string().optional(),
      })
    )
    .default([]),
  missingInformation: z.array(z.string()).default([]),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  disclaimer: z.string().default(AI_MEDICAL_DISCLAIMER),
  processedAt: z.string().optional(),
})

export type DocumentIntelligenceResult = z.infer<typeof documentIntelligenceSchema>

export interface AnalyzeDocumentInput {
  documentName: string
  documentText?: string
  declaredCategory?: string
  caseContext?: string
}

/**
 * De-identification utility to scrub unnecessary personal identifiers
 * before sending textual snippets to the language model.
 */
export function sanitizeMedicalText(text: string): string {
  if (!text) return ''
  let sanitized = text
  // 1. Scrub emails
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
  // 2. Scrub phone numbers (international and local)
  sanitized = sanitized.replace(/(?:\+\d{1,3}[-.\s]*)?(?:\(?\d{2,5}\)?[-.\s]*)?\d{3,5}[-.\s]*\d{3,5}\b/g, '[REDACTED_PHONE]')
  // 3. Scrub SSN / National IDs
  sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_ID]')
  // 4. Scrub explicit patient name labels (e.g. "Patient: Eleanor Vance")
  sanitized = sanitized.replace(
    /(?:Patient(?:\s+Name)?|Name|Pt):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
    'Patient: [ANONYMIZED_PATIENT]'
  )
  return sanitized
}

/**
 * Validates document file extension against allowed clinical file types.
 */
export function validateDocumentExtension(fileName: string): void {
  const lowerName = fileName.toLowerCase().trim()
  const lastDot = lowerName.lastIndexOf('.')
  if (lastDot === -1) {
    throw new UnsupportedDocumentError(
      `File "${fileName}" does not have an extension. Supported extensions: ${SUPPORTED_EXTENSIONS.join(', ')}`
    )
  }
  const ext = lowerName.substring(lastDot)
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    throw new UnsupportedDocumentError(
      `File format "${ext}" is not supported for clinical indexing. Supported formats: ${SUPPORTED_EXTENSIONS.join(', ')}`
    )
  }
}

/**
 * Centralized Groq Service for Medical Document Intelligence
 */
class GroqService {
  private client: Groq | null = null
  private defaultModel = process.env.GROQ_MODEL || 'openai/gpt-oss-20b'

  /**
   * Allows injecting a custom client (useful for unit testing timeouts and mocks)
   */
  public setClient(customClient: Groq | null): void {
    this.client = customClient
  }

  public isConfigured(): boolean {
    const key = process.env.GROQ_API_KEY
    return Boolean(key && key.trim().length > 0)
  }

  private getClient(): Groq {
    if (this.client) {
      return this.client
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey || apiKey.trim().length === 0) {
      throw new ConfigurationError('GROQ_API_KEY is not configured in the backend environment')
    }

    this.client = new Groq({
      apiKey: apiKey.trim(),
      timeout: 15000, // 15 second request timeout
    })

    return this.client
  }

  /**
   * System Prompt enforcing non-diagnostic, informational coordination constraints.
   */
  private getSystemPrompt(): string {
    return `You are an administrative medical document coordinator and record indexing assistant for EthAum Sovereign Healthcare.
Your ONLY task is to classify medical records, extract factual text elements, and structure them into valid JSON.

CRITICAL SAFETY DIRECTIVES (NON-NEGOTIABLE):
1. You must NOT diagnose any illness, syndrome, or medical condition.
2. You must NOT prescribe any medication or treatment.
3. You must NOT recommend surgical procedures or evaluate whether surgery is necessary.
4. You must NOT act as or replace a licensed medical practitioner.
5. You must NOT guarantee medical outcomes or make emergency triage decisions.
6. Only extract symptoms, diagnoses, medications, and procedures if EXPLICITLY and unambiguously present in the input document text.
7. Identify any missing standard pre-procedure records (e.g. recent 12-lead ECG, blood panel within 90 days, weight-bearing views).
8. You MUST always include the following disclaimer verbatim:
   "${AI_MEDICAL_DISCLAIMER}"

Your response MUST be a valid JSON object matching this schema:
{
  "documentType": "MRI" | "X-Ray" | "CT Scan" | "Blood Report" | "Prescription" | "Medical History" | "Discharge Summary" | "Clinical Notes" | "Other",
  "confidence": number between 0.0 and 1.0,
  "relevantDates": ["YYYY-MM-DD", ...],
  "mentionedConditions": ["string", ...],
  "mentionedProcedures": ["string", ...],
  "medications": [{"name": "string", "dosage": "string", "frequency": "string"}],
  "missingInformation": ["string", ...],
  "summary": "Objective factual summary of document contents without diagnostic evaluation.",
  "disclaimer": "${AI_MEDICAL_DISCLAIMER}"
}`
  }

  /**
   * Analyzes an uploaded medical document with Groq LLM and validates output structure.
   */
  async analyzeDocument(input: AnalyzeDocumentInput): Promise<DocumentIntelligenceResult> {
    const startTime = Date.now()

    // 1. Validate file format
    validateDocumentExtension(input.documentName)

    // 2. Sanitize clinical input text (data minimization)
    const sanitizedText = sanitizeMedicalText(input.documentText || '')
    const safeContext = input.caseContext ? sanitizeMedicalText(input.caseContext) : ''

    // 3. Ensure Groq is configured
    const client = this.getClient()

    // 4. Safe logging (metadata only - NEVER log medical text or personal data)
    console.log(
      `[groqService] Processing document intelligence: name="${input.documentName}", textLen=${sanitizedText.length}`
    )

    const userPrompt = `Document Filename: ${input.documentName}
Declared Category: ${input.declaredCategory || 'Unspecified'}
${safeContext ? `Case Clinical Context: ${safeContext}\n` : ''}
Document Text / Content:
${sanitizedText || '[Binary diagnostic scan uploaded; classify primarily from filename, metadata, and clinical case context]'}`

    let rawResponseContent = ''

    try {
      const response = await client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1, // Low temperature for deterministic factual extraction
        max_tokens: 1024,
      })

      rawResponseContent = response.choices?.[0]?.message?.content || ''
    } catch (err: any) {
      // Safe error logging without prompt content
      console.error(`[groqService] Groq API call failed: ${err.name || 'Error'} - ${err.message}`)
      if (err.name === 'APIConnectionTimeoutError' || err.message?.includes('timeout')) {
        throw new AiProcessingError('Groq AI processing timed out after 15 seconds')
      }
      throw new AiProcessingError(`Groq AI service error: ${err.message}`)
    }

    if (!rawResponseContent || rawResponseContent.trim().length === 0) {
      throw new AiProcessingError('Groq AI returned an empty response')
    }

    // 5. Parse JSON
    let parsedJson: unknown
    try {
      parsedJson = JSON.parse(rawResponseContent)
    } catch (parseErr: any) {
      console.error(`[groqService] JSON parse error on AI response: ${parseErr.message}`)
      throw new AiProcessingError('Failed to parse AI response as valid JSON')
    }

    // 6. Schema validation
    const validationResult = documentIntelligenceSchema.safeParse(parsedJson)
    if (!validationResult.success) {
      const issues = validationResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      console.error(`[groqService] AI response failed schema validation: ${issues}`)
      throw new ValidationError(`AI response failed schema validation: ${issues}`)
    }

    const validatedData = validationResult.data

    // 7. Enforce disclaimer and timestamp
    validatedData.disclaimer = AI_MEDICAL_DISCLAIMER
    validatedData.processedAt = new Date().toISOString()

    const duration = Date.now() - startTime
    console.log(
      `[groqService] Document intelligence completed: doc="${input.documentName}", type="${validatedData.documentType}", duration=${duration}ms`
    )

    return validatedData
  }

  /**
   * System Prompt for Multi-Stakeholder Case Coordination Summarization
   */
  private getCaseSummarySystemPrompt(): string {
    return `You are an administrative medical case coordinator and briefing assistant for EthAum Sovereign Healthcare.
Your task is to convert structured medical case inputs and authorized document metadata into a concise, factual coordination summary for the patient, provider, and care coordinator.

CRITICAL SAFETY & MEDICAL DIRECTIVES (STRICTLY ENFORCED):
1. You must NOT diagnose any illness, syndrome, or medical condition.
2. You must NOT recommend surgical procedures or make clinical treatment decisions.
3. You must NOT prescribe or adjust medications.
4. You must NOT infer hidden or unverified medical conditions.
5. You must NOT act as or replace a licensed medical practitioner.
6. STRICT SOURCE ATTRIBUTION: Every section MUST include one of these 4 attribution sources:
   - "Patient provided"
   - "Document extracted"
   - "AI summarized"
   - "Not available"
7. NO INVENTED FACTS: If any piece of information was not explicitly provided or extracted from documents, you MUST use the exact string "Not provided" for its value (or empty list if array) and set source to "Not available".
8. Always include the mandatory disclaimer verbatim:
   "${AI_MEDICAL_DISCLAIMER}"

Your response MUST be a valid JSON object strictly matching this schema:
{
  "caseObjective": {
    "value": "string (the target procedure or medical goal sought)",
    "source": "Patient provided" | "Document extracted" | "AI summarized" | "Not available"
  },
  "patientProvidedInformation": {
    "value": "string (symptoms, complaints, duration provided by patient, or 'Not provided')",
    "source": "Patient provided" | "Not available"
  },
  "uploadedDocumentTypes": {
    "types": ["string", ...],
    "source": "Document extracted" | "Not available"
  },
  "documentedMedicalHistory": {
    "value": "string (explicit medical history from documents/case, or 'Not provided')",
    "source": "Document extracted" | "Patient provided" | "Not available"
  },
  "documentedProcedures": {
    "value": "string (explicitly documented prior surgeries/procedures, or 'Not provided')",
    "source": "Document extracted" | "Patient provided" | "Not available"
  },
  "knownMedications": {
    "items": [{"name": "string", "dosage": "string", "frequency": "string"}] | "Not provided",
    "source": "Document extracted" | "Patient provided" | "Not available"
  },
  "missingInformation": {
    "items": ["string (e.g. recent ECG, blood panel within 90 days, cardiac clearance)"],
    "source": "AI summarized" | "Not available"
  },
  "patientPreferences": {
    "value": "string (budget, preferred dates, hospital destination, or 'Not provided')",
    "source": "Patient provided" | "Not available"
  },
  "travelCoordinationRequirements": {
    "value": "string (travel companion, airport concierge, wheelchair assistance, or 'Not provided')",
    "source": "Patient provided" | "AI summarized" | "Not available"
  },
  "executiveBrief": "string (concise 2-3 sentence factual overview helping patient, provider, and coordinator align quickly)",
  "disclaimer": "${AI_MEDICAL_DISCLAIMER}"
}`
  }

  /**
   * Generates a multi-stakeholder Case Coordination Summary via Groq LLM
   */
  async generateCaseSummary(input: GenerateCaseSummaryInput): Promise<CaseCoordinationSummaryData> {
    const startTime = Date.now()

    // 1. Sanitize all case inputs (data minimization)
    const treatmentName = sanitizeMedicalText(input.treatmentName || 'Not provided')
    const medicalHistory = sanitizeMedicalText(input.medicalHistory || '')
    const patientNotes = sanitizeMedicalText(input.patientNotes || '')
    const destination = input.destinationName || 'Not provided'
    const preferredDate = input.preferredDate || 'Not provided'
    const budget =
      input.budgetMin && input.budgetMax
        ? `$${input.budgetMin} – $${input.budgetMax} ${input.currency || 'USD'}`
        : 'Not provided'

    // Format records metadata (categories, types, and previous AI document intelligence outputs)
    const recordSummaries = (input.recordsMetadata || []).map((r, i) => {
      const summaryText = r.aiSummary || r.aiMetadata?.summary || 'Uploaded document'
      const docType = r.aiMetadata?.documentType || r.category || r.type || 'Diagnostic Scan'
      return `[Doc ${i + 1}] Type: ${docType}, Name: ${sanitizeMedicalText(r.name)}, Summary: ${sanitizeMedicalText(summaryText)}`
    })

    const correctionsText = (input.patientCorrections || [])
      .map((c) => `- Section [${c.sectionKey}]: Patient corrected to "${c.correctedValue}" (Reason: ${c.reason || 'None'})`)
      .join('\n')

    const userPrompt = `CASE DOSSIER FOR COORDINATION SUMMARY:
Case ID: ${input.caseId}
Target Treatment / Procedure: ${treatmentName}
Destination: ${destination}
Preferred Date: ${preferredDate}
Budget Range: ${budget}
Patient Provided Medical History: ${medicalHistory || 'Not provided'}
Patient Notes / Accommodations: ${patientNotes || 'Not provided'}
Companion Traveling: ${input.companionTraveling ? 'Yes' : 'No'}

AUTHORIZED UPLOADED MEDICAL RECORDS (${recordSummaries.length} files):
${recordSummaries.length > 0 ? recordSummaries.join('\n') : 'No medical records uploaded yet.'}

${correctionsText ? `PATIENT-VERIFIED FACT CORRECTIONS (MUST OVERRIDE INACCURATE RECORDS):\n${correctionsText}\n` : ''}
Generate the structured coordination summary JSON following all safety rules.`

    const client = this.getClient()

    console.log(
      `[groqService] Generating case coordination summary: caseId="${input.caseId}", records=${input.recordsMetadata.length}`
    )

    let rawResponseContent = ''
    try {
      const response = await client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: this.getCaseSummarySystemPrompt() },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 1500,
      })

      rawResponseContent = response.choices?.[0]?.message?.content || ''
    } catch (err: any) {
      console.error(`[groqService] Groq case summary call failed: ${err.name || 'Error'} - ${err.message}`)
      if (err.name === 'APIConnectionTimeoutError' || err.message?.includes('timeout')) {
        throw new AiProcessingError('Groq AI case summarization timed out')
      }
      throw new AiProcessingError(`Groq AI case summarization error: ${err.message}`)
    }

    if (!rawResponseContent || rawResponseContent.trim().length === 0) {
      throw new AiProcessingError('Groq AI returned an empty case summary response')
    }

    let parsedJson: unknown
    try {
      parsedJson = JSON.parse(rawResponseContent)
    } catch (parseErr: any) {
      console.error(`[groqService] JSON parse error on case summary: ${parseErr.message}`)
      throw new AiProcessingError('Failed to parse AI case summary as valid JSON')
    }

    const validationResult = caseCoordinationSummarySchema.safeParse(parsedJson)
    if (!validationResult.success) {
      const issues = validationResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      console.error(`[groqService] Case summary failed schema validation: ${issues}`)
      throw new ValidationError(`Case summary failed schema validation: ${issues}`)
    }

    const validatedData = validationResult.data
    validatedData.disclaimer = AI_MEDICAL_DISCLAIMER
    validatedData.generatedAt = new Date().toISOString()
    validatedData.modelVersion = this.defaultModel

    const duration = Date.now() - startTime
    console.log(
      `[groqService] Case coordination summary generated: caseId="${input.caseId}", duration=${duration}ms`
    )

    return validatedData
  }

  /**
   * System Prompt for Neutral Provider Relevance Explanation (Strict Safety Directives)
   */
  private getProviderMatchingSystemPrompt(): string {
    return `You are an administrative healthcare navigator and hospital network coordinator for EthAum Sovereign Healthcare.
Your task is to generate a neutral, factual explanation of WHY a specific healthcare provider appears relevant to a patient's case, based ONLY on structured matching criteria.

CRITICAL SAFETY & MEDICAL DIRECTIVES (STRICTLY ENFORCED):
1. DO NOT decide or claim that this provider is the "best", "best hospital", "best doctor", "top choice", or medically superior.
2. You must NEVER guarantee medical outcomes, surgical success, or safety.
3. You must NEVER diagnose conditions, recommend specific surgeries, or prescribe treatments.
4. Explain WHY the provider appears relevant based ONLY on structured matching facts provided (e.g., procedures offered, accreditation status, destination match, companion facilities, logistics support).
5. Use objective, clear, and reassuring language suitable for patients and care coordinators.
6. Always include the mandatory disclaimer verbatim:
   "${AI_PROVIDER_MATCHING_DISCLAIMER}"

Your response MUST be a valid JSON object strictly matching this schema:
{
  "whyRelevant": "string (2-3 concise factual sentences explaining why this provider aligns with the case parameters)",
  "highlights": ["string (e.g. 'Offers Mako robotic knee navigation', 'JCI accredited in New Delhi', 'Direct airport VIP concierge')"],
  "disclaimer": "${AI_PROVIDER_MATCHING_DISCLAIMER}"
}`
  }

  /**
   * Generates a neutral, factual explanation of why a provider matches a medical case
   */
  async generateProviderRelevanceExplanation(input: {
    caseSummary?: string
    treatmentName: string
    destinationPreference?: string
    providerName: string
    providerCity: string
    providerCountry: string
    accreditations: string[]
    matchFactors: string[]
    offeredTreatment?: string
    startingPriceUSD?: number
    facilities?: string[]
  }): Promise<ProviderRelevanceData> {
    const startTime = Date.now()

    const client = this.getClient()

    const userPrompt = `MATCHING EVALUATION DATA:
Patient Target Procedure: ${input.treatmentName}
Destination Preference: ${input.destinationPreference || 'Open / Flexible'}
Case Context: ${input.caseSummary ? sanitizeMedicalText(input.caseSummary) : 'Standard clinical evaluation'}

PROVIDER CANDIDATE:
Provider Name: ${input.providerName}
Location: ${input.providerCity}, ${input.providerCountry}
Accreditations: ${input.accreditations.join(', ') || 'Institutional standards'}
Relevant Treatment Offered: ${input.offeredTreatment || input.treatmentName}
Starting Estimate: ${input.startingPriceUSD ? `$${input.startingPriceUSD} USD` : 'Institutional package'}
Key Facilities: ${(input.facilities || []).slice(0, 3).join(', ') || 'Surgical center'}

STRUCTURED MATCH FACTORS:
${input.matchFactors.map((f) => `- ${f}`).join('\n')}

Generate the neutral factual relevance explanation strictly adhering to all safety rules.`

    let rawResponseContent = ''
    try {
      const response = await client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: this.getProviderMatchingSystemPrompt() },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 1200,
      })

      rawResponseContent = response.choices?.[0]?.message?.content || ''
    } catch (err: any) {
      console.error(`[groqService] Provider matching explanation call failed: ${err.message}`)
      return {
        whyRelevant: `${input.providerName} in ${input.providerCity}, ${input.providerCountry} offers verified ${input.treatmentName} programs with ${input.accreditations.join(' and ')}.`,
        highlights: input.matchFactors.slice(0, 3),
        disclaimer: AI_PROVIDER_MATCHING_DISCLAIMER,
      }
    }

    let parsedJson: unknown
    try {
      parsedJson = JSON.parse(rawResponseContent)
    } catch (parseErr: any) {
      return {
        whyRelevant: `${input.providerName} in ${input.providerCity}, ${input.providerCountry} offers verified ${input.treatmentName} programs with ${input.accreditations.join(' and ')}.`,
        highlights: input.matchFactors.slice(0, 3),
        disclaimer: AI_PROVIDER_MATCHING_DISCLAIMER,
      }
    }

    const validationResult = providerRelevanceSchema.safeParse(parsedJson)
    if (!validationResult.success) {
      return {
        whyRelevant: `${input.providerName} in ${input.providerCity}, ${input.providerCountry} offers verified ${input.treatmentName} programs with ${input.accreditations.join(' and ')}.`,
        highlights: input.matchFactors.slice(0, 3),
        disclaimer: AI_PROVIDER_MATCHING_DISCLAIMER,
      }
    }

    const validatedData = validationResult.data

    // Safety guardrail: sanitize any forbidden superlative words from both whyRelevant and highlights
    const forbidden = /(#\s*1|\b(best|superior|number one|guaranteed|guarantee|infallible|safest)\b)/gi
    validatedData.whyRelevant = validatedData.whyRelevant.replace(forbidden, 'verified')
    validatedData.highlights = (validatedData.highlights || []).map((h) => h.replace(forbidden, 'verified'))
    validatedData.disclaimer = AI_PROVIDER_MATCHING_DISCLAIMER

    const duration = Date.now() - startTime
    console.log(
      `[groqService] Provider relevance explanation generated for ${input.providerName} in ${duration}ms`
    )

    return validatedData
  }
}

export const ATTRIBUTION_SOURCES = [
  'Patient provided',
  'Document extracted',
  'AI summarized',
  'Not available',
] as const

export const caseSummaryItemSchema = z.object({
  value: z.string().min(1),
  source: z.enum(ATTRIBUTION_SOURCES),
  notes: z.string().optional(),
})

export const caseCoordinationSummarySchema = z.object({
  caseObjective: caseSummaryItemSchema,
  patientProvidedInformation: caseSummaryItemSchema,
  uploadedDocumentTypes: z.object({
    types: z.array(z.string()).default([]),
    source: z.enum(ATTRIBUTION_SOURCES),
  }),
  documentedMedicalHistory: caseSummaryItemSchema,
  documentedProcedures: caseSummaryItemSchema,
  knownMedications: z.object({
    items: z.union([
      z.array(
        z.object({
          name: z.string(),
          dosage: z.string().optional(),
          frequency: z.string().optional(),
        })
      ),
      z.string(),
    ]),
    source: z.enum(ATTRIBUTION_SOURCES),
  }),
  missingInformation: z.object({
    items: z.array(z.string()).default([]),
    source: z.enum(ATTRIBUTION_SOURCES),
  }),
  patientPreferences: caseSummaryItemSchema,
  travelCoordinationRequirements: caseSummaryItemSchema,
  executiveBrief: z.string().min(10, 'Executive brief must be at least 10 characters'),
  disclaimer: z.string().default(AI_MEDICAL_DISCLAIMER),
  generatedAt: z.string().optional(),
  modelVersion: z.string().optional(),
})

export type CaseCoordinationSummaryData = z.infer<typeof caseCoordinationSummarySchema>

export interface GenerateCaseSummaryInput {
  caseId: string
  treatmentName: string
  medicalHistory?: string
  patientNotes?: string
  preferredDate?: string
  budgetMin?: number
  budgetMax?: number
  currency?: string
  destinationName?: string
  companionTraveling?: boolean
  recordsMetadata: Array<{
    name: string
    category: string
    type?: string
    aiSummary?: string
    aiMetadata?: any
  }>
  patientCorrections?: Array<{
    sectionKey: string
    correctedValue: string
    reason?: string
  }>
}

export const AI_PROVIDER_MATCHING_DISCLAIMER =
  'Provider relevance explanations are for coordination and informational purposes and do not constitute a clinical endorsement or guarantee of care.'

export const providerRelevanceSchema = z.object({
  whyRelevant: z.string().min(20, 'Explanation must be at least 20 characters'),
  highlights: z.array(z.string()).default([]),
  disclaimer: z.string().default(AI_PROVIDER_MATCHING_DISCLAIMER),
})

export type ProviderRelevanceData = z.infer<typeof providerRelevanceSchema>

export const groqService = new GroqService()
