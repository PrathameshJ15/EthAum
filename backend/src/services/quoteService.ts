import { Quote, QuoteStatus, QuoteQuestion } from '../types/index.js'
import { caseService } from './caseService.js'
import { providerService } from './providerService.js'
import { journeyService } from './journeyService.js'
import { MedicalCaseStatus } from '../types/index.js'

const MOCK_QUOTES: Quote[] = [
  {
    id: 'quo-1',
    caseId: 'ET-8492',
    providerId: 'apex-joint-delhi',
    providerName: 'Apex Orthopedic & Robotic Joint Institute',
    providerCity: 'New Delhi',
    providerCountry: 'India',
    providerFlag: '🇮🇳',
    providerAccreditation: 'JCI & NABH Accredited',
    providerRating: 4.94,
    treatmentId: 'knee-replacement',
    treatmentName: 'Robotic Total Knee Replacement (Unilateral)',
    consultation: {
      description: 'Pre-operative specialist orthopedic consultation, surgical planning & 45-min virtual video review',
      cost: 300,
    },
    diagnostics: {
      description: 'Pre-admission robotic 3D CT scan, weight-bearing bilateral radiographs, complete metabolic panel, and cardiac clearance',
      cost: 600,
    },
    accommodation: {
      applicable: true,
      roomType: 'Private Deluxe Suite with Companion Sleeper Bed',
      nights: 4,
      cost: 1200,
      notes: 'Includes full room amenities, Wi-Fi, and companion daily meals during inpatient stay',
    },
    otherServices: {
      description: 'Airport chauffeur transfers (DEL ⇄ Hospital), dedicated international patient concierge, and in-hospital daily physiotherapy',
      cost: 900,
      items: [
        'Round-trip private airport chauffeur transfer',
        'Inpatient physical therapy & gait rehabilitation',
        '24/7 dedicated medical concierge coordinator',
        'Post-discharge recovery kit & medication supply',
      ],
    },
    total: 6500,
    price: 6500,
    currency: 'USD',
    validity: '2026-12-15',
    validUntil: '2026-12-15',
    notes: 'Cruciate-retaining robotic total knee arthroplasty using Stryker Mako robotic arm. Utilizes ceramic-on-polyethylene FDA-approved implant with 25-year structural warranty.',
    exclusions: [
      'International airfare and travel visas',
      'Personal companion meals outside standard hospital tray',
      'Treatment of unrelated pre-existing acute comorbidities',
      'Extended ICU hospitalization exceeding standard protocol (>24h)',
    ],
    inclusions: [
      'Pre-operative CT scan and blood work panel',
      'Stryker Mako Robotic arm precision resurfacing',
      'Ceramic-on-polyethylene FDA-approved implant',
      '4 nights in Private Executive Suite with companion bed',
      'Surgeon, assistant, and anesthesia professional fees',
      'Inpatient physical therapy & gait re-education',
      'Airport chauffeur transfers both ways',
    ],
    estimatedStayDays: 10,
    status: 'SUBMITTED',
    questions: [
      {
        id: 'q-101',
        quoteId: 'quo-1',
        caseId: 'ET-8492',
        patientId: 'pat-1',
        patientName: 'Eleanor Vance',
        question: 'Does the companion accommodation include hospital meals for my traveling spouse?',
        createdAt: '2026-09-24T10:00:00Z',
        answer: 'Yes, daily breakfast and lunch are provided for one traveling companion staying in the private deluxe suite.',
        answeredAt: '2026-09-24T14:30:00Z',
        answeredBy: 'Dr. Vikram Oberoi',
        status: 'ANSWERED',
      },
    ],
    createdAt: '2026-09-22T08:00:00Z',
    updatedAt: '2026-09-24T14:30:00Z',
  },
  {
    id: 'quo-2',
    caseId: 'ET-8492',
    providerId: 'bumrungrad-partner-bangkok',
    providerName: 'Bumrungrad International Hospital Network',
    providerCity: 'Bangkok',
    providerCountry: 'Thailand',
    providerFlag: '🇹🇭',
    providerAccreditation: 'JCI Accredited & GHA Certified',
    providerRating: 4.96,
    treatmentId: 'knee-replacement',
    treatmentName: 'Computer-Navigated Bilateral Knee Arthroplasty',
    consultation: {
      description: 'Multi-disciplinary joint reconstruction panel consultation & personalized surgical navigation blueprint',
      cost: 400,
    },
    diagnostics: {
      description: 'High-definition 3D EOS imaging, MRI joint cartilage cartography, pre-admission cardiac stress test and infectious disease screen',
      cost: 800,
    },
    accommodation: {
      applicable: true,
      roomType: 'VIP Single Room with Companion Lounge Area',
      nights: 5,
      cost: 1500,
      notes: 'Overlooks city gardens, includes sleeper sofa for companion, 24/7 dedicated nursing staff',
    },
    otherServices: {
      description: 'VIP airport limousine reception, certified medical interpreter, digital telemedicine aftercare subscription',
      cost: 1100,
      items: [
        'Suvarnabhumi Airport (BKK) limousine transfers',
        'Certified medical translator (English/Thai)',
        '12-month digital aftercare portal access',
        'Occupational therapy & mobility evaluation',
      ],
    },
    total: 7800,
    price: 7800,
    currency: 'USD',
    validity: '2026-12-15',
    validUntil: '2026-12-15',
    notes: 'Computer-assisted orthopedic surgery with Zimmer Persona personalized knee implant system. Rapid-recovery multimodal analgesia protocol.',
    exclusions: [
      'International flights and tourist/medical visa fees',
      'Personal long-distance phone calls, laundry, and minibar services',
      'Unscheduled diagnostic procedures not directly related to joint arthroplasty',
      'Extended ICU care beyond standard clinical monitoring',
    ],
    inclusions: [
      'Comprehensive pre-admission diagnostic workup',
      'Computer-assisted orthopedic surgery',
      'Zimmer Persona personalized knee implant',
      '5 nights private VIP room with companion amenities',
      'Specialist surgical team fees',
      '12-month digital aftercare portal access',
    ],
    estimatedStayDays: 12,
    status: 'SUBMITTED',
    questions: [
      {
        id: 'q-102',
        quoteId: 'quo-2',
        caseId: 'ET-8492',
        patientId: 'pat-1',
        patientName: 'Eleanor Vance',
        question: 'How many days before the surgery date do I need to land in Bangkok for pre-op testing?',
        createdAt: '2026-09-25T11:15:00Z',
        answer: 'We recommend arriving 48 hours prior to admission for pre-op cardiology clearance and 3D EOS imaging.',
        answeredAt: '2026-09-25T16:00:00Z',
        answeredBy: 'Horizon International Medical Coordinator',
        status: 'ANSWERED',
      },
    ],
    createdAt: '2026-09-23T09:30:00Z',
    updatedAt: '2026-09-25T16:00:00Z',
  },
  {
    id: 'quo-3',
    caseId: 'ET-8492',
    providerId: 'acibadem-heart-istanbul',
    providerName: 'Acıbadem Healthcare Group',
    providerCity: 'Istanbul',
    providerCountry: 'Turkey',
    providerFlag: '🇹🇷',
    providerAccreditation: 'JCI & ISO 9001 Accredited',
    providerRating: 4.88,
    treatmentId: 'knee-replacement',
    treatmentName: 'Minimally Invasive Quadriceps-Sparing Knee Arthroplasty',
    consultation: {
      description: 'Pre-operative orthopedics clinical evaluation and virtual surgical conference',
      cost: 250,
    },
    diagnostics: {
      description: 'Pre-operative digital radiography series, limb alignment scan, and comprehensive clinical chemistry',
      cost: 550,
    },
    accommodation: {
      applicable: true,
      roomType: 'Standard Private Patient Suite',
      nights: 4,
      cost: 1000,
      notes: 'Private room with recliner for companion and ensuite bathroom',
    },
    otherServices: {
      description: 'Airport private shuttle, native English patient navigator, post-operative physiotherapy',
      cost: 700,
      items: [
        'Istanbul Airport (IST) transfer to hospital campus',
        'Dedicated international patient liaison officer',
        'Physical therapy daily sessions during admission',
      ],
    },
    total: 5800,
    price: 5800,
    currency: 'USD',
    validity: '2026-12-01',
    validUntil: '2026-12-01',
    notes: 'Minimally invasive subvastus quadriceps-sparing approach designed to preserve extensor mechanism and reduce post-op recovery timeline.',
    exclusions: [
      'International flights and transit hotel stays',
      'Personal incidental expenses and non-formulary medications',
      'Management of pre-existing chronic conditions unrelated to knee replacement',
    ],
    inclusions: [
      'Surgical intervention and anesthesia',
      'Smith & Nephew Journey II active knee implant',
      '4 nights private suite accommodation',
      'Pre-op laboratory workup',
      'Airport pick-up and drop-off',
    ],
    estimatedStayDays: 9,
    status: 'SUBMITTED',
    questions: [],
    createdAt: '2026-09-24T14:00:00Z',
  },
  {
    id: 'quo-4',
    caseId: 'ET-9011',
    providerId: 'apex-joint-delhi',
    providerName: 'Apex Orthopedic & Robotic Joint Institute',
    providerCity: 'New Delhi',
    providerCountry: 'India',
    providerFlag: '🇮🇳',
    providerAccreditation: 'JCI & NABH Accredited',
    providerRating: 4.94,
    treatmentId: 'knee-replacement',
    treatmentName: 'Robotic Knee Reconstruction Revision',
    consultation: {
      description: 'Comprehensive complex revision arthroplasty surgical planning & structural bone stock review',
      cost: 500,
    },
    diagnostics: {
      description: 'Revision 3D CT reconstruction, metal suppression MRI, infection screening panel (ESR/CRP/Aspiration)',
      cost: 1100,
    },
    accommodation: {
      applicable: true,
      roomType: 'Private Executive Suite with Companion Bed',
      nights: 5,
      cost: 1500,
      notes: 'Dedicated orthopedic recovery suite with companion accommodations',
    },
    otherServices: {
      description: 'Airport chauffeur meet & greet, specialized revision physical therapy, translation support',
      cost: 1100,
      items: [
        'Roundtrip private airport transfers',
        'Intensive inpatient revision rehabilitation protocol',
        'Dedicated international case manager',
      ],
    },
    total: 9400,
    price: 9400,
    currency: 'USD',
    validity: '2026-12-31',
    validUntil: '2026-12-31',
    notes: 'Complex revision knee reconstruction utilizing Trabecular Metal augments, modular revision stems, and constrained condylar insert.',
    exclusions: [
      'International flights',
      'Long-term post-discharge rehabilitation outside host country',
      'Management of unrelated acute systemic complications',
    ],
    inclusions: [
      'Pre-operative Revision CT Reconstruction',
      'Trabecular Metal Augments and Stems',
      '5 Nights Private Executive Room',
      'Airport Chauffeur Meet & Greet',
    ],
    estimatedStayDays: 14,
    status: 'DRAFT',
    questions: [],
    createdAt: '2026-10-01T12:00:00Z',
  },
]

// Helper to check and update expired quotes
function checkExpiry(q: Quote): Quote {
  if (q.status === 'SUBMITTED' || q.status === 'PENDING') {
    const validDate = new Date(q.validity || q.validUntil)
    if (!isNaN(validDate.getTime()) && validDate.getTime() < Date.now()) {
      q.status = 'EXPIRED'
    }
  }
  return q
}

export const quoteService = {
  async listQuotesByCase(caseId: string, role?: string, providerId?: string): Promise<Quote[]> {
    return MOCK_QUOTES.filter((q) => {
      if (q.caseId !== caseId) return false
      checkExpiry(q)

      // If requested by a patient (or non-provider), hide DRAFT quotes
      if (role === 'patient') {
        return q.status !== 'DRAFT'
      }

      // If requested by a provider, show their own quotes (including drafts) or all submitted
      if (role === 'provider' && providerId) {
        if (q.providerId === providerId) return true
        return q.status !== 'DRAFT'
      }

      return true
    })
  },

  async listQuotesByProvider(providerId: string): Promise<Quote[]> {
    return MOCK_QUOTES.filter((q) => {
      if (q.providerId !== providerId) return false
      checkExpiry(q)
      return true
    })
  },

  async getQuoteById(id: string): Promise<Quote | null> {
    const q = MOCK_QUOTES.find((item) => item.id === id)
    if (!q) return null
    return checkExpiry(q)
  },

  async createQuote(
    data: {
      caseId: string
      treatmentId: string
      treatmentName: string
      providerId: string
      providerName?: string
      providerCity?: string
      providerCountry?: string
      providerFlag?: string
      providerAccreditation?: string
      providerRating?: number
      consultation?: { description: string; cost: number }
      diagnostics?: { description: string; cost: number }
      accommodation?: {
        applicable: boolean
        roomType?: string
        nights?: number
        cost?: number
        notes?: string
      }
      otherServices?: { description: string; cost: number; items?: string[] }
      surgicalBaseFee?: number
      total?: number
      price?: number
      currency?: string
      validity?: string
      validUntil?: string
      notes?: string
      exclusions?: string[] | string
      inclusions?: string[]
      estimatedStayDays?: number
      status?: QuoteStatus
    }
  ): Promise<Quote> {
    const provider = await providerService.getProviderById(data.providerId)
    const providerName = data.providerName || provider?.name || 'Healthcare Provider'
    const providerCity = data.providerCity || provider?.city || 'Delhi'
    const providerCountry = data.providerCountry || provider?.country || 'India'
    const providerFlag = data.providerFlag || provider?.flag || '🇮🇳'
    const providerAccreditation =
      data.providerAccreditation || (provider?.accreditations ? provider.accreditations.join(' & ') : 'JCI Accredited')
    const providerRating = data.providerRating || provider?.rating || 4.9

    const consultation = data.consultation || {
      description: 'Specialist pre-operative clinical evaluation & surgical review',
      cost: 250,
    }

    const diagnostics = data.diagnostics || {
      description: 'Pre-admission laboratory panels and radiographic verification',
      cost: 500,
    }

    const accommodation = data.accommodation || {
      applicable: true,
      roomType: 'Private Patient Room with Companion Sleeper',
      nights: 4,
      cost: 1000,
      notes: 'Inpatient recovery stay with companion accommodations',
    }

    const otherServices = data.otherServices || {
      description: 'Airport transfers, dedicated international concierge, and post-op rehabilitation',
      cost: 750,
      items: data.inclusions || ['Airport chauffeur transfer', 'In-hospital physiotherapy', 'Dedicated medical coordinator'],
    }

    // Determine total
    let total = data.total || data.price
    if (!total || total <= 0) {
      const accomCost = accommodation.applicable ? (accommodation.cost || 0) : 0
      total = consultation.cost + diagnostics.cost + accomCost + otherServices.cost + 4000 // base surgical fee
    }

    const validity = data.validity || data.validUntil || '2026-12-31'
    const notes = data.notes || `Institutional clinical quote for ${data.treatmentName} under surgical standard of care.`

    let exclusions: string[] = []
    if (Array.isArray(data.exclusions)) {
      exclusions = data.exclusions
    } else if (typeof data.exclusions === 'string') {
      exclusions = data.exclusions
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    } else {
      exclusions = [
        'International flights and travel visa fees',
        'Personal incidental expenditures outside hospital care package',
        'Extended intensive care unit (ICU) hospitalization beyond standard protocol',
      ]
    }

    // Default status: if specified use it; if unspecified default to SUBMITTED
    const status: QuoteStatus = data.status || 'SUBMITTED'

    const newQuote: Quote = {
      id: `quo-${Date.now()}`,
      caseId: data.caseId,
      providerId: data.providerId,
      providerName,
      providerCity,
      providerCountry,
      providerFlag,
      providerAccreditation,
      providerRating,
      treatmentId: data.treatmentId,
      treatmentName: data.treatmentName,
      consultation,
      diagnostics,
      accommodation,
      otherServices,
      surgicalBaseFee: data.surgicalBaseFee,
      total,
      price: total,
      currency: data.currency || 'USD',
      validity,
      validUntil: validity,
      notes,
      exclusions,
      inclusions: data.inclusions || otherServices.items || [
        'Consultation and surgical team fees',
        'Diagnostic laboratory workup',
        'Inpatient room accommodation',
      ],
      estimatedStayDays: data.estimatedStayDays || (accommodation.nights ? accommodation.nights + 4 : 8),
      status,
      questions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    MOCK_QUOTES.push(newQuote)

    // If submitted, advance case state and record journey event
    if (newQuote.status === 'SUBMITTED' || newQuote.status === 'PENDING') {
      try {
        await caseService.updateCaseStatus(newQuote.caseId, MedicalCaseStatus.QUOTES_RECEIVED, 'provider')
      } catch {
        // ignore
      }

      await journeyService.addJourneyEvent({
        caseId: newQuote.caseId,
        stage: 'Quotes',
        title: 'Institutional Quote Dispatched',
        description: `Formal package quotation for ${newQuote.treatmentName} submitted by ${newQuote.providerName} (${newQuote.total} ${newQuote.currency}).`,
        actorRole: 'provider',
        timestamp: newQuote.createdAt,
      })
    }

    return newQuote
  },

  async updateQuote(
    id: string,
    data: Partial<Quote>,
    providerId?: string
  ): Promise<Quote | null> {
    const quote = MOCK_QUOTES.find((q) => q.id === id)
    if (!quote) return null

    if (providerId && quote.providerId !== providerId) {
      throw new Error('Not authorized to modify this quote')
    }

    Object.assign(quote, data)
    if (data.total !== undefined) {
      quote.price = data.total
    } else if (data.price !== undefined) {
      quote.total = data.price
    }
    if (data.validity) {
      quote.validUntil = data.validity
    } else if (data.validUntil) {
      quote.validity = data.validUntil
    }

    quote.updatedAt = new Date().toISOString()
    return quote
  },

  async submitQuote(id: string, providerId: string): Promise<Quote | null> {
    const quote = MOCK_QUOTES.find((q) => q.id === id)
    if (!quote) return null

    if (quote.providerId !== providerId) {
      throw new Error('Not authorized to submit this quote')
    }

    quote.status = 'SUBMITTED'
    quote.updatedAt = new Date().toISOString()

    try {
      await caseService.updateCaseStatus(quote.caseId, MedicalCaseStatus.QUOTES_RECEIVED, 'provider')
    } catch {
      // ignore
    }

    await journeyService.addJourneyEvent({
      caseId: quote.caseId,
      stage: 'Quotes',
      title: 'Institutional Quote Submitted to Patient',
      description: `${quote.providerName} submitted formal package quote #${quote.id} for patient review.`,
      actorRole: 'provider',
      timestamp: quote.updatedAt,
    })

    return quote
  },

  async acceptQuote(quoteId: string, patientId: string): Promise<Quote | null> {
    const quote = MOCK_QUOTES.find((q) => q.id === quoteId)
    if (!quote) return null

    quote.status = 'ACCEPTED'
    quote.updatedAt = new Date().toISOString()

    // Mark other quotes for this case as REJECTED
    MOCK_QUOTES.forEach((q) => {
      if (q.caseId === quote.caseId && q.id !== quoteId && q.status !== 'DRAFT') {
        q.status = 'REJECTED'
        q.updatedAt = new Date().toISOString()
      }
    })

    // Transition case status to PROVIDER_SELECTED and update provider selection
    try {
      const c = await caseService.getCaseById(quote.caseId)
      if (c) {
        c.selectedProviderId = quote.providerId
        c.selectedProviderName = quote.providerName
      }
      await caseService.updateCaseStatus(quote.caseId, MedicalCaseStatus.PROVIDER_SELECTED, 'patient')
    } catch {
      // ignore
    }

    await journeyService.addJourneyEvent({
      caseId: quote.caseId,
      stage: 'Provider Selected',
      title: 'Provider Selected & Quote Accepted',
      description: `Patient confirmed institutional package with ${quote.providerName} (${quote.total} ${quote.currency}). No payment processed. Ready for consultation coordination.`,
      actorRole: 'patient',
      timestamp: quote.updatedAt,
    })

    return quote
  },

  async rejectQuote(quoteId: string, _patientId: string, reason?: string): Promise<Quote | null> {
    const quote = MOCK_QUOTES.find((q) => q.id === quoteId)
    if (!quote) return null

    quote.status = 'REJECTED'
    quote.updatedAt = new Date().toISOString()

    await journeyService.addJourneyEvent({
      caseId: quote.caseId,
      stage: 'Quotes',
      title: 'Quote Declined',
      description: `Patient declined quote #${quote.id} from ${quote.providerName}${reason ? `: ${reason}` : '.'}`,
      actorRole: 'patient',
      timestamp: quote.updatedAt,
    })

    return quote
  },

  async addQuestion(
    quoteId: string,
    patientId: string,
    patientName: string,
    questionText: string
  ): Promise<QuoteQuestion | null> {
    const quote = MOCK_QUOTES.find((q) => q.id === quoteId)
    if (!quote) return null

    if (!quote.questions) {
      quote.questions = []
    }

    const newQuestion: QuoteQuestion = {
      id: `q-${Date.now()}`,
      quoteId: quote.id,
      caseId: quote.caseId,
      patientId,
      patientName,
      question: questionText.trim(),
      createdAt: new Date().toISOString(),
      status: 'OPEN',
    }

    quote.questions.push(newQuestion)
    quote.updatedAt = newQuestion.createdAt

    await journeyService.addJourneyEvent({
      caseId: quote.caseId,
      stage: 'Quotes',
      title: 'Patient Inquiry Submitted on Quote',
      description: `${patientName} asked question regarding quote #${quote.id}: "${questionText.slice(0, 80)}..."`,
      actorRole: 'patient',
      timestamp: newQuestion.createdAt,
    })

    return newQuestion
  },

  async answerQuestion(
    quoteId: string,
    questionId: string,
    providerName: string,
    answerText: string
  ): Promise<QuoteQuestion | null> {
    const quote = MOCK_QUOTES.find((q) => q.id === quoteId)
    if (!quote || !quote.questions) return null

    const question = quote.questions.find((q) => q.id === questionId)
    if (!question) return null

    question.answer = answerText.trim()
    question.answeredAt = new Date().toISOString()
    question.answeredBy = providerName
    question.status = 'ANSWERED'

    quote.updatedAt = question.answeredAt

    return question
  },
}
