import {
  TravelPlan,
  TravelStatus,
  OfficialVisaResource,
  TravelChecklistItem,
  FlightDetails,
  AccommodationDetails,
  GroundTransferDetails,
} from '../types/index.js'
import { caseService } from './caseService.js'
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/apiError.js'

export const OFFICIAL_VISA_RESOURCES: Record<string, OfficialVisaResource> = {
  india: {
    country: 'India',
    destinationId: 'india',
    portalName: 'Indian Visa Online (Government of India Official Portal)',
    portalUrl: 'https://indianvisaonline.gov.in/evisa/tvoa.html',
    visaType: 'e-Medical Visa (MED-V, Triple Entry, 60 Days Validity)',
    processingTime: '48–72 hours',
    invitationLetterRequired: true,
    keyRequirements: [
      'Valid national passport with at least 6 months validity from planned arrival date and 2 blank pages',
      'Official Medical Visa Invitation Letter from treating accredited hospital in India with letterhead and stamp',
      'Recent passport-style digital color photograph (2x2 inch, white background)',
      'Scanned copy of passport biographical page (PDF format, 10–300 KB)',
      'Proof of return or onward international flight ticket',
    ],
    disclaimer:
      'Official Regulatory Notice: Visa regulations and entry criteria are set by the Government of India and depend on your nationality. You must verify and submit your application on the official Indian Visa Online portal (indianvisaonline.gov.in). EthAum is a healthcare coordination platform and does not issue visas, guarantee approval, or influence consular decisions.',
  },
  thailand: {
    country: 'Thailand',
    destinationId: 'thailand',
    portalName: 'Official Thai E-Visa Portal (Ministry of Foreign Affairs of Thailand)',
    portalUrl: 'https://www.thaievisa.go.th',
    visaType: 'Non-Immigrant Category "O" (Medical Treatment) / Medical Tourism Scheme',
    processingTime: '3–5 business days',
    invitationLetterRequired: true,
    keyRequirements: [
      'Passport with minimum 6 months remaining validity',
      'Confirmation letter and preliminary treatment appointment plan from an accredited Thai hospital',
      'Proof of adequate financial maintenance for duration of medical stay',
      'Confirmed hotel or post-operative recovery retreat reservation',
    ],
    disclaimer:
      'Official Regulatory Notice: Visa issuance is determined strictly by the Ministry of Foreign Affairs of the Kingdom of Thailand. Always verify entry conditions through the official Thai E-Visa system (thaievisa.go.th). EthAum does not guarantee visa approval.',
  },
  turkey: {
    country: 'Turkey',
    destinationId: 'turkey',
    portalName: 'Republic of Türkiye Electronic Visa Application System',
    portalUrl: 'https://www.evisa.gov.tr',
    visaType: 'Electronic Visa (e-Visa) for Medical Travel & Tourism',
    processingTime: 'Instant to 24 hours',
    invitationLetterRequired: false,
    keyRequirements: [
      'Travel document (passport) valid for at least 60 days beyond intended stay duration',
      'Round-trip airline booking with partner carrier',
      'Hotel or hospital patient residence reservation',
      'Valid credit or debit card for official electronic consular fee',
    ],
    disclaimer:
      'Official Regulatory Notice: Electronic visa requirements vary based on the applicant nationality. Verify your eligibility exclusively on the official Turkish Ministry of Foreign Affairs portal (evisa.gov.tr). EthAum does not grant visas.',
  },
  mexico: {
    country: 'Mexico',
    destinationId: 'mexico',
    portalName: 'Instituto Nacional de Migración (INM Mexico Official Portal)',
    portalUrl: 'https://www.gob.mx/inm',
    visaType: 'Forma Migratoria Múltiple (FMM) / Tourist & Medical Stay (Up to 180 Days)',
    processingTime: 'Visa-exempt for US, Canadian, UK, and EU passport holders',
    invitationLetterRequired: false,
    keyRequirements: [
      'Valid national passport with at least 6 months validity from entry date',
      'Official hospital surgical scheduling confirmation from partner medical center',
      'Completed electronic Forma Migratoria Múltiple (FMM) entry document',
      'Return travel itinerary or proof of economic solvency',
    ],
    disclaimer:
      'Official Regulatory Notice: Entry exemptions and border controls are governed by the Instituto Nacional de Migración. Travelers holding non-exempt passports must consult their local Mexican embassy. EthAum does not guarantee immigration entry.',
  },
}

export const DEFAULT_VISA_RESOURCE: OfficialVisaResource = {
  country: 'International Medical Destination',
  destinationId: 'default',
  portalName: 'Destination Embassy & Ministry of Foreign Affairs Resources',
  portalUrl: 'https://www.iatatravelcentre.com',
  visaType: 'Medical Treatment / Visitor Visa Protocol',
  processingTime: 'Varies by destination consulate',
  invitationLetterRequired: true,
  keyRequirements: [
    'Valid national passport with at least 6 months remaining validity',
    'Official invitation letter from treating international hospital',
    'Clinical case dossier and diagnostic summary',
    'International travel health insurance policy documentation',
  ],
  disclaimer:
    'Official Regulatory Notice: Always verify visa policies directly with the destination country official embassy or consulate. EthAum is a healthcare coordination platform and does not issue visas, guarantee approval, or provide immigration legal advice.',
}

export function getDefaultChecklist(destinationCountry: string): TravelChecklistItem[] {
  return [
    {
      id: 'chk-1',
      task: 'Verify Passport Validity (at least 6 months validity from planned arrival date)',
      completed: true,
      category: 'VISA',
      essential: true,
      notes: 'Ensure at least two blank consecutive pages for consular stamps.',
    },
    {
      id: 'chk-2',
      task: `Request & Download Official Medical Visa (MED-V) Invitation Letter from Hospital`,
      completed: true,
      category: 'VISA',
      essential: true,
      notes: 'Generated and signed by hospital international care desk.',
    },
    {
      id: 'chk-3',
      task: `Submit Electronic Visa Application via Official Government Portal`,
      completed: false,
      category: 'VISA',
      essential: true,
      notes: 'Apply only through official government portal links.',
    },
    {
      id: 'chk-4',
      task: 'Complete Pre-Travel Surgeon Tele-Consultation & Confirm Fit-To-Fly Clearance',
      completed: true,
      category: 'MEDICAL',
      essential: true,
      notes: 'Surgeon reviews pre-operative stability and travel clearance.',
    },
    {
      id: 'chk-5',
      task: 'Print Physical Copies of Diagnostic Records (MRI, CT, X-Rays, Lab Reports)',
      completed: false,
      category: 'MEDICAL',
      essential: true,
      notes: 'Carry in cabin hand baggage; do not place in checked luggage.',
    },
    {
      id: 'chk-6',
      task: 'Pack Current Medications in Original Pharmacy-Labeled Containers with Doctor Note',
      completed: false,
      category: 'PACKING',
      essential: true,
      notes: 'Keep 14-day supply plus emergency prescription copies.',
    },
    {
      id: 'chk-7',
      task: 'Secure International Health & Medical Complication Travel Insurance',
      completed: false,
      category: 'LOGISTICS',
      essential: true,
      notes: 'Verify policy specifically covers cross-border planned surgeries.',
    },
    {
      id: 'chk-8',
      task: 'Notify Bank and Credit Card Providers of International Travel Window',
      completed: false,
      category: 'LOGISTICS',
      essential: false,
      notes: 'Prevent anti-fraud card holds during cross-border pharmacy transactions.',
    },
    {
      id: 'chk-9',
      task: 'Confirm Wheelchair / Airport Mobility Assistance with Airline & Treating Hospital',
      completed: true,
      category: 'LOGISTICS',
      essential: false,
      notes: 'Hospital chauffeur van equipped with wheelchair ramp upon request.',
    },
    {
      id: 'chk-10',
      task: 'Download Offline Maps and Save Care Coordinator Direct Helpline Number',
      completed: false,
      category: 'LOGISTICS',
      essential: false,
      notes: 'Save hospital 24/7 emergency desk into phone contacts.',
    },
  ]
}

const MOCK_TRAVEL_PLANS: TravelPlan[] = [
  {
    id: 'tp-8492',
    caseId: 'ET-8492',
    patientId: 'pat-1',
    destinationCountry: 'India',
    destinationCity: 'New Delhi',
    departureDate: '2026-11-13',
    returnDate: '2026-11-26',
    travelStatus: 'BOOKED',
    visaInfo: OFFICIAL_VISA_RESOURCES['india'],
    checklist: getDefaultChecklist('India'),
    flightDetails: {
      airline: 'Air India',
      flightNumber: 'AI 102',
      departureAirport: 'JFK (New York)',
      arrivalAirport: 'DEL (Indira Gandhi International, New Delhi)',
      departureDate: '2026-11-13T18:30:00Z',
      arrivalDate: '2026-11-14T20:15:00Z',
      bookingReference: 'AI-77894',
      isSelfArranged: true,
    },
    accommodationDetails: {
      facilityName: 'The Leela Palace New Delhi (Hospital Preferred Partner)',
      address: 'Diplomatic Enclave, Chanakyapuri, New Delhi, Delhi 110023',
      checkInDate: '2026-11-14',
      checkOutDate: '2026-11-26',
      bookingReference: 'LEELA-99120',
      companionIncluded: true,
      notes: 'Ground-floor mobility suite with roll-in shower and companion king bed reserved.',
      source: 'PATIENT_RECORDED',
    },
    groundTransfer: {
      transferType: 'HOSPITAL_VAN',
      wheelchairAccessible: true,
      flightTrackingEnabled: true,
      driverNotes: 'Hospital chauffeur will wait at Terminal 3 Gate 4 holding Apex Hospital / EthAum paging board.',
      status: 'CONFIRMED',
    },
    coordinationNotes:
      'Traveling with spouse. International patient coordinator Ananya Roy assigned for VIP tarmac reception and WhatsApp check-in.',
    createdAt: '2026-10-10T10:00:00Z',
    updatedAt: '2026-10-18T14:30:00Z',
  },
]

export const travelService = {
  getVisaResourceForDestination(destinationIdOrCountry: string): OfficialVisaResource {
    const key = (destinationIdOrCountry || '').toLowerCase().trim()
    for (const [k, resource] of Object.entries(OFFICIAL_VISA_RESOURCES)) {
      if (key.includes(k) || key.includes(resource.country.toLowerCase())) {
        return resource
      }
    }
    return DEFAULT_VISA_RESOURCE
  },

  async getTravelPlan(
    caseId: string,
    user: { id: string; role?: string; patientId?: string; providerId?: string }
  ): Promise<TravelPlan> {
    const medicalCase = await caseService.getCaseById(caseId)
    if (!medicalCase) {
      throw new NotFoundError(`Medical Case #${caseId} does not exist`)
    }

    // Role-based authorization
    const role = (user.role || 'patient').toLowerCase()
    const patientId = user.patientId || user.id

    if (role === 'patient' && medicalCase.patientId !== patientId) {
      throw new ForbiddenError('Access denied: You can only view travel information for your own cases')
    }

    let plan = MOCK_TRAVEL_PLANS.find((tp) => tp.caseId.toLowerCase() === caseId.toLowerCase())

    if (!plan) {
      const destKey = medicalCase.destinationId || medicalCase.destinationName || 'india'
      const visaInfo = this.getVisaResourceForDestination(destKey)
      const checklist = getDefaultChecklist(visaInfo.country)

      plan = {
        id: `tp-${Date.now()}`,
        caseId: medicalCase.id,
        patientId: medicalCase.patientId,
        destinationCountry: visaInfo.country,
        destinationCity: medicalCase.destinationName || 'Accredited Medical Center',
        departureDate: medicalCase.preferredDate || new Date().toISOString().split('T')[0],
        returnDate: undefined,
        travelStatus: 'PLANNING',
        visaInfo,
        checklist,
        flightDetails: {
          isSelfArranged: true,
        },
        accommodationDetails: {
          companionIncluded: true,
          source: 'PATIENT_RECORDED',
        },
        groundTransfer: {
          transferType: 'HOSPITAL_VAN',
          wheelchairAccessible: false,
          flightTrackingEnabled: false,
          status: 'REQUESTED',
        },
        coordinationNotes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      MOCK_TRAVEL_PLANS.push(plan)
    }

    return plan
  },

  async updateTravelPlan(
    caseId: string,
    updateData: Partial<TravelPlan>,
    user: { id: string; role?: string; patientId?: string }
  ): Promise<TravelPlan> {
    const medicalCase = await caseService.getCaseById(caseId)
    if (!medicalCase) {
      throw new NotFoundError(`Medical Case #${caseId} does not exist`)
    }

    const role = (user.role || 'patient').toLowerCase()
    const patientId = user.patientId || user.id

    if (role === 'patient' && medicalCase.patientId !== patientId) {
      throw new ForbiddenError('Access denied: You can only modify travel details for your own cases')
    }

    // Ensure no sensitive passport data was smuggled in
    const rawKeys = Object.keys(updateData)
    const forbiddenKeys = ['passportNumber', 'passport_number', 'ssn', 'nationalId', 'passportPhoto']
    for (const fk of forbiddenKeys) {
      if (rawKeys.includes(fk) || (updateData as any)[fk]) {
        throw new ValidationError('Security restriction: EthAum does not store passport numbers or identity credentials.')
      }
    }

    let plan = await this.getTravelPlan(caseId, user)

    if (updateData.departureDate !== undefined) plan.departureDate = updateData.departureDate
    if (updateData.returnDate !== undefined) plan.returnDate = updateData.returnDate
    if (updateData.destinationCountry !== undefined) plan.destinationCountry = updateData.destinationCountry
    if (updateData.destinationCity !== undefined) plan.destinationCity = updateData.destinationCity
    if (updateData.travelStatus !== undefined) plan.travelStatus = updateData.travelStatus
    if (updateData.coordinationNotes !== undefined) plan.coordinationNotes = updateData.coordinationNotes

    if (updateData.destinationCountry) {
      plan.visaInfo = this.getVisaResourceForDestination(updateData.destinationCountry)
    }

    if (updateData.flightDetails) {
      plan.flightDetails = {
        ...plan.flightDetails,
        ...updateData.flightDetails,
        isSelfArranged: true,
      }
    }

    if (updateData.accommodationDetails) {
      plan.accommodationDetails = {
        ...plan.accommodationDetails,
        ...updateData.accommodationDetails,
        source: updateData.accommodationDetails.source || 'PATIENT_RECORDED',
      }
    }

    if (updateData.groundTransfer) {
      plan.groundTransfer = {
        ...plan.groundTransfer,
        ...updateData.groundTransfer,
      }
    }

    if (Array.isArray(updateData.checklist)) {
      plan.checklist = updateData.checklist
    }

    plan.updatedAt = new Date().toISOString()
    return plan
  },

  async toggleChecklistItem(
    caseId: string,
    itemId: string,
    completed: boolean,
    user: { id: string; role?: string; patientId?: string }
  ): Promise<TravelPlan> {
    const plan = await this.getTravelPlan(caseId, user)
    const item = plan.checklist.find((c) => c.id === itemId)
    if (!item) {
      throw new NotFoundError(`Checklist item '${itemId}' not found`)
    }

    item.completed = completed
    plan.updatedAt = new Date().toISOString()
    return plan
  },
}
