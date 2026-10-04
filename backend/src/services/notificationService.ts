import { Notification } from '../types/index.js'

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'usr-patient-1',
    title: 'Consultation Confirmed',
    message: 'Your tele-consultation with Dr. Vikram Oberoi is scheduled for Oct 14.',
    type: 'SUCCESS',
    link: '/dashboard',
    read: false,
    createdAt: '2026-10-01T14:35:00Z',
  },
  {
    id: 'notif-2',
    userId: 'usr-patient-1',
    title: 'Quote Received',
    message: 'Apex Joint Institute issued an all-inclusive quote of $6,500 USD.',
    type: 'INFO',
    link: '/cases/ET-8492',
    read: true,
    createdAt: '2026-09-22T08:05:00Z',
  },
]

export const notificationService = {
  async listNotifications(userId: string): Promise<Notification[]> {
    return MOCK_NOTIFICATIONS.filter((n) => n.userId === userId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  async markAsRead(id: string, userId: string): Promise<boolean> {
    const notif = MOCK_NOTIFICATIONS.find((n) => n.id === id && n.userId === userId)
    if (!notif) return false
    notif.read = true
    return true
  },
}
