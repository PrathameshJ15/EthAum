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
- Python
- Django
- Django REST Framework

### Data & Infrastructure
- Supabase PostgreSQL
- Supabase Storage
- Supabase Auth

### AI
- Grok API through the Django backend

### Deployment
- Frontend: Vercel
- Backend: Render/Railway
- Database, Storage and Auth: Supabase

## Core Principle

The Medical Case is the center of the application.

Patient → Case → Records → Providers → Quotes → Appointments → Booking → Journey → Aftercare

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
12. Treatment is booked
13. Journey tracker updates
14. Aftercare reminders appear

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Environment Variables

Frontend:

```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Backend:

```env
SECRET_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
XAI_API_KEY=
```

Never expose `XAI_API_KEY` in the frontend.

## Product Status

This repository is intended for an MVP/hackathon implementation. Production deployment requires appropriate legal, privacy, security and healthcare-regulatory review.
