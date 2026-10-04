import React, { useState } from 'react'
import {
  Sparkles,
  Lock,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import {
  Breadcrumb,
  Badge,
  Button,
  Tabs,
  useToast,
} from '../../components'

export function AdminDashboardPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState('providers')

  const pendingVerification = [
    {
      id: 'hosp-req-1',
      name: 'Mediterranean Center for Orthopedics',
      country: 'Spain 🇪🇸',
      accreditation: 'ISO 9001 / JCI Audit Pending',
      specialty: 'Sports Arthroscopy & Joint Resurfacing',
      submittedDate: 'Oct 01, 2026',
      status: 'pending',
    },
    {
      id: 'hosp-req-2',
      name: 'Bangkok Specialty Cardio-Vascular Hospital',
      country: 'Thailand 🇹🇭',
      accreditation: 'JCI Gold Seal (Renewed 2026)',
      specialty: 'Interventional Cardiology & Electrophysiology',
      submittedDate: 'Oct 02, 2026',
      status: 'verified',
    },
  ]

  const handleApprove = (hospName) => {
    addToast({
      type: 'success',
      title: 'Provider Network Approved',
      message: `${hospName} is now authorized to receive patient cases on EthAum.`,
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 text-left">
      <Breadcrumb
        items={[
          { label: 'Marketplace', href: '/' },
          { label: 'Platform Administration', current: true },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-default)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--green-rich)]">
              System Governance & Oversight
            </span>
            <Badge variant="primary" size="sm">Admin Role</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[var(--text-primary)] font-medium">
            Platform Compliance & Security Console
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-primary)]/70 mt-1">
            Logged in as {user?.name || 'Administrator'} · Sovereign Healthcare Marketplace Operations
          </p>
        </div>

        <Badge variant="success" dot>All API Services Healthy</Badge>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-white rounded-[4px] border border-[var(--border-default)]">
          <span className="text-[10px] text-[var(--text-primary)]/50 uppercase font-medium block">Registered Patients</span>
          <strong className="text-xl text-[var(--text-primary)] font-medium">1,842</strong>
        </div>
        <div className="p-4 bg-white rounded-[4px] border border-[var(--border-default)]">
          <span className="text-[10px] text-[var(--text-primary)]/50 uppercase font-medium block">Verified Hospitals</span>
          <strong className="text-xl text-[var(--text-primary)] font-medium">48 Centers</strong>
        </div>
        <div className="p-4 bg-white rounded-[4px] border border-[var(--border-default)]">
          <span className="text-[10px] text-[var(--text-primary)]/50 uppercase font-medium block">Active Medical Cases</span>
          <strong className="text-xl text-[#2B5975] font-medium">129 In-Flight</strong>
        </div>
        <div className="p-4 bg-white rounded-[4px] border border-[var(--border-default)]">
          <span className="text-[10px] text-[var(--text-primary)]/50 uppercase font-medium block">AI Scans Processed</span>
          <strong className="text-xl text-[var(--green-rich)] font-medium">4,912 DICOM/PDF</strong>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'providers', label: 'Hospital Verifications & Audits', badge: '1 Pending' },
          { id: 'ai', label: 'Grok AI Service Telemetry' },
          { id: 'security', label: 'Audit Logs & Record Security' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'providers' && (
        <div className="bg-white rounded-[4px] border border-[var(--border-default)] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[var(--border-hairline)]">
            <h3 className="text-base font-medium text-[var(--text-primary)]">Hospital Network Onboarding Queue</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[var(--bg-base)] border-b border-[var(--border-hairline)] text-[var(--text-primary)] font-medium">
                <tr>
                  <th className="p-4 sm:px-6">Hospital Facility</th>
                  <th className="p-4">Accreditation Claim</th>
                  <th className="p-4">Primary Specialty</th>
                  <th className="p-4">Audit Status</th>
                  <th className="p-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF1EF]">
                {pendingVerification.map((hosp) => (
                  <tr key={hosp.id}>
                    <td className="p-4 sm:px-6 font-medium text-[var(--text-primary)]">
                      {hosp.name}
                      <span className="block text-[11px] font-normal text-[var(--text-primary)]/60">{hosp.country}</span>
                    </td>
                    <td className="p-4 text-[var(--text-primary)]/80">{hosp.accreditation}</td>
                    <td className="p-4 text-[var(--text-primary)]/80">{hosp.specialty}</td>
                    <td className="p-4">
                      {hosp.status === 'verified' ? (
                        <span className="text-[var(--green-rich)] font-medium bg-[#EBF5EE] px-2.5 py-0.5 rounded-full">
                          Verified
                        </span>
                      ) : (
                        <span className="text-[#B07D1E] font-medium bg-[#FEF7EA] px-2.5 py-0.5 rounded-full">
                          Awaiting JCI Verification
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {hosp.status === 'verified' ? (
                        <Button variant="ghost" size="sm" disabled>Approved</Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(hosp.name)}
                        >
                          Approve Partner
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="p-6 bg-white rounded-[4px] border border-[var(--border-default)] space-y-4 text-xs">
          <h3 className="text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--green-rich)]" /> Grok AI Boundary Guardrails
          </h3>
          <p className="text-[var(--text-primary)]/75 leading-relaxed">
            All AI operations are strictly restricted to non-clinical administrative tasks: document categorization, missing document alerting, and provider matching explanations.
          </p>
          <div className="p-4 bg-[var(--bg-elevated)]/40 rounded-[3px] border border-[var(--border-default)] space-y-1">
            <p className="font-medium text-[var(--text-primary)]">Diagnostic Guardrail Active:</p>
            <p className="text-[11px] text-[var(--text-primary)]/70">Zero clinical diagnoses or prescription recommendations generated across all active cases.</p>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="p-6 bg-white rounded-[4px] border border-[var(--border-default)] space-y-4 text-xs">
          <h3 className="text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[var(--green-rich)]" /> Immutable Audit Ledger
          </h3>
          <p className="text-[var(--text-primary)]/75">
            Every medical record view event is cryptographically timestamped and logged for patient review.
          </p>
        </div>
      )}
    </div>
  )
}

export default AdminDashboardPage
