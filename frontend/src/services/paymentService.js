import apiClient from './apiClient.js'

export const paymentService = {
  /**
   * Fetch public payment configuration (active gateway, public key, supported currencies)
   */
  async getConfig() {
    try {
      const res = await apiClient.get('/payments/config')
      return res.data || res
    } catch {
      return {
        enabledProvider: 'mock',
        keyId: 'mock_key_live_testing',
        supportedCurrencies: ['USD', 'INR', 'EUR', 'GBP', 'THB'],
        testMode: true,
      }
    }
  },

  /**
   * Create payment order on server with authoritative server pricing
   */
  async createPaymentOrder({ caseId, purpose, bookingId, appointmentId, customNotes }) {
    const res = await apiClient.post('/payments/orders', {
      caseId,
      purpose,
      bookingId,
      appointmentId,
      customNotes,
    })
    return res.data || res
  },

  /**
   * Verify cryptographic payment signature on backend
   */
  async verifyPayment({ paymentId, providerOrderId, providerPaymentId, providerSignature }) {
    const res = await apiClient.post('/payments/verify', {
      paymentId,
      providerOrderId,
      providerPaymentId,
      providerSignature,
    })
    return res.data || res
  },

  /**
   * Fetch user's payment history or case payments
   */
  async getPaymentHistory(params = {}) {
    try {
      const res = await apiClient.get('/payments/history', { params })
      return res.data || res
    } catch {
      return []
    }
  },

  /**
   * Fetch payments specifically associated with a medical case
   */
  async getCasePayments(caseId) {
    try {
      const res = await apiClient.get(`/cases/${caseId}/payments`)
      return res.data || res
    } catch {
      return []
    }
  },

  /**
   * Load external script dynamically (e.g. Razorpay checkout.js)
   */
  loadScript(src) {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  },
}

export default paymentService
