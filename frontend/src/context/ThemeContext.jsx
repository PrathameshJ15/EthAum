import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'

const THEME_STORAGE_KEY = 'ethaum_theme_preference'

const ThemeContext = createContext({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
})

export function ThemeProvider({ children }) {
  // 1. Get initial preference from localStorage or default to 'system'
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored
      }
    } catch {
      // localStorage may fail in private mode
    }
    return 'system'
  })

  // 2. Track OS media query preference
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  // Listen to OS color scheme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      setSystemPrefersDark(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // 3. Resolve active visual theme ('light' or 'dark')
  const resolvedTheme = useMemo(() => {
    if (theme === 'system') {
      return systemPrefersDark ? 'dark' : 'light'
    }
    return theme
  }, [theme, systemPrefersDark])

  // 4. Update DOM root and persist choice
  useEffect(() => {
    const root = document.documentElement

    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
      root.setAttribute('data-theme', 'dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.setAttribute('data-theme', 'light')
      root.style.colorScheme = 'light'
    }
  }, [resolvedTheme])

  const setTheme = React.useCallback((newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark' || newTheme === 'system') {
      setThemeState(newTheme)
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme)
      } catch {
        // Ignore storage errors
      }
    }
  }, [])

  const toggleTheme = React.useCallback(() => {
    setThemeState((prevTheme) => {
      const nextTheme = prevTheme === 'light' ? 'dark' : prevTheme === 'dark' ? 'system' : 'light'
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
      } catch {
        // Ignore storage errors
      }
      return nextTheme
    })
  }, [])

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext
