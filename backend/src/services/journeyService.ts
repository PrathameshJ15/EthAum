import {
  JourneyEvent,
  CanonicalJourneyStage,
  CaseJourneySummary,
  JourneyStageItem,
  MedicalCaseStatus,
} from '../types/index.js'
import { caseService } from './caseService.js'
import { appointmentService } from './appointmentService.js'
import { bookingService } from './bookingService.js'
import { providerService } from './providerService.js'

export const CANONICAL_JOURNEY_STAGES: Array<{
  id: CanonicalJourneyStage
  number: string
  title: string
  shortDesc: string
}> = [
  { id: 'DRAFT', number: '01', title: 'Draft Intake', shortDesc: 'Case dossier initialized & symptoms logged' },
  { id: 'RECORDS', number: '02', title: 'Diagnostic Records', shortDesc: 'Scans & clinical history securely uploaded' },
  { id: 'QUALIFICATION', number: '03', title: 'Clinical Qualification', shortDesc: 'Eligibility criteria & pre-op review verified' },
  { id: 'MATCHING', number: '04', title: 'Provider Matching', shortDesc: 'Accredited international hospitals screened' },
  { id: 'QUOTES', number: '05', title: 'Institutional Quotes', shortDesc: 'Transparent itemized proposals received' },
  { id: 'PROVIDER', number: '06', title: 'Provider Selected', shortDesc: 'Hospital & lead surgeon confirmed by patient' },
  { id: 'CONSULTATION', number: '07', title: 'Specialist Consultation', shortDesc: 'Pre-travel video consult with surgeon' },
  { id: 'BOOKED', number: '08', title: 'Treatment Booked', shortDesc: 'Admission date locked, travel & logistics set' },
  { id: 'TREATMENT', number: '09', title: 'Inpatient Treatment', shortDesc: 'Hospital admission, procedure & acute care' },
  { id: 'AFTERCARE', number: '10', title: 'Recovery & Aftercare', shortDesc: 'Post-discharge milestones, rehab & follow-ups' },
  { id: 'COMPLETED', number: '11', title: 'Care Completed', shortDesc: 'Full recovery achieved & dossier archived' },
]

export function normalizeStage(rawStage?: string): CanonicalJourneyStage {
  if (!rawStage) return 'DRAFT'
  const upper = rawStage.toUpperCase().trim()

  if (upper === 'DRAFT' || upper === 'CREATED' || upper === 'CASE CREATED') return 'DRAFT'
  if (upper === 'RECORDS' || upper === 'RECORDS_PENDING' || upper === 'RECORDS UPLOADED') return 'RECORDS'
  if (upper === 'QUALIFICATION' || upper === 'AI' || upper === 'AI SYNTHESIS' || upper === 'ELIGIBILITY') return 'QUALIFICATION'
  if (upper === 'MATCHING' || upper === 'PROVIDER MATCHING') return 'MATCHING'
  if (upper === 'QUOTES' || upper === 'QUOTES_RECEIVED' || upper === 'QUOTES RECEIVED') return 'QUOTES'
  if (upper === 'PROVIDER' || upper === 'PROVIDER_SELECTED' || upper === 'PROVIDER SELECTED') return 'PROVIDER'
  if (upper === 'CONSULTATION') return 'CONSULTATION'
  if (upper === 'BOOKED' || upper === 'TREATMENT BOOKED') return 'BOOKED'
  if (upper === 'TREATMENT' || upper === 'INPATIENT TREATMENT') return 'TREATMENT'
  if (upper === 'AFTERCARE' || upper === 'RECOVERY') return 'AFTERCARE'
  if (upper === 'COMPLETED' || upper === 'CARE COMPLETED') return 'COMPLETED'

  return 'DRAFT'
}

const MOCK_JOURNEY_EVENTS: JourneyEvent[] = [
  {
    id: 'je-1',
    caseId: 'ET-8492',
    stage: 'DRAFT',
    title: 'Medical Case Initialized',
    description: 'Dossier initialized & registered for Robotic Total Knee Replacement',
    actorRole: 'patient',
    timestamp: '2026-09-18T10:15:00Z',
  },
  {
    id: 'je-2',
    caseId: 'ET-8492',
    stage: 'RECORDS',
    title: 'Diagnostic Records Uploaded',
    description: 'Coronal MRI, Bilateral X-Ray, and CT DICOM scans securely verified in private vault',
    actorRole: 'patient',
    timestamp: '2026-09-18T10:45:00Z',
  },
  {
    id: 'je-3',
    caseId: 'ET-8492',
    stage: 'QUALIFICATION',
    title: 'Clinical Qualification Complete',
    description: 'Intake eligibility verified for cruciate-retaining ceramic joint replacement',
    actorRole: 'SYSTEM',
    timestamp: '2026-09-19T09:00:00Z',
  },
  {
    id: 'je-4',
    caseId: 'ET-8492',
    stage: 'MATCHING',
    title: 'Accredited Centers Screened',
    description: 'Matched with JCI-accredited Apex Joint Institute in New Delhi',
    actorRole: 'SYSTEM',
    timestamp: '2026-09-19T14:00:00Z',
  },
  {
    id: 'je-5',
    caseId: 'ET-8492',
    stage: 'QUOTES',
    title: 'Itemized Quotes Received',
    description: 'Received institutional quotation with comprehensive surgical itemization',
    actorRole: 'provider',
    timestamp: '2026-09-22T11:00:00Z',
  },
  {
    id: 'je-6',
    caseId: 'ET-8492',
    stage: 'PROVIDER',
    title: 'Provider Confirmed',
    description: 'Apex Joint Institute selected by patient for surgical execution',
    actorRole: 'patient',
    timestamp: '2026-09-25T15:30:00Z',
  },
  {
    id: 'je-7',
    caseId: 'ET-8492',
    stage: 'CONSULTATION',
    title: 'Pre-Surgical Tele-Consultation Scheduled',
    description: 'Video session confirmed with Dr. Vikram Oberoi',
    actorRole: 'provider',
    timestamp: '2026-10-01T14:30:00Z',
  },
]

export const journeyService = {
  async getJourneyEvents(caseId: string): Promise<JourneyEvent[]> {
    return MOCK_JOURNEY_EVENTS.filter((e) => e.caseId === caseId).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  },

  async addJourneyEvent(eventData: Omit<JourneyEvent, 'id'>): Promise<JourneyEvent> {
    const newEvent: JourneyEvent = {
      ...eventData,
      id: `je-${Date.now()}`,
    }
    MOCK_JOURNEY_EVENTS.push(newEvent)
    return newEvent
  },

  async getJourneySummary(caseId: string): Promise<CaseJourneySummary> {
    const c = await caseService.getCaseById(caseId)
    if (!c) {
      throw new Error(`Case #${caseId} not found`)
    }

    const currentStageId = normalizeStage(c.status || c.journeyStage)
    const currentIndex = CANONICAL_JOURNEY_STAGES.findIndex((s) => s.id === currentStageId)
    const activeIdx = currentIndex >= 0 ? currentIndex : 0

    const completedStages: CanonicalJourneyStage[] = CANONICAL_JOURNEY_STAGES.slice(
      0,
      activeIdx
    ).map((s) => s.id)

    const allStages: JourneyStageItem[] = CANONICAL_JOURNEY_STAGES.map((s, idx) => ({
      id: s.id,
      number: s.number,
      title: s.title,
      shortDesc: s.shortDesc,
      isCompleted: idx < activeIdx,
      isCurrent: idx === activeIdx,
    }))

    // Appointments lookup
    const appointments = await appointmentService.listAppointments({ caseId })
    const bookings = await bookingService.listBookings({ caseId })
    const booking = bookings[0] || null

    // Determine Next Action based on canonical stage
    let nextAction = {
      title: 'Complete Case Intake Details',
      description: 'Review your initial symptoms, medical context, and preferred timeline.',
      actionLabel: 'Complete Intake',
      actionType: 'COMPLETE_INTAKE',
      targetTab: 'overview',
    }

    switch (currentStageId) {
      case 'DRAFT':
        nextAction = {
          title: 'Upload Diagnostic Medical Records',
          description: 'Provide DICOM MRI, X-ray scans, or blood work to enable clinical review.',
          actionLabel: 'Upload Medical Records',
          actionType: 'UPLOAD_RECORDS',
          targetTab: 'records',
        }
        break
      case 'RECORDS':
        nextAction = {
          title: 'Review Structured Medical Vault',
          description: 'Your diagnostic scans are uploaded. Verify records and configure provider permissions.',
          actionLabel: 'Review Records Vault',
          actionType: 'VIEW_RECORDS',
          targetTab: 'records',
        }
        break
      case 'QUALIFICATION':
        nextAction = {
          title: 'Review Clinical Coordination Summary',
          description: 'Clinical intake has qualified your case. Review summary facts and gap detection.',
          actionLabel: 'Review Summary & Gaps',
          actionType: 'VIEW_SUMMARY',
          targetTab: 'summary',
        }
        break
      case 'MATCHING':
        nextAction = {
          title: 'Explore Accredited Hospital Matches',
          description: 'Screening complete. Review top matching international centers and doctor profiles.',
          actionLabel: 'View Matched Centers',
          actionType: 'VIEW_MATCHES',
          targetTab: 'matching',
        }
        break
      case 'QUOTES':
        nextAction = {
          title: 'Compare Institutional Quotes Side-by-Side',
          description: 'Review itemized pricing, inclusions, and clinical notes without automated bias.',
          actionLabel: 'Compare Quotes',
          actionType: 'COMPARE_QUOTES',
          targetTab: 'quotes',
        }
        break
      case 'PROVIDER':
        nextAction = {
          title: 'Schedule Pre-Surgical Video Consultation',
          description: 'Provider selected. Book your pre-travel video consultation with the operating surgeon.',
          actionLabel: 'Schedule Video Consult',
          actionType: 'SCHEDULE_CONSULT',
          targetTab: 'consultation',
        }
        break
      case 'CONSULTATION':
        nextAction = {
          title: 'Join Pre-Surgical Video Consult',
          description: 'Connect with Dr. Vikram Oberoi for surgical planning and pre-travel evaluation.',
          actionLabel: 'Join Video Consultation',
          actionType: 'JOIN_CONSULT',
          targetTab: 'consultation',
        }
        break
      case 'BOOKED':
        nextAction = {
          title: 'Review Inpatient Admission & Travel Logistics',
          description: 'Admission confirmed. Coordinate arrival concierge, companion suite, and hospital pass.',
          actionLabel: 'View Admission Details',
          actionType: 'VIEW_ADMISSION',
          targetTab: 'overview',
        }
        break
      case 'TREATMENT':
        nextAction = {
          title: 'Hospital Inpatient Protocol Active',
          description: 'Surgical procedure & acute ward recovery underway. Care team monitoring vitals.',
          actionLabel: 'View Inpatient Protocol',
          actionType: 'VIEW_TREATMENT',
          targetTab: 'overview',
        }
        break
      case 'AFTERCARE':
        nextAction = {
          title: 'Follow-Up Milestones & Recovery Reminders',
          description: 'Post-discharge protocol active. Complete scheduled follow-ups and physiotherapist check-ins.',
          actionLabel: 'Open Aftercare Portal',
          actionType: 'VIEW_AFTERCARE',
          targetTab: 'aftercare',
        }
        break
      case 'COMPLETED':
        nextAction = {
          title: 'Care Journey Complete · Access Full Dossier',
          description: 'Surgical care cycle fulfilled. Download final discharge pack, implant passport & certificate.',
          actionLabel: 'Download Care Archive',
          actionType: 'DOWNLOAD_ARCHIVE',
          targetTab: 'aftercare',
        }
        break
    }

    // Provider Details
    const providerId = c.selectedProviderId || 'apex-joint-delhi'
    let providerDetails = {
      id: providerId,
      name: c.selectedProviderName || 'Apex Orthopedic & Robotic Joint Institute',
      city: 'New Delhi',
      country: 'India 🇮🇳',
      doctorName: 'Dr. Vikram Oberoi',
      doctorTitle: 'Director of Robotic Joint Reconstruction',
      accreditation: 'JCI Accredited · NABH Super Specialty',
      rating: 4.95,
      contactEmail: 'international.desk@apollohealth.org',
      contactPhone: '+91 11 2692 5858',
    }

    // Treatment Details
    const treatmentDetails = {
      id: c.treatmentId,
      name: c.treatmentName,
      category: 'Adult Orthopedic Reconstruction',
      protocol: 'Mako Robotic Total Arthroplasty (Cruciate Retaining)',
      estimatedStayDays: booking?.estimatedStayDays || 10,
      packagePrice: booking?.packagePrice || 6500,
      currency: booking?.currency || c.currency || 'USD',
    }

    // Important Dates
    const intakeDate = c.createdAt ? c.createdAt.split('T')[0] : '2026-09-18'
    const consultationDate = appointments[0]?.dateTime
      ? appointments[0].dateTime.split('T')[0]
      : '2026-10-14'
    const admissionDate = booking?.admissionDate || c.preferredDate || '2026-11-15'
    const procedureDate = '2026-11-16'
    const targetDischargeDate = '2026-11-22'
    const nextFollowUpDate = '2026-11-30'
    const completionDate = '2026-12-15'

    const importantDates = {
      intakeDate,
      recordsVerifiedDate: '2026-09-19',
      qualificationDate: '2026-09-20',
      matchingDate: '2026-09-21',
      quoteReceivedDate: '2026-09-23',
      providerConfirmedDate: '2026-09-25',
      consultationDate,
      admissionDate,
      procedureDate,
      targetDischargeDate,
      nextFollowUpDate,
      completionDate,
    }

    const currentStageDef = CANONICAL_JOURNEY_STAGES[activeIdx]

    return {
      caseId: c.id,
      currentStage: {
        id: currentStageDef.id,
        number: currentStageDef.number,
        title: currentStageDef.title,
        shortDesc: currentStageDef.shortDesc,
        status: c.status,
        progressPercent: Math.round(((activeIdx + 1) / CANONICAL_JOURNEY_STAGES.length) * 100),
      },
      completedStages,
      allStages,
      nextAction,
      importantDates,
      provider: providerDetails,
      treatment: treatmentDetails,
      appointments,
    }
  },
}
