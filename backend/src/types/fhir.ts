import { z } from 'zod'

/**
 * HL7 FHIR Release 4 (R4) - v4.0.1 Data Definitions & Zod Schemas
 * Standard: http://hl7.org/fhir/R4/
 */

export type FhirResourceType =
  | 'Patient'
  | 'Condition'
  | 'Observation'
  | 'DiagnosticReport'
  | 'DocumentReference'
  | 'Encounter'
  | 'Bundle'

export interface FhirCoding {
  system?: string
  version?: string
  code?: string
  display?: string
}

export interface FhirCodeableConcept {
  coding?: FhirCoding[]
  text?: string
}

export interface FhirReference {
  reference?: string
  type?: string
  display?: string
}

export interface FhirIdentifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary'
  system?: string
  value?: string
}

export interface FhirHumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'maiden'
  text?: string
  family?: string
  given?: string[]
}

export interface FhirContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other'
  value?: string
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile'
}

export interface FhirAddress {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing'
  type?: 'postal' | 'physical' | 'both'
  text?: string
  line?: string[]
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface FhirAttachment {
  contentType?: string
  language?: string
  data?: string
  url?: string
  size?: number
  hash?: string
  title?: string
  creation?: string
}

// 1. Patient Resource
export interface FhirPatient {
  resourceType: 'Patient'
  id?: string
  identifier?: FhirIdentifier[]
  active?: boolean
  name?: FhirHumanName[]
  telecom?: FhirContactPoint[]
  gender?: 'male' | 'female' | 'other' | 'unknown'
  birthDate?: string
  address?: FhirAddress[]
}

// 2. Condition Resource (Problem / Diagnosis)
export interface FhirCondition {
  resourceType: 'Condition'
  id?: string
  identifier?: FhirIdentifier[]
  clinicalStatus?: FhirCodeableConcept
  verificationStatus?: FhirCodeableConcept
  category?: FhirCodeableConcept[]
  severity?: FhirCodeableConcept
  code?: FhirCodeableConcept
  subject: FhirReference
  encounter?: FhirReference
  onsetDateTime?: string
  recordedDate?: string
  note?: Array<{ text: string }>
}

// 3. Observation Resource (Vital Signs / Laboratory / Diagnostic Metrics)
export interface FhirObservation {
  resourceType: 'Observation'
  id?: string
  identifier?: FhirIdentifier[]
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown'
  category?: FhirCodeableConcept[]
  code: FhirCodeableConcept
  subject: FhirReference
  encounter?: FhirReference
  effectiveDateTime?: string
  issued?: string
  valueQuantity?: {
    value?: number
    unit?: string
    system?: string
    code?: string
  }
  valueString?: string
  interpretation?: FhirCodeableConcept[]
  note?: Array<{ text: string }>
}

// 4. DiagnosticReport Resource (Imaging / Pathology / Lab Panels)
export interface FhirDiagnosticReport {
  resourceType: 'DiagnosticReport'
  id?: string
  identifier?: FhirIdentifier[]
  status: 'registered' | 'partial' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'appended' | 'cancelled' | 'entered-in-error' | 'unknown'
  category?: FhirCodeableConcept[]
  code: FhirCodeableConcept
  subject: FhirReference
  encounter?: FhirReference
  effectiveDateTime?: string
  issued?: string
  performer?: FhirReference[]
  result?: FhirReference[]
  conclusion?: string
  presentedForm?: FhirAttachment[]
}

// 5. DocumentReference Resource (Original Medical Scans & Clinical Notes)
export interface FhirDocumentReference {
  resourceType: 'DocumentReference'
  id?: string
  identifier?: FhirIdentifier[]
  status: 'current' | 'superseded' | 'entered-in-error'
  docStatus?: 'preliminary' | 'final' | 'amended' | 'entered-in-error'
  type?: FhirCodeableConcept
  category?: FhirCodeableConcept[]
  subject?: FhirReference
  date?: string
  author?: FhirReference[]
  description?: string
  securityLabel?: FhirCodeableConcept[]
  content: Array<{
    attachment: FhirAttachment
    format?: FhirCoding
  }>
}

// 6. Encounter Resource (Clinical Appointments & Teleconsultations)
export interface FhirEncounter {
  resourceType: 'Encounter'
  id?: string
  identifier?: FhirIdentifier[]
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled' | 'entered-in-error' | 'unknown'
  class: FhirCoding
  type?: FhirCodeableConcept[]
  subject: FhirReference
  participant?: Array<{
    type?: FhirCodeableConcept[]
    individual?: FhirReference
  }>
  period?: {
    start?: string
    end?: string
  }
  serviceProvider?: FhirReference
}

// 7. Bundle Resource
export interface FhirBundleEntry {
  fullUrl?: string
  resource: FhirResource
  request?: {
    method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    url: string
  }
}

export interface FhirBundle {
  resourceType: 'Bundle'
  id?: string
  meta?: {
    versionId?: string
    lastUpdated?: string
    profile?: string[]
  }
  fhirVersion?: string
  identifier?: FhirIdentifier
  type: 'document' | 'message' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history' | 'searchset' | 'collection'
  timestamp?: string
  total?: number
  entry?: FhirBundleEntry[]
}

export type FhirResource =
  | FhirPatient
  | FhirCondition
  | FhirObservation
  | FhirDiagnosticReport
  | FhirDocumentReference
  | FhirEncounter
  | FhirBundle

// ============================================================================
// ZOD VALIDATION SCHEMAS FOR HL7 FHIR R4
// ============================================================================

export const fhirCodingSchema = z.object({
  system: z.string().optional(),
  version: z.string().optional(),
  code: z.string().optional(),
  display: z.string().optional(),
})

export const fhirCodeableConceptSchema = z.object({
  coding: z.array(fhirCodingSchema).optional(),
  text: z.string().optional(),
})

export const fhirReferenceSchema = z.object({
  reference: z.string().optional(),
  type: z.string().optional(),
  display: z.string().optional(),
})

export const fhirAttachmentSchema = z.object({
  contentType: z.string().optional(),
  url: z.string().optional(),
  size: z.number().optional(),
  title: z.string().optional(),
  creation: z.string().optional(),
})

export const fhirPatientSchema = z.object({
  resourceType: z.literal('Patient'),
  id: z.string().optional(),
  name: z.array(z.any()).optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  birthDate: z.string().optional(),
  telecom: z.array(z.any()).optional(),
  address: z.array(z.any()).optional(),
})

export const fhirConditionSchema = z.object({
  resourceType: z.literal('Condition'),
  id: z.string().optional(),
  clinicalStatus: fhirCodeableConceptSchema.optional(),
  verificationStatus: fhirCodeableConceptSchema.optional(),
  code: fhirCodeableConceptSchema.optional(),
  subject: fhirReferenceSchema,
  recordedDate: z.string().optional(),
})

export const fhirObservationSchema = z.object({
  resourceType: z.literal('Observation'),
  id: z.string().optional(),
  status: z.enum(['registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled', 'entered-in-error', 'unknown']),
  code: fhirCodeableConceptSchema,
  subject: fhirReferenceSchema,
  effectiveDateTime: z.string().optional(),
  valueQuantity: z.any().optional(),
  valueString: z.string().optional(),
})

export const fhirDiagnosticReportSchema = z.object({
  resourceType: z.literal('DiagnosticReport'),
  id: z.string().optional(),
  status: z.enum(['registered', 'partial', 'preliminary', 'final', 'amended', 'corrected', 'appended', 'cancelled', 'entered-in-error', 'unknown']),
  code: fhirCodeableConceptSchema,
  subject: fhirReferenceSchema,
  conclusion: z.string().optional(),
  presentedForm: z.array(fhirAttachmentSchema).optional(),
})

export const fhirDocumentReferenceSchema = z.object({
  resourceType: z.literal('DocumentReference'),
  id: z.string().optional(),
  status: z.enum(['current', 'superseded', 'entered-in-error']),
  subject: fhirReferenceSchema.optional(),
  content: z.array(
    z.object({
      attachment: fhirAttachmentSchema,
    })
  ).min(1, 'DocumentReference must contain at least one content attachment'),
})

export const fhirEncounterSchema = z.object({
  resourceType: z.literal('Encounter'),
  id: z.string().optional(),
  status: z.enum(['planned', 'arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'cancelled', 'entered-in-error', 'unknown']),
  class: fhirCodingSchema,
  subject: fhirReferenceSchema,
})

export const fhirBundleSchema = z.object({
  resourceType: z.literal('Bundle'),
  id: z.string().optional(),
  type: z.enum(['document', 'message', 'transaction', 'transaction-response', 'batch', 'batch-response', 'history', 'searchset', 'collection']),
  timestamp: z.string().optional(),
  total: z.number().optional(),
  entry: z.array(
    z.object({
      fullUrl: z.string().optional(),
      resource: z.record(z.any()),
    })
  ).optional(),
})

export interface FhirValidationResult {
  valid: boolean
  isValid: boolean
  resourceType?: string
  fhirVersion: string
  errors: Array<{
    path: string
    message: string
    severity: 'error' | 'warning' | 'info'
  }>
  warnings: Array<{
    path: string
    message: string
  }>
  resourceCounts: Record<string, number>
}

export interface FhirStagedImport {
  stagingId: string
  caseId: string
  status: 'PENDING_REVIEW' | 'CONFIRMED' | 'REJECTED'
  stagedBy: string
  createdAt: string
  bundleId?: string
  resourceCount: number
  resources: Array<{
    resourceType: FhirResourceType
    id?: string
    title?: string
    isDuplicate: boolean
    duplicateDetails?: string
    unmappableFields?: string[]
    raw: any
  }>
  validationResult: FhirValidationResult
}
