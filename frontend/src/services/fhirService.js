import apiClient from './apiClient.js'

export const fhirService = {
  /**
   * Validate arbitrary FHIR R4 resource or Bundle
   */
  async validate(payload) {
    try {
      const res = await apiClient.post('/fhir/validate', payload)
      return res.data || res
    } catch (err) {
      if (err.response?.data?.data) {
        return err.response.data.data
      }
      throw err
    }
  },

  /**
   * Fetch synthetic demonstration FHIR R4 bundle
   */
  async getSyntheticSampleBundle() {
    const res = await apiClient.get('/fhir/sample-bundle')
    return res.data || res
  },

  /**
   * Preview FHIR export for an authorized case
   */
  async previewExport(caseId) {
    const res = await apiClient.get(`/cases/${caseId}/fhir/preview`)
    return res.data || res
  },

  /**
   * Export case as FHIR R4 Bundle. If download is true, triggers browser download.
   */
  async exportBundle(caseId, download = false) {
    if (download) {
      const res = await apiClient.get(`/cases/${caseId}/fhir/export?download=true`, {
        responseType: 'blob',
      })
      const blob = new Blob([res.data || res], { type: 'application/fhir+json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `ethaum-case-${caseId}-fhir-r4.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      return { downloaded: true }
    }

    const res = await apiClient.get(`/cases/${caseId}/fhir/export`)
    return res.data || res
  },

  /**
   * Stage an incoming FHIR bundle for clinical review
   */
  async stageImport(caseId, bundle) {
    const res = await apiClient.post(`/cases/${caseId}/fhir/import/stage`, bundle)
    return res.data || res
  },

  /**
   * Confirm an authorized staged import
   */
  async confirmImport(caseId, stagingId) {
    const res = await apiClient.post(`/cases/${caseId}/fhir/import/confirm`, { stagingId })
    return res.data || res
  },

  /**
   * Fetch history of FHIR operations for a case
   */
  async getOperationsHistory(caseId) {
    try {
      const res = await apiClient.get(`/cases/${caseId}/fhir/operations`)
      return res.data || res || []
    } catch {
      return []
    }
  },
}

export default fhirService
