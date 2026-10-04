import apiClient from './apiClient.js'

export const messageService = {
  async listConversations() {
    return await apiClient.get('/messages/conversations')
  },

  async getMessages(conversationId) {
    return await apiClient.get(`/messages/conversations/${conversationId}/messages`)
  },

  async sendMessage({ conversationId, content, attachments = [] }) {
    return await apiClient.post('/messages/messages', {
      conversationId,
      content,
      attachments,
    })
  },
}

export default messageService
