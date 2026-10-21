import apiClient from './apiClient.js'
import { DESTINATIONS_DATA } from '../data/destinationsData.js'

const TRAVEL_STORAGE_PREFIX = 'ethaum_travel_plan_'

export const OFFICIAL_VISA_PORTALS = {
  india: {
    country: 'India',
    portalName: 'Indian Visa Online (Government of India Official Portal)',
    portalUrl: 'https://indianvisaonline.gov.in/evisa/tvoa.html',
    visaType: 'e-Medical Visa (MED-V, Triple Entry, 60 Days Validity)',
    processingTime: '48–72 hours',
    invitationLetterRequired: true,
    keyRequirements: [
      'Valid national passport with at least 6 months validity from planned arrival date',
      'Official Medical Visa Invitation Letter from treating hospital in India with official seal',
      'Recent passport-style digital color photograph (2x2 inch, white background)',
      'Scanned copy of passport biographical page (PDF format)',
    ],
    disclaimer:
      'Official Regulatory Notice: Visa regulations and entry criteria are set by the Government of India and depend on your nationality. You must verify and submit your application on the official Indian Visa Online portal (indianvisaonline.gov.in). EthAum is a healthcare coordination platform and does not issue visas, guarantee approval, or influence consular decisions.',
  },
  thailand: {
    country: 'Thailand',
    portalName: 'Official Thai E-Visa Portal (Ministry of Foreign Affairs of Thailand)',
    portalUrl: 'https://www.thaievisa.go.th',
    visaType: 'Non-Immigrant Category "O" (Medical Treatment) / Medical Tourist Scheme',
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

export const DEFAULT_OFFICIAL_VISA = {
  country: 'International Medical Destination',
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

function getStoredPlan(caseId) {
  try {
    const raw = localStorage.getItem(`${TRAVEL_STORAGE_PREFIX}${caseId.toLowerCase()}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setStoredPlan(caseId, plan) {
  try {
    localStorage.setItem(`${TRAVEL_STORAGE_PREFIX}${caseId.toLowerCase()}`, JSON.stringify(plan))
  } catch {
    // ignore
  }
}

export function getDefaultTravelChecklist(destination = 'India') {
  return [
    {
      id: 'chk-1',
      task: 'Verify Passport Validity (at least 6 months validity from planned arrival date)',
      completed: true,
      category: 'VISA',
      essential: true,
      notes: 'Ensure at least two blank consecutive pages for consular entry stamps.',
    },
    {
      id: 'chk-2',
      task: 'Request & Download Official Medical Visa (MED-V) Invitation Letter from Hospital',
      completed: true,
      category: 'VISA',
      essential: true,
      notes: 'Signed and stamped by hospital international care desk.',
    },
    {
      id: 'chk-3',
      task: 'Submit Electronic Visa Application via Official Government Portal',
      completed: false,
      category: 'VISA',
      essential: true,
      notes: 'Apply directly through verified government portal link.',
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
      notes: 'Verify policy covers cross-border planned surgeries.',
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

export const travelService = {
  getVisaInfo(destinationId = 'india') {
    const key = (destinationId || '').toLowerCase().trim()
    for (const [k, v] of Object.entries(OFFICIAL_VISA_PORTALS)) {
      if (key.includes(k) || (v.country && key.includes(v.country.toLowerCase()))) {
        return v
      }
    }
    return DEFAULT_OFFICIAL_VISA
  },

  async getTravelPlan(caseId, destinationId = 'india') {
    try {
      const res = await apiClient.get(`/cases/${caseId}/travel`)
      const data = res?.data !== undefined ? res.data : res
      if (data && data.caseId) {
        setStoredPlan(caseId, data)
        return data
      }
    } catch (err) {
      console.warn('[travelService] API fallback for getTravelPlan:', err.message)
    }

    const stored = getStoredPlan(caseId)
    if (stored) return stored

    const visaInfo = this.getVisaInfo(destinationId)
    const fallbackPlan = {
      id: `tp-${caseId}`,
      caseId,
      patientId: 'pat-1',
      destinationCountry: visaInfo.country,
      destinationCity: 'New Delhi',
      departureDate: '2026-11-13',
      returnDate: '2026-11-26',
      travelStatus: 'BOOKED',
      visaInfo,
      checklist: getDefaultTravelChecklist(visaInfo.country),
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
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    setStoredPlan(caseId, fallbackPlan)
    return fallbackPlan
  },

  async updateTravelPlan(caseId, updates) {
    try {
      const res = await apiClient.put(`/cases/${caseId}/travel`, updates)
      const data = res?.data !== undefined ? res.data : res
      if (data) {
        setStoredPlan(caseId, data)
        return data
      }
    } catch (err) {
      console.warn('[travelService] API fallback for updateTravelPlan:', err.message)
    }

    const current = (await this.getTravelPlan(caseId)) || {}
    const merged = {
      ...current,
      ...updates,
      flightDetails: {
        ...(current.flightDetails || {}),
        ...(updates.flightDetails || {}),
        isSelfArranged: true,
      },
      accommodationDetails: {
        ...(current.accommodationDetails || {}),
        ...(updates.accommodationDetails || {}),
      },
      groundTransfer: {
        ...(current.groundTransfer || {}),
        ...(updates.groundTransfer || {}),
      },
      updatedAt: new Date().toISOString(),
    }

    setStoredPlan(caseId, merged)
    return merged
  },

  async toggleChecklistItem(caseId, itemId, completed) {
    try {
      const res = await apiClient.patch(`/travel/${caseId}/checklist/${itemId}`, { completed })
      const data = res?.data !== undefined ? res.data : res
      if (data) {
        setStoredPlan(caseId, data)
        return data
      }
    } catch (err) {
      console.warn('[travelService] API fallback for toggleChecklistItem:', err.message)
    }

    const plan = await this.getTravelPlan(caseId)
    if (plan && Array.isArray(plan.checklist)) {
      const item = plan.checklist.find((c) => c.id === itemId)
      if (item) {
        item.completed = completed
        setStoredPlan(caseId, plan)
      }
    }
    return plan
  },
}

export default travelService
