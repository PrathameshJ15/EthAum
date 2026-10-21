-- ==============================================================================
-- EthAum Healthcare Coordination Platform
-- Migration: 20261020000000_create_payments_schema.sql
-- Description: Secure Payment Gateway Tables, Webhook Idempotency & RLS Policies
-- ==============================================================================

-- 1. PAYMENTS TABLE
-- Records consultation fees, booking deposits, and hospital escrow transactions
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id TEXT UNIQUE NOT NULL, -- Internal EthAum reference e.g. 'PAY-ET-8492-XXXX'
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    patient_id TEXT NOT NULL,
    patient_name TEXT,
    case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    booking_id TEXT,
    appointment_id TEXT,
    provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe', 'mock')),
    provider_order_id TEXT,       -- e.g. 'order_xxxx' (Razorpay) or 'cs_test_xxxx' (Stripe)
    provider_payment_id TEXT,     -- e.g. 'pay_xxxx' (Razorpay) or 'pi_xxxx' (Stripe)
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED')),
    purpose TEXT NOT NULL CHECK (purpose IN ('CONSULTATION_FEE', 'TREATMENT_DEPOSIT', 'HOSPITAL_ADMISSION', 'SECOND_OPINION')),
    idempotency_key TEXT UNIQUE,
    receipt_url TEXT,
    failure_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    refund_status TEXT DEFAULT 'NONE' CHECK (refund_status IN ('NONE', 'PARTIAL', 'FULL', 'REQUESTED')),
    refunded_amount NUMERIC(10, 2) DEFAULT 0.00 CHECK (refunded_amount >= 0),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance and reconciliation queries
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient_id ON public.payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_case_id ON public.payments(case_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_order_id ON public.payments(provider_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_payment_id ON public.payments(provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- 2. PAYMENT WEBHOOK EVENTS TABLE
-- Guarantees webhook idempotency and maintains immutable delivery logs
CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE NOT NULL, -- Provider event ID (e.g. 'evt_xxxx')
    provider TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PROCESSED', 'IGNORED', 'FAILED')),
    processed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_id ON public.payment_webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_provider ON public.payment_webhook_events(provider);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;

-- Patients can only view payments related to their own cases
CREATE POLICY "Patients view own payments" ON public.payments
    FOR SELECT USING (
        patient_id = auth.uid()::text
        OR auth.jwt() ->> 'role' IN ('admin', 'ADMIN')
    );

-- Providers can view payments for cases associated with their hospital
CREATE POLICY "Providers view associated case payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.cases c
            WHERE c.id = public.payments.case_id
              AND c.selected_provider_id = (auth.jwt() ->> 'provider_id')
        )
        OR auth.jwt() ->> 'role' IN ('admin', 'ADMIN')
    );

-- Only service role / backend admin can insert or update payments and webhooks
CREATE POLICY "Service role manages payments" ON public.payments
    FOR ALL USING (auth.jwt() ->> 'role' IN ('service_role', 'admin', 'ADMIN'));

CREATE POLICY "Service role manages webhook events" ON public.payment_webhook_events
    FOR ALL USING (auth.jwt() ->> 'role' IN ('service_role', 'admin', 'ADMIN'));
