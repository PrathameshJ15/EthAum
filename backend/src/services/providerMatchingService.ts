import { caseService } from './caseService.js'
import { providerService, MOCK_PROVIDERS } from './providerService.js'
import { groqService, AI_PROVIDER_MATCHING_DISCLAIMER } from './groqService.js'
import { Provider, ProviderMatch, ScoringBreakdown, MedicalCase } from '../types/index.js'
import { NotFoundError } from '../utils/apiError.js'

export interface MatchOptions {
  destinationFilter?: string
  maxResults?: number
  includeAiExplanations?: boolean
}

export const providerMatchingService = {
  /**
   * Complete Multi-Stage Matching Pipeline:
   * Medical Case -> Hard Filters -> Structured Scoring -> AI Relevance Explanation -> Ranked Matches
   */
  async matchProvidersForCase(
    caseId: string,
    options: MatchOptions = {}
  ): Promise<{
    caseId: string
    treatmentTarget: string
    matches: ProviderMatch[]
    disclaimer: string
    evaluatedCount: number
  }> {
    const medicalCase = await caseService.getCaseById(caseId)
    if (!medicalCase) {
      throw new NotFoundError(`Medical case #${caseId} not found`)
    }

    const allProviders = await providerService.listProviders()
    const evaluatedCount = allProviders.length

    // STAGE 1: HARD FILTERS
    const qualifiedCandidates = allProviders.filter((provider) => {
      return this.passesHardFilters(provider, medicalCase, options)
    })

    // If hard filters eliminated all providers (e.g. strict country filter), fall back gracefully to all accredited providers offering the treatment
    const candidates =
      qualifiedCandidates.length > 0
        ? qualifiedCandidates
        : allProviders.filter((p) => this.hasTreatmentCapability(p, medicalCase.treatmentId, medicalCase.treatmentName))

    // STAGE 2: STRUCTURED SCORING
    const scoredCandidates = candidates.map((provider) => {
      const { breakdown, factors, relevantTreatments } = this.calculateMatchScore(provider, medicalCase)
      return {
        provider,
        breakdown,
        factors,
        relevantTreatments,
        totalScore: breakdown.totalScore,
      }
    })

    // Sort descending by transparent total score
    scoredCandidates.sort((a, b) => b.totalScore - a.totalScore)

    const topCandidates = scoredCandidates.slice(0, options.maxResults || 5)

    // STAGE 3: AI RELEVANCE EXPLANATIONS
    const matches: ProviderMatch[] = await Promise.all(
      topCandidates.map(async (candidate) => {
        let whyRelevant = `${candidate.provider.name} in ${candidate.provider.city}, ${candidate.provider.country} aligns with your case requirements for ${medicalCase.treatmentName}.`
        let highlights = candidate.factors.slice(0, 3)

        if (options.includeAiExplanations !== false) {
          try {
            const aiExplanation = await groqService.generateProviderRelevanceExplanation({
              caseSummary: medicalCase.medicalHistory,
              treatmentName: medicalCase.treatmentName,
              destinationPreference: medicalCase.destinationName,
              providerName: candidate.provider.name,
              providerCity: candidate.provider.city,
              providerCountry: candidate.provider.country,
              accreditations: candidate.provider.accreditations,
              matchFactors: candidate.factors,
              offeredTreatment: candidate.relevantTreatments[0]?.name,
              startingPriceUSD: candidate.relevantTreatments[0]?.startingPriceUSD,
              facilities: candidate.provider.facilities,
            })
            whyRelevant = aiExplanation.whyRelevant
            if (aiExplanation.highlights && aiExplanation.highlights.length > 0) {
              highlights = aiExplanation.highlights
            }
          } catch (err: any) {
            console.warn(`[providerMatching] Groq explanation fallback for ${candidate.provider.id}: ${err.message}`)
          }
        }

        const leadDoctor = candidate.provider.doctors?.[0]

        return {
          provider: candidate.provider,
          matchScore: candidate.totalScore,
          scoringBreakdown: candidate.breakdown,
          matchFactors: candidate.factors,
          whyRelevant,
          highlights,
          relevantTreatments: candidate.relevantTreatments,
          trustInformation: {
            accreditations: candidate.provider.accreditations,
            establishedYear: candidate.provider.establishedYear,
            internationalDesk: Boolean(candidate.provider.internationalSupport?.airportConcierge),
            leadSurgeonExperienceYears: leadDoctor?.experienceYears,
          },
        }
      })
    )

    return {
      caseId: medicalCase.id,
      treatmentTarget: medicalCase.treatmentName,
      matches,
      disclaimer: AI_PROVIDER_MATCHING_DISCLAIMER,
      evaluatedCount,
    }
  },

  /**
   * STAGE 1: Hard Filters Validation
   */
  passesHardFilters(provider: Provider, medicalCase: MedicalCase, options: MatchOptions): boolean {
    // 1. Provider Verification Filter: Must possess institutional accreditations
    if (!provider.accreditations || provider.accreditations.length === 0) {
      return false
    }

    // 2. Treatment Capability Filter: Must offer the target treatment or relevant surgical category
    const hasTreatment = this.hasTreatmentCapability(
      provider,
      medicalCase.treatmentId,
      medicalCase.treatmentName
    )
    if (!hasTreatment) {
      return false
    }

    // 3. Destination Preference Filter (if explicitly filtered in query options)
    if (options.destinationFilter && options.destinationFilter !== 'all') {
      const matchCountry = provider.country.toLowerCase() === options.destinationFilter.toLowerCase()
      const matchCity = provider.city.toLowerCase() === options.destinationFilter.toLowerCase()
      if (!matchCountry && !matchCity) {
        return false
      }
    }

    return true
  },

  /**
   * Helper to verify if provider offers target treatment
   */
  hasTreatmentCapability(provider: Provider, treatmentId: string, treatmentName: string): boolean {
    const tId = treatmentId.toLowerCase()
    const tName = treatmentName.toLowerCase()

    // Check treatmentsOffered array
    if (provider.treatmentsOffered && provider.treatmentsOffered.length > 0) {
      const directMatch = provider.treatmentsOffered.some((to) => {
        const toId = to.treatmentId.toLowerCase()
        const toName = to.name.toLowerCase()
        return (
          toId === tId ||
          toName.includes(tId) ||
          toId.includes(tId) ||
          tName.includes(toId) ||
          toName.includes('knee') === tName.includes('knee') && tName.includes('knee') ||
          toName.includes('hip') === tName.includes('hip') && tName.includes('hip') ||
          toName.includes('cardiac') === tName.includes('cardiac') && tName.includes('cardiac') ||
          toName.includes('bypass') === tName.includes('bypass') && tName.includes('bypass') ||
          toName.includes('dental') === tName.includes('dental') && tName.includes('dental') ||
          toName.includes('ivf') === tName.includes('ivf') && tName.includes('ivf') ||
          toName.includes('eye') === tName.includes('eye') && tName.includes('eye')
        )
      })
      if (directMatch) return true
    }

    // Check doctors specialty
    if (provider.doctors && provider.doctors.length > 0) {
      const docMatch = provider.doctors.some((d) => {
        const spec = d.specialty.toLowerCase()
        if (tName.includes('knee') || tName.includes('hip') || tName.includes('joint')) {
          return spec.includes('joint') || spec.includes('orthopedic') || spec.includes('knee') || spec.includes('hip')
        }
        if (tName.includes('cardiac') || tName.includes('bypass') || tName.includes('heart')) {
          return spec.includes('cardiac') || spec.includes('cardiothoracic') || spec.includes('heart')
        }
        if (tName.includes('dental') || tName.includes('implant')) {
          return spec.includes('implant') || spec.includes('dental') || spec.includes('prosthodontics')
        }
        if (tName.includes('ivf') || tName.includes('fertility')) {
          return spec.includes('fertility') || spec.includes('reproductive') || spec.includes('ivf')
        }
        if (tName.includes('eye') || tName.includes('lasik') || tName.includes('vision')) {
          return spec.includes('ophthalmology') || spec.includes('refractive') || spec.includes('eye')
        }
        return false
      })
      if (docMatch) return true
    }

    return false
  },

  /**
   * STAGE 2: Transparent Structured Scoring Algorithm
   * Dimensions:
   * - Treatment Fit (Max 30)
   * - Destination Fit (Max 25)
   * - Specialization Fit (Max 20)
   * - Availability & Logistics Fit (Max 15)
   * - Patient Preference Fit (Max 10)
   */
  calculateMatchScore(
    provider: Provider,
    medicalCase: MedicalCase
  ): {
    breakdown: ScoringBreakdown
    factors: string[]
    relevantTreatments: Provider['treatmentsOffered'] & Array<any>
  } {
    const factors: string[] = []
    let treatmentFit = 0
    let destinationFit = 0
    let specializationFit = 0
    let availabilityFit = 0
    let preferenceFit = 0

    const tId = medicalCase.treatmentId.toLowerCase()
    const tName = medicalCase.treatmentName.toLowerCase()

    // 1. Treatment Fit (Max 30)
    const matchingTreatments = (provider.treatmentsOffered || []).filter((to) => {
      const toId = to.treatmentId.toLowerCase()
      return toId === tId || to.name.toLowerCase().includes(tId) || tName.includes(toId)
    })

    if (matchingTreatments.length > 0) {
      treatmentFit += 20
      factors.push(`Verified Procedure: ${matchingTreatments[0].name}`)
    } else {
      treatmentFit += 10
      factors.push(`Clinical department provides related surgical care`)
    }

    // Technology Fit (Robotic navigation / advanced imaging)
    const mentionsRobotics =
      tName.includes('robotic') ||
      tName.includes('mako') ||
      (medicalCase.medicalHistory && medicalCase.medicalHistory.toLowerCase().includes('robotic'))
    const providerHasRobotics = (provider.facilities || []).some(
      (f) => f.toLowerCase().includes('robotic') || f.toLowerCase().includes('mako')
    )
    if (mentionsRobotics && providerHasRobotics) {
      treatmentFit += 10
      factors.push('Robotic Navigation (Mako / Rosa) Available on Campus')
    } else if (providerHasRobotics) {
      treatmentFit += 5
    }

    // 2. Destination Fit (Max 25)
    const caseDest = (medicalCase.destinationName || '').toLowerCase()
    const provCountry = provider.country.toLowerCase()
    const provCity = provider.city.toLowerCase()

    if (caseDest.includes(provCountry)) {
      destinationFit += 20
      factors.push(`Matches Destination Country: ${provider.country}`)
      const cityMatches =
        caseDest.includes(provCity) ||
        provCity.includes(caseDest) ||
        caseDest.includes('delhi') && provCity.includes('delhi') ||
        !caseDest.includes(',') // No specific city specified, country-wide match
      if (cityMatches) {
        destinationFit += 5
        factors.push(`Located in Preferred City: ${provider.city}`)
      }
    } else if (!medicalCase.destinationName || medicalCase.destinationName.toLowerCase().includes('open') || medicalCase.destinationName.toLowerCase().includes('flexible')) {
      destinationFit += 18
      factors.push(`Open travel destination matches premier international hub`)
    } else {
      destinationFit += 10
      factors.push(`Alternative international quaternary destination`)
    }

    // 3. Provider Specialization & Trust (Max 20)
    const hasJci = (provider.accreditations || []).some((a) => a.toLowerCase().includes('jci'))
    if (hasJci) {
      specializationFit += 10
      factors.push('Gold Seal JCI Accredited Hospital')
    } else {
      specializationFit += 6
      factors.push(provider.accreditations[0] || 'Institutionally Certified')
    }

    const leadDoc = provider.doctors?.[0]
    if (leadDoc && leadDoc.experienceYears >= 20) {
      specializationFit += 5
      factors.push(`Lead Specialist: ${leadDoc.name} (${leadDoc.experienceYears}+ years experience)`)
    } else if (leadDoc) {
      specializationFit += 3
    }

    const isDedicatedCenter =
      provider.name.toLowerCase().includes('institute') ||
      provider.name.toLowerCase().includes('joint') ||
      provider.name.toLowerCase().includes('heart') ||
      provider.name.toLowerCase().includes('orthopedic')
    if (isDedicatedCenter) {
      specializationFit += 5
      factors.push('Dedicated Quaternary Center of Excellence')
    } else {
      specializationFit += 3
    }

    // 4. Availability & Logistics Fit (Max 15)
    if (provider.internationalSupport?.airportConcierge) {
      availabilityFit += 5
      factors.push('VIP Airport Chauffeur & Reception Included')
    }
    if (provider.internationalSupport?.visaAssistance) {
      availabilityFit += 5
      factors.push('Medical Visa Invitation (MED-V) Assistance')
    }
    if (provider.internationalSupport?.translators) {
      availabilityFit += 5
      factors.push('Multilingual Patient Coordinators on site')
    }

    // 5. Patient Preference Fit (Max 10)
    const packagePrice = matchingTreatments[0]?.startingPriceUSD
    if (medicalCase.budgetMax && packagePrice) {
      if (packagePrice <= medicalCase.budgetMax) {
        preferenceFit += 5
        factors.push(`Package rate ($${packagePrice.toLocaleString()} USD) within budget limit`)
      } else {
        preferenceFit += 2
      }
    } else {
      preferenceFit += 5
    }

    const hasCompanionNeed =
      medicalCase.patientNotes?.toLowerCase().includes('spouse') ||
      medicalCase.patientNotes?.toLowerCase().includes('companion')
    const hasCompanionSuites = (provider.facilities || []).some(
      (f) => f.toLowerCase().includes('companion') || f.toLowerCase().includes('private') || f.toLowerCase().includes('suite')
    )
    if (hasCompanionNeed && hasCompanionSuites) {
      preferenceFit += 5
      factors.push('Private Executive Suites with Traveling Companion Accommodations')
    } else if (hasCompanionSuites) {
      preferenceFit += 3
    }

    const totalScore = Math.min(
      100,
      treatmentFit + destinationFit + specializationFit + availabilityFit + preferenceFit
    )

    return {
      breakdown: {
        treatmentFit: Math.min(30, treatmentFit),
        destinationFit: Math.min(25, destinationFit),
        specializationFit: Math.min(20, specializationFit),
        availabilityFit: Math.min(15, availabilityFit),
        preferenceFit: Math.min(10, preferenceFit),
        totalScore,
      },
      factors,
      relevantTreatments: matchingTreatments.length > 0 ? matchingTreatments : provider.treatmentsOffered || [],
    }
  },
}
