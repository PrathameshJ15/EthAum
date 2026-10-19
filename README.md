# EthAum — AI-Powered International Healthcare Marketplace

> **Global Care. Closer to You.**

EthAum is a patient-controlled medical tourism platform that connects international patients with healthcare providers and manages the complete journey from treatment discovery to aftercare.

## Core Product Thesis

International healthcare is fragmented. Patients struggle with providers, medical records, pricing, consultations, booking and follow-up.

EthAum creates one connected **Medical Case**.

**Discover → Case → Records → AI → Match → Quotes → Consultation → Booking → Treatment → Aftercare**

## Primary Users

### Patient
- Discover treatments
- Explore providers and destinations
- Create a Medical Case
- Upload medical records
- Review AI-organized information
- Explore provider matches
- Compare quotes
- Book consultation
- Book treatment
- Track journey
- Manage aftercare

### Healthcare Provider
- Receive patient cases
- Access permitted medical records
- Review cases
- Create quotes
- Manage appointments
- Communicate with patients
- Track active cases

### Admin
- Manage users
- Verify providers
- Manage treatments
- Manage cases
- Manage reviews
- Monitor platform activity

## Technology Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React

### Backend
- Node.js & Express (TypeScript)
- Zod schema validation
- Helmet, CORS & Express Rate Limiter
- Cryptographic HMAC-SHA256 signature verification

### Data & Infrastructure
- Supabase PostgreSQL
- Supabase Storage (medical records bucket)
- Supabase Auth

### AI Engine
- Groq SDK (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) with medical safety filters

### Payment Gateway & Escrow (Phase 30)
- Multi-provider gateway architecture: Razorpay, Stripe, and Sovereign Simulation Sandbox
- Server-authoritative pricing (anti-tamper)
- Cryptographic HMAC signature verification & idempotent webhooks
- See [docs/payment-integration.md](docs/payment-integration.md) for full guide

### EHR & HL7 FHIR R4 Interoperability Prototype (Phase 31)
- Conforms to **HL7 FHIR Release 4 (v4.0.1)** (`http://hl7.org/fhir/R4/`)
- Resources supported: `Patient`, `Condition`, `Observation`, `DiagnosticReport`, `DocumentReference`, `Encounter`, and `Bundle`
- Bidirectional mapping with SNOMED CT (`38362002`) and LOINC (`82312-0`) clinical coding
- Patient data sovereignty & consent-filtered provider export (`application/fhir+json`)
- Inbound bundle staging (`PENDING_REVIEW`) with automated duplicate detection by filename
- Interactive frontend module in Case Detail with synthetic Eleanor Vance sample loader
- See [docs/fhir-interoperability.md](docs/fhir-interoperability.md) for complete mapping & REST API specification

### Deployment
- Frontend: Vercel / Cloudflare Pages
- Backend: Render / Railway / Node container
- Database, Storage and Auth: Supabase

## Core Principle

The Medical Case is the center of the application.

Patient → Case → Records → Providers → Quotes → Appointments → Booking → Escrow Payment → Journey → Aftercare

## AI Boundary

AI assists with:
- Document classification
- Information extraction
- Case summarization
- Missing-information detection
- Provider matching explanations
- Quote normalization/comparison

AI must not:
- Diagnose
- Prescribe medication
- Decide whether surgery is necessary
- Guarantee treatment results
- Replace a doctor
- Make emergency medical decisions

## Demo Story

Use one complete patient story for the hackathon:

1. Patient searches for Knee Replacement
2. Creates a Medical Case
3. Uploads MRI, X-Ray, Blood Report and Prescription
4. AI organizes the documents
5. AI generates a coordination summary
6. Missing information is highlighted
7. Providers are matched using platform criteria
8. Providers submit quotes
9. Patient compares quotes
10. Patient selects a provider
11. Patient books consultation
12. Treatment admission booked & escrow payment verified via gateway
13. Journey tracker updates through travel, admission, and surgery
14. Aftercare rehabilitation milestones appear

## Local Development

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:5173**.

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

Runs on **http://localhost:8000** (Health: `http://localhost:8000/api/v1/health`).

### 3. Run Automated Test Suite

```bash
cd backend
npm test
```

Currently verifies **17 test suites (178 tests total)**.

## Environment Variables

### Frontend (`frontend/.env`):

```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_PAYMENT_PROVIDER=mock
VITE_RAZORPAY_KEY_ID=rzp_test_placeholder
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
```

### Backend (`backend/.env`):

```env
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_ANON_KEY=your-supabase-anon-key
GROQ_API_KEY=your-groq-api-key

# Payment Gateway (Phase 30)
PAYMENT_PROVIDER=mock
RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

> [!CAUTION]
> Never expose `GROQ_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, or `STRIPE_SECRET_KEY` in the frontend or Git.

## Product Status

This repository provides an enterprise-ready architecture for international healthcare coordination. Full production transaction processing requires merchant KYC approval and production webhook secret provisioning with Razorpay or Stripe.

