import apiClient from './apiClient.js'

export const bookingService = {
  async listBookings(params = {}) {
    return await apiClient.get('/bookings', { params })
  },

  async getBookingById(id) {
    return await apiClient.get(`/bookings/${id}`)
  },

  async createBooking(data) {
    return await apiClient.post('/bookings', data)
  },

  async bookTreatmentForCase(caseId, data) {
    return await apiClient.post(`/cases/${caseId}/book`, data)
  },
}

export default bookingService
