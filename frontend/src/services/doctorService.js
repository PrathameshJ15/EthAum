import apiClient from './apiClient.js'

export const doctorService = {
  async listDoctors(params = {}) {
    return await apiClient.get('/doctors', { params })
  },

  async getDoctorById(id) {
    return await apiClient.get(`/doctors/${id}`)
  },
}

export default doctorService
