import crypto from 'crypto'
import { env } from '../config/env.js'
import {
  Appointment,
  VideoConsultationSession,
  VideoSessionStatus,
} from '../types/index.js'
import { appointmentService } from './appointmentService.js'
import { journeyService } from './journeyService.js'
import { AuthUser } from '../middleware/auth.js'
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../utils/apiError.js'

// In-memory session store (keyed by appointmentId)
const ACTIVE_VIDEO_SESSIONS = new Map<string, VideoConsultationSession>()

export const videoConsultationService = {
  /**
   * Authorizes a user to access an appointment's video consultation session.
   * Allowed participants:
   * - Admin
   * - Assigned Patient (or matching patientId)
   * - Assigned Provider / Doctor (or matching providerId)
   */
  validateParticipantAuthorization(appointment: Appointment, user: AuthUser): void {
    if (user.role === 'admin') {
      return
    }

    if (user.role === 'patient') {
      const isAuthorizedPatient =
        user.patientId === appointment.patientId ||
        user.id === appointment.patientId

      if (!isAuthorizedPatient) {
        throw new ForbiddenError(
          'Access Denied: You are not an authorized patient for this consultation session.'
        )
      }
      return
    }

    if (user.role === 'provider' || (user.role as string) === 'doctor') {
      const isAuthorizedProvider =
        (Boolean(appointment.providerId) && user.providerId === appointment.providerId) ||
        (Boolean(appointment.doctorId) && user.id === appointment.doctorId)

      if (!isAuthorizedProvider) {
        throw new ForbiddenError(
          'Access Denied: You are not an authorized healthcare provider for this consultation session.'
        )
      }
      return
    }

    throw new ForbiddenError(
      'Access Denied: Invalid role for video consultation participation.'
    )
  },

  /**
   * Generates or retrieves an active video consultation session for a valid appointment.
   * Interfaces with Daily.co REST API if DAILY_API_KEY is configured,
   * or provisions a secure WebRTC end-to-end encrypted room session fallback.
   */
  async createOrJoinVideoSession(
    appointmentId: string,
    user: AuthUser
  ): Promise<VideoConsultationSession> {
    const appointment = await appointmentService.getAppointmentById(appointmentId)
    if (!appointment) {
      throw new NotFoundError(`Appointment '${appointmentId}' not found.`)
    }

    // Status validations
    if (appointment.status === 'CANCELLED') {
      throw new ValidationError(
        'Cannot join or create a video session for a CANCELLED appointment.'
      )
    }

    if (appointment.status === 'COMPLETED') {
      throw new ValidationError(
        'This clinical consultation session has already been COMPLETED.'
      )
    }

    // Participant verification
    this.validateParticipantAuthorization(appointment, user)

    const isOwner =
      user.role === 'provider' ||
      (user.role as string) === 'doctor' ||
      user.role === 'admin'
    const participantRole =
      (user.role as 'patient' | 'doctor' | 'provider' | 'admin') || 'patient'
    const participantName =
      user.name || (isOwner ? 'Attending Clinical Specialist' : 'Patient')

    const roomName = `ethaum-${appointment.caseId
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')}-${appointment.id}`

    // Calculate 2 hour session window
    const nowMs = Date.now()
    const expUnix = Math.floor(nowMs / 1000) + 7200
    const expiresAt = new Date(nowMs + 7200 * 1000).toISOString()

    let provider: 'daily' | 'webrtc-e2ee' = 'webrtc-e2ee'
    let roomUrl = ''
    let sessionToken = ''

    // 1. Daily.co API Integration (when DAILY_API_KEY is configured on backend)
    if (env.DAILY_API_KEY) {
      try {
        provider = 'daily'
        const dailyDomain = env.DAILY_DOMAIN?.replace(/^https?:\/\//, '') || 'ethaum.daily.co'

        // Create Daily.co private room (HIPAA compliant, no recording by default)
        const roomRes = await fetch('https://api.daily.co/v1/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.DAILY_API_KEY}`,
          },
          body: JSON.stringify({
            name: roomName,
            privacy: 'private',
            properties: {
              enable_screenshare: true,
              enable_chat: true,
              enable_recording: false, // NOT recorded by default
              exp: expUnix,
              eject_at_room_exp: true,
            },
          }),
        })

        if (!roomRes.ok && roomRes.status !== 400) {
          // If 400, room may already exist, which is expected
          console.warn(`[Daily.co] Room provisioning HTTP status ${roomRes.status}`)
        }

        // Generate scoped meeting token for participant
        const tokenRes = await fetch('https://api.daily.co/v1/meeting-tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.DAILY_API_KEY}`,
          },
          body: JSON.stringify({
            properties: {
              room_name: roomName,
              is_owner: isOwner,
              user_name: participantName,
              enable_recording: false,
              exp: expUnix,
            },
          }),
        })

        if (tokenRes.ok) {
          const tokenData = (await tokenRes.json()) as { token: string }
          sessionToken = tokenData.token
          roomUrl = `https://${dailyDomain}/${roomName}?t=${sessionToken}`
        } else {
          throw new Error(`Daily.co token issuance returned HTTP ${tokenRes.status}`)
        }
      } catch (err: any) {
        console.warn(
          `[Daily.co Integration Fallback] Falling back to WebRTC room: ${err.message}`
        )
        provider = 'webrtc-e2ee'
      }
    }

    // 2. Sovereign WebRTC End-to-End Encrypted Room Fallback
    if (!sessionToken || provider === 'webrtc-e2ee') {
      provider = 'webrtc-e2ee'
      sessionToken = crypto.randomBytes(24).toString('hex')
      roomUrl = `${env.FRONTEND_URL}/consultations/room/${appointment.id}?token=${sessionToken}&role=${participantRole}`
    }

    const session: VideoConsultationSession = {
      sessionId: `vses-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      appointmentId: appointment.id,
      caseId: appointment.caseId,
      roomName,
      roomUrl,
      provider,
      status: 'ACTIVE',
      sessionToken,
      participantRole,
      participantName,
      isOwner,
      enableRecording: false, // Strict HIPAA default: no recording
      enableScreenshare: true,
      enableChat: true,
      createdAt: new Date().toISOString(),
      expiresAt,
    }

    ACTIVE_VIDEO_SESSIONS.set(appointment.id, session)

    // Sync appointment meeting URL & status if requested
    if (appointment.status === 'REQUESTED') {
      await appointmentService.updateAppointment(appointment.id, {
        status: 'CONFIRMED',
        meetingUrl: roomUrl,
      })
    } else if (!appointment.meetingUrl || appointment.meetingUrl.includes('meet.ethaum.health/room/')) {
      await appointmentService.updateAppointment(appointment.id, {
        meetingUrl: roomUrl,
      })
    }

    // Add journey event
    try {
      await journeyService.addJourneyEvent({
        caseId: appointment.caseId,
        stage: 'Consultation',
        title: `Video Consultation Active (${provider.toUpperCase()})`,
        description: `${participantName} joined encrypted telemedicine session for ${appointment.title || 'Consultation'}.`,
        actorRole: user.role === 'provider' ? 'provider' : 'patient',
        timestamp: new Date().toISOString(),
      })
    } catch {
      // non-blocking
    }

    return session
  },

  /**
   * Retrieves the current video session for an appointment.
   */
  async getVideoSession(
    appointmentId: string,
    user: AuthUser
  ): Promise<VideoConsultationSession | null> {
    const appointment = await appointmentService.getAppointmentById(appointmentId)
    if (!appointment) {
      throw new NotFoundError(`Appointment '${appointmentId}' not found.`)
    }

    this.validateParticipantAuthorization(appointment, user)

    const session = ACTIVE_VIDEO_SESSIONS.get(appointmentId)
    if (!session) {
      return null
    }

    // Check expiration
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      session.status = 'EXPIRED'
    }

    return session
  },

  /**
   * Ends an active video consultation session and marks appointment as COMPLETED.
   */
  async endVideoSession(
    appointmentId: string,
    user: AuthUser,
    notes?: string
  ): Promise<{ appointment: Appointment; session: VideoConsultationSession }> {
    const appointment = await appointmentService.getAppointmentById(appointmentId)
    if (!appointment) {
      throw new NotFoundError(`Appointment '${appointmentId}' not found.`)
    }

    this.validateParticipantAuthorization(appointment, user)

    let session = ACTIVE_VIDEO_SESSIONS.get(appointmentId)
    if (session) {
      session.status = 'COMPLETED'
    } else {
      session = {
        sessionId: `vses-${Date.now()}`,
        appointmentId: appointment.id,
        caseId: appointment.caseId,
        roomName: `ethaum-${appointment.caseId}-${appointment.id}`,
        roomUrl: appointment.meetingUrl || '',
        provider: 'webrtc-e2ee',
        status: 'COMPLETED',
        sessionToken: '',
        participantRole: (user.role as any) || 'provider',
        participantName: user.name || 'Provider',
        isOwner: true,
        enableRecording: false,
        enableScreenshare: false,
        enableChat: false,
        createdAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
      }
    }

    const updatedApt = await appointmentService.updateAppointment(appointmentId, {
      status: 'COMPLETED',
      notes: notes
        ? `${appointment.notes ? appointment.notes + ' | ' : ''}Consultation Notes: ${notes}`
        : appointment.notes,
    })

    return {
      appointment: updatedApt || appointment,
      session,
    }
  },
}
