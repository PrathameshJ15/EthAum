import { randomUUID } from 'node:crypto'
import { caseService } from './caseService.js'
import { medicalRecordService } from './medicalRecordService.js'
import { groqService, CaseCoordinationSummaryData, AI_MEDICAL_DISCLAIMER } from './groqService.js'
import { journeyService } from './journeyService.js'
import {
  CaseCoordinationSummary,
  SummaryCorrection,
  AttributionSource,
} from '../types/index.js'
import { NotFoundError, ValidationError } from '../utils/apiError.js'

export const caseSummaryService = {
  buildDeterministicSummary(medicalCase: any, records: any[]): CaseCoordinationSummaryData {
    const docTypes = records.map((r) => r.category || r.type || 'Diagnostic Report')
    return {
      caseObjective: {
        value: `Evaluation and surgical planning for ${medicalCase.treatmentName}`,
        source: 'Patient provided',
      },
      patientProvidedInformation: {
        value: medicalCase.medicalHistory || 'Patient reported condition requiring specialist consultation.',
        source: 'Patient provided',
      },
      uploadedDocumentTypes: {
        types: docTypes.length > 0 ? Array.from(new Set(docTypes)) as string[] : ['Diagnostic Dossier'],
        source: docTypes.length > 0 ? 'Document extracted' : 'Not available',
      },
      documentedMedicalHistory: {
        value: medicalCase.medicalHistory || 'Comprehensive history on file awaiting specialist clinical review.',
        source: 'Patient provided',
      },
      documentedProcedures: {
        value: `Recommended procedure protocol: ${medicalCase.treatmentName}`,
        source: 'Patient provided',
      },
      knownMedications: {
        items: 'To be verified during pre-operative surgical assessment',
        source: 'Not available',
      },
      missingInformation: {
        items: [
          'Pre-operative anesthesia clearance panel',
          'Current 12-lead ECG and cardio-pulmonary assessment',
          'Direct surgeon video consultation clearance',
        ],
        source: 'AI summarized',
      },
      patientPreferences: {
        value: `Destination: ${medicalCase.destinationName || 'Flexible'}; Target Budget: ${medicalCase.budgetMin ? `$${medicalCase.budgetMin}–$${medicalCase.budgetMax} ${medicalCase.currency}` : 'Market standard'}`,
        source: 'Patient provided',
      },
      travelCoordinationRequirements: {
        value: medicalCase.patientNotes || 'Standard international medical tourism coordination with airport assistance.',
        source: 'Patient provided',
      },
      executiveBrief: `Patient with documented history seeking ${medicalCase.treatmentName}. Uploaded records compiled for accredited hospital panel review.`,
      disclaimer: AI_MEDICAL_DISCLAIMER,
      generatedAt: new Date().toISOString(),
      modelVersion: 'deterministic-coordination-engine',
    }
  },

  /**
   * Generates or refreshes an AI-assisted coordination summary for a medical case.
   */
  async generateCaseSummary(
    caseId: string
  ): Promise<{ summary: CaseCoordinationSummary; corrections: SummaryCorrection[] }> {
    const medicalCase = await caseService.getCaseById(caseId)
    if (!medicalCase) {
      throw new NotFoundError(`Medical case #${caseId} not found`)
    }

    // Retrieve authorized medical records associated with this case
    const records = await medicalRecordService.listRecordsByCase(caseId)

    // Collect existing corrections to incorporate or preserve
    const existingCorrections = medicalCase.summaryCorrections || []

    // Map record metadata
    const recordsMetadata = records.map((r) => ({
      name: r.name,
      category: r.category,
      type: r.type,
      aiSummary: r.aiSummary,
      aiMetadata: r.aiMetadata,
    }))

    // Call Groq LLM service for structured extraction with rate-limit resilience
    let rawSummary: CaseCoordinationSummaryData
    try {
      rawSummary = await groqService.generateCaseSummary({
        caseId: medicalCase.id,
        treatmentName: medicalCase.treatmentName,
        medicalHistory: medicalCase.medicalHistory,
        patientNotes: medicalCase.patientNotes,
        preferredDate: medicalCase.preferredDate,
        budgetMin: medicalCase.budgetMin,
        budgetMax: medicalCase.budgetMax,
        currency: medicalCase.currency,
        destinationName: medicalCase.destinationName,
        recordsMetadata,
        patientCorrections: existingCorrections.map((c) => ({
          sectionKey: c.sectionKey,
          correctedValue: c.correctedValue,
          reason: c.reason,
        })),
      })
    } catch (err: any) {
      if (
        err.message?.includes('429') ||
        err.message?.includes('Rate limit') ||
        err.message?.includes('rate_limit') ||
        err.message?.includes('tokens per minute')
      ) {
        console.warn(`[caseSummaryService] Groq rate limit hit, using deterministic fallback: ${err.message}`)
        rawSummary = this.buildDeterministicSummary(medicalCase, records)
      } else {
        throw err
      }
    }

    // Construct final coordination summary
    const summary: CaseCoordinationSummary = {
      caseObjective: rawSummary.caseObjective,
      patientProvidedInformation: rawSummary.patientProvidedInformation,
      uploadedDocumentTypes: rawSummary.uploadedDocumentTypes,
      documentedMedicalHistory: rawSummary.documentedMedicalHistory,
      documentedProcedures: rawSummary.documentedProcedures,
      knownMedications: rawSummary.knownMedications,
      missingInformation: rawSummary.missingInformation,
      patientPreferences: rawSummary.patientPreferences,
      travelCoordinationRequirements: rawSummary.travelCoordinationRequirements,
      executiveBrief: rawSummary.executiveBrief,
      disclaimer: rawSummary.disclaimer,
      generatedAt: rawSummary.generatedAt || new Date().toISOString(),
      modelVersion: rawSummary.modelVersion,
    }

    // Apply active patient corrections directly to ensure patient inputs override extracted data
    this.applyCorrectionsToSummary(summary, existingCorrections)

    // Save summary to case record
    await caseService.updateCoordinationSummary(caseId, summary)

    // Audit/Journey log
    await journeyService.addJourneyEvent({
      caseId: medicalCase.id,
      stage: 'AI_SUMMARY',
      title: 'AI Coordination Summary Generated',
      description: `Structured clinical briefing generated for ${medicalCase.treatmentName}`,
      actorRole: 'SYSTEM',
      timestamp: summary.generatedAt,
    })

    return { summary, corrections: existingCorrections }
  },

  /**
   * Retrieves current coordination summary and patient corrections for a case.
   */
  async getCaseSummary(
    caseId: string
  ): Promise<{ summary: CaseCoordinationSummary | null; corrections: SummaryCorrection[] }> {
    const medicalCase = await caseService.getCaseById(caseId)
    if (!medicalCase) {
      throw new NotFoundError(`Medical case #${caseId} not found`)
    }

    return {
      summary: medicalCase.coordinationSummary || null,
      corrections: medicalCase.summaryCorrections || [],
    }
  },

  /**
   * Allows the patient or coordinator to flag or correct inaccurate extracted facts.
   */
  async addCorrection(
    caseId: string,
    data: {
      sectionKey: string
      originalValue?: string
      correctedValue: string
      reason?: string
      userId: string
    }
  ): Promise<{ correction: SummaryCorrection; summary: CaseCoordinationSummary | null }> {
    if (!data.correctedValue || data.correctedValue.trim().length === 0) {
      throw new ValidationError('Corrected value is required and cannot be empty')
    }

    const medicalCase = await caseService.getCaseById(caseId)
    if (!medicalCase) {
      throw new NotFoundError(`Medical case #${caseId} not found`)
    }

    const correction: SummaryCorrection = {
      id: `corr-${randomUUID().substring(0, 8)}`,
      caseId,
      sectionKey: data.sectionKey,
      originalValue: data.originalValue || '',
      correctedValue: data.correctedValue.trim(),
      reason: data.reason?.trim() || 'Patient reported correction',
      flaggedBy: data.userId,
      status: 'Corrected',
      createdAt: new Date().toISOString(),
    }

    await caseService.addSummaryCorrection(caseId, correction)

    // If summary exists, apply correction immediately so the UI reflects it
    let updatedSummary = medicalCase.coordinationSummary || null
    if (updatedSummary) {
      this.applyCorrectionsToSummary(updatedSummary, [correction])
      await caseService.updateCoordinationSummary(caseId, updatedSummary)
    }

    // Audit trail
    await journeyService.addJourneyEvent({
      caseId,
      stage: 'CORRECTION',
      title: 'Summary Fact Corrected by Patient',
      description: `Section [${data.sectionKey}] adjusted by patient.`,
      actorRole: 'patient',
      timestamp: correction.createdAt,
    })

    return {
      correction,
      summary: updatedSummary,
    }
  },

  /**
   * Helper to overlay patient corrections onto summary fields
   */
  applyCorrectionsToSummary(
    summary: CaseCoordinationSummary,
    corrections: SummaryCorrection[]
  ): void {
    for (const corr of corrections) {
      const key = corr.sectionKey as keyof CaseCoordinationSummary
      if (key === 'caseObjective' && summary.caseObjective) {
        summary.caseObjective.value = corr.correctedValue
        summary.caseObjective.source = 'Patient provided'
        summary.caseObjective.notes = `Corrected by patient (${corr.reason || 'Verified'})`
      } else if (key === 'patientProvidedInformation' && summary.patientProvidedInformation) {
        summary.patientProvidedInformation.value = corr.correctedValue
        summary.patientProvidedInformation.source = 'Patient provided'
        summary.patientProvidedInformation.notes = `Corrected by patient`
      } else if (key === 'documentedMedicalHistory' && summary.documentedMedicalHistory) {
        summary.documentedMedicalHistory.value = corr.correctedValue
        summary.documentedMedicalHistory.source = 'Patient provided'
        summary.documentedMedicalHistory.notes = `Corrected by patient`
      } else if (key === 'documentedProcedures' && summary.documentedProcedures) {
        summary.documentedProcedures.value = corr.correctedValue
        summary.documentedProcedures.source = 'Patient provided'
        summary.documentedProcedures.notes = `Corrected by patient`
      } else if (key === 'knownMedications' && summary.knownMedications) {
        summary.knownMedications.items = corr.correctedValue
        summary.knownMedications.source = 'Patient provided'
      } else if (key === 'patientPreferences' && summary.patientPreferences) {
        summary.patientPreferences.value = corr.correctedValue
        summary.patientPreferences.source = 'Patient provided'
        summary.patientPreferences.notes = `Corrected by patient`
      } else if (key === 'travelCoordinationRequirements' && summary.travelCoordinationRequirements) {
        summary.travelCoordinationRequirements.value = corr.correctedValue
        summary.travelCoordinationRequirements.source = 'Patient provided'
        summary.travelCoordinationRequirements.notes = `Corrected by patient`
      }
    }
  },
}
