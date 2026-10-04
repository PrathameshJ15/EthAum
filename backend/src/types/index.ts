/**
 * EthAum Platform Domain Models & Types
 */

export type UserRole = 'patient' | 'provider' | 'admin' | 'PATIENT' | 'PROVIDER' | 'ADMIN'

export interface User {
  id: string
  authUserId?: string
  email: string
  role: UserRole
  name: string
  phone?: string
  country?: string
  organization?: string
  specialty?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Patient {
  id: string
  userId: string
  dateOfBirth?: string
  gender?: string
  age?: number
  companionTraveling?: boolean
  medicalSummary?: string
  createdAt: string
  updatedAt: string
}

export interface Provider {
  id: string
  name: string
  city: string
  country: string
  flag?: string
  accreditations: string[]
  tagline?: string
  overview: string
  coverImage?: string
  logo?: string
  rating: number
  reviewCount: number
  beds?: number
  languages: string[]
  facilities: string[]
  internationalSupport?: {
    airportConcierge?: string
    visaAssistance?: string
    translators?: string
    accommodation?: string
  }
  doctors?: Doctor[]
  treatmentsOffered?: ProviderTreatmentOffer[]
  establishedYear?: number
  createdAt: string
  updatedAt: string
}

export interface ProviderTreatmentOffer {
  treatmentId: string
  name: string
  startingPriceUSD: number
  inclusions?: string[]
  exclusions?: string[]
}

export interface ScoringBreakdown {
  treatmentFit: number
  destinationFit: number
  specializationFit: number
  availabilityFit: number
  preferenceFit: number
  totalScore: number
}

export interface ProviderMatch {
  provider: Provider
  matchScore: number
  scoringBreakdown: ScoringBreakdown
  matchFactors: string[]
  whyRelevant: string
  highlights?: string[]
  relevantTreatments: ProviderTreatmentOffer[]
  trustInformation: {
    accreditations: string[]
    establishedYear?: number
    internationalDesk: boolean
    leadSurgeonExperienceYears?: number
  }
}

export interface Doctor {
  id: string
  providerId: string
  name: string
  title: string
  specialty: string
  experienceYears: number
  education: string
  image?: string
  createdAt: string
}

export interface Treatment {
  id: string
  name: string
  category: string
  shortDescription: string
  longDescription: string
  startingPriceUSD: number
  usAvgPriceUSD?: number
  ukAvgPriceUSD?: number
  savingsPercentage?: number
  hospitalStayDays: string
  recoveryTimeWeeks: string
  suitableFor: string[]
  image?: string
  topDestinationIds: string[]
  createdAt: string
}

export interface ProviderTreatment {
  id: string
  providerId: string
  treatmentId: string
  priceUSD: number
  inclusions: string[]
  notes?: string
}

/**
 * Medical Case State Constants & Types
 * Represents the sovereign clinical journey through EthAum
 */
export const MedicalCaseStatus = {
  DRAFT: 'DRAFT',
  RECORDS: 'RECORDS',
  RECORDS_PENDING: 'RECORDS_PENDING',
  QUALIFICATION: 'QUALIFICATION',
  MATCHING: 'MATCHING',
  QUOTES: 'QUOTES',
  QUOTES_RECEIVED: 'QUOTES_RECEIVED',
  PROVIDER: 'PROVIDER',
  PROVIDER_SELECTED: 'PROVIDER_SELECTED',
  CONSULTATION: 'CONSULTATION',
  BOOKED: 'BOOKED',
  TREATMENT: 'TREATMENT',
  AFTERCARE: 'AFTERCARE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export type MedicalCaseStatusType = (typeof MedicalCaseStatus)[keyof typeof MedicalCaseStatus]

export type CanonicalJourneyStage =
  | 'DRAFT'
  | 'RECORDS'
  | 'QUALIFICATION'
  | 'MATCHING'
  | 'QUOTES'
  | 'PROVIDER'
  | 'CONSULTATION'
  | 'BOOKED'
  | 'TREATMENT'
  | 'AFTERCARE'
  | 'COMPLETED'

export type AttributionSource =
  | 'Patient provided'
  | 'Document extracted'
  | 'AI summarized'
  | 'Not available'

export interface CaseSummaryItem {
  value: string
  source: AttributionSource
  notes?: string
}

export interface CaseCoordinationSummary {
  caseObjective: CaseSummaryItem
  patientProvidedInformation: CaseSummaryItem
  uploadedDocumentTypes: {
    types: string[]
    source: AttributionSource
  }
  documentedMedicalHistory: CaseSummaryItem
  documentedProcedures: CaseSummaryItem
  knownMedications: {
    items: Array<{ name: string; dosage?: string; frequency?: string }> | string
    source: AttributionSource
  }
  missingInformation: {
    items: string[]
    source: AttributionSource
  }
  patientPreferences: CaseSummaryItem
  travelCoordinationRequirements: CaseSummaryItem
  executiveBrief: string
  disclaimer: string
  generatedAt: string
  modelVersion?: string
}

export interface SummaryCorrection {
  id: string
  caseId: string
  sectionKey: string
  originalValue: string
  correctedValue: string
  reason?: string
  flaggedBy: string
  status: 'Flagged' | 'Corrected' | 'Reviewed'
  createdAt: string
  updatedAt?: string
}

export interface MedicalCase {
  id: string
  patientId: string
  patientName: string
  treatmentId: string
  treatmentName: string
  destinationId?: string
  destinationName?: string
  status: MedicalCaseStatusType
  journeyStage: string
  budgetMin?: number
  budgetMax?: number
  currency: string
  preferredDate?: string
  medicalHistory: string
  patientNotes?: string
  selectedProviderId?: string
  selectedProviderName?: string
  coordinationSummary?: CaseCoordinationSummary
  summaryCorrections?: SummaryCorrection[]
  bookingDetails?: TreatmentBooking
  createdAt: string
  updatedAt: string
}

export type RecordCategory =
  | 'MRI'
  | 'X-Ray'
  | 'CT'
  | 'Blood Reports'
  | 'Prescriptions'
  | 'Medical History'
  | 'Other'
  | 'CT Scan'
  | 'Blood Report'
  | 'Biopsy'
  | 'Clinical Notes'

export interface MedicalRecord {
  id: string
  caseId: string
  patientId: string
  name: string
  category: RecordCategory
  type: string
  size: string
  sizeBytes?: number
  storagePath: string
  status: 'Pending' | 'Verified' | 'Rejected' | 'Flagged'
  aiStatus: 'Processing' | 'Organized' | 'Failed'
  aiSummary?: string
  aiMetadata?: Record<string, any>
  permissions: string[] // List of provider IDs explicitly authorized to view
  createdAt: string
  updatedAt: string
}

export interface RecordPermission {
  id: string
  recordId: string
  providerId: string
  grantedBy: string // Patient ID
  grantedAt: string
  expiresAt?: string
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED'
}

export interface RecordAccessLog {
  id: string
  recordId: string
  accessedBy: string // User ID
  accessRole: UserRole
  action: 'VIEW' | 'DOWNLOAD' | 'UPLOAD' | 'SHARE_GRANTED' | 'SHARE_REVOKED'
  ipAddress?: string
  userAgent?: string
  details?: Record<string, any>
  timestamp: string
}

export type QuoteStatus = 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'PENDING' | 'DECLINED'

export interface QuoteAccommodation {
  applicable: boolean
  roomType?: string
  nights?: number
  cost?: number
  notes?: string
}

export interface QuoteComponent {
  description: string
  cost: number
  items?: string[]
}

export interface QuoteQuestion {
  id: string
  quoteId: string
  caseId: string
  patientId: string
  patientName: string
  question: string
  createdAt: string
  answer?: string
  answeredAt?: string
  answeredBy?: string
  status: 'OPEN' | 'ANSWERED'
}

export interface Quote {
  id: string
  caseId: string
  providerId: string
  providerName: string
  providerCity?: string
  providerCountry?: string
  providerFlag?: string
  providerLogo?: string
  providerAccreditation?: string
  providerRating?: number
  treatmentId: string
  treatmentName: string
  consultation: QuoteComponent
  diagnostics: QuoteComponent
  accommodation: QuoteAccommodation
  otherServices: QuoteComponent
  surgicalBaseFee?: number
  total: number
  price: number // alias to total
  currency: string
  validity: string // YYYY-MM-DD or ISO date
  validUntil: string // alias for validity
  notes: string
  exclusions: string[]
  status: QuoteStatus
  questions?: QuoteQuestion[]
  inclusions?: string[]
  estimatedStayDays?: number
  createdAt: string
  updatedAt?: string
}

export interface QuoteItem {
  id: string
  quoteId: string
  title: string
  description?: string
  amount: number
  isOptional: boolean
}

export type AppointmentStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'Scheduled'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled'
  | 'Rescheduled'

export type ConsultationType = 'consultation' | 'follow-up'

export interface Appointment {
  id: string
  caseId: string
  patientId: string
  providerId: string
  providerName?: string
  doctorId?: string
  doctorName?: string
  title: string
  specialty?: string
  consultationType?: ConsultationType
  type: 'Telemedicine' | 'In-Person Consultation' | 'Pre-Op Assessment'
  dateTime: string
  slotTime?: string
  meetingUrl?: string
  status: AppointmentStatus
  notes?: string
  createdAt: string
  updatedAt?: string
}

export interface TreatmentBooking {
  id: string
  caseId: string
  patientId: string
  patientName: string
  providerId: string
  providerName: string
  doctorId?: string
  doctorName?: string
  treatmentId: string
  treatmentName: string
  admissionDate: string
  estimatedStayDays: number
  packagePrice: number
  currency: string
  depositAmount: number
  mockPaymentRef: string
  paymentStatus: 'MOCK_ESCROW_AUTHORIZED' | 'PENDING' | 'CONFIRMED'
  companionNotes?: string
  specialRequirements?: string[]
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'
  createdAt: string
  updatedAt?: string
}

export interface JourneyEvent {
  id: string
  caseId: string
  stage: string
  title: string
  description: string
  actorRole: UserRole | 'SYSTEM'
  timestamp: string
}

export interface Conversation {
  id: string
  caseId: string
  participantIds: string[]
  subject: string
  lastMessageAt: string
  createdAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: UserRole
  content: string
  attachments?: string[]
  read: boolean
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT'
  link?: string
  read: boolean
  createdAt: string
}

/**
 * Aftercare & Recovery Types
 * Coordination-focused post-discharge models
 * Clinical recovery directives must be explicitly provided by authorized medical professionals.
 */
export interface AftercareReminder {
  id: string
  caseId: string
  title: string
  type: 'medication' | 'mobility' | 'wound_check' | 'consultation' | 'tele_checkin' | 'survey'
  daysPostOp: number
  dueDate: string
  status: 'PENDING' | 'ACKNOWLEDGED' | 'COMPLETED'
  instructions: string
  acknowledgedAt?: string
}

export interface ProviderRecoveryDirective {
  id: string
  caseId: string
  category: string
  authorizingDoctor: string
  doctorTitle?: string
  institution: string
  directives: string[]
  precautions: string[]
  warningSignsWhenToContactEmergency: string[]
  isDoctorVerified: boolean
  verifiedAt: string
  disclaimer: string
}

export interface AftercareDocument {
  id: string
  caseId: string
  title: string
  type:
    | 'Discharge Summary'
    | 'Operative Notes'
    | 'Implant Card'
    | 'Physical Therapy Protocol'
    | 'Fit-to-Fly Certificate'
    | 'Prescription Schedule'
  issuedBy: string
  issuedDate: string
  fileSize: string
  downloadUrl?: string
  verificationCode?: string
}

export interface AftercareMessage {
  id: string
  caseId: string
  senderRole: 'patient' | 'coordinator' | 'physiotherapist' | 'doctor'
  senderName: string
  content: string
  timestamp: string
  isEmergencyContact?: boolean
}

export interface AftercarePlan {
  caseId: string
  providerId: string
  providerName: string
  leadPhysician: string
  leadPhysiotherapist: string
  careCoordinator: {
    name: string
    email: string
    phone: string
    role: string
    photoUrl?: string
  }
  reminders: AftercareReminder[]
  directives: ProviderRecoveryDirective[]
  documents: AftercareDocument[]
  messages: AftercareMessage[]
  emergencyContact: {
    hospitalHelpline: string
    coordinatorDirect: string
    localEmergencyNumber: string
  }
}

/**
 * Complete Medical Case Journey Types
 */
export interface JourneyStageItem {
  id: CanonicalJourneyStage
  number: string
  title: string
  shortDesc: string
  isCompleted: boolean
  isCurrent: boolean
}

export interface CaseJourneySummary {
  caseId: string
  currentStage: {
    id: CanonicalJourneyStage
    number: string
    title: string
    shortDesc: string
    status: MedicalCaseStatusType
    progressPercent: number
  }
  completedStages: CanonicalJourneyStage[]
  allStages: JourneyStageItem[]
  nextAction: {
    title: string
    description: string
    actionLabel: string
    actionType: string
    targetTab: string
  }
  importantDates: {
    intakeDate?: string
    recordsVerifiedDate?: string
    qualificationDate?: string
    matchingDate?: string
    quoteReceivedDate?: string
    providerConfirmedDate?: string
    consultationDate?: string
    admissionDate?: string
    procedureDate?: string
    targetDischargeDate?: string
    nextFollowUpDate?: string
    completionDate?: string
  }
  provider: {
    id?: string
    name?: string
    city?: string
    country?: string
    doctorName?: string
    doctorTitle?: string
    accreditation?: string
    rating?: number
    contactEmail?: string
    contactPhone?: string
  }
  treatment: {
    id?: string
    name?: string
    category?: string
    protocol?: string
    estimatedStayDays?: number
    packagePrice?: number
    currency?: string
  }
  appointments: Appointment[]
}

