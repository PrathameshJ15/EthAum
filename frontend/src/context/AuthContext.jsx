import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize and restore active session on load
  useEffect(() => {
    async function initAuth() {
      try {
        const activeUser = await authService.getSessionUser()
        setUser(activeUser)
      } catch (err) {
        console.error('Failed to restore authentication session:', err)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = useCallback(async (email, password) => {
    setIsLoading(true)
    try {
      const { user: loggedInUser } = await authService.signIn({ email, password })
      setUser(loggedInUser)
      return loggedInUser
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signup = useCallback(async (data) => {
    setIsLoading(true)
    try {
      const { user: registeredUser } = await authService.signUp(data)
      setUser(registeredUser)
      return registeredUser
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await authService.signOut()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Convenient helper to switch demo accounts in testing
  const switchDemoRole = useCallback(async (targetRole) => {
    const roleCredentials = {
      patient: { email: 'patient@ethaum.com', password: 'PatientPass123!' },
      provider: { email: 'doctor@ethaum.com', password: 'DoctorPass123!' },
      admin: { email: 'admin@ethaum.com', password: 'AdminPass123!' },
    }
    const creds = roleCredentials[targetRole]
    if (creds) {
      return await login(creds.email, creds.password)
    }
  }, [login])

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    signup,
    logout,
    switchDemoRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
