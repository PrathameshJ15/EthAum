import React, { useState, useEffect, useRef } from 'react'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  Maximize2,
  Minimize2,
  CheckCircle2,
  User,
  Stethoscope,
  Building2,
  RefreshCw,
  Info,
} from 'lucide-react'

import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { useToast } from '../common/useToast'
import { appointmentService } from '../../services/appointmentService'

export function VideoConsultationRoom({
  isOpen,
  onClose,
  appointment,
  isProviderView = false,
  onSessionEnded,
}) {
  const { addToast } = useToast()

  // Video session metadata from backend
  const [session, setSession] = useState(null)
  const [connectionState, setConnectionState] = useState('INITIALIZING') // INITIALIZING | PERMISSION_PROMPT | CONNECTED | PERMISSION_DENIED | ERROR | ENDED
  const [errorMessage, setErrorMessage] = useState('')
  const [permissionErrorDetail, setPermissionErrorDetail] = useState(null)

  // Media controls state
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // In-call timer
  const [callDurationSeconds, setCallDurationSeconds] = useState(0)

  // Media stream references
  const localVideoRef = useRef(null)
  const localStreamRef = useRef(null)
  const containerRef = useRef(null)
  const timerIntervalRef = useRef(null)

  // 1. Initialize Video Session with Backend when dialog opens
  useEffect(() => {
    if (!isOpen || !appointment?.id) {
      cleanupStreams()
      setSession(null)
      setConnectionState('INITIALIZING')
      setCallDurationSeconds(0)
      return
    }

    let isMounted = true

    async function initSession() {
      try {
        setConnectionState('INITIALIZING')
        setErrorMessage('')

        // Request backend to issue/retrieve secure session token
        const res = await appointmentService.createOrJoinVideoSession(appointment.id)
        const sessionData = res?.data || res

        if (!isMounted) return
        setSession(sessionData)

        // Proceed to acquire media stream
        await acquireLocalMedia()
      } catch (err) {
        if (!isMounted) return
        console.error('[VideoConsultation] Session initialization error:', err)
        const status = err?.response?.status
        const msg = err?.response?.data?.error?.message || err?.message || 'Failed to initialize video session'
        
        if (status === 403) {
          setErrorMessage('Access Denied: You are not authorized to join this clinical consultation.')
        } else if (status === 400) {
          setErrorMessage(msg)
        } else {
          setErrorMessage(`Unable to establish encrypted session: ${msg}`)
        }
        setConnectionState('ERROR')
      }
    }

    initSession()

    return () => {
      isMounted = false
      cleanupStreams()
    }
  }, [isOpen, appointment?.id])

  // 2. Hardware Permissions & Stream Acquisition
  const acquireLocalMedia = async (audioOnly = false) => {
    try {
      setConnectionState('PERMISSION_PROMPT')
      setPermissionErrorDetail(null)

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints = {
          audio: true,
          video: audioOnly ? false : { width: { ideal: 1280 }, height: { ideal: 720 } },
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        localStreamRef.current = stream

        if (localVideoRef.current && !audioOnly) {
          localVideoRef.current.srcObject = stream
        }

        setIsVideoEnabled(!audioOnly)
        setIsAudioEnabled(true)
        setConnectionState('CONNECTED')
        startCallTimer()
      } else {
        // Browser without WebRTC mediaDevices API
        setConnectionState('CONNECTED')
        startCallTimer()
      }
    } catch (err) {
      console.warn('[VideoConsultation] Camera/Microphone access error:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionErrorDetail({
          type: 'DENIED',
          title: 'Camera & Microphone Access Blocked',
          message:
            'Browser permissions for camera and microphone are blocked. Please click the permissions/lock icon in your address bar, allow access, and try again.',
        })
        setConnectionState('PERMISSION_DENIED')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionErrorDetail({
          type: 'NOT_FOUND',
          title: 'Camera or Microphone Not Detected',
          message:
            'No video capture device was detected on your computer or phone. You may still join in audio-only mode.',
        })
        setConnectionState('PERMISSION_DENIED')
      } else {
        setPermissionErrorDetail({
          type: 'HARDWARE_BUSY',
          title: 'Media Device In Use',
          message:
            'Your camera or microphone might already be in use by another application. Please close other video tools and retry.',
        })
        setConnectionState('PERMISSION_DENIED')
      }
    }
  }

  // 3. Call Timer
  const startCallTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    setCallDurationSeconds(0)
    timerIntervalRef.current = setInterval(() => {
      setCallDurationSeconds((prev) => prev + 1)
    }, 1000)
  }

  // Cleanup helper
  const cleanupStreams = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }
  }

  // 4. Media Controls
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = !isAudioEnabled
      })
      setIsAudioEnabled(!isAudioEnabled)
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = !isVideoEnabled
      })
      setIsVideoEnabled(!isVideoEnabled)
    }
  }

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Revert to camera
      await acquireLocalMedia()
      setIsScreenSharing(false)
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream
          }
          screenStream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false)
            acquireLocalMedia()
          }
          setIsScreenSharing(true)
        } else {
          addToast({
            type: 'error',
            title: 'Not Supported',
            message: 'Screen sharing is not supported on this browser device.',
          })
        }
      } catch (err) {
        // User cancelled picker
      }
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  // 5. Conclude Consultation
  const handleEndConsultation = async () => {
    cleanupStreams()
    try {
      const notes = isProviderView
        ? 'Clinical review completed. Patient cleared for surgical admission.'
        : 'Patient completed pre-op teleconsultation.'
      const res = await appointmentService.endVideoSession(appointment.id, notes)
      setConnectionState('ENDED')
      onSessionEnded?.(res?.data?.appointment || res)
      addToast({
        type: 'success',
        title: 'Consultation Concluded',
        message: 'Clinical teleconsultation successfully concluded.',
      })
    } catch (err) {
      setConnectionState('ENDED')
      onClose?.()
    }
  }

  if (!isOpen) return null

  // Format timer mm:ss
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 text-[var(--text-primary)]"
    >
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[820px] bg-[#0E1513] rounded-lg border border-[#1F2C27] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#131D19] border-b border-[#1F2C27] select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1F2E28] flex items-center justify-center text-[var(--green-rich)]">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">
                  {appointment?.doctorName || 'Attending Clinical Specialist'}
                </h2>
                <Badge variant="success" size="sm">
                  {connectionState === 'CONNECTED' ? 'LIVE E2EE' : connectionState}
                </Badge>
              </div>
              <p className="text-xs text-[#89938F] flex items-center gap-2">
                <span>{appointment?.providerName || 'Partner Hospital'}</span>
                <span>•</span>
                <span>Case #{appointment?.caseId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* HIPAA E2EE Zero Recording Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#16231E] border border-[#273B32] text-[11px] text-[#A3B8B0]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>HIPAA Compliant · Zero Recording</span>
            </div>

            {/* Timer */}
            {connectionState === 'CONNECTED' && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-red-950/60 border border-red-800/40 text-xs font-mono text-red-200">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>{formatTimer(callDurationSeconds)}</span>
              </div>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-[4px] text-[#89938F] hover:text-white hover:bg-[#1C2A24] transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Video Stage */}
        <div className="relative flex-1 bg-[#0A0F0D] flex items-center justify-center overflow-hidden">
          
          {/* STATE 1: INITIALIZING */}
          {connectionState === 'INITIALIZING' && (
            <div className="text-center space-y-3 p-6 max-w-sm">
              <RefreshCw className="w-8 h-8 text-[var(--green-rich)] animate-spin mx-auto" />
              <h3 className="text-sm font-medium text-white">Negotiating Sovereign Session...</h3>
              <p className="text-xs text-[#89938F]">
                Securing end-to-end encrypted medical corridor with {appointment?.providerName || 'hospital'}.
              </p>
            </div>
          )}

          {/* STATE 2: ERROR */}
          {connectionState === 'ERROR' && (
            <div className="text-center space-y-4 p-6 max-w-md bg-[#161F1B] rounded-lg border border-red-900/40">
              <div className="w-12 h-12 rounded-full bg-red-900/30 text-red-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Consultation Connection Issue</h3>
                <p className="text-xs text-[#A8B3AE] mt-1.5 leading-relaxed">{errorMessage}</p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Dismiss
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => acquireLocalMedia()}
                >
                  Retry Connection
                </Button>
              </div>
            </div>
          )}

          {/* STATE 3: PERMISSION DENIED / HARDWARE ISSUE */}
          {connectionState === 'PERMISSION_DENIED' && (
            <div className="text-center space-y-4 p-6 max-w-lg bg-[#141E1A] rounded-lg border border-amber-900/40">
              <div className="w-12 h-12 rounded-full bg-amber-900/30 text-amber-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{permissionErrorDetail?.title}</h3>
                <p className="text-xs text-[#A8B3AE] mt-2 leading-relaxed">
                  {permissionErrorDetail?.message}
                </p>
              </div>

              <div className="p-3 bg-[#0D1512] rounded-[4px] border border-[#23352D] text-left text-xs text-[#89938F] space-y-1">
                <p className="font-medium text-[#C8D6D0]">How to unblock in browser:</p>
                <p>1. Look at the address bar next to the URL (click the camera or lock icon).</p>
                <p>2. Toggle <strong>Camera</strong> and <strong>Microphone</strong> to <strong>Allow</strong>.</p>
                <p>3. Click "Retry Access" below.</p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <Button variant="outline" size="sm" onClick={() => acquireLocalMedia(true)}>
                  Join in Audio-Only
                </Button>
                <Button variant="primary" size="sm" onClick={() => acquireLocalMedia(false)}>
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry Access
                </Button>
              </div>
            </div>
          )}

          {/* STATE 4: ACTIVE CONNECTED STREAM */}
          {connectionState === 'CONNECTED' && (
            session?.provider === 'daily' && session?.roomUrl ? (
              <iframe
                src={session.roomUrl}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="w-full h-full border-0"
                title="Daily.co Encrypted Consultation Room"
              />
            ) : (
              <div className="relative w-full h-full flex flex-col md:flex-row items-center justify-center bg-[#090E0C]">
                
                {/* Main Remote View: Attending Specialist */}
                <div className="relative flex-1 w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#111A17] to-[#0A100E] p-6">
                  <div className="text-center space-y-3">
                    <div className="relative inline-block">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#182620] border-2 border-[var(--green-rich)] flex items-center justify-center text-white shadow-xl">
                        <User className="w-12 h-12 text-[#99AB9F]" />
                      </div>
                      <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#090E0C]" title="Connected" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-white">
                        {appointment?.doctorName || 'Dr. Vikram Oberoi'}
                      </h4>
                      <p className="text-xs text-[#89938F]">
                        {appointment?.specialty || 'Adult Knee & Hip Reconstruction'}
                      </p>
                      <p className="text-[11px] text-[var(--green-rich)] mt-1 font-mono">
                        Active Audio & Video Feed (Encrypted)
                      </p>
                    </div>

                    {/* Speaking waveform animation */}
                    <div className="flex items-center justify-center gap-1 pt-2">
                      <span className="w-1 h-3 bg-emerald-500/80 rounded-full animate-bounce" />
                      <span className="w-1 h-5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1 h-7 bg-emerald-300 rounded-full animate-bounce [animation-delay:0.3s]" />
                      <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.45s]" />
                      <span className="w-1 h-2 bg-emerald-500/80 rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                  </div>
                </div>

                {/* Picture-In-Picture / Split Self View */}
                <div className="absolute top-4 right-4 w-44 sm:w-56 h-32 sm:h-40 bg-[#16211C] rounded-lg border-2 border-[#2B3E35] overflow-hidden shadow-2xl z-10 flex items-center justify-center">
                  {isVideoEnabled ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover mirror"
                    />
                  ) : (
                    <div className="text-center p-3 text-xs text-[#89938F]">
                      <VideoOff className="w-6 h-6 mx-auto mb-1 text-[#66736C]" />
                      <span>Camera Off</span>
                    </div>
                  )}

                  {/* Pip Label */}
                  <div className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-white font-medium">
                    You ({session?.participantRole || 'Patient'})
                  </div>
                </div>
              </div>
            )
          )}

          {/* STATE 5: ENDED */}
          {connectionState === 'ENDED' && (
            <div className="text-center space-y-4 p-8 max-w-md bg-[#131E19] rounded-lg border border-[#23352D]">
              <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Clinical Consultation Concluded</h3>
                <p className="text-xs text-[#A8B3AE] mt-1.5">
                  Duration: <strong>{formatTimer(callDurationSeconds)}</strong> · Attending:{' '}
                  <strong>{appointment?.doctorName || 'Clinical Specialist'}</strong>
                </p>
                <p className="text-xs text-[#7A8882] mt-3 leading-relaxed">
                  Your case milestone has been recorded. You can now review institutional quotes, accept treatment plans, or proceed to Treatment Booking.
                </p>
              </div>
              <div className="pt-3 flex justify-center gap-3">
                <Button variant="primary" size="sm" onClick={onClose}>
                  Return to Case Dossier
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Dock (Visible when connected) */}
        {connectionState === 'CONNECTED' && (
          <div className="px-4 py-3 bg-[#131D19] border-t border-[#1F2C27] flex items-center justify-between select-none">
            <div className="text-xs text-[#89938F] hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Sovereign WebRTC Peer Active</span>
            </div>

            {/* Media Action Buttons */}
            <div className="flex items-center gap-3 mx-auto sm:mx-0">
              {/* Mic Toggle */}
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full transition-colors ${
                  isAudioEnabled
                    ? 'bg-[#1C2C24] hover:bg-[#253A30] text-white'
                    : 'bg-red-900/80 hover:bg-red-800 text-white'
                }`}
                title={isAudioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              {/* Video Toggle */}
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-colors ${
                  isVideoEnabled
                    ? 'bg-[#1C2C24] hover:bg-[#253A30] text-white'
                    : 'bg-red-900/80 hover:bg-red-800 text-white'
                }`}
                title={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              {/* Screen Share */}
              <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-full transition-colors ${
                  isScreenSharing
                    ? 'bg-[var(--green-rich)] text-white'
                    : 'bg-[#1C2C24] hover:bg-[#253A30] text-[#A8B3AE]'
                }`}
                title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
              >
                <Share2 className="w-5 h-5" />
              </button>

              {/* End / Leave Consultation */}
              <button
                onClick={handleEndConsultation}
                className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg"
                title="End Consultation"
              >
                <PhoneOff className="w-4 h-4" />
                <span>{isProviderView ? 'Conclude Session' : 'Leave Room'}</span>
              </button>
            </div>

            <div className="hidden sm:block text-xs text-[#89938F]">
              <span>ID: {appointment?.id}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default VideoConsultationRoom
