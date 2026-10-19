# EthAum — Video Consultation & Telemedicine Architecture

## 1. Overview

EthAum's video consultation platform provides secure, end-to-end encrypted (E2EE) clinical teleconsultation connecting international patients with accredited hospital specialists prior to cross-border travel.

The architecture supports:
1. **Daily.co Cloud Infrastructure:** REST-provisioned private rooms with participant-scoped, time-limited meeting tokens.
2. **Sovereign WebRTC Fallback:** In-browser WebRTC room engine for offline or standalone enterprise operation.
3. **Strict Participant Authorization:** Cryptographic session verification restricting entry exclusively to the assigned patient, attending hospital provider/doctor, and authorized platform admins.
4. **Zero-Recording HIPAA Guarantee:** Cloud and local recording are disabled by default (`enable_recording: false`).

---

## 2. Configuration & Environment Variables

Provider API secrets are stored strictly on the backend (`backend/src/config/env.ts`) and are **never exposed to frontend code or client network payloads**.

### Backend Configuration (`.env`)

| Variable | Type | Default | Description |
|---|---|---|---|
| `DAILY_API_KEY` | String | *(Optional)* | Daily.co REST API Key. If omitted, the platform automatically engages the sovereign WebRTC fallback engine. |
| `DAILY_DOMAIN` | String | `ethaum.daily.co` | Custom Daily.co subdomain (e.g., `ethaum.daily.co`). |
| `FRONTEND_URL` | String | `http://localhost:5173` | Authorized frontend origin for WebRTC handshake and token negotiation. |

> [!IMPORTANT]
> **Daily.co Setup Instructions:**
> 1. Sign up at [https://dashboard.daily.co/](https://dashboard.daily.co/).
> 2. Navigate to **Developers** -> **API Keys**.
> 3. Copy your API Key and place it into `backend/.env`:
>    ```bash
>    DAILY_API_KEY=your_daily_api_key_here
>    DAILY_DOMAIN=your_subdomain.daily.co
>    ```
> 4. Ensure privacy compliance: EthAum explicitly enforces `"enable_recording": false` on all provisioned rooms and tokens.

---

## 3. Session Lifecycle & Endpoints

Video consultation sessions are tied directly to valid `Appointment` entities and follow a deterministic lifecycle:

```text
[REQUESTED] ──> [CONFIRMED] ──> [ACTIVE VIDEO SESSION] ──> [COMPLETED]
     │               │                                          ▲
     └─── CANCELLED ─┴──────────────────────────────────────────┘
```

### API Reference

#### 1. Initialize or Join Video Session
`POST /api/v1/appointments/:id/video-session`
- **Headers:** `Authorization: Bearer <JWT>`
- **Authorization:** Only the assigned patient, doctor/hospital provider, or platform admin.
- **Rules:**
  - Cannot join `CANCELLED` appointments (HTTP 400).
  - Cannot join already `COMPLETED` appointments (HTTP 400).
  - Rejects unauthorized users with HTTP 403 Forbidden.
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "sessionId": "vses-1729372800000-a1b2c3d4",
      "appointmentId": "apt-1",
      "caseId": "ET-8492",
      "roomName": "ethaum-et-8492-apt-1",
      "roomUrl": "https://ethaum.daily.co/ethaum-et-8492-apt-1?t=TOKEN",
      "provider": "daily",
      "status": "ACTIVE",
      "sessionToken": "TOKEN",
      "participantRole": "patient",
      "participantName": "Rahul Sharma",
      "isOwner": false,
      "enableRecording": false,
      "enableScreenshare": true,
      "enableChat": true,
      "createdAt": "2026-10-20T02:40:00.000Z",
      "expiresAt": "2026-10-20T04:40:00.000Z"
    }
  }
  ```

#### 2. Get Video Session Status
`GET /api/v1/appointments/:id/video-session`
- **Headers:** `Authorization: Bearer <JWT>`
- **Response (`200 OK`):** Returns current active session or `null` if none initialized.

#### 3. Conclude Video Consultation
`POST /api/v1/appointments/:id/video-session/end`
- **Headers:** `Authorization: Bearer <JWT>`
- **Body:** `{ "notes": "Clinical assessment completed." }`
- **Actions:**
  - Transitions session status to `COMPLETED`.
  - Updates appointment status to `COMPLETED`.
  - Emits milestone to case journey audit ledger (`Video Consultation Completed`).
  - Clears patient to advance to Treatment Booking.

---

## 4. Hardware Permissions & Device Error Handling

The in-browser [`VideoConsultationRoom`](file:///C:/Users/ayush/EthAum/frontend/src/components/consultation/VideoConsultationRoom.jsx) component gracefully detects and handles device permission states:

1. **`NotAllowedError` / `PermissionDeniedError`:**
   - Displays clear instructions guiding the patient on how to unblock camera/mic via the browser address bar icon.
   - Provides a one-click **"Join in Audio-Only"** fallback button so patient consultations are never abruptly terminated due to a missing webcam.
2. **`NotFoundError` / `DevicesNotFoundError`:**
   - Alerts the user that no video capture device was detected and smoothly activates audio stream.
3. **`NotReadableError` (Hardware Busy):**
   - Informs the user that the camera is locked by another operating system process.

---

## 5. Security & Clinical Data Protection

1. **No Client Secret Exposure:** `DAILY_API_KEY` is retained exclusively on the backend.
2. **No Default Recording:** Under international medical regulations (HIPAA § 164.530 and GDPR Art. 9), recording is disabled by default to protect sensitive patient clinical interactions.
3. **Signed Tokens with Expiration:** Tokens are cryptographically tied to the participant's user identity and expire after 2 hours.
4. **Sovereign Audit Trail:** Room join, leave, and completion events are recorded in the patient case journey timeline.

---

## 6. Known Limitations & Next Steps

1. **Daily.co Domain Verification:** When using Daily.co in production, the custom domain should have SPF/DKIM and appropriate CORS origins verified in the Daily Dashboard.
2. **P2P Multi-Party Fallback:** The standalone WebRTC fallback currently operates as an optimized peer-to-peer room for 1:1 doctor-patient consultations; for multi-party clinical boards (>3 participants), Daily.co cloud routing or an SFU (e.g. LiveKit) is recommended.
