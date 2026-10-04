import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'

import { Navbar, Footer, ToastProvider } from './components'
import { CreateCaseModal } from './components/common/CreateCaseModal'
import { LoginModal } from './components/common/LoginModal'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ProtectedRoute } from './routes/ProtectedRoute'

// Public Pages
import { HomePage } from './pages/HomePage'
import { TreatmentsPage } from './pages/TreatmentsPage'
import { TreatmentDetailPage } from './pages/TreatmentDetailPage'
import { ProvidersPage } from './pages/ProvidersPage'
import { ProviderDetailPage } from './pages/ProviderDetailPage'
import { DestinationsPage } from './pages/DestinationsPage'
import { DestinationDetailPage } from './pages/DestinationDetailPage'
import { HowItWorksPage } from './pages/HowItWorksPage'

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'

// Protected Portal Pages
import { PatientDashboardPage } from './pages/patient/PatientDashboardPage'
import { CreateCasePage } from './pages/patient/CreateCasePage'
import { CaseDetailPage } from './pages/patient/CaseDetailPage'
import { CaseRecordsPage } from './pages/patient/CaseRecordsPage'
import { ProviderPortalPage } from './pages/provider/ProviderPortalPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'

// Automatically scrolls to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

function MainLayout() {
  const [caseModalOpen, setCaseModalOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [selectedTreatmentId, setSelectedTreatmentId] = useState('')
  const navigate = useNavigate()

  const handleOpenCreateCase = (treatmentId = '') => {
    if (treatmentId) {
      setSelectedTreatmentId(treatmentId)
      setCaseModalOpen(true)
    } else {
      navigate('/create-case')
    }
  }

  const handleOpenLogin = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-[var(--green-rich)] selection:text-[var(--text-inverse)] transition-colors duration-200">
      <ScrollToTop />

      {/* Global Sticky Navbar */}
      <Navbar
        brandName="EthAum"
        brandLogo="/logo.png"
        tagline="Global Care. Closer to You."
        onCreateCase={() => handleOpenCreateCase('')}
        onLogin={handleOpenLogin}
      />

      {/* Main Content View with Routes */}
      <main className="flex-1">
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<HomePage onCreateCase={handleOpenCreateCase} />} />
          <Route path="/treatments" element={<TreatmentsPage onCreateCase={handleOpenCreateCase} />} />
          <Route path="/treatments/:id" element={<TreatmentDetailPage onCreateCase={handleOpenCreateCase} />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/providers/:id" element={<ProviderDetailPage onCreateCase={handleOpenCreateCase} />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/destinations/:id" element={<DestinationDetailPage onCreateCase={handleOpenCreateCase} />} />
          <Route path="/how-it-works" element={<HowItWorksPage onCreateCase={handleOpenCreateCase} />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Patient Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-case"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <CreateCasePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases/:id/records"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <CaseRecordsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases/:id"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <CaseDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases/*"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <CaseDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Provider Protected Routes */}
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderPortalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderPortalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/*"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderPortalPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<HomePage onCreateCase={handleOpenCreateCase} />} />
        </Routes>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Quick Intake Modal */}
      <CreateCaseModal
        isOpen={caseModalOpen}
        onClose={() => setCaseModalOpen(false)}
        initialTreatment={selectedTreatmentId}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <MainLayout />
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
}
