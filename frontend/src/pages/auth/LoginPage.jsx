import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  User,
  Building2,
  Shield,
  AlertCircle,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { useToast, BackgroundGrid } from '../../components'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/forms/Input'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, switchDemoRole } = useAuth()
  const { addToast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect target if intercepted by ProtectedRoute
  const destination = location.state?.from?.pathname

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please provide both your email address and password.')
      return
    }

    setIsSubmitting(true)
    try {
      const loggedInUser = await login(email, password)
      addToast({
        type: 'success',
        title: 'Authentication Confirmed',
        message: `Welcome back, ${loggedInUser.name}.`,
      })

      // Navigate to destination or role-based default
      if (destination) {
        navigate(destination, { replace: true })
      } else if (loggedInUser.role === 'provider') {
        navigate('/provider/dashboard', { replace: true })
      } else if (loggedInUser.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Quick fill helper for review and evaluation
  const handleQuickFill = async (targetRole) => {
    setError('')
    try {
      const user = await switchDemoRole(targetRole)
      addToast({
        type: 'success',
        title: `${targetRole.toUpperCase()} Session Started`,
        message: `Signed in as ${user.name}`,
      })

      if (targetRole === 'provider') {
        navigate('/provider/dashboard', { replace: true })
      } else if (targetRole === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12 text-left">
      <BackgroundGrid mask="radial" opacityClass="opacity-[0.07] dark:opacity-[0.09]" />

      <div className="relative w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <img
                src="/logo.png"
                alt="EthAum"
                className="w-12 h-12 object-contain transition-transform group-hover:scale-105"
              />
            </Link>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[3px] bg-[var(--bg-elevated)] border border-[var(--border-hairline)] text-xs font-normal text-[var(--green-rich)] font-sans">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted Healthcare Authentication</span>
          </div>
          <h1 className="text-3xl font-serif font-light text-[var(--text-primary)] tracking-tight">
            Sign In to EthAum
          </h1>
          <p className="text-xs sm:text-sm font-light text-[var(--text-secondary)] font-sans">
            Access your patient dossier, hospital quote inbox, or compliance desk.
          </p>
        </div>

        {/* Demo Role Fast-Switcher Pill Selector */}
        <div className="p-3 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] space-y-2 text-xs">
          <span className="text-[10px] font-normal text-[var(--text-muted)] uppercase tracking-wider block font-sans">
            Demo Quick Login by Role:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('patient')}
              className="p-2 rounded-xl bg-[#F8F8F5] dark:bg-[#151C1A] border border-[#EEF1EF] dark:border-[#2B3834] hover:border-[#173E39] dark:hover:border-[#6F9F91] hover:bg-[#E6EFEB]/60 dark:hover:bg-[#202B28] transition-all text-center cursor-pointer"
            >
              <User className="w-4 h-4 mx-auto text-[#315B55] dark:text-[#6F9F91] mb-1" />
              <span className="font-semibold block text-[#172321] dark:text-[#F2F4F1]">Patient</span>
              <span className="text-[10px] text-[#172321]/50 dark:text-[#89938F]">Eleanor V.</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('provider')}
              className="p-2 rounded-xl bg-[#F8F8F5] dark:bg-[#151C1A] border border-[#EEF1EF] dark:border-[#2B3834] hover:border-[#173E39] dark:hover:border-[#6F9F91] hover:bg-[#E6EFEB]/60 dark:hover:bg-[#202B28] transition-all text-center cursor-pointer"
            >
              <Building2 className="w-4 h-4 mx-auto text-[#315B55] dark:text-[#6F9F91] mb-1" />
              <span className="font-semibold block text-[#172321] dark:text-[#F2F4F1]">Provider</span>
              <span className="text-[10px] text-[#172321]/50 dark:text-[#89938F]">Dr. Oberoi</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="p-2 rounded-xl bg-[#F8F8F5] dark:bg-[#151C1A] border border-[#EEF1EF] dark:border-[#2B3834] hover:border-[#173E39] dark:hover:border-[#6F9F91] hover:bg-[#E6EFEB]/60 dark:hover:bg-[#202B28] transition-all text-center cursor-pointer"
            >
              <Shield className="w-4 h-4 mx-auto text-[#315B55] dark:text-[#6F9F91] mb-1" />
              <span className="font-semibold block text-[#172321] dark:text-[#F2F4F1]">Admin</span>
              <span className="text-[10px] text-[#172321]/50 dark:text-[#89938F]">Compliance</span>
            </button>
          </div>
        </div>

        {/* Main Login Form */}
        <div className="bg-white dark:bg-[#1A2421] p-6 sm:p-8 rounded-3xl border border-[#E5E7E4] dark:border-[#2B3834] shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-[#FDF2F2] dark:bg-red-950/30 border border-[#F5D4D4] dark:border-red-900/50 flex items-start gap-2.5 text-xs text-[#A33B39] dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="patient@ethaum.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer text-[#172321]/45 dark:text-[#89938F] hover:text-[#172321] dark:hover:text-[#F2F4F1]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="mt-2"
            >
              Sign In
            </Button>
          </form>

          <div className="pt-4 border-t border-[#EEF1EF] dark:border-[#2B3834] text-center text-xs text-[#172321]/70 dark:text-[#B6C0BC]">
            <span>Don't have an account yet? </span>
            <Link to="/signup" className="font-semibold text-[#173E39] dark:text-[#6F9F91] hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
