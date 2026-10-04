import apiClient from './apiClient.js'

export const journeyService = {
  async getJourneyEvents(caseId) {
    const url = caseId ? `/journey/${caseId}` : '/journey'
    return await apiClient.get(url)
  },
}

export default journeyService
