import React from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ShieldAlert, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, LoadingSkeleton } from '../components'

export function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, isAuthenticated, isLoading, role } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-6">
        <LoadingSkeleton variant="title" />
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="text" count={4} />
      </div>
    )
  }

  // Not logged in -> redirect to login with saved location
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Role check
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const defaultHome =
      role === 'provider'
        ? '/provider/dashboard'
        : role === 'admin'
        ? '/admin'
        : '/dashboard'

    return (
      <div className="max-w-xl mx-auto px-6 py-16 text-center space-y-6">
        <div className="w-12 h-12 rounded-[3px] bg-red-950/20 border border-red-900/40 text-red-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6 stroke-[1.75]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-light text-[var(--text-primary)]">
            Access Restricted to {allowedRoles.map((r) => r.toUpperCase()).join(' or ')}
          </h2>
          <p className="text-xs sm:text-sm font-light text-[var(--text-secondary)] font-sans max-w-md mx-auto leading-relaxed">
            You are signed in as <strong className="text-[var(--text-primary)]">{user?.name}</strong> with the <strong className="text-[var(--text-primary)]">{role?.toUpperCase()}</strong> role. You do not have permissions to view this protected section.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate(defaultHome)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Go to Your {role?.toUpperCase()} Portal
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate('/')}
          >
            Return to Marketplace
          </Button>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
