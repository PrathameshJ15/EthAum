import { Treatment } from '../types/index.js'

const MOCK_TREATMENTS: Treatment[] = [
  {
    id: 'knee-replacement',
    name: 'Total Knee Replacement (TKR)',
    category: 'Orthopedics',
    shortDescription: 'Minimally invasive robotic-assisted joint resurfacing for severe osteoarthritis.',
    longDescription:
      'Total Knee Replacement replaces damaged cartilage and bone with high-grade biocompatible titanium implants utilizing robotic navigation.',
    startingPriceUSD: 6500,
    usAvgPriceUSD: 38000,
    ukAvgPriceUSD: 18500,
    savingsPercentage: 75,
    hospitalStayDays: '3–5 days',
    recoveryTimeWeeks: '4–6 weeks',
    suitableFor: ['Severe osteoarthritis', 'Advanced rheumatoid arthritis', 'Failed conservative physical therapy'],
    topDestinationIds: ['india', 'thailand', 'mexico'],
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cardiac-bypass',
    name: 'Coronary Artery Bypass Graft (CABG)',
    category: 'Cardiology',
    shortDescription: 'Quaternary heart revascularization by globally accredited cardiothoracic surgical panels.',
    longDescription:
      'Off-pump or on-pump surgical bypass to restore arterial blood flow in multivessel coronary heart disease.',
    startingPriceUSD: 4200,
    usAvgPriceUSD: 95000,
    ukAvgPriceUSD: 32000,
    savingsPercentage: 86,
    hospitalStayDays: '6–8 days',
    recoveryTimeWeeks: '6–8 weeks',
    suitableFor: ['Triple-vessel coronary artery disease', 'Left main coronary artery stenosis'],
    topDestinationIds: ['india', 'thailand', 'turkey'],
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dental-implants-all-on-4',
    name: 'Full Arch Dental Implants (All-on-4)',
    category: 'Dental Reconstruction',
    shortDescription: 'Immediate-load screw-retained hybrid zirconia arch anchored on 4 titanium fixtures.',
    longDescription:
      'Comprehensive dental rehabilitation restoring full masticatory function with computer-guided surgical templates.',
    startingPriceUSD: 1800,
    usAvgPriceUSD: 24000,
    ukAvgPriceUSD: 12000,
    savingsPercentage: 80,
    hospitalStayDays: 'Outpatient (3 days in country)',
    recoveryTimeWeeks: '1–2 weeks',
    suitableFor: ['Severe edentulism', 'Terminal dentition with bone resorption'],
    topDestinationIds: ['turkey', 'mexico', 'hungary'],
    createdAt: '2026-01-01T00:00:00Z',
  },
]

export const treatmentService = {
  async listTreatments(filters?: { category?: string; search?: string }): Promise<Treatment[]> {
    let result = [...MOCK_TREATMENTS]
    if (filters?.category && filters.category !== 'All') {
      result = result.filter(
        (t) => t.category.toLowerCase() === filters.category!.toLowerCase()
      )
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.shortDescription.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      )
    }
    return result
  },

  async getTreatmentById(id: string): Promise<Treatment | null> {
    const t = MOCK_TREATMENTS.find((item) => item.id === id)
    return t || null
  },
}
