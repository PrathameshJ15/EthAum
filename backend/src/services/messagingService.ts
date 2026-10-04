import { Conversation, Message } from '../types/index.js'

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    caseId: 'ET-8492',
    participantIds: ['usr-patient-1', 'dr-vikram-oberoi'],
    subject: 'Robotic Knee Replacement Planning',
    lastMessageAt: '2026-10-02T16:00:00Z',
    createdAt: '2026-09-20T10:00:00Z',
  },
]

const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'dr-vikram-oberoi',
    senderName: 'Dr. Vikram Oberoi',
    senderRole: 'provider',
    content:
      'Hello Eleanor, I reviewed your coronal MRI scan. The bone quality is excellent for a cruciate-retaining implant.',
    read: true,
    createdAt: '2026-10-02T15:45:00Z',
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'usr-patient-1',
    senderName: 'Eleanor Vance',
    senderRole: 'patient',
    content: 'Thank you doctor! Looking forward to our video consultation on the 14th.',
    read: true,
    createdAt: '2026-10-02T16:00:00Z',
  },
]

export const messagingService = {
  async listConversations(userId: string): Promise<Conversation[]> {
    return MOCK_CONVERSATIONS.filter((c) => c.participantIds.includes(userId))
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    return MOCK_MESSAGES.filter((m) => m.conversationId === conversationId).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  },

  async sendMessage(data: Omit<Message, 'id' | 'createdAt' | 'read'>): Promise<Message> {
    const newMessage: Message = {
      ...data,
      id: `msg-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    }
    MOCK_MESSAGES.push(newMessage)

    const conv = MOCK_CONVERSATIONS.find((c) => c.id === data.conversationId)
    if (conv) {
      conv.lastMessageAt = newMessage.createdAt
    }

    return newMessage
  },
}
