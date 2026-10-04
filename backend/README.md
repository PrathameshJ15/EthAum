# EthAum Backend API

The Node.js + Express + TypeScript REST API foundation with **Supabase PostgreSQL, Supabase Auth, and Supabase Storage** for the **EthAum Healthcare Coordination Platform**.

---

## 1. Architecture Overview

- **Runtime**: Node.js (ES Modules, TypeScript)
- **Framework**: Express.js with Helmet security headers, CORS, rate limiting, and Morgan logging
- **Database**: Supabase PostgreSQL with 17 relational tables, foreign keys, and RLS
- **Authentication**: Supabase Auth (`auth.users`) with application user profiles and normalized RBAC (`PATIENT`, `PROVIDER`, `ADMIN`)
- **Object Storage**: Supabase Storage private bucket `medical-records` with short-lived signed upload and download URLs
- **Validation**: Schema-based validation using Zod
- **Base Route**: `/api/v1`

---

## 2. Directory Structure

```
backend/
├── docs/
│   └── database_schema.md       # Comprehensive database, RLS, and storage documentation
├── src/
│   ├── config/
│   │   ├── env.ts               # Typed environment variables
│   │   └── supabase.ts          # Centralized Supabase Admin & Anon client singletons
│   ├── controllers/             # Modular HTTP controllers
│   │   ├── appointmentController.ts
│   │   ├── authController.ts
│   │   ├── caseController.ts
│   │   ├── doctorController.ts
│   │   ├── journeyController.ts
│   │   ├── medicalRecordController.ts  # Upload URLs, download URLs, permissions, audit logs
│   │   ├── messagingController.ts
│   │   ├── notificationController.ts
│   │   ├── providerController.ts
│   │   ├── quoteController.ts
│   │   ├── treatmentController.ts
│   │   └── userController.ts
│   ├── middleware/              # Security, validation, and error handling
│   │   ├── auth.ts              # Supabase JWT verification & normalized RBAC
│   │   ├── recordAuth.ts        # Object-level access control & audit logging
│   │   ├── validate.ts          # Zod schema validation middleware
│   │   ├── errorHandler.ts      # Centralized error handler
│   │   └── notFoundHandler.ts   # Centralized 404 handler
│   ├── routes/                  # Express routers mounted under /api/v1
│   ├── services/                # Pure business logic and domain services
│   │   ├── caseService.ts       # 12-stage Medical Case state machine & persistence
│   │   ├── medicalRecordService.ts # Sovereign medical records, permissions & audit logs
│   │   ├── storageService.ts    # Private bucket storage with signed upload/download URLs
│   │   ├── userService.ts       # User & patient profile persistence
│   │   └── ...
│   ├── types/
│   │   └── index.ts             # Domain models, enums, RecordCategory, and UserRole
│   ├── utils/
│   │   ├── apiError.ts          # Standard ApiError hierarchy
│   │   ├── apiResponse.ts       # Standard sendSuccess / sendError
│   │   └── sanitizer.ts         # PHI / credential redaction utility
│   └── app.ts                   # Express application configuration
├── supabase/
│   ├── migrations/
│   │   └── 20261004000000_init_schema.sql # Complete 17-table relational schema & RLS
│   └── schema.sql               # Reference schema snapshot
├── tests/                       # Vitest unit & integration test suites
│   ├── auth.test.ts
│   ├── errorHandling.test.ts
│   ├── health.test.ts
│   ├── medicalRecords.test.ts
│   ├── supabaseIntegration.test.ts # Auth, profile, case, storage, permissions, audit logs
│   └── validation.test.ts
├── server.ts                    # Server startup & graceful shutdown
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 3. Environment Variables & Security

Configure your local environment by copying `.env.example` to `.env`:

```bash
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase PostgreSQL, Auth & Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_ANON_KEY=your-supabase-anon-key

# Server-Side Only (Not exposed to client)
GROQ_API_KEY=
```

> **Security Rule**: `SUPABASE_SERVICE_ROLE_KEY` is loaded strictly server-side and is never exposed to React or the frontend.

---

## 4. API Endpoints Map (`/api/v1`)

| Endpoint | Method | Auth Required | Description |
|---|---|---|---|
| `/health` | GET | No | Service health check |
| `/auth/login` | POST | No | Authenticate user credentials |
| `/auth/signup` | POST | No | Register new patient, provider, or admin |
| `/auth/me` | GET | Yes | Current authenticated user profile |
| `/users/:id` | GET | Yes | Retrieve user details |
| `/patients/profile` | GET | Yes | Get authenticated patient medical profile |
| `/patients/:userId/profile` | PATCH | Yes | Update patient profile |
| `/providers` | GET | No | List accredited hospital providers |
| `/providers/:id` | GET | No | Hospital provider details |
| `/doctors` | GET | No | List accredited specialists & surgeons |
| `/doctors/:id` | GET | No | Specialist credentials & case history |
| `/treatments` | GET | No | Global treatment catalogue & cost benchmarks |
| `/treatments/:id` | GET | No | Treatment procedure details |
| `/cases` | GET | Yes | List medical cases (filtered by patient) |
| `/cases/:id` | GET | Yes | Medical case details & timeline |
| `/cases` | POST | Yes | Create medical coordination case |
| `/cases/:id/status` | PATCH | Yes | Update medical case status (State Machine) |
| `/medical-records` | GET | Yes | List patient medical records |
| `/medical-records/upload-url` | POST | Yes | **Request signed upload URL for private storage bucket** |
| `/medical-records/:id` | GET | Yes (ACL) | Retrieve medical record metadata |
| `/medical-records/:id/download-url` | GET | Yes (ACL) | **Generate time-limited signed download URL** |
| `/medical-records/:id/permissions` | POST | Yes (ACL) | **Patient grants access to a specific provider** |
| `/medical-records/:id/permissions/:providerId` | DELETE | Yes (ACL) | **Patient revokes access from a specific provider** |
| `/medical-records/:id/permissions` | PATCH | Yes (ACL) | Bulk update sharing permissions |
| `/medical-records/:id/access-logs` | GET | Yes (ACL) | **HIPAA/GDPR audit trail for record access** |
| `/quotes` | GET | Yes | List quotes for case |
| `/quotes/:id` | GET | Yes | Institutional quote details |
| `/quotes/:id/accept` | POST | Yes | Accept institutional quote |
| `/appointments` | GET | Yes | List teleconsultation & in-person appointments |
| `/appointments/:id` | GET | Yes | Appointment details |
| `/appointments` | POST | Yes | Schedule consultation |
| `/messages/conversations` | GET | Yes | List care coordination conversations |
| `/messages/conversations/:id/messages` | GET | Yes | Retrieve conversation chat thread |
| `/messages/messages` | POST | Yes | Send message to care team / coordinator |
| `/journey` | GET | Yes | Patient journey progression timeline |
| `/notifications` | GET | Yes | List patient notifications |
| `/notifications/:id/read` | PATCH | Yes | Mark notification as read |

---

## 5. Medical Records Storage & Access Control

### Supported Diagnostic Categories
- `MRI`
- `X-Ray`
- `CT`
- `Blood Reports`
- `Prescriptions`
- `Medical History`
- `Other`

### Private Storage Bucket
- Bucket name: `medical-records` (`public = false`)
- Path format: `patients/{patientId}/cases/{caseId}/{timestamp}_{fileName}`
- Files are accessed strictly via signed URLs (`POST /upload-url` and `GET /:id/download-url`).

### Patient Sovereignty & Audit Logging
1. **Patient Ownership**: Patients own their diagnostic records and can view, download, or grant/revoke access.
2. **Provider Sharing**: Providers can only view or download records where an `ACTIVE` grant exists in `record_permissions`.
3. **Audit Trail**: Every sensitive operation (`VIEW`, `DOWNLOAD`, `UPLOAD`, `SHARE_GRANTED`, `SHARE_REVOKED`) generates an immutable entry in `record_access_logs` with timestamp, user ID, role, action, and IP address.

---

## 6. Development & Verification Commands

All commands are executed inside the `backend/` directory:

```bash
# Install dependencies
npm install

# Run automated test suites (36 passing tests across 6 test suites)
npm test

# Build TypeScript to dist/ (0 compile errors)
npm run build

# Start development server with live reload
npm run dev

# Start production build
npm start
```

---

## 7. Verification Status

- **Automated Tests**: **36 / 36 passed** across 6 test suites (`health`, `errorHandling`, `auth`, `validation`, `medicalRecords`, `supabaseIntegration`)
- **TypeScript Compile**: Clean compilation with **0 errors** (`tsc` exit code 0)
- **Live Health Check**: `GET http://localhost:8000/api/v1/health` verified returning `{ "status": "ok", "service": "EthAum API" }`
- **Live Upload URL**: `POST http://localhost:8000/api/v1/medical-records/upload-url` verified generating signed upload URLs
- **Live Download URL**: `GET http://localhost:8000/api/v1/medical-records/rec-1/download-url` verified generating signed download URLs and logging `DOWNLOAD` actions
- **Frontend Preserved**: Existing React/Vite frontend remains untouched and running on `http://localhost:5173/`
