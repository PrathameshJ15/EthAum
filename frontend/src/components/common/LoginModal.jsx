import React, { useState } from 'react'
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import { Modal } from '../layout/Modal'
import { Button } from './Button'
import { Input } from '../forms/Input'
import { useToast } from './useToast'

import { useAuth } from '../../context/AuthContext'

export function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { addToast } = useToast()
  const { login } = useAuth()
  const [role, setRole] = useState('patient')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const finalEmail = email || (role === 'patient' ? 'patient@ethaum.com' : 'doctor@ethaum.com')
    const finalPassword = password || (role === 'patient' ? 'PatientPass123!' : 'DoctorPass123!')

    try {
      const loggedInUser = await login(finalEmail, finalPassword)
      addToast({
        type: 'success',
        title: 'Logged in successfully',
        message: `Welcome back, ${loggedInUser.name} (${role === 'patient' ? 'Patient Portal' : 'Hospital Coordinator'})`,
      })
      if (onLoginSuccess) onLoginSuccess(loggedInUser)
      onClose()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Authentication Failed',
        message: err.message || 'Please verify your credentials',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Access Your Healthcare Account"
      description="Secure portal access for patients, medical coordinators, and verified hospitals."
      size="sm"
    >
      <form onSubmit={handleLogin} className="space-y-4 text-left">
        <div className="flex p-1 bg-[#EEF1EF] rounded-xl">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              role === 'patient' ? 'bg-white text-[#173E39] shadow-xs' : 'text-[#172321]/60'
            }`}
          >
            Patient Access
          </button>
          <button
            type="button"
            onClick={() => setRole('provider')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              role === 'provider' ? 'bg-white text-[#173E39] shadow-xs' : 'text-[#172321]/60'
            }`}
          >
            Provider Portal
          </button>
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <div className="p-2.5 bg-[#E6EFEB]/40 rounded-xl border border-[#CFE2D8] flex items-center gap-2 text-[11px] text-[#173E39]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#315B55] shrink-0" />
          <span>Protected with end-to-end encrypted session tokens</span>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to {role === 'patient' ? 'Patient Portal' : 'Hospital Desk'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default LoginModal
