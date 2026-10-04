import {
  MedicalCase,
  MedicalCaseStatus,
  MedicalCaseStatusType,
  UserRole,
  CaseCoordinationSummary,
  SummaryCorrection,
} from '../types/index.js'
import { journeyService } from './journeyService.js'
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js'

const MOCK_CASES: MedicalCase[] = [
  {
    id: 'ET-8492',
    patientId: 'pat-1',
    patientName: 'Eleanor Vance',
    treatmentId: 'knee-replacement',
    treatmentName: 'Total Knee Replacement (Robotic Mako/Rosa)',
    destinationId: 'india',
    destinationName: 'New Delhi, India',
    status: MedicalCaseStatus.CONSULTATION,
    journeyStage: 'Consultation',
    budgetMin: 5500,
    budgetMax: 8500,
    currency: 'USD',
    preferredDate: '2026-11-15',
    medicalHistory: 'Severe osteoarthritis Grade IV. Conservative therapy exhausted.',
    patientNotes: 'Requires private room accommodating traveling spouse.',
    selectedProviderId: 'apex-joint-delhi',
    selectedProviderName: 'Apex Joint Institute',
    createdAt: '2026-09-18T10:15:00Z',
    updatedAt: '2026-10-01T14:30:00Z',
  },
  {
    id: 'ET-7123',
    patientId: 'pat-2',
    patientName: 'David Miller',
    treatmentId: 'cabg',
    treatmentName: 'Coronary Artery Bypass Graft (CABG)',
    destinationId: 'thailand',
    destinationName: 'Bangkok, Thailand',
    status: MedicalCaseStatus.MATCHING,
    journeyStage: 'Matching',
    budgetMin: 14000,
    budgetMax: 22000,
    currency: 'USD',
    preferredDate: '2026-12-01',
    medicalHistory: 'Triple vessel coronary disease with 85% proximal LAD stenosis. Stable angina class III.',
    patientNotes: 'Prefers minimally invasive off-pump CABG protocol if clinically viable.',
    selectedProviderId: 'bumrungrad-partner-bangkok',
    selectedProviderName: 'Bumrungrad International Hospital',
    createdAt: '2026-09-24T11:00:00Z',
    updatedAt: '2026-10-02T09:00:00Z',
  },
  {
    id: 'ET-6842',
    patientId: 'pat-3',
    patientName: 'Robert Vance',
    treatmentId: 'dental-implants',
    treatmentName: 'All-on-4 Zirconia Dental Arch',
    destinationId: 'turkey',
    destinationName: 'Istanbul, Turkey',
    status: MedicalCaseStatus.CONSULTATION,
    journeyStage: 'Consultation',
    budgetMin: 4000,
    budgetMax: 7000,
    currency: 'USD',
    preferredDate: '2026-11-20',
    medicalHistory: 'Severe maxillary bone resorption following periodontal disease. Non-smoker.',
    patientNotes: 'Requires full immediate load prosthesis with companion accommodation.',
    selectedProviderId: 'acibadem-heart-istanbul',
    selectedProviderName: 'Acıbadem Healthcare Group',
    createdAt: '2026-09-20T14:20:00Z',
    updatedAt: '2026-10-03T16:00:00Z',
  },
  {
    id: 'ET-9011',
    patientId: 'pat-4',
    patientName: 'Sarah Jenkins',
    treatmentId: 'knee-replacement',
    treatmentName: 'Robotic Knee Reconstruction (Revision)',
    destinationId: 'india',
    destinationName: 'New Delhi, India',
    status: MedicalCaseStatus.MATCHING,
    journeyStage: 'Matching',
    budgetMin: 7000,
    budgetMax: 11000,
    currency: 'USD',
    preferredDate: '2026-12-10',
    medicalHistory: 'Aseptic loosening of left tibial component after primary arthroplasty 6 years ago.',
    patientNotes: 'Requires CT scan review for revision stem length and bone augments. Awaiting quote.',
    selectedProviderId: 'apex-joint-delhi',
    selectedProviderName: 'Apex Joint Institute',
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-03T18:00:00Z',
  },
]

export const caseService = {
  async listCases(filters?: {
    patientId?: string
    providerId?: string
    status?: MedicalCaseStatusType
  }): Promise<MedicalCase[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabaseAdmin.from('cases').select('*')
        if (filters?.patientId) {
          query = query.eq('patient_id', filters.patientId)
        }
        if (filters?.providerId) {
          query = query.eq('selected_provider_id', filters.providerId)
        }
        if (filters?.status) {
          query = query.eq('status', filters.status)
        }
        const { data, error } = await query

        if (!error && data) {
          return data.map((c: any) => ({
            id: c.id,
            patientId: c.patient_id,
            patientName: c.patient_name,
            treatmentId: c.treatment_id,
            treatmentName: c.treatment_name,
            destinationId: c.destination_id,
            destinationName: c.destination_name,
            status: c.status,
            journeyStage: c.journey_stage,
            budgetMin: c.budget_min,
            budgetMax: c.budget_max,
            currency: c.currency,
            preferredDate: c.preferred_date,
            medicalHistory: c.medical_history,
            patientNotes: c.patient_notes,
            selectedProviderId: c.selected_provider_id,
            selectedProviderName: c.selected_provider_name,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
          }))
        }
      } catch (err: any) {
        console.warn(`[caseService] Supabase listCases fallback: ${err.message}`)
      }
    }

    let result = [...MOCK_CASES]
    if (filters?.patientId) {
      result = result.filter((c) => c.patientId === filters.patientId)
    }
    if (filters?.providerId) {
      const pId = filters.providerId
      const authorized: MedicalCase[] = []
      for (const c of result) {
        if (c.selectedProviderId === pId) {
          authorized.push(c)
        } else {
          const isAuth = await this.isProviderAuthorizedForCase(c.id, pId)
          if (isAuth) {
            authorized.push(c)
          }
        }
      }
      result = authorized
    }
    if (filters?.status) {
      result = result.filter((c) => c.status === filters.status)
    }
    return result
  },

  async isProviderAuthorizedForCase(caseId: string, providerId: string): Promise<boolean> {
    const c = await this.getCaseById(caseId)
    if (!c) return false

    // Direct assignment / selection
    if (c.selectedProviderId === providerId) return true

    // Check if provider has active quotes for this case
    try {
      const { quoteService } = await import('./quoteService.js')
      const quotes = await quoteService.listQuotesByCase(caseId)
      if (quotes.some((q) => q.providerId === providerId)) return true
    } catch {
      // ignore
    }

    // Check if provider has active permissions for any record in this case
    try {
      const { medicalRecordService } = await import('./medicalRecordService.js')
      const records = await medicalRecordService.listRecordsByCase(caseId)
      if (records.some((r) => r.permissions && r.permissions.includes(providerId))) return true
    } catch {
      // ignore
    }

    return false
  },

  async getCaseById(id: string): Promise<MedicalCase | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data: c, error } = await supabaseAdmin
          .from('cases')
          .select('*')
          .eq('id', id)
          .single()

        if (!error && c) {
          return {
            id: c.id,
            patientId: c.patient_id,
            patientName: c.patient_name,
            treatmentId: c.treatment_id,
            treatmentName: c.treatment_name,
            destinationId: c.destination_id,
            destinationName: c.destination_name,
            status: c.status,
            journeyStage: c.journey_stage,
            budgetMin: c.budget_min,
            budgetMax: c.budget_max,
            currency: c.currency,
            preferredDate: c.preferred_date,
            medicalHistory: c.medical_history,
            patientNotes: c.patient_notes,
            selectedProviderId: c.selected_provider_id,
            selectedProviderName: c.selected_provider_name,
            coordinationSummary: c.coordination_summary || c.coordinationSummary,
            summaryCorrections: c.summary_corrections || c.summaryCorrections || [],
            createdAt: c.created_at,
            updatedAt: c.updated_at,
          }
        }
      } catch (err: any) {
        console.warn(`[caseService] Supabase getCaseById fallback: ${err.message}`)
      }
    }

    const c = MOCK_CASES.find((item) => item.id === id)
    return c || null
  },

  async createCase(
    data: Omit<MedicalCase, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'journeyStage'>
  ): Promise<MedicalCase> {
    const newCase: MedicalCase = {
      ...data,
      id: `ET-${Math.floor(1000 + Math.random() * 9000)}`,
      status: MedicalCaseStatus.DRAFT,
      journeyStage: 'Case Created',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (isSupabaseConfigured()) {
      try {
        await supabaseAdmin.from('cases').insert({
          id: newCase.id,
          patient_id: newCase.patientId,
          patient_name: newCase.patientName,
          treatment_id: newCase.treatmentId,
          treatment_name: newCase.treatmentName,
          destination_id: newCase.destinationId,
          destination_name: newCase.destinationName,
          status: newCase.status,
          journey_stage: newCase.journeyStage,
          budget_min: newCase.budgetMin,
          budget_max: newCase.budgetMax,
          currency: newCase.currency,
          preferred_date: newCase.preferredDate,
          medical_history: newCase.medicalHistory,
          patient_notes: newCase.patientNotes,
          created_at: newCase.createdAt,
          updated_at: newCase.updatedAt,
        })
      } catch (err: any) {
        console.warn(`[caseService] Supabase createCase fallback: ${err.message}`)
      }
    }

    MOCK_CASES.push(newCase)

    await journeyService.addJourneyEvent({
      caseId: newCase.id,
      stage: 'Created',
      title: 'Medical Case Initialized',
      description: `Case dossier #${newCase.id} registered for ${newCase.treatmentName}`,
      actorRole: 'patient',
      timestamp: newCase.createdAt,
    })

    return newCase
  },

  async updateCaseStatus(
    id: string,
    newStatus: MedicalCaseStatusType,
    updatedByRole: UserRole = 'patient'
  ): Promise<MedicalCase | null> {
    const c = await this.getCaseById(id)
    if (!c) return null

    // Validate that newStatus is a valid MedicalCaseStatus constant
    const validStatuses = Object.values(MedicalCaseStatus)
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`)
    }

    c.status = newStatus
    c.updatedAt = new Date().toISOString()

    if (isSupabaseConfigured()) {
      try {
        await supabaseAdmin
          .from('cases')
          .update({
            status: newStatus,
            updated_at: c.updatedAt,
          })
          .eq('id', id)
      } catch (err: any) {
        console.warn(`[caseService] Supabase updateCaseStatus fallback: ${err.message}`)
      }
    }

    // In-memory update
    const memCase = MOCK_CASES.find((item) => item.id === id)
    if (memCase) {
      memCase.status = newStatus
      memCase.updatedAt = c.updatedAt
    }

    await journeyService.addJourneyEvent({
      caseId: c.id,
      stage: newStatus,
      title: `Status Transition: ${newStatus}`,
      description: `Case progression updated to ${newStatus}`,
      actorRole: updatedByRole,
      timestamp: c.updatedAt,
    })

    return c
  },

  async updateCoordinationSummary(
    id: string,
    summary: CaseCoordinationSummary
  ): Promise<MedicalCase | null> {
    const c = await this.getCaseById(id)
    if (!c) return null

    c.coordinationSummary = summary
    c.updatedAt = new Date().toISOString()

    if (isSupabaseConfigured()) {
      try {
        await supabaseAdmin
          .from('cases')
          .update({
            coordination_summary: summary,
            updated_at: c.updatedAt,
          })
          .eq('id', id)
      } catch (err: any) {
        console.warn(`[caseService] Supabase updateCoordinationSummary fallback: ${err.message}`)
      }
    }

    const memCase = MOCK_CASES.find((item) => item.id === id)
    if (memCase) {
      memCase.coordinationSummary = summary
      memCase.updatedAt = c.updatedAt
    }

    return c
  },

  async addSummaryCorrection(
    caseId: string,
    correction: SummaryCorrection
  ): Promise<SummaryCorrection> {
    const c = await this.getCaseById(caseId)
    if (!c) {
      throw new Error(`Case #${caseId} not found`)
    }

    if (!c.summaryCorrections) {
      c.summaryCorrections = []
    }
    c.summaryCorrections.push(correction)
    c.updatedAt = new Date().toISOString()

    const memCase = MOCK_CASES.find((item) => item.id === caseId)
    if (memCase) {
      if (!memCase.summaryCorrections) {
        memCase.summaryCorrections = []
      }
      memCase.summaryCorrections.push(correction)
      memCase.updatedAt = c.updatedAt
    }

    if (isSupabaseConfigured()) {
      try {
        await supabaseAdmin
          .from('cases')
          .update({
            summary_corrections: c.summaryCorrections,
            updated_at: c.updatedAt,
          })
          .eq('id', caseId)
      } catch (err: any) {
        console.warn(`[caseService] Supabase addSummaryCorrection fallback: ${err.message}`)
      }
    }

    return correction
  },
}
