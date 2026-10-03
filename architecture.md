# EthAum — System Architecture

## 1. High-Level Architecture

```text
                         ETHAUM
                            |
                            v
                  +-------------------+
                  | React + Vite      |
                  | Patient / Provider|
                  +---------+---------+
                            |
                            | HTTPS / REST
                            v
                  +-------------------+
                  | Django REST API   |
                  | Business Logic    |
                  +----+---------+----+
                       |         |
                       |         |
                       v         v
              +-------------+  +-------------+
              | Supabase    |  | Grok API    |
              | PostgreSQL  |  | AI          |
              +------+------+  +-------------+
                     |
                     v
              Supabase Storage
              Medical Documents
```

## 2. Frontend Architecture

```text
src/
├── assets/
├── components/
│   ├── common/
│   ├── layout/
│   ├── forms/
│   └── medical/
├── pages/
│   ├── public/
│   ├── auth/
│   ├── patient/
│   ├── provider/
│   └── admin/
├── layouts/
├── routes/
├── services/
├── hooks/
├── context/
├── data/
└── utils/
```

## 3. Backend Architecture

```text
backend/
├── config/
├── users/
├── providers/
├── treatments/
├── cases/
├── medical_records/
├── quotes/
├── appointments/
├── messaging/
├── journey/
└── manage.py
```

## 4. Main Domain Entities

```text
User
 ├── Patient
 └── Provider

Patient
 └── Medical Case
      ├── Medical Records
      ├── Provider Matches
      ├── Quotes
      ├── Appointments
      ├── Booking
      ├── Journey Events
      ├── Messages
      └── Aftercare
```

## 5. Main Database Tables

```text
users
patients
providers
doctors
treatments
provider_treatments
cases
medical_records
record_permissions
record_access_logs
quotes
quote_items
appointments
bookings
payments
messages
journey_events
notifications
reviews
```

## 6. Medical Case State Machine

```text
DRAFT
  ↓
RECORDS_PENDING
  ↓
QUALIFICATION
  ↓
MATCHING
  ↓
QUOTES_RECEIVED
  ↓
PROVIDER_SELECTED
  ↓
CONSULTATION
  ↓
BOOKED
  ↓
TREATMENT
  ↓
AFTERCARE
  ↓
COMPLETED
```

Possible cancellation path:

```text
Any eligible active state → CANCELLED
```

## 7. AI Architecture

Never call Grok directly from React.

```text
React
  ↓
Django API
  ↓
AI Service
  ↓
Grok API
  ↓
Structured JSON
  ↓
Django
  ↓
Database
  ↓
React
```

## 8. File Processing

```text
Patient uploads file
        ↓
Django validates file
        ↓
Supabase Storage
        ↓
Text/content extraction
        ↓
AI classification
        ↓
Structured metadata
        ↓
MedicalRecord
        ↓
Patient dashboard
```

## 9. Provider Matching

```text
Medical Case
    ↓
Hard Eligibility Filters
    ↓
Eligible Providers
    ↓
Structured Matching Score
    ↓
AI Explanation
    ↓
Patient
```

The score is a platform matching score, not a medical recommendation.

## 10. Security Architecture

- Backend-only secrets
- Role-based authorization
- Patient-controlled record permissions
- Access logs
- Secure file storage
- Input validation
- File type/size validation
- API authentication
- Rate limiting
- Auditability

## 11. Deployment

```text
Vercel
  ↓
React Frontend

Render/Railway
  ↓
Django API

Supabase
  ├── PostgreSQL
  ├── Storage
  └── Auth

xAI
  ↓
Grok API
```
