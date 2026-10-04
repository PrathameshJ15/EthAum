import apiClient from './apiClient.js'
import { PROVIDERS_DATA } from '../data/providersData.js'

export const providerService = {
  /**
   * Retrieves all providers from backend API with fallback
   */
  async listProviders(params = {}) {
    try {
      const data = await apiClient.get('/providers', { params })
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    } catch (err) {
      console.warn('[providerService] API unavailable, using local provider catalog:', err.message)
    }

    let result = [...PROVIDERS_DATA]
    if (params.country && params.country !== 'All') {
      result = result.filter(
        (p) => p.country.toLowerCase() === params.country.toLowerCase()
      )
    }
    if (params.search) {
      const q = params.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q) ||
          p.overview.toLowerCase().includes(q)
      )
    }
    return result
  },

  /**
   * Retrieves single provider by ID
   */
  async getProviderById(id) {
    try {
      const data = await apiClient.get(`/providers/${id}`)
      if (data && data.id) {
        const local = PROVIDERS_DATA.find((p) => p.id === id)
        return {
          ...local,
          ...data,
          doctors: data.doctors || local?.doctors || [],
          facilities: data.facilities || local?.facilities || [],
          internationalSupport: data.internationalSupport || local?.internationalSupport || {},
        }
      }
    } catch (err) {
      console.warn(`[providerService] API error for provider ${id}, using fallback:`, err.message)
    }

    return PROVIDERS_DATA.find((p) => p.id === id) || PROVIDERS_DATA[0]
  },

  /**
   * Evaluates and retrieves ranked quaternary provider matches for a medical case
   */
  async matchProvidersForCase(caseId, options = {}) {
    try {
      const params = {}
      if (options.destination) params.destination = options.destination
      if (options.maxResults) params.maxResults = options.maxResults
      if (options.includeAi !== undefined) params.includeAi = options.includeAi

      const res = await apiClient.get(`/cases/${caseId}/matches`, { params })
      if (res?.data?.matches) {
        return res.data
      }
      if (res?.matches) {
        return res
      }
    } catch (err) {
      console.warn(`[providerService] Match API call failed for ${caseId}, trying /providers/match:`, err.message)
      try {
        const res = await apiClient.get(`/providers/match/${caseId}`, { params: options })
        if (res?.data?.matches) return res.data
        if (res?.matches) return res
      } catch (err2) {
        console.warn(`[providerService] Fallback to empty matches:`, err2.message)
      }
    }

    return {
      caseId,
      matches: [],
      disclaimer:
        'Provider relevance explanations are for coordination and informational purposes and do not constitute a clinical endorsement or guarantee of care.',
      evaluatedCount: 0,
    }
  },

  /**
   * Provider Portal Dashboard aggregation
   */
  async getDashboard() {
    return await apiClient.get('/providers/dashboard')
  },

  /**
   * Provider Institutional Profile
   */
  async getProfile() {
    return await apiClient.get('/providers/profile')
  },

  async updateProfile(data) {
    return await apiClient.patch('/providers/profile', data)
  },

  /**
   * Provider Treatment Offerings Management
   */
  async getTreatments() {
    return await apiClient.get('/providers/treatments')
  },

  async addTreatment(offer) {
    return await apiClient.post('/providers/treatments', offer)
  },

  async updateTreatment(treatmentId, offer) {
    return await apiClient.patch(`/providers/treatments/${treatmentId}`, offer)
  },

  async deleteTreatment(treatmentId) {
    return await apiClient.delete(`/providers/treatments/${treatmentId}`)
  },
}

export default providerService
