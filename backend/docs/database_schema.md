# EthAum Database Schema & Supabase Architecture

This document describes the complete relational data architecture, Row Level Security (RLS) model, Supabase Auth integration, and Supabase Storage structure for the **EthAum Healthcare Coordination Platform**.

---

## 1. System Overview

- **Database Engine**: PostgreSQL 15+ (Hosted on Supabase)
- **Authentication**: Supabase Auth (`auth.users`) mapped to sovereign application profiles
- **Object Storage**: Private bucket `medical-records` with time-limited signed URLs
- **Access Control**: Patient-sovereignty model with explicit provider grants, permission revocations, and HIPAA/GDPR-compliant access audit logging.

---

## 2. Entity Relationship Overview

```
                                  +-------------------+
                                  |    auth.users     | (Supabase Auth)
                                  +---------+---------+
                                            | (1:1)
                                            v
                                  +-------------------+
                                  |   public.users    |
                                  +----+----+----+----+
                                       |    |    |
                   +-------------------+    |    +-------------------+
                   | (1:1)                  | (1:N)                  | (1:N)
                   v                        v                        v
            +--------------+        +---------------+        +---------------+
            |   patients   |        |   providers   |        |    doctors    |
            +------+-------+        +---+-------+---+        +---------------+
                   |                    |       |
                   | (1:N)              | (1:N) | (1:N)
                   v                    v       v
            +--------------+        +-------+ +--------------------+
            |    cases     |<-------+quotes | |provider_treatments |
            +------+-------+        +---+---+ +--------------------+
                   |                    | (1:N)
                   | (1:N)              v
                   |                +-----------+
                   |                |quote_items|
                   |                +-----------+
                   +------------------------------+
                   | (1:N)                        | (1:N)
                   v                              v
        +----------------------+        +-------------------+
        |   medical_records    |        |   appointments    |
        +----+------------+----+        +-------------------+
             |            |
       (1:N) |            | (1:N)
             v            v
  +------------------+  +--------------------+
  |record_permissions|  | record_access_logs |
  +------------------+  +--------------------+
```

---

## 3. Relational Table Specifications

### 1. `users`
Central user profile table linking Supabase Auth identities with application roles.
- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `auth_user_id` (UUID, UNIQUE) - Foreign key referencing `auth.users(id)`
- `email` (TEXT, UNIQUE, NOT NULL)
- `role` (TEXT, NOT NULL) - Constraint: `CHECK (role IN ('PATIENT', 'PROVIDER', 'ADMIN', 'patient', 'provider', 'admin'))`
- `name` (TEXT, NOT NULL)
- `phone` (TEXT)
- `country` (TEXT)
- `avatar_url` (TEXT)
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)

### 2. `patients`
Sovereign medical and travel attributes of registered patients.
- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `user_id` (UUID, NOT NULL, FK `users.id` ON DELETE CASCADE)
- `date_of_birth` (DATE)
- `gender` (TEXT)
- `companion_traveling` (BOOLEAN, DEFAULT `false`)
- `emergency_contact_name` (TEXT)
- `emergency_contact_phone` (TEXT)
- `medical_summary` (TEXT)
- `allergies` (TEXT[], DEFAULT `'{}'`)
- `medical_conditions` (TEXT[], DEFAULT `'{}'`)
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)

### 3. `providers`
Globally accredited hospitals and clinical centers.
- `id` (TEXT, PK) - Unique slug/identifier (e.g. `apex-joint-delhi`)
- `user_id` (UUID, FK `users.id` ON DELETE SET NULL)
- `name` (TEXT, NOT NULL)
- `slug` (TEXT, UNIQUE, NOT NULL)
- `city` (TEXT, NOT NULL)
- `country` (TEXT, NOT NULL)
- `flag` (TEXT)
- `accreditations` (TEXT[], DEFAULT `'{}'`) - e.g. JCI, NABH, ISO
- `tagline` (TEXT)
- `overview` (TEXT, NOT NULL)
- `cover_image` (TEXT)
- `logo` (TEXT)
- `rating` (NUMERIC(3,2), DEFAULT `5.00`)
- `review_count` (INTEGER, DEFAULT `0`)
- `beds` (INTEGER)
- `languages` (TEXT[], DEFAULT `'{}'`)
- `facilities` (TEXT[], DEFAULT `'{}'`)
- `international_support` (JSONB, DEFAULT `'{}'::jsonb`) - Concierge, visa, translation
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)

### 4. `doctors`
Surgeons and accredited clinical specialists.
- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `provider_id` (TEXT, NOT NULL, FK `providers.id` ON DELETE CASCADE)
- `user_id` (UUID, FK `users.id` ON DELETE SET NULL)
- `name` (TEXT, NOT NULL)
- `title` (TEXT, NOT NULL)
- `specialty` (TEXT, NOT NULL)
- `experience_years` (INTEGER, DEFAULT `0`)
- `education` (TEXT, NOT NULL)
- `image` (TEXT)
- `bio` (TEXT)
- `qualifications` (TEXT[], DEFAULT `'{}'`)
- `languages` (TEXT[], DEFAULT `'{}'`)
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)

### 5. `treatments`
Standardized procedure catalog with international cost benchmarks.
- `id` (TEXT, PK) - e.g. `knee-replacement`, `cardiac-bypass`
- `name` (TEXT, NOT NULL)
- `category` (TEXT, NOT NULL) - Orthopedics, Cardiology, Dental, etc.
- `short_description` (TEXT, NOT NULL)
- `long_description` (TEXT, NOT NULL)
- `starting_price_usd` (NUMERIC(10,2), NOT NULL)
- `us_avg_price_usd` (NUMERIC(10,2))
- `uk_avg_price_usd` (NUMERIC(10,2))
- `savings_percentage` (INTEGER)
- `hospital_stay_days` (TEXT, NOT NULL)
- `recovery_time_weeks` (TEXT, NOT NULL)
- `suitable_for` (TEXT[], DEFAULT `'{}'`)
- `top_destination_ids` (TEXT[], DEFAULT `'{}'`)
- `image` (TEXT)
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)

### 6. `provider_treatments`
Negotiated hospital packaging and pricing for specific procedures.
- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `provider_id` (TEXT, NOT NULL, FK `providers.id` ON DELETE CASCADE)
- `treatment_id` (TEXT, NOT NULL, FK `treatments.id` ON DELETE CASCADE)
- `price_usd` (NUMERIC(10,2), NOT NULL)
- `inclusions` (TEXT[], DEFAULT `'{}'`)
- `wait_time_days` (INTEGER, DEFAULT `7`)
- `success_rate` (NUMERIC(5,2))
- `notes` (TEXT)
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)
- **Constraint**: `UNIQUE(provider_id, treatment_id)`

### 7. `cases`
Cross-border medical case dossiers and 12-stage state machine tracking.
- `id` (TEXT, PK) - e.g. `ET-8492`
- `patient_id` (TEXT, NOT NULL)
- `patient_name` (TEXT, NOT NULL)
- `treatment_id` (TEXT, NOT NULL, FK `treatments.id`)
- `treatment_name` (TEXT, NOT NULL)
- `destination_id` (TEXT)
- `destination_name` (TEXT)
- `status` (TEXT, NOT NULL) - Constraint: `CHECK (status IN ('DRAFT', 'RECORDS_PENDING', 'QUALIFICATION', 'MATCHING', 'QUOTES_RECEIVED', 'PROVIDER_SELECTED', 'CONSULTATION', 'BOOKED', 'TREATMENT', 'AFTERCARE', 'COMPLETED', 'CANCELLED'))`
- `journey_stage` (TEXT, DEFAULT `'Submission'`)
- `budget_min` (NUMERIC(10,2))
- `budget_max` (NUMERIC(10,2))
- `currency` (TEXT, DEFAULT `'USD'`)
- `preferred_date` (DATE)
- `medical_history` (TEXT, NOT NULL)
- `patient_notes` (TEXT)
- `selected_provider_id` (TEXT, FK `providers.id`)
- `selected_provider_name` (TEXT)
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)

### 8. `medical_records`
Patient-owned diagnostic files and imaging metadata.
- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `case_id` (TEXT, NOT NULL, FK `cases.id` ON DELETE CASCADE)
- `patient_id` (TEXT, NOT NULL)
- `name` (TEXT, NOT NULL)
- `category` (TEXT, NOT NULL) - Constraint: `CHECK (category IN ('MRI', 'X-Ray', 'CT', 'Blood Reports', 'Prescriptions', 'Medical History', 'Other', 'CT Scan', 'Blood Report'))`
- `type` (TEXT, NOT NULL)
- `size` (TEXT)
- `size_bytes` (BIGINT)
- `storage_path` (TEXT, NOT NULL) - Path in `medical-records` storage bucket
- `status` (TEXT, DEFAULT `'Pending'`) - Constraint: `CHECK (status IN ('Pending', 'Verified', 'Rejected', 'Flagged'))`
- `ai_status` (TEXT, DEFAULT `'Processing'`) - Constraint: `CHECK (ai_status IN ('Processing', 'Organized', 'Failed'))`
- `ai_summary` (TEXT)
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)

### 9. `record_permissions`
Patient-controlled explicit provider access permissions.
- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `record_id` (UUID, NOT NULL, FK `medical_records.id` ON DELETE CASCADE)
- `provider_id` (TEXT, NOT NULL, FK `providers.id` ON DELETE CASCADE)
- `granted_by` (TEXT, NOT NULL) - Patient ID
- `granted_at` (TIMESTAMPTZ, NOT NULL)
- `expires_at` (TIMESTAMPTZ)
- `status` (TEXT, DEFAULT `'ACTIVE'`) - Constraint: `CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED'))`
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)
- **Constraint**: `UNIQUE(record_id, provider_id)`

### 10. `record_access_logs`
Immutable HIPAA and GDPR audit logs for every sensitive medical access.
- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `record_id` (UUID, NOT NULL, FK `medical_records.id` ON DELETE CASCADE)
- `accessed_by` (TEXT, NOT NULL) - User ID
- `access_role` (TEXT, NOT NULL) - `patient`, `provider`, `admin`
- `action` (TEXT, NOT NULL) - Constraint: `CHECK (action IN ('VIEW', 'DOWNLOAD', 'UPLOAD', 'SHARE_GRANTED', 'SHARE_REVOKED'))`
- `ip_address` (TEXT)
- `user_agent` (TEXT)
- `details` (JSONB, DEFAULT `'{}'::jsonb`)
- `timestamp` (TIMESTAMPTZ, NOT NULL)

### 11. `quotes`
Official hospital treatment packages.
- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `case_id` (TEXT, NOT NULL, FK `cases.id` ON DELETE CASCADE)
- `provider_id` (TEXT, NOT NULL, FK `providers.id`)
- `treatment_id` (TEXT, NOT NULL, FK `treatments.id`)
- `price` (NUMERIC(10,2), NOT NULL)
- `currency` (TEXT, DEFAULT `'USD'`)
- `inclusions` (TEXT[], DEFAULT `'{}'`)
- `estimated_stay_days` (INTEGER, DEFAULT `5`)
- `valid_until` (TIMESTAMPTZ)
- `status` (TEXT, DEFAULT `'PENDING'`) - `PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)

### 12. `quote_items`
Itemized financial breakdowns for transparent healthcare budgeting.
- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `quote_id` (UUID, NOT NULL, FK `quotes.id` ON DELETE CASCADE)
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `amount` (NUMERIC(10,2), NOT NULL)
- `is_optional` (BOOLEAN, DEFAULT `false`)
- `created_at` (TIMESTAMPTZ, NOT NULL)

### 13. `appointments`
Telemedicine consultations and scheduled hospital visits.
- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `case_id` (TEXT, NOT NULL, FK `cases.id` ON DELETE CASCADE)
- `patient_id` (TEXT, NOT NULL)
- `provider_id` (TEXT, NOT NULL, FK `providers.id`)
- `doctor_id` (UUID, FK `doctors.id`)
- `title` (TEXT, NOT NULL)
- `type` (TEXT, NOT NULL) - `Telemedicine`, `In-Person Consultation`, `Pre-Op Assessment`
- `date_time` (TIMESTAMPTZ, NOT NULL)
- `meeting_url` (TEXT)
- `status` (TEXT, DEFAULT `'Scheduled'`) - `Scheduled`, `Confirmed`, `Completed`, `Cancelled`
- `notes` (TEXT)
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)

### 14. `journey_events`
Chronological milestone events for patient dashboard progression.
- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `case_id` (TEXT, NOT NULL, FK `cases.id` ON DELETE CASCADE)
- `stage` (TEXT, NOT NULL)
- `title` (TEXT, NOT NULL)
- `description` (TEXT, NOT NULL)
- `actor_role` (TEXT, NOT NULL)
- `timestamp` (TIMESTAMPTZ, NOT NULL)

### 15. `conversations`
Care team coordination chat threads.
- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `case_id` (TEXT, NOT NULL, FK `cases.id` ON DELETE CASCADE)
- `participant_ids` (TEXT[], DEFAULT `'{}'`)
- `subject` (TEXT)
- `last_message_at` (TIMESTAMPTZ, NOT NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)

### 16. `messages`
Individual communications within care threads.
- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `conversation_id` (UUID, NOT NULL, FK `conversations.id` ON DELETE CASCADE)
- `sender_id` (TEXT, NOT NULL)
- `sender_name` (TEXT, NOT NULL)
- `sender_role` (TEXT, NOT NULL)
- `content` (TEXT, NOT NULL)
- `attachments` (TEXT[], DEFAULT `'{}'`)
- `read` (BOOLEAN, DEFAULT `false`)
- `created_at` (TIMESTAMPTZ, NOT NULL)

### 17. `notifications`
Actionable notifications for patients and clinical coordinators.
- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `user_id` (TEXT, NOT NULL)
- `title` (TEXT, NOT NULL)
- `message` (TEXT, NOT NULL)
- `type` (TEXT, NOT NULL) - `INFO`, `SUCCESS`, `WARNING`, `ALERT`
- `link` (TEXT)
- `read` (BOOLEAN, DEFAULT `false`)
- `created_at` (TIMESTAMPTZ, NOT NULL)

---

## 4. Supabase Storage Architecture

### Private Bucket: `medical-records`
- **Visibility**: Strictly `public = false`.
- **Max File Size**: 50 MB (`52,428,800` bytes).
- **Allowed MIME Types**: `application/pdf`, `image/jpeg`, `image/png`, `image/dicom`, `application/dicom`, `application/octet-stream`.

### Storage Path Scheme
Files are partitioned hierarchically by patient ID and case dossier:
```
patients/{patientId}/cases/{caseId}/{timestamp}_{fileName}
```

### Access Lifecycle:
1. **Upload Request**: Patient client calls `POST /api/v1/medical-records/upload-url`. Backend verifies session, generates a signed upload URL (15-minute TTL) via Supabase Storage, and registers the pending record.
2. **Direct Upload**: Client PUTs the file bytes directly to the signed upload URL without overloading API servers.
3. **Authorized Download**: Clinician or patient requests `GET /api/v1/medical-records/:id/download-url`. Backend verifies access permissions, generates a short-lived signed download URL (1-hour TTL), and writes an immutable audit record to `record_access_logs`.

---

## 5. Row Level Security & Defense-in-Depth

The database enforces policies:
- `users`: Authenticated users can read/modify their own profile.
- `cases`: Patients can only read their own cases; Admins have read audit access.
- `medical_records`: Records are accessible only if the user is the owning patient, OR if an `ACTIVE` permission row exists in `record_permissions` matching the requesting provider, OR if the user is an authorized `admin`.
- `record_access_logs`: Append-only table for auditable events.

Server-side queries executed by the Node.js Express backend utilize `SUPABASE_SERVICE_ROLE_KEY`, which safely bypasses RLS for coordinated domain logic while object-level security is enforced in `backend/src/middleware/recordAuth.ts`.

---

## 6. How to Run Migrations

To apply the schema to a Supabase PostgreSQL instance:

### Option A: Supabase Dashboard
1. Open your Supabase project dashboard at `https://supabase.com/dashboard/project/<PROJECT_REF>`.
2. Navigate to **SQL Editor**.
3. Copy the contents of [`backend/supabase/migrations/20261004000000_init_schema.sql`](file:///c:/Users/jadha/OneDrive/Desktop/EthAum/backend/supabase/migrations/20261004000000_init_schema.sql).
4. Click **Run**.

### Option B: Supabase CLI
```bash
# Link your local project
supabase link --project-ref <PROJECT_REF>

# Push the migration
supabase db push
```
