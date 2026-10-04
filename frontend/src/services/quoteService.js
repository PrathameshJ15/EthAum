import apiClient from './apiClient.js'

export const DEFAULT_QUOTES = [
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
]

const QUOTES_STORAGE_KEY = 'ethaum_quotes_cache_v2'

function getLocalQuotes() {
  try {
    const raw = localStorage.getItem(QUOTES_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (err) {
    console.warn('Failed to read quotes from localStorage:', err)
  }
  return DEFAULT_QUOTES
}

function saveLocalQuotes(quotes) {
  try {
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes))
  } catch (err) {
    console.warn('Failed to save quotes to localStorage:', err)
  }
}

export const quoteService = {
  async listQuotes(caseId, providerId) {
    try {
      const params = {}
      if (caseId) params.caseId = caseId
      if (providerId) params.providerId = providerId

      const res = await apiClient.get('/quotes', { params })
      const list = res?.data || res
      if (Array.isArray(list) && list.length > 0) {
        saveLocalQuotes(list)
        return list
      }
    } catch (err) {
      console.warn('[quoteService] API listQuotes fallback:', err.message)
    }

    const cached = getLocalQuotes()
    return cached.filter((q) => {
      if (caseId && q.caseId !== caseId) return false
      if (providerId && q.providerId !== providerId) return false
      return true
    })
  },

  async getQuoteById(id) {
    try {
      const res = await apiClient.get(`/quotes/${id}`)
      return res?.data || res
    } catch (err) {
      console.warn('[quoteService] API getQuoteById fallback:', err.message)
      const cached = getLocalQuotes()
      return cached.find((q) => q.id === id) || null
    }
  },

  async createQuote(payload) {
    try {
      const res = await apiClient.post('/quotes', payload)
      const created = res?.data || res
      if (created) {
        const cached = getLocalQuotes()
        saveLocalQuotes([created, ...cached])
        return created
      }
    } catch (err) {
      console.warn('[quoteService] API createQuote fallback:', err.message)
    }

    // Local fallback creation
    const newQuote = {
      ...payload,
      id: `quo-${Date.now()}`,
      status: payload.status || 'SUBMITTED',
      createdAt: new Date().toISOString(),
      questions: [],
    }
    const cached = getLocalQuotes()
    saveLocalQuotes([newQuote, ...cached])
    return newQuote
  },

  async updateQuote(id, payload) {
    try {
      const res = await apiClient.put(`/quotes/${id}`, payload)
      return res?.data || res
    } catch (err) {
      console.warn('[quoteService] API updateQuote fallback:', err.message)
      const cached = getLocalQuotes()
      const updated = cached.map((q) => (q.id === id ? { ...q, ...payload, updatedAt: new Date().toISOString() } : q))
      saveLocalQuotes(updated)
      return updated.find((q) => q.id === id)
    }
  },

  async submitQuote(id) {
    try {
      const res = await apiClient.post(`/quotes/${id}/submit`)
      return res?.data || res
    } catch (err) {
      console.warn('[quoteService] API submitQuote fallback:', err.message)
      const cached = getLocalQuotes()
      const updated = cached.map((q) => (q.id === id ? { ...q, status: 'SUBMITTED', updatedAt: new Date().toISOString() } : q))
      saveLocalQuotes(updated)
      return updated.find((q) => q.id === id)
    }
  },

  async acceptQuote(id) {
    try {
      const res = await apiClient.post(`/quotes/${id}/accept`)
      const accepted = res?.data || res
      const cached = getLocalQuotes()
      const targetCaseId = accepted?.caseId || cached.find((q) => q.id === id)?.caseId
      const updated = cached.map((q) => {
        if (q.id === id) return { ...q, status: 'ACCEPTED', updatedAt: new Date().toISOString() }
        if (q.caseId === targetCaseId && q.status !== 'DRAFT') return { ...q, status: 'REJECTED', updatedAt: new Date().toISOString() }
        return q
      })
      saveLocalQuotes(updated)
      return accepted
    } catch (err) {
      console.warn('[quoteService] API acceptQuote fallback:', err.message)
      const cached = getLocalQuotes()
      const target = cached.find((q) => q.id === id)
      const updated = cached.map((q) => {
        if (q.id === id) return { ...q, status: 'ACCEPTED', updatedAt: new Date().toISOString() }
        if (target && q.caseId === target.caseId && q.status !== 'DRAFT') {
          return { ...q, status: 'REJECTED', updatedAt: new Date().toISOString() }
        }
        return q
      })
      saveLocalQuotes(updated)
      return target ? { ...target, status: 'ACCEPTED' } : null
    }
  },

  async rejectQuote(id, reason) {
    try {
      const res = await apiClient.post(`/quotes/${id}/reject`, { reason })
      return res?.data || res
    } catch (err) {
      console.warn('[quoteService] API rejectQuote fallback:', err.message)
      const cached = getLocalQuotes()
      const updated = cached.map((q) => (q.id === id ? { ...q, status: 'REJECTED', updatedAt: new Date().toISOString() } : q))
      saveLocalQuotes(updated)
      return updated.find((q) => q.id === id)
    }
  },

  async askQuestion(quoteId, questionText) {
    try {
      const res = await apiClient.post(`/quotes/${quoteId}/questions`, { question: questionText })
      return res?.data || res
    } catch (err) {
      console.warn('[quoteService] API askQuestion fallback:', err.message)
      const newQuestion = {
        id: `q-${Date.now()}`,
        quoteId,
        question: questionText,
        patientName: 'Patient',
        createdAt: new Date().toISOString(),
        status: 'OPEN',
      }
      const cached = getLocalQuotes()
      const updated = cached.map((q) => {
        if (q.id === quoteId) {
          const qs = q.questions || []
          return { ...q, questions: [...qs, newQuestion] }
        }
        return q
      })
      saveLocalQuotes(updated)
      return newQuestion
    }
  },

  async answerQuestion(quoteId, questionId, answerText) {
    try {
      const res = await apiClient.post(`/quotes/${quoteId}/questions/${questionId}/answer`, { answer: answerText })
      return res?.data || res
    } catch (err) {
      console.warn('[quoteService] API answerQuestion fallback:', err.message)
      const cached = getLocalQuotes()
      const updated = cached.map((q) => {
        if (q.id === quoteId) {
          const qs = (q.questions || []).map((question) => {
            if (question.id === questionId) {
              return {
                ...question,
                answer: answerText,
                answeredAt: new Date().toISOString(),
                answeredBy: 'Provider Specialist',
                status: 'ANSWERED',
              }
            }
            return question
          })
          return { ...q, questions: qs }
        }
        return q
      })
      saveLocalQuotes(updated)
      return { success: true }
    }
  },
}

export default quoteService
