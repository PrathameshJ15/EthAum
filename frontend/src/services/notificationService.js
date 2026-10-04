import apiClient from './apiClient.js'

export const notificationService = {
  async listNotifications() {
    return await apiClient.get('/notifications')
  },

  async markAsRead(id) {
    return await apiClient.patch(`/notifications/${id}/read`)
  },
}

export default notificationService
