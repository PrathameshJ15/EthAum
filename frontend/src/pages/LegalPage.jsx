import React from 'react'
import { Shield, Lock, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import { Breadcrumb } from '../components'
import { Link } from 'react-router-dom'

export function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-10 text-left">
      <Breadcrumb
        items={[
          { label: 'EthAum', href: '/' },
          { label: 'Privacy Policy', current: true },
        ]}
      />

      <div className="space-y-4 border-b border-[var(--border-hairline)] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--green-soft)]/20 text-[var(--green-rich)] text-xs font-medium rounded-full">
          <Shield className="w-3.5 h-3.5" />
          <span>Patient Data Sovereignty Standard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-light text-[var(--text-primary)]">
          Privacy Policy & Data Sovereignty
        </h1>
        <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed max-w-2xl">
          EthAum was built on the core principle that patients own their medical records. We act solely as a secure coordination conduit — never a data broker.
        </p>
      </div>

      <div className="space-y-8 text-sm font-light text-[var(--text-secondary)] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-medium text-[var(--text-primary)] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[var(--green-rich)]" />
            1. Sovereign Patient Control
          </h2>
          <p>
            All diagnostic documents, imaging scans (DICOM, MRI, CT, X-Ray), lab reports, and clinical notes uploaded to your EthAum case remain under your explicit control. Hospital providers and clinical panels cannot view, query, or download your records until you explicitly toggle permission for that specific institution.
          </p>
          <p>
            You may revoke access to any provider at any time with immediate effect. Revocation instantly invalidates the provider&apos;s time-limited signed access URLs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-medium text-[var(--text-primary)] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--green-rich)]" />
            2. Immutable Access Audit Ledger
          </h2>
          <p>
            Every access event — including document views, download URL generation, permission grants, and revocations — is permanently recorded in our cryptographic access audit ledger. Patients can inspect the full ledger directly in their Case Dossier under the &quot;Access Audit Ledger&quot; tab.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-medium text-[var(--text-primary)] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--green-rich)]" />
            3. AI Safety & Clinical De-Identification
          </h2>
          <p>
            EthAum employs AI solely for administrative coordination tasks: document classification, identifying missing pre-operative diagnostic tests, and generating unbiased institutional quote summaries.
          </p>
          <p>
            Text processed by our backend AI pipelines is stripped of direct personal identifiers (email addresses, phone numbers, government ID numbers) before extraction. Furthermore, our AI models are restricted from rendering clinical diagnoses, prescribing treatments, or modifying patient medical history.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-medium text-[var(--text-primary)] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--green-rich)]" />
            4. Zero Commercial Data Brokering
          </h2>
          <p>
            We do not sell, rent, monetize, or license patient data to insurance companies, advertising networks, pharmaceutical manufacturers, or commercial data aggregators. Data stored on EthAum exists exclusively to facilitate cross-border care delivery between you and your chosen accredited medical centers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-medium text-[var(--text-primary)] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[var(--green-rich)]" />
            5. International Standards Compliance
          </h2>
          <p>
            EthAum adheres to Health Insurance Portability and Accountability Act (HIPAA) security guidelines for Electronic Protected Health Information (ePHI) and the European Union General Data Protection Regulation (GDPR) for data privacy and sovereign subject rights.
          </p>
        </section>
      </div>

      <div className="pt-8 border-t border-[var(--border-hairline)] flex items-center justify-between">
        <Link to="/terms" className="inline-flex items-center gap-2 text-xs text-[var(--green-rich)] hover:underline">
          <span>Read Terms of Service</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <span className="text-xs text-[var(--text-muted)]">Effective Date: October 2026</span>
      </div>
    </div>
  )
}

export function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-10 text-left">
      <Breadcrumb
        items={[
          { label: 'EthAum', href: '/' },
          { label: 'Terms of Service', current: true },
        ]}
      />

      <div className="space-y-4 border-b border-[var(--border-hairline)] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FEF7EA] text-[#B07D1E] text-xs font-medium rounded-full">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Clinical & Platform Terms</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-light text-[var(--text-primary)]">
          Terms of Service & Clinical Disclaimer
        </h1>
        <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed max-w-2xl">
          Please review the terms governing your use of the EthAum international healthcare coordination platform.
        </p>
      </div>

      <div className="space-y-8 text-sm font-light text-[var(--text-secondary)] leading-relaxed">
        <section className="space-y-3 p-4 bg-[var(--bg-elevated)]/40 rounded-[4px] border border-[var(--border-default)]">
          <h2 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#B07D1E]" />
            Medical Disclaimer & Emergency Notice
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            <strong>EthAum is not a hospital, clinic, or direct medical provider.</strong> We do not practice medicine, offer clinical diagnoses, prescribe medications, or render medical opinions. If you are experiencing a medical emergency, please call your local emergency service (e.g., 911, 112, or 999) or visit the nearest emergency room immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-medium text-[var(--text-primary)] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--green-rich)]" />
            1. Nature of the Platform
          </h2>
          <p>
            EthAum provides an AI-enabled technological coordination marketplace designed to help international patients organize their health records, request itemized quotes from independently accredited hospitals (JCI/NABH/TMC), schedule consultations, and manage medical travel logistics.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-medium text-[var(--text-primary)] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--green-rich)]" />
            2. Hospital & Physician Responsibility
          </h2>
          <p>
            All healthcare procedures, pre-operative clearances, surgical interventions, and post-operative aftercare are delivered solely by licensed, independent hospitals and certified medical practitioners. EthAum does not guarantee surgical outcomes or clinical efficacy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-medium text-[var(--text-primary)] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[var(--green-rich)]" />
            3. Quotations & Financial Transparency
          </h2>
          <p>
            Quotations provided through EthAum represent itemized pre-admission estimates submitted by participating medical centers based on the preliminary clinical records you submit. In the event that intra-operative complications or unforeseen clinical findings arise during admission, final hospital charges may vary according to institutional policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-medium text-[var(--text-primary)] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--green-rich)]" />
            4. User Responsibilities
          </h2>
          <p>
            You agree to provide accurate, authentic, and complete medical records and medical history. Falsifying medical documentation or withholding clinical conditions compromises surgical safety and violates the terms of this platform.
          </p>
        </section>
      </div>

      <div className="pt-8 border-t border-[var(--border-hairline)] flex items-center justify-between">
        <Link to="/privacy" className="inline-flex items-center gap-2 text-xs text-[var(--green-rich)] hover:underline">
          <span>Read Privacy Policy</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <span className="text-xs text-[var(--text-muted)]">Effective Date: October 2026</span>
      </div>
    </div>
  )
}
