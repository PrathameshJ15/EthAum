import { Provider, ProviderTreatmentOffer } from '../types/index.js'

export const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'apex-joint-delhi',
    name: 'Apex Orthopedic & Robotic Joint Institute',
    city: 'New Delhi',
    country: 'India',
    flag: '🇮🇳',
    accreditations: ['JCI Accredited', 'NABH Certified', 'ISO 9001:2015'],
    tagline: 'Global Leader in CT-Guided Robotic Joint Resurfacing & Sports Medicine',
    overview:
      'Apex Joint Institute is a 450-bed dedicated orthopedic hospital featuring 8 surgical suites, 4 Mako robotic arms, and specialized rapid-rehab protocols for international joint replacement patients.',
    coverImage:
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=200&q=80',
    rating: 4.9,
    reviewCount: 382,
    establishedYear: 2008,
    beds: 450,
    languages: ['English', 'Arabic', 'Russian', 'French', 'Hindi'],
    facilities: [
      'Private Executive Recovery Suites with companion beds',
      'Mako & Rosa Robotic Joint Navigation Systems',
      'In-house Hydrotherapy & Sports Biomechanics Lab',
      '24/7 International Patient Concierge Lounge',
      'Encrypted Tele-Rehabilitation Monitoring Suite',
    ],
    internationalSupport: {
      airportConcierge: 'Complimentary private chauffeur transfer from Indira Gandhi International Airport (DEL)',
      visaAssistance: 'Official Medical Visa Invitation (MED-V) letters dispatched within 12 hours',
      translators: 'Dedicated personal medical interpreters assigned throughout admission',
      accommodation: 'Special partner rates at adjoining 5-star recovery hotels (The Oberoi, Trident)',
    },
    doctors: [
      {
        id: 'dr-vikram-oberoi',
        providerId: 'apex-joint-delhi',
        name: 'Dr. Vikram Oberoi, MS, FRCS',
        title: 'Chief of Robotic Joint Reconstruction',
        specialty: 'Adult Knee & Hip Reconstruction',
        experienceYears: 24,
        education: 'AIIMS New Delhi · Fellowship Royal College of Surgeons (Edinburgh)',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ],
    treatmentsOffered: [
      {
        treatmentId: 'knee-replacement',
        name: 'Robotic Total Knee Replacement (Unilateral)',
        startingPriceUSD: 6500,
        inclusions: ['Pre-op CT scan', 'Stryker/Zimmer implant', '4 nights private room', 'Physiotherapy'],
      },
      {
        treatmentId: 'hip-replacement',
        name: 'Direct Anterior Total Hip Replacement',
        startingPriceUSD: 7200,
        inclusions: ['3D planning CT', 'Titanium ceramic implant', '4 nights hospital stay'],
      },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'bumrungrad-partner-bangkok',
    name: 'Horizon International Medical City',
    city: 'Bangkok',
    country: 'Thailand',
    flag: '🇹🇭',
    accreditations: ['JCI Accredited (Gold Seal)', 'GHA COVID-19 Excellence', 'ISO 15189'],
    tagline: 'Southeast Asia Premier Multi-Specialty Quaternary Academic Health Center',
    overview:
      'Horizon International Medical City is a 580-bed globally celebrated hospital in central Bangkok. Known for world-class hospitality, 45 clinical specialty clinics, and board-certified US/UK trained clinicians.',
    coverImage:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=200&q=80',
    rating: 4.95,
    reviewCount: 524,
    establishedYear: 1999,
    beds: 580,
    languages: ['English', 'Japanese', 'Arabic', 'Mandarin', 'Thai', 'German'],
    facilities: [
      'Single-patient luxury inpatient suites with park view',
      'Hybrid Cardiovascular Operating Theaters',
      'Comprehensive Genomics & Embryology Cleanrooms',
      'In-hospital Airport Check-in & Baggage Service',
      'VIP International Patient Services Wing',
    ],
    internationalSupport: {
      airportConcierge: 'Direct VIP tarmac reception and limousine transfer from Suvarnabhumi Airport (BKK)',
      visaAssistance: 'Ministry of Public Health 90-day medical visa extension endorsements',
      translators: 'Over 150 full-time multilingual medical interpreters on site',
      accommodation: 'Integrated Skybridge connection to Horizon Residence & Wellness Suites',
    },
    doctors: [
      {
        id: 'dr-somchai-prasert',
        providerId: 'bumrungrad-partner-bangkok',
        name: 'Dr. Somchai Prasert, MD, FACS',
        title: 'Senior Cardiothoracic Surgeon',
        specialty: 'Minimally Invasive Valve & Off-Pump CABG',
        experienceYears: 27,
        education: 'Chulalongkorn University · Fellowship Cleveland Clinic (USA)',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ],
    treatmentsOffered: [
      {
        treatmentId: 'cardiac-bypass',
        name: 'Off-Pump Coronary Artery Bypass (CABG)',
        startingPriceUSD: 9800,
        inclusions: ['7 nights CCU + private suite', 'Heart team surgical fees', 'Diagnostic coronary cath'],
      },
      {
        treatmentId: 'ivf-fertility',
        name: 'Complete IVF Cycle with PGT-A',
        startingPriceUSD: 5200,
        inclusions: ['Oocyte retrieval', 'ICSI fertilization', '5-day blastocyst culture', 'PGT-A biopsy'],
      },
      {
        treatmentId: 'laser-eye-surgery',
        name: 'Carl Zeiss ReLEx SMILE Refractive Correction',
        startingPriceUSD: 2100,
        inclusions: ['Bilateral laser treatment', 'Diagnostic Pentacam topography', 'Post-op medication kit'],
      },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'acibadem-heart-istanbul',
    name: 'Bosphorus Quaternary Health Campus',
    city: 'Istanbul',
    country: 'Turkey',
    flag: '🇹🇷',
    accreditations: ['JCI Accredited', 'European Foundation for Quality Management (EFQM)', 'TEMOS International'],
    tagline: 'Pioneering Cardiovascular Care, Smile Aesthetics & European Standard Surgery',
    overview:
      'Bosphorus Quaternary Health Campus is a 400-bed modern medical complex strategically situated in Istanbul with intraoperative 3T MRI, robotic surgery, and high-volume dental implantology wings.',
    coverImage:
      'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=200&q=80',
    rating: 4.88,
    reviewCount: 410,
    establishedYear: 2012,
    beds: 400,
    languages: ['English', 'German', 'Russian', 'Arabic', 'Turkish'],
    facilities: [
      'Specialized 3D Digital Dental Laboratory on campus',
      'Ultra-Sterile Cardiovascular Intensive Care Unit',
      'Rooftop Heliport for immediate transfers',
      'Panoramic Bosphorus-view Patient Suites',
    ],
    internationalSupport: {
      airportConcierge: 'Private vehicle meet-and-greet at Istanbul Airport (IST)',
      visaAssistance: 'Turkish E-Visa medical acceleration support',
      translators: 'Native European and Arabic speaking coordinators',
      accommodation: 'Special corporate lodging agreements with nearby waterfront hotels',
    },
    doctors: [
      {
        id: 'dr-mehmet-yilmaz',
        providerId: 'acibadem-heart-istanbul',
        name: 'Dr. Mehmet Yilmaz, MD, FEBCTS',
        title: 'Head of Adult Cardiac Surgery',
        specialty: 'Minimally Invasive Aortic & Coronary Interventions',
        experienceYears: 23,
        education: 'Istanbul University Cerrahpasa · Fellowship Zurich University Hospital',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ],
    treatmentsOffered: [
      {
        treatmentId: 'cardiac-bypass',
        name: 'Beating Heart CABG Bypass Package',
        startingPriceUSD: 8500,
        inclusions: ['6 nights hospital stay', 'Surgical fees', 'Cardiac meds', 'Airport transfers'],
      },
      {
        treatmentId: 'dental-implants-all-on-4',
        name: 'All-on-4 Full Arch Zirconia Restoration (Per Jaw)',
        startingPriceUSD: 4200,
        inclusions: ['4 Straumann titanium implants', 'Immediate hybrid bridge', 'CAD/CAM zirconia prosthesis'],
      },
      {
        treatmentId: 'laser-eye-surgery',
        name: 'Custom Femto-LASIK Bilateral Refraction',
        startingPriceUSD: 1800,
        inclusions: ['Both eyes laser treatment', 'Diagnostic scans', 'Medication pack'],
      },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'medica-sur-mexico',
    name: 'Centro Medico Internacional Sur',
    city: 'Mexico City',
    country: 'Mexico',
    flag: '🇲🇽',
    accreditations: ['JCI Accredited', 'Mayo Clinic Care Network Member', 'General Health Council (CSG)'],
    tagline: 'Mayo Clinic Care Network Member Providing North American Excellence at Accessible Rates',
    overview:
      'Centro Medico Internacional Sur is a renowned 320-bed hospital in Mexico City and an official member of the Mayo Clinic Care Network, offering geographic proximity and exceptional orthopedic and dental care.',
    coverImage:
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=200&q=80',
    rating: 4.91,
    reviewCount: 340,
    establishedYear: 2004,
    beds: 320,
    languages: ['English', 'Spanish'],
    facilities: [
      'Mayo Clinic e-Consult Integration',
      'Advanced Robotic Orthopedic Surgical Suite',
      'State-of-the-Art Private Recovery Suites',
      'On-campus bilingual patient relations center',
    ],
    internationalSupport: {
      airportConcierge: 'Direct private shuttle service from Mexico City International Airport (MEX)',
      visaAssistance: 'No visa required for US/Canadian/EU citizens for up to 180 days',
      translators: 'Fully bilingual medical doctors, nursing staff, and patient navigators',
      accommodation: 'On-campus Holiday Inn Hotel connected directly to the clinical towers',
    },
    doctors: [
      {
        id: 'dr-carlos-navarro',
        providerId: 'medica-sur-mexico',
        name: 'Dr. Carlos Navarro, MD',
        title: 'Director of Adult Orthopedic Surgery',
        specialty: 'Direct Anterior Hip & Robotic Knee Arthroplasty',
        experienceYears: 22,
        education: 'UNAM School of Medicine · Fellowship Hospital for Special Surgery NYC (USA)',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ],
    treatmentsOffered: [
      {
        treatmentId: 'knee-replacement',
        name: 'Robotic Total Knee Replacement',
        startingPriceUSD: 8200,
        inclusions: ['4 nights private room', 'Stryker Triathlon implant', 'Operating room & surgeon fee', 'Physical therapy'],
      },
      {
        treatmentId: 'hip-replacement',
        name: 'Direct Anterior Hip Replacement',
        startingPriceUSD: 8600,
        inclusions: ['3 nights stay', 'Dual mobility ceramic-on-poly implant', 'Anesthesia & nursing'],
      },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

export const providerService = {
  async listProviders(filters?: { country?: string; search?: string }): Promise<Provider[]> {
    let result = [...MOCK_PROVIDERS]
    if (filters?.country && filters.country !== 'all') {
      result = result.filter(
        (p) => p.country.toLowerCase() === filters.country!.toLowerCase()
      )
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q)
      )
    }
    return result
  },

  async getProviderById(id: string): Promise<Provider | null> {
    const p = MOCK_PROVIDERS.find((item) => item.id === id)
    return p || null
  },

  async updateProvider(id: string, data: Partial<Provider>): Promise<Provider | null> {
    const provider = MOCK_PROVIDERS.find((p) => p.id === id)
    if (!provider) return null

    Object.assign(provider, data, { updatedAt: new Date().toISOString() })
    return provider
  },

  async getTreatments(providerId: string): Promise<ProviderTreatmentOffer[]> {
    const provider = await this.getProviderById(providerId)
    return provider?.treatmentsOffered || []
  },

  async addTreatment(providerId: string, offer: ProviderTreatmentOffer): Promise<ProviderTreatmentOffer | null> {
    const provider = MOCK_PROVIDERS.find((p) => p.id === providerId)
    if (!provider) return null

    if (!provider.treatmentsOffered) provider.treatmentsOffered = []
    const existingIdx = provider.treatmentsOffered.findIndex((t) => t.treatmentId === offer.treatmentId)
    if (existingIdx !== -1) {
      provider.treatmentsOffered[existingIdx] = offer
    } else {
      provider.treatmentsOffered.push(offer)
    }
    provider.updatedAt = new Date().toISOString()
    return offer
  },

  async updateTreatment(
    providerId: string,
    treatmentId: string,
    data: Partial<ProviderTreatmentOffer>
  ): Promise<ProviderTreatmentOffer | null> {
    const provider = MOCK_PROVIDERS.find((p) => p.id === providerId)
    if (!provider || !provider.treatmentsOffered) return null

    const item = provider.treatmentsOffered.find((t) => t.treatmentId === treatmentId)
    if (!item) return null

    Object.assign(item, data)
    provider.updatedAt = new Date().toISOString()
    return item
  },

  async deleteTreatment(providerId: string, treatmentId: string): Promise<boolean> {
    const provider = MOCK_PROVIDERS.find((p) => p.id === providerId)
    if (!provider || !provider.treatmentsOffered) return false

    const initialLen = provider.treatmentsOffered.length
    provider.treatmentsOffered = provider.treatmentsOffered.filter((t) => t.treatmentId !== treatmentId)
    return provider.treatmentsOffered.length < initialLen
  },

  async getProviderDashboard(providerId: string): Promise<any> {
    const provider = await this.getProviderById(providerId)
    const { caseService } = await import('./caseService.js')
    const { appointmentService } = await import('./appointmentService.js')
    const { quoteService } = await import('./quoteService.js')
    const { notificationService } = await import('./notificationService.js')

    const cases = await caseService.listCases({ providerId })
    const activeCasesList = cases.filter((c) =>
      ['CONSULTATION', 'BOOKED', 'TREATMENT', 'AFTERCARE'].includes(c.status)
    )
    const pendingCasesList = cases.filter((c) =>
      ['DRAFT', 'RECORDS_PENDING', 'QUALIFICATION', 'MATCHING', 'QUOTES_RECEIVED'].includes(c.status)
    )

    const appointments = await appointmentService.listAppointments({ providerId })
    const quotes = await quoteService.listQuotesByProvider(providerId)
    const notifications = await notificationService.listNotifications(providerId)

    return {
      provider: provider || {
        id: providerId,
        name: 'Healthcare Provider',
        city: 'International',
        country: 'Global',
      },
      metrics: {
        activeCases: activeCasesList.length,
        pendingCases: pendingCasesList.length,
        consultations: appointments.length,
        quotes: quotes.length,
        notifications: notifications.length,
      },
      cases,
      upcomingConsultations: appointments,
      recentQuotes: quotes,
      notifications,
    }
  },
}
