import apiClient from './apiClient.js'

export const recordService = {
  /**
   * List medical records (filtered by case or patient)
   */
  async listRecords(caseId) {
    const params = caseId ? { caseId } : {}
    return await apiClient.get('/medical-records', { params })
  },

  /**
   * Retrieve a single record by ID
   */
  async getRecordById(id) {
    return await apiClient.get(`/medical-records/${id}`)
  },

  /**
   * Request a time-limited signed upload URL for the private storage bucket.
   * Also registers preliminary record metadata on the backend.
   */
  async requestUploadUrl({ caseId, fileName, category, type = 'Clinical Document', size = 'Unknown', sizeBytes = 0 }) {
    return await apiClient.post('/medical-records/upload-url', {
      caseId,
      fileName,
      category,
      type,
      size,
      sizeBytes,
    })
  },

  /**
   * Directly upload file binary to the signed storage upload URL
   */
  async uploadFileDirect(uploadUrl, file) {
    // If it's a mock upload URL in local testing, simulate immediate success
    if (uploadUrl.includes('mock-storage.ethaum.local')) {
      return { success: true, status: 200 }
    }

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    })

    if (!response.ok) {
      throw new Error(`Failed to upload file to storage: ${response.statusText}`)
    }

    return { success: true, status: response.status }
  },

  /**
   * Generate an authorized, short-lived signed download URL for private files
   */
  async getDownloadUrl(recordId) {
    return await apiClient.get(`/medical-records/${recordId}/download-url`)
  },

  /**
   * Patient grants explicit access to a hospital provider
   */
  async grantPermission(recordId, providerId) {
    return await apiClient.post(`/medical-records/${recordId}/permissions`, { providerId })
  },

  /**
   * Patient revokes access from a hospital provider
   */
  async revokePermission(recordId, providerId) {
    return await apiClient.delete(`/medical-records/${recordId}/permissions/${providerId}`)
  },

  /**
   * Retrieve the immutable audit trail for a medical record
   */
  async getAccessLogs(recordId) {
    return await apiClient.get(`/medical-records/${recordId}/access-logs`)
  },

  /**
   * Process medical record with Groq AI Document Intelligence via backend
   */
  async analyzeRecord(recordId, { documentText = '', caseContext = '' } = {}) {
    return await apiClient.post(`/medical-records/${recordId}/analyze-ai`, {
      documentText,
      caseContext,
    })
  },

  /**
   * Analyze raw clinical document text or snippet via backend
   */
  async analyzeText({ documentName, documentText, declaredCategory, caseContext }) {
    return await apiClient.post('/medical-records/analyze-text', {
      documentName,
      documentText,
      declaredCategory,
      caseContext,
    })
  },
}

export default recordService
