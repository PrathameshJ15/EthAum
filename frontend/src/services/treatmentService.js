import apiClient from './apiClient.js'
import { TREATMENTS_DATA } from '../data/treatmentsData.js'

export const treatmentService = {
  /**
   * Retrieves all treatments from backend API with fallback
   */
  async listTreatments(params = {}) {
    try {
      const data = await apiClient.get('/treatments', { params })
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    } catch (err) {
      console.warn('[treatmentService] API unavailable, using local treatment catalog:', err.message)
    }

    // Filter local fallback by category or search term if present
    let result = [...TREATMENTS_DATA]
    if (params.category && params.category !== 'All') {
      result = result.filter(
        (t) => t.category.toLowerCase() === params.category.toLowerCase()
      )
    }
    if (params.search) {
      const q = params.search.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.shortDescription.toLowerCase().includes(q)
      )
    }
    return result
  },

  /**
   * Retrieves single treatment by ID
   */
  async getTreatmentById(id) {
    try {
      const data = await apiClient.get(`/treatments/${id}`)
      if (data && data.id) {
        // Merge rich UI properties (journeySteps, faqs, image) from catalog if not returned by backend
        const local = TREATMENTS_DATA.find((t) => t.id === id)
        return {
          ...local,
          ...data,
          journeySteps: data.journeySteps || local?.journeySteps || [],
          faqs: data.faqs || local?.faqs || [],
        }
      }
    } catch (err) {
      console.warn(`[treatmentService] API error for treatment ${id}, using fallback:`, err.message)
    }

    return TREATMENTS_DATA.find((t) => t.id === id) || TREATMENTS_DATA[0]
  },
}

export default treatmentService
