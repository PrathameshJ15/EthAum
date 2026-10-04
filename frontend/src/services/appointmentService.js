import apiClient from './apiClient.js'

export const appointmentService = {
  async listAppointments(params = {}) {
    return await apiClient.get('/appointments', { params })
  },

  async getAppointmentById(id) {
    return await apiClient.get(`/appointments/${id}`)
  },

  async createAppointment(data) {
    return await apiClient.post('/appointments', data)
  },

  async getAvailableSlots(doctorId, date) {
    return await apiClient.get('/appointments/slots', {
      params: { doctorId, date },
    })
  },

  async updateAppointment(id, data) {
    return await apiClient.patch(`/appointments/${id}`, data)
  },

  async confirmAppointment(id) {
    return await apiClient.post(`/appointments/${id}/confirm`)
  },

  async completeAppointment(id) {
    return await apiClient.post(`/appointments/${id}/complete`)
  },

  async cancelAppointment(id) {
    return await apiClient.post(`/appointments/${id}/cancel`)
  },
}

export default appointmentService

