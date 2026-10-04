import axios from 'axios'

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:8000') + '/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach authentication Bearer token
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('ethaum_auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (err) {
      console.warn('[apiClient] Could not read auth token from localStorage', err)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Standardize data unpacking and errors
apiClient.interceptors.response.use(
  (response) => {
    // If backend returns standard API wrapper { success: true, data: ..., message: ... }
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      const payload = response.data.data !== undefined ? response.data.data : response.data
      // Attach metadata for pagination or informative messages
      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        payload.__message = response.data.message
      }
      return payload
    }
    return response.data
  },
  (error) => {
    let errorMessage = 'Network error: could not connect to EthAum API server'

    if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }

    const customError = new Error(errorMessage)
    customError.statusCode = error.response?.status
    customError.details = error.response?.data?.error?.details
    customError.code = error.response?.data?.error?.code

    return Promise.reject(customError)
  }
)

export default apiClient
