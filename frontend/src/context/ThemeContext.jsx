import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'

const THEME_STORAGE_KEY = 'ethaum_theme_preference'

const ThemeContext = createContext({
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
})

export function ThemeProvider({ children }) {
  const [theme] = useState('light')
  const resolvedTheme = 'light'

  // Ensure DOM root stays strictly in white theme per user specification
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
    root.setAttribute('data-theme', 'light')
    root.style.colorScheme = 'light'
    try {
      localStorage.setItem(THEME_STORAGE_KEY, 'light')
    } catch {
      // safe fallback
    }
  }, [])

  const setTheme = React.useCallback(() => {}, [])
  const toggleTheme = React.useCallback(() => {}, [])

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
