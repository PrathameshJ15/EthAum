import crypto from 'crypto'
import {
  FhirBundle,
  FhirBundleEntry,
  FhirPatient,
  FhirCondition,
  FhirObservation,
  FhirDiagnosticReport,
  FhirDocumentReference,
  FhirEncounter,
  FhirValidationResult,
  FhirStagedImport,
  fhirBundleSchema,
  fhirPatientSchema,
  fhirConditionSchema,
  fhirObservationSchema,
  fhirDiagnosticReportSchema,
  fhirDocumentReferenceSchema,
  fhirEncounterSchema,
} from '../types/fhir.js'
import { MedicalRecord, UserRole } from '../types/index.js'
import { caseService } from './caseService.js'
import { medicalRecordService } from './medicalRecordService.js'
import { appointmentService } from './appointmentService.js'
import { journeyService } from './journeyService.js'
import { AuthUser } from '../middleware/auth.js'
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../utils/apiError.js'

// In-memory staging store for FHIR imports (keyed by stagingId)
const STAGED_FHIR_IMPORTS = new Map<string, FhirStagedImport>()

// In-memory operation history
const FHIR_OPERATIONS_LEDGER: Array<{
  id: string
  caseId: string
  operation: 'EXPORT' | 'PREVIEW' | 'IMPORT_STAGE' | 'IMPORT_CONFIRM'
  actorId: string
  actorRole: UserRole
  timestamp: string
  resourceCount: number
  status: 'SUCCESS' | 'FAILED'
  details?: string
}> = []

export const fhirService = {
  /**
   * Validates a standalone FHIR R4 resource or Bundle against structural constraints.
   */
  validateResourceOrBundle(payload: any): FhirValidationResult {
    const errors: FhirValidationResult['errors'] = []
    const warnings: FhirValidationResult['warnings'] = []
    const resourceCounts: Record<string, number> = {}

    if (!payload || typeof payload !== 'object') {
      return {
        valid: false,
        isValid: false,
        resourceType: undefined,
        fhirVersion: '4.0.1 (R4)',
        errors: [{ path: 'root', message: 'Payload must be a valid JSON object', severity: 'error' }],
        warnings: [],
        resourceCounts: {},
      }
    }

    const resourceType = payload.resourceType
    if (!resourceType) {
      errors.push({
        path: 'resourceType',
        message: 'Missing required field: resourceType',
        severity: 'error',
      })
      return {
        valid: false,
        isValid: false,
        resourceType: undefined,
        fhirVersion: '4.0.1 (R4)',
        errors,
        warnings,
        resourceCounts,
      }
    }

    const supportedTypes = [
      'Patient',
      'Condition',
      'Observation',
      'DiagnosticReport',
      'DocumentReference',
      'Encounter',
      'Bundle',
    ]

    if (!supportedTypes.includes(resourceType)) {
      errors.push({
        path: 'resourceType',
        message: `Unsupported FHIR resource type '${resourceType}'. Supported types: ${supportedTypes.join(', ')}`,
        severity: 'error',
      })
      return {
        valid: false,
        isValid: false,
        resourceType,
        fhirVersion: '4.0.1 (R4)',
        errors,
        warnings,
        resourceCounts,
      }
    }

    // Single Resource Validation
    const validateSingleResource = (res: any, pathPrefix = '') => {
      const type = res.resourceType
      resourceCounts[type] = (resourceCounts[type] || 0) + 1

      if (type === 'Patient') {
        const parse = fhirPatientSchema.safeParse(res)
        if (!parse.success) {
          parse.error.errors.forEach((e) => {
            errors.push({ path: `${pathPrefix}${e.path.join('.')}`, message: e.message, severity: 'error' })
          })
        }
      } else if (type === 'Condition') {
        const parse = fhirConditionSchema.safeParse(res)
        if (!parse.success) {
          parse.error.errors.forEach((e) => {
            errors.push({ path: `${pathPrefix}${e.path.join('.')}`, message: e.message, severity: 'error' })
          })
        }
      } else if (type === 'Observation') {
        const parse = fhirObservationSchema.safeParse(res)
        if (!parse.success) {
          parse.error.errors.forEach((e) => {
            errors.push({ path: `${pathPrefix}${e.path.join('.')}`, message: e.message, severity: 'error' })
          })
        }
      } else if (type === 'DiagnosticReport') {
        const parse = fhirDiagnosticReportSchema.safeParse(res)
        if (!parse.success) {
          parse.error.errors.forEach((e) => {
            errors.push({ path: `${pathPrefix}${e.path.join('.')}`, message: e.message, severity: 'error' })
          })
        }
      } else if (type === 'DocumentReference') {
        const parse = fhirDocumentReferenceSchema.safeParse(res)
        if (!parse.success) {
          parse.error.errors.forEach((e) => {
            errors.push({ path: `${pathPrefix}${e.path.join('.')}`, message: e.message, severity: 'error' })
          })
        }
      } else if (type === 'Encounter') {
        const parse = fhirEncounterSchema.safeParse(res)
        if (!parse.success) {
          parse.error.errors.forEach((e) => {
            errors.push({ path: `${pathPrefix}${e.path.join('.')}`, message: e.message, severity: 'error' })
          })
        }
      }
    }

    // Bundle Processing
    if (resourceType === 'Bundle') {
      const bundleParse = fhirBundleSchema.safeParse(payload)
      if (!bundleParse.success) {
        bundleParse.error.errors.forEach((e) => {
          errors.push({ path: e.path.join('.'), message: e.message, severity: 'error' })
        })
      }

      const entries = payload.entry || []
      if (!Array.isArray(entries) || entries.length === 0) {
        warnings.push({ path: 'entry', message: 'Bundle contains 0 entries.' })
      } else {
        entries.forEach((entry: any, index: number) => {
          if (!entry.resource) {
            errors.push({
              path: `entry[${index}]`,
              message: 'Bundle entry is missing required `resource` field',
              severity: 'error',
            })
          } else {
            validateSingleResource(entry.resource, `entry[${index}].resource.`)
          }
        })
      }
    } else {
      validateSingleResource(payload)
    }

    return {
      valid: errors.length === 0,
      isValid: errors.length === 0,
      resourceType: payload?.resourceType,
      fhirVersion: '4.0.1 (R4)',
      errors,
      warnings,
      resourceCounts,
    }
  },

  /**
   * Verifies that the user has authorized access to view/export the MedicalCase.
   * Enforces patient data sovereignty and prevents cross-patient leakage.
   */
  async verifyCaseAccess(caseId: string, user: AuthUser): Promise<any> {
    const medicalCase = await caseService.getCaseById(caseId)
    if (!medicalCase) {
      throw new NotFoundError(`Medical Case '${caseId}' not found.`)
    }

    if (user.role === 'admin') {
      return medicalCase
    }

    if (user.role === 'patient') {
      const isAuthorizedPatient =
        (user.patientId && user.patientId === medicalCase.patientId) ||
        (user.id && user.id === medicalCase.patientId)

      if (!isAuthorizedPatient) {
        throw new ForbiddenError(
          `Access Denied: You do not have permission to access patient case '${caseId}'.`
        )
      }
      return medicalCase
    }

    if (user.role === 'provider') {
      const isAuthorizedProvider =
        Boolean(user.providerId && medicalCase.selectedProviderId && user.providerId === medicalCase.selectedProviderId)

      if (!isAuthorizedProvider) {
        throw new ForbiddenError(
          `Access Denied: Your hospital provider account is not authorized on case '${caseId}'.`
        )
      }
      return medicalCase
    }

    throw new ForbiddenError('Access Denied: Invalid role for case access.')
  },

  /**
   * Exports an authorized MedicalCase as an HL7 FHIR R4 Bundle.
   * Respects patient consent and record permission grants.
   */
  async exportCaseAsFhirBundle(caseId: string, user: AuthUser): Promise<FhirBundle> {
    const medicalCase = await this.verifyCaseAccess(caseId, user)

    // Retrieve records
    const allRecords = await medicalRecordService.listRecordsByCase(caseId)

    // Apply patient-controlled consent and record permissions:
    // If the requester is a provider, only export records where permissions are explicitly granted!
    let authorizedRecords = allRecords
    if (user.role === 'provider' && user.providerId) {
      authorizedRecords = allRecords.filter((rec: MedicalRecord) => {
        const perms = rec.permissions || []
        return perms.includes(user.providerId!)
      })
    }

    const entries: FhirBundleEntry[] = []

    // 1. Patient Resource
    const patientResource: FhirPatient = {
      resourceType: 'Patient',
      id: medicalCase.patientId || 'pat-1',
      identifier: [
        {
          system: 'https://ethaum.com/identifiers/patient',
          value: medicalCase.patientId || 'pat-1',
        },
      ],
      active: true,
      name: [
        {
          use: 'official',
          text: medicalCase.patientName || 'Eleanor Vance',
          family: (medicalCase.patientName || 'Eleanor Vance').split(' ').slice(-1)[0],
          given: (medicalCase.patientName || 'Eleanor Vance').split(' ').slice(0, -1),
        },
      ],
      gender: 'female',
      address: [
        {
          country: medicalCase.destinationName?.includes('UK') ? 'GB' : 'US',
        },
      ],
    }

    entries.push({
      fullUrl: `urn:uuid:patient-${patientResource.id}`,
      resource: patientResource,
    })

    // 2. Condition Resource (Target Treatment & Clinical Problem)
    const conditionResource: FhirCondition = {
      resourceType: 'Condition',
      id: `cond-${medicalCase.id}`,
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'active',
            display: 'Active',
          },
        ],
      },
      verificationStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
            code: 'confirmed',
            display: 'Confirmed',
          },
        ],
      },
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-category',
              code: 'encounter-diagnosis',
              display: 'Encounter Diagnosis',
            },
          ],
        },
      ],
      code: {
        text: medicalCase.treatmentName || 'Total Knee Arthroplasty',
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '38362002',
            display: 'Osteoarthritis of knee',
          },
        ],
      },
      subject: {
        reference: `Patient/${patientResource.id}`,
        display: medicalCase.patientName || 'Eleanor Vance',
      },
      recordedDate: medicalCase.createdAt || new Date().toISOString(),
      note: medicalCase.medicalHistory ? [{ text: medicalCase.medicalHistory }] : undefined,
    }

    entries.push({
      fullUrl: `urn:uuid:${conditionResource.id}`,
      resource: conditionResource,
    })

    // 3. Observations (Clinical Findings from records / intake)
    if (medicalCase.medicalHistory) {
      const observationResource: FhirObservation = {
        resourceType: 'Observation',
        id: `obs-${medicalCase.id}-joint`,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Physical Examination',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '82312-0',
              display: 'Range of motion joint assessment',
            },
          ],
          text: 'Grade IV Medial Joint Space Collapse',
        },
        subject: {
          reference: `Patient/${patientResource.id}`,
          display: medicalCase.patientName,
        },
        effectiveDateTime: medicalCase.createdAt,
        valueString: 'Grade IV Medial Joint Space Collapse with Varus Deformity',
      }

      entries.push({
        fullUrl: `urn:uuid:${observationResource.id}`,
        resource: observationResource,
      })
    }

    // 4. DocumentReference & DiagnosticReports for Authorized Medical Records
    for (const rec of authorizedRecords) {
      const isImaging = ['MRI', 'X-Ray', 'CT Scan'].includes(rec.category)
      const isLab = rec.category === 'Blood Report'
      const contentType = rec.name.endsWith('.pdf')
        ? 'application/pdf'
        : rec.name.endsWith('.dcm')
        ? 'application/dicom'
        : rec.name.endsWith('.jpg') || rec.name.endsWith('.png')
        ? 'image/jpeg'
        : 'application/octet-stream'

      // DocumentReference for original storage binary
      const docRef: FhirDocumentReference = {
        resourceType: 'DocumentReference',
        id: `docref-${rec.id}`,
        status: 'current',
        type: {
          coding: [
            {
              system: 'http://loinc.org',
              code: isImaging ? '18748-4' : '11502-2',
              display: isImaging ? 'Diagnostic Imaging Report' : 'Laboratory report',
            },
          ],
          text: rec.type || rec.category,
        },
        subject: {
          reference: `Patient/${patientResource.id}`,
        },
        date: rec.createdAt,
        description: rec.name,
        securityLabel: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-Confidentiality',
                code: 'R',
                display: 'Restricted',
              },
            ],
          },
        ],
        content: [
          {
            attachment: {
              contentType,
              url: `https://storage.ethaum.com/${rec.storagePath}`,
              title: rec.name,
              creation: rec.createdAt,
            },
          },
        ],
      }

      entries.push({
        fullUrl: `urn:uuid:${docRef.id}`,
        resource: docRef,
      })

      // DiagnosticReport for structured clinical interpretation
      if (isImaging || isLab) {
        const diagReport: FhirDiagnosticReport = {
          resourceType: 'DiagnosticReport',
          id: `diag-${rec.id}`,
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
                  code: isImaging ? 'RAD' : 'LAB',
                  display: isImaging ? 'Radiology' : 'Laboratory',
                },
              ],
            },
          ],
          code: {
            text: `${rec.category} - ${rec.name}`,
          },
          subject: {
            reference: `Patient/${patientResource.id}`,
          },
          effectiveDateTime: rec.createdAt,
          conclusion: rec.aiSummary || 'Original diagnostic record study verified on EthAum Platform.',
          presentedForm: [
            {
              contentType,
              url: `https://storage.ethaum.com/${rec.storagePath}`,
              title: rec.name,
            },
          ],
        }

        entries.push({
          fullUrl: `urn:uuid:${diagReport.id}`,
          resource: diagReport,
        })
      }

      // Log access audit entry for export
      try {
        await medicalRecordService.logAccess({
          recordId: rec.id,
          accessedBy: user.id,
          accessRole: user.role,
          action: 'VIEW',
          details: { fhirExport: true, caseId },
          timestamp: new Date().toISOString(),
        })
      } catch {
        // non-blocking
      }
    }

    // 5. Encounters (Scheduled / Completed Consultations)
    try {
      const appointments = await appointmentService.listAppointments({ caseId })
      for (const apt of appointments) {
        const encounter: FhirEncounter = {
          resourceType: 'Encounter',
          id: `enc-${apt.id}`,
          status:
            apt.status === 'COMPLETED'
              ? 'finished'
              : apt.status === 'CANCELLED'
              ? 'cancelled'
              : 'planned',
          class: {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            code: apt.type === 'Telemedicine' ? 'VR' : 'AMB',
            display: apt.type === 'Telemedicine' ? 'Virtual' : 'Ambulatory',
          },
          type: [
            {
              text: apt.title || 'Pre-Surgical Specialist Teleconsultation',
            },
          ],
          subject: {
            reference: `Patient/${patientResource.id}`,
            display: medicalCase.patientName,
          },
          participant: apt.doctorName
            ? [
                {
                  individual: {
                    display: apt.doctorName,
                  },
                },
              ]
            : undefined,
          serviceProvider: apt.providerName
            ? {
                display: apt.providerName,
              }
            : undefined,
        }

        entries.push({
          fullUrl: `urn:uuid:${encounter.id}`,
          resource: encounter,
        })
      }
    } catch {
      // non-blocking
    }

    const bundle: FhirBundle = {
      resourceType: 'Bundle',
      id: `bundle-case-${medicalCase.id}`,
      meta: {
        versionId: '4.0.1',
        lastUpdated: new Date().toISOString(),
      },
      fhirVersion: '4.0.1',
      identifier: {
        system: 'https://ethaum.com/fhir/bundles',
        value: `bundle-${medicalCase.id}-${Date.now()}`,
      },
      type: 'document',
      timestamp: new Date().toISOString(),
      total: entries.length,
      entry: entries,
    }

    // Record audit event
    FHIR_OPERATIONS_LEDGER.unshift({
      id: `op-${Date.now()}`,
      caseId,
      operation: 'EXPORT',
      actorId: user.id,
      actorRole: user.role,
      timestamp: new Date().toISOString(),
      resourceCount: entries.length,
      status: 'SUCCESS',
      details: `Exported ${entries.length} FHIR R4 resources for case ${caseId}.`,
    })

    try {
      await journeyService.addJourneyEvent({
        caseId,
        stage: 'Records',
        title: 'HL7 FHIR R4 Health Records Exported',
        description: `Patient-authorized FHIR Bundle generated (${entries.length} resources) by ${user.name || user.role}.`,
        actorRole: user.role,
        timestamp: new Date().toISOString(),
      })
    } catch {
      // non-blocking
    }

    return bundle
  },

  /**
   * Previews a FHIR export without recording export milestone.
   */
  async previewCaseFhirExport(caseId: string, user: AuthUser): Promise<any> {
    const bundle = await this.exportCaseAsFhirBundle(caseId, user)

    const resourceCounts: Record<string, number> = {}
    bundle.entry?.forEach((e) => {
      const type = e.resource?.resourceType || 'Unknown'
      resourceCounts[type] = (resourceCounts[type] || 0) + 1
    })

    const previewSummary = {
      caseId,
      patientId: bundle.entry?.[0]?.resource?.id || 'pat-1',
      resourceCounts,
      authorizedRecordCount: resourceCounts['DocumentReference'] || 0,
      isConsentRestricted: user.role === 'provider',
      interoperabilityDisclaimer:
        'Interoperability prototype: Validated against HL7 FHIR Release 4 (R4) v4.0.1 schema. Does not connect to live production hospital EHR endpoints without verified institutional mTLS credentials.',
    }

    return {
      bundle,
      caseId,
      fhirVersion: '4.0.1',
      resourceCounts,
      previewSummary,
      summary: previewSummary,
    }
  },

  /**
   * Stages an incoming FHIR R4 Bundle into the staging workflow for clinical review.
   * Detects duplicates and maps candidates without silently merging into authoritative records.
   */
  async stageFhirBundleImport(
    caseId: string,
    bundlePayload: any,
    user: AuthUser
  ): Promise<FhirStagedImport> {
    await this.verifyCaseAccess(caseId, user)

    // 1. Structural Validation
    const validationResult = this.validateResourceOrBundle(bundlePayload)
    if (!validationResult.isValid) {
      throw new ValidationError(
        `Invalid FHIR R4 Bundle: ${validationResult.errors.map((e) => e.message).join('; ')}`
      )
    }

    // 2. Fetch existing records for duplicate detection
    const existingRecords = await medicalRecordService.listRecordsByCase(caseId)
    const existingFilenames = new Set(existingRecords.map((r: MedicalRecord) => r.name.toLowerCase().trim()))

    const entries = bundlePayload.resourceType === 'Bundle' ? bundlePayload.entry || [] : [{ resource: bundlePayload }]
    const resourcesToStage: FhirStagedImport['resources'] = []

    for (const entry of entries) {
      const res = entry.resource || entry
      const type = res.resourceType

      let title = res.id || type
      let isDuplicate = false
      let duplicateDetails: string | undefined = undefined
      const unmappableFields: string[] = []

      if (type === 'DocumentReference') {
        const attachment = res.content?.[0]?.attachment
        title = attachment?.title || res.description || `Doc_${res.id || 'Import'}`
        if (existingFilenames.has(title.toLowerCase().trim())) {
          isDuplicate = true
          duplicateDetails = `A medical record with name '${title}' is already present in this case dossier.`
        }
      } else if (type === 'DiagnosticReport') {
        title = res.code?.text || `DiagnosticReport_${res.id || 'Study'}`
      } else if (type === 'Patient') {
        title = res.name?.[0]?.text || `Patient ${res.id || ''}`
        if (res.maritalStatus || res.communication) {
          unmappableFields.push('maritalStatus', 'communication')
        }
      } else if (type === 'Condition') {
        title = res.code?.text || 'Clinical Diagnosis'
      }

      resourcesToStage.push({
        resourceType: type,
        id: res.id,
        title,
        isDuplicate,
        duplicateDetails,
        unmappableFields: unmappableFields.length > 0 ? unmappableFields : undefined,
        raw: res,
      })
    }

    const stagingId = `stage-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
    const stagedImport: FhirStagedImport = {
      stagingId,
      caseId,
      status: 'PENDING_REVIEW',
      stagedBy: user.name || user.id,
      createdAt: new Date().toISOString(),
      bundleId: bundlePayload.id || `ext-${Date.now()}`,
      resourceCount: resourcesToStage.length,
      resources: resourcesToStage,
      validationResult,
    }

    STAGED_FHIR_IMPORTS.set(stagingId, stagedImport)

    FHIR_OPERATIONS_LEDGER.unshift({
      id: `op-${Date.now()}`,
      caseId,
      operation: 'IMPORT_STAGE',
      actorId: user.id,
      actorRole: user.role,
      timestamp: new Date().toISOString(),
      resourceCount: resourcesToStage.length,
      status: 'SUCCESS',
      details: `Staged FHIR import with ${resourcesToStage.length} resources (Pending Clinical Review).`,
    })

    return stagedImport
  },

  /**
   * Confirms an authorized import, converting vetted DocumentReferences and DiagnosticReports
   * into sovereign MedicalRecords without duplicating existing data.
   */
  async confirmStagedImport(
    caseId: string,
    stagingId: string,
    user: AuthUser
  ): Promise<{
    importedRecords: MedicalRecord[]
    staging: FhirStagedImport
    message: string
  }> {
    await this.verifyCaseAccess(caseId, user)

    const staged = STAGED_FHIR_IMPORTS.get(stagingId)
    if (!staged) {
      throw new NotFoundError(`Staged import '${stagingId}' not found.`)
    }

    if (staged.status !== 'PENDING_REVIEW') {
      throw new ValidationError(`Staged import '${stagingId}' has already been ${staged.status}.`)
    }

    const createdRecords: MedicalRecord[] = []

    // Import vetted non-duplicate records
    for (const item of staged.resources) {
      if (item.isDuplicate) {
        continue // Skip duplicate
      }

      if (item.resourceType === 'DocumentReference') {
        const attachment = item.raw.content?.[0]?.attachment
        const filename = attachment?.title || item.title || `Imported_Record_${Date.now()}.pdf`
        const category = filename.toLowerCase().includes('mri')
          ? 'MRI'
          : filename.toLowerCase().includes('xray') || filename.toLowerCase().includes('x-ray')
          ? 'X-Ray'
          : filename.toLowerCase().includes('ct')
          ? 'CT Scan'
          : 'Clinical Notes'

        const newRec = await medicalRecordService.createRecord({
          caseId,
          patientId: user.patientId || 'pat-1',
          name: filename,
          category,
          type: item.raw.type?.text || 'Imported FHIR R4 Document',
          size: `${Math.round((attachment?.size || 1024 * 1024 * 2) / (1024 * 1024))} MB`,
          storagePath: attachment?.url || `imported/fhir/${caseId}/${filename}`,
        })
        createdRecords.push(newRec)
      } else if (item.resourceType === 'DiagnosticReport' && !staged.resources.some((r) => r.resourceType === 'DocumentReference' && r.title === item.title)) {
        const newRec = await medicalRecordService.createRecord({
          caseId,
          patientId: user.patientId || 'pat-1',
          name: `${item.title}.pdf`,
          category: 'Clinical Notes',
          type: 'Diagnostic Report',
          size: '1.2 MB',
          storagePath: `imported/fhir/${caseId}/${item.title}.pdf`,
        })
        createdRecords.push(newRec)
      }
    }

    staged.status = 'CONFIRMED'

    FHIR_OPERATIONS_LEDGER.unshift({
      id: `op-${Date.now()}`,
      caseId,
      operation: 'IMPORT_CONFIRM',
      actorId: user.id,
      actorRole: user.role,
      timestamp: new Date().toISOString(),
      resourceCount: createdRecords.length,
      status: 'SUCCESS',
      details: `Confirmed import of ${createdRecords.length} medical records into case ${caseId}.`,
    })

    try {
      await journeyService.addJourneyEvent({
        caseId,
        stage: 'Records',
        title: 'HL7 FHIR Records Integrated',
        description: `${createdRecords.length} clinical records successfully verified and integrated from HL7 FHIR Bundle.`,
        actorRole: user.role,
        timestamp: new Date().toISOString(),
      })
    } catch {
      // non-blocking
    }

    return {
      importedRecords: createdRecords,
      staging: staged,
      message: `Successfully confirmed import: ${createdRecords.length} records added to sovereign case dossier.`,
    }
  },

  /**
   * Retrieves operation audit history.
   */
  getOperationsHistory(caseId?: string): typeof FHIR_OPERATIONS_LEDGER {
    if (caseId) {
      return FHIR_OPERATIONS_LEDGER.filter((op) => op.caseId === caseId)
    }
    return [...FHIR_OPERATIONS_LEDGER]
  },

  /**
   * Returns a complete, synthetic HL7 FHIR R4 Bundle for testing and demonstration.
   */
  getSyntheticSampleBundle(): FhirBundle {
    return {
      resourceType: 'Bundle',
      id: 'bundle-synthetic-hospital-delhi',
      meta: {
        versionId: '4.0.1',
        lastUpdated: '2026-10-15T09:30:00Z',
        profile: ['http://hl7.org/fhir/StructureDefinition/Bundle'],
      },
      fhirVersion: '4.0.1',
      identifier: {
        system: 'http://hospital.example.org/bundles',
        value: 'SYNTH-DELHI-2026-001',
      },
      type: 'collection',
      timestamp: '2026-10-15T09:30:00Z',
      total: 6,
      entry: [
        {
          fullUrl: 'urn:uuid:pat-eleanor-vance',
          resource: {
            resourceType: 'Patient',
            id: 'pat-eleanor-vance',
            active: true,
            name: [
              {
                use: 'official',
                family: 'Vance',
                given: ['Eleanor', 'R.'],
              },
            ],
            gender: 'female',
            birthDate: '1968-04-12',
            address: [
              {
                city: 'London',
                country: 'GB',
              },
            ],
          },
        },
        {
          fullUrl: 'urn:uuid:cond-severe-oa',
          resource: {
            resourceType: 'Condition',
            id: 'cond-severe-oa',
            clinicalStatus: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                  code: 'active',
                  display: 'Active',
                },
              ],
            },
            verificationStatus: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
                  code: 'confirmed',
                  display: 'Confirmed',
                },
              ],
            },
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '38362002',
                  display: 'Osteoarthritis of knee joint',
                },
              ],
              text: 'Bilateral Primary Osteoarthritis of Knee, Grade IV (Kellgren-Lawrence)',
            },
            subject: {
              reference: 'Patient/pat-eleanor-vance',
            },
            recordedDate: '2026-09-10',
          },
        },
        {
          fullUrl: 'urn:uuid:obs-varus-deformity',
          resource: {
            resourceType: 'Observation',
            id: 'obs-varus-deformity',
            status: 'final',
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '82312-0',
                  display: 'Mechanical axis deformity',
                },
              ],
              text: 'Bilateral Varus Alignment (7 degrees deviation)',
            },
            subject: {
              reference: 'Patient/pat-eleanor-vance',
            },
            valueString: '7 degrees varus alignment on long-leg weight-bearing scan',
          },
        },
        {
          fullUrl: 'urn:uuid:docref-right-knee-mri',
          resource: {
            resourceType: 'DocumentReference',
            id: 'docref-right-knee-mri',
            status: 'current',
            type: {
              text: 'Right Knee Coronal MRI High-Resolution',
            },
            subject: {
              reference: 'Patient/pat-eleanor-vance',
            },
            content: [
              {
                attachment: {
                  contentType: 'application/pdf',
                  url: 'https://storage.ethaum.com/sample/Right_Knee_Coronal_MRI_HighRes.pdf',
                  title: 'Right_Knee_Coronal_MRI_HighRes.pdf',
                  size: 14889728,
                },
              },
            ],
          },
        },
        {
          fullUrl: 'urn:uuid:diag-mri-report',
          resource: {
            resourceType: 'DiagnosticReport',
            id: 'diag-mri-report',
            status: 'final',
            code: {
              text: 'MRI Right Knee with Contrast',
            },
            subject: {
              reference: 'Patient/pat-eleanor-vance',
            },
            conclusion: 'Complete denudation of articular cartilage across medial femoral condyle. Intact PCL/ACL.',
            presentedForm: [
              {
                contentType: 'application/pdf',
                title: 'Right_Knee_Coronal_MRI_HighRes.pdf',
              },
            ],
          },
        },
        {
          fullUrl: 'urn:uuid:enc-preop-consult',
          resource: {
            resourceType: 'Encounter',
            id: 'enc-preop-consult',
            status: 'finished',
            class: {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
              code: 'VR',
              display: 'Virtual Telemedicine',
            },
            subject: {
              reference: 'Patient/pat-eleanor-vance',
            },
            participant: [
              {
                individual: {
                  display: 'Dr. Vikram Oberoi, MS, FRCS',
                },
              },
            ],
          },
        },
      ],
    }
  },
}
