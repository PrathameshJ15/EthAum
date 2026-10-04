-- ==============================================================================
-- EthAum Healthcare Coordination Platform
-- PostgreSQL Database Schema & Migration for Supabase
-- ==============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. USERS & PROFILES
-- Linked to Supabase Auth (auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- References auth.users(id) when using Supabase Auth
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('PATIENT', 'PROVIDER', 'ADMIN', 'patient', 'provider', 'admin')),
    name TEXT NOT NULL,
    phone TEXT,
    country TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for authentication lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ==============================================================================
-- 2. PATIENTS
-- Sovereign patient demographic and clinical summaries
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender TEXT,
    companion_traveling BOOLEAN DEFAULT false,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    medical_summary TEXT,
    allergies TEXT[] DEFAULT '{}',
    medical_conditions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);

-- ==============================================================================
-- 3. PROVIDERS (Hospitals & Medical Centers)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.providers (
    id TEXT PRIMARY KEY, -- e.g. 'apex-joint-delhi', 'horizon-bangkok' or UUID string
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    flag TEXT,
    accreditations TEXT[] DEFAULT '{}',
    tagline TEXT,
    overview TEXT NOT NULL,
    cover_image TEXT,
    logo TEXT,
    rating NUMERIC(3,2) DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    beds INTEGER,
    languages TEXT[] DEFAULT '{}',
    facilities TEXT[] DEFAULT '{}',
    international_support JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_providers_country ON public.providers(country);
CREATE INDEX IF NOT EXISTS idx_providers_slug ON public.providers(slug);

-- ==============================================================================
-- 4. DOCTORS (Surgeons & Clinical Specialists)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id TEXT NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    specialty TEXT NOT NULL,
    experience_years INTEGER DEFAULT 0,
    education TEXT NOT NULL,
    image TEXT,
    bio TEXT,
    qualifications TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_doctors_provider ON public.doctors(provider_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON public.doctors(specialty);

-- ==============================================================================
-- 5. TREATMENTS (Global Medical Procedures & Benchmark Pricing)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.treatments (
    id TEXT PRIMARY KEY, -- e.g. 'knee-replacement', 'cardiac-bypass'
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    short_description TEXT NOT NULL,
    long_description TEXT NOT NULL,
    starting_price_usd NUMERIC(10,2) NOT NULL,
    us_avg_price_usd NUMERIC(10,2),
    uk_avg_price_usd NUMERIC(10,2),
    savings_percentage INTEGER,
    hospital_stay_days TEXT NOT NULL,
    recovery_time_weeks TEXT NOT NULL,
    suitable_for TEXT[] DEFAULT '{}',
    top_destination_ids TEXT[] DEFAULT '{}',
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_treatments_category ON public.treatments(category);

-- ==============================================================================
-- 6. PROVIDER_TREATMENTS (Hospital Offerings & Negotiated Packaging)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.provider_treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id TEXT NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    treatment_id TEXT NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,
    price_usd NUMERIC(10,2) NOT NULL,
    inclusions TEXT[] DEFAULT '{}',
    wait_time_days INTEGER DEFAULT 7,
    success_rate NUMERIC(5,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(provider_id, treatment_id)
);

CREATE INDEX IF NOT EXISTS idx_provider_treatments_lookup ON public.provider_treatments(provider_id, treatment_id);

-- ==============================================================================
-- 7. CASES (Medical Coordination Cases & 12-Stage State Machine)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cases (
    id TEXT PRIMARY KEY, -- e.g. 'ET-8492' or UUID
    patient_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    treatment_id TEXT NOT NULL REFERENCES public.treatments(id),
    treatment_name TEXT NOT NULL,
    destination_id TEXT,
    destination_name TEXT,
    status TEXT NOT NULL CHECK (status IN (
        'DRAFT',
        'RECORDS_PENDING',
        'QUALIFICATION',
        'MATCHING',
        'QUOTES_RECEIVED',
        'PROVIDER_SELECTED',
        'CONSULTATION',
        'BOOKED',
        'TREATMENT',
        'AFTERCARE',
        'COMPLETED',
        'CANCELLED'
    )),
    journey_stage TEXT NOT NULL DEFAULT 'Submission',
    budget_min NUMERIC(10,2),
    budget_max NUMERIC(10,2),
    currency TEXT DEFAULT 'USD',
    preferred_date DATE,
    medical_history TEXT NOT NULL,
    patient_notes TEXT,
    selected_provider_id TEXT REFERENCES public.providers(id),
    selected_provider_name TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cases_patient ON public.cases(patient_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_provider ON public.cases(selected_provider_id);

-- ==============================================================================
-- 8. MEDICAL_RECORDS (Sovereign Medical Imaging, Pathology & Clinical Files)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    patient_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'MRI',
        'X-Ray',
        'CT',
        'Blood Reports',
        'Prescriptions',
        'Medical History',
        'Other',
        'CT Scan',
        'Blood Report'
    )),
    type TEXT NOT NULL,
    size TEXT,
    size_bytes BIGINT,
    storage_path TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Rejected', 'Flagged')),
    ai_status TEXT DEFAULT 'Processing' CHECK (ai_status IN ('Processing', 'Organized', 'Failed')),
    ai_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_medical_records_case ON public.medical_records(case_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_category ON public.medical_records(category);

-- ==============================================================================
-- 9. RECORD_PERMISSIONS (Patient-Controlled Explicit Provider Access Grants)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.record_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL REFERENCES public.medical_records(id) ON DELETE CASCADE,
    provider_id TEXT NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    granted_by TEXT NOT NULL, -- Patient User ID
    granted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMPTZ,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(record_id, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_permissions_record ON public.record_permissions(record_id);
CREATE INDEX IF NOT EXISTS idx_permissions_provider ON public.record_permissions(provider_id);
CREATE INDEX IF NOT EXISTS idx_permissions_status ON public.record_permissions(status);

-- ==============================================================================
-- 10. RECORD_ACCESS_LOGS (HIPAA/GDPR Auditable Immutable Access Logs)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.record_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL REFERENCES public.medical_records(id) ON DELETE CASCADE,
    accessed_by TEXT NOT NULL,
    access_role TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN (
        'VIEW',
        'DOWNLOAD',
        'UPLOAD',
        'SHARE_GRANTED',
        'SHARE_REVOKED'
    )),
    ip_address TEXT,
    user_agent TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_access_logs_record ON public.record_access_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_user ON public.record_access_logs(accessed_by);
CREATE INDEX IF NOT EXISTS idx_access_logs_action ON public.record_access_logs(action);

-- ==============================================================================
-- 11. QUOTES (Institutional Provider Price Quotations)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    provider_id TEXT NOT NULL REFERENCES public.providers(id),
    treatment_id TEXT NOT NULL REFERENCES public.treatments(id),
    price NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    inclusions TEXT[] DEFAULT '{}',
    estimated_stay_days INTEGER DEFAULT 5,
    valid_until TIMESTAMPTZ,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quotes_case ON public.quotes(case_id);
CREATE INDEX IF NOT EXISTS idx_quotes_provider ON public.quotes(provider_id);

-- ==============================================================================
-- 12. QUOTE_ITEMS (Itemized Quote Breakdown)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(10,2) NOT NULL,
    is_optional BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON public.quote_items(quote_id);

-- ==============================================================================
-- 13. APPOINTMENTS (Telehealth, Consultations & Pre-Op)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    patient_id TEXT NOT NULL,
    provider_id TEXT NOT NULL REFERENCES public.providers(id),
    doctor_id UUID REFERENCES public.doctors(id),
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'Telemedicine',
        'In-Person Consultation',
        'Pre-Op Assessment'
    )),
    date_time TIMESTAMPTZ NOT NULL,
    meeting_url TEXT,
    status TEXT DEFAULT 'Scheduled' CHECK (status IN (
        'Scheduled',
        'Confirmed',
        'Completed',
        'Cancelled'
    )),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_appointments_case ON public.appointments(case_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date_time);

-- ==============================================================================
-- 14. JOURNEY_EVENTS (Chronological Care Milestones)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.journey_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    stage TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_journey_events_case ON public.journey_events(case_id);

-- ==============================================================================
-- 15. CONVERSATIONS (Care Team Coordination Threads)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    participant_ids TEXT[] DEFAULT '{}',
    subject TEXT,
    last_message_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conversations_case ON public.conversations(case_id);

-- ==============================================================================
-- 16. MESSAGES (Encrypted Care Dialogue & File Attachments)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    content TEXT NOT NULL,
    attachments TEXT[] DEFAULT '{}',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);

-- ==============================================================================
-- 17. NOTIFICATIONS (Patient & Provider Actionable Alerts)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('INFO', 'SUCCESS', 'WARNING', 'ALERT')),
    link TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);

-- ==============================================================================
-- TRIGGERS: Automated updated_at Maintenance
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN
        SELECT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND column_name = 'updated_at'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
            CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();',
            tbl, tbl);
    END LOOP;
END;
$$;

-- ==============================================================================
-- SUPABASE STORAGE BUCKET CONFIGURATION
-- Private bucket for medical diagnostic files (MRI, X-Ray, CT, etc.)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'medical-records',
    'medical-records',
    false, -- STRICTLY PRIVATE
    52428800, -- 50 MB limit
    ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/dicom',
        'application/dicom',
        'application/octet-stream'
    ]
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 52428800;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Defense-in-depth policies for PostgreSQL
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. Public Catalogs (Treatments, Providers, Doctors) are readable by authenticated users
CREATE POLICY "Public Read Treatments" ON public.treatments FOR SELECT USING (true);
CREATE POLICY "Public Read Providers" ON public.providers FOR SELECT USING (true);
CREATE POLICY "Public Read Doctors" ON public.doctors FOR SELECT USING (true);

-- 2. Patient Cases: Patients can read their own cases
CREATE POLICY "Patients view own cases" ON public.cases
    FOR SELECT USING (
        patient_id = auth.uid()::text
        OR auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'role' = 'ADMIN'
    );

-- 3. Medical Records: Patient owns their records, or active permission granted to provider
CREATE POLICY "Patients view own medical records" ON public.medical_records
    FOR SELECT USING (
        patient_id = auth.uid()::text
        OR EXISTS (
            SELECT 1 FROM public.record_permissions rp
            WHERE rp.record_id = public.medical_records.id
              AND rp.provider_id = (auth.jwt() ->> 'provider_id')
              AND rp.status = 'ACTIVE'
        )
        OR auth.jwt() ->> 'role' IN ('admin', 'ADMIN')
    );

-- 4. Service Role Override
-- Server-side Express backend using SUPABASE_SERVICE_ROLE_KEY bypasses RLS directly.
