import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import i18n from 'i18next'
import { initReactI18next, useTranslation as useI18nextTranslation } from 'react-i18next'

import en from './locales/en.json'
import ar from './locales/ar.json'
import fr from './locales/fr.json'
import es from './locales/es.json'
import ru from './locales/ru.json'

export const LANGUAGE_STORAGE_KEY = 'ethaum_language_preference'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇬🇧' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr', flag: '🇪🇸' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr', flag: '🇷🇺' },
]

export const DEFAULT_LANGUAGE = 'en'

// Detect stored language preference or default to English
function getInitialLanguage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
      if (stored && SUPPORTED_LANGUAGES.some((lang) => lang.code === stored)) {
        return stored
      }
    }
  } catch {
    // localStorage may be inaccessible in certain environments
  }
  return DEFAULT_LANGUAGE
}

const initialLang = getInitialLanguage()

// Initialize i18next instance
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      fr: { translation: fr },
      es: { translation: es },
      ru: { translation: ru },
    },
    lng: initialLang,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  })

// Sync initial HTML document attributes
if (typeof document !== 'undefined') {
  const dir = initialLang === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = initialLang
  document.documentElement.dir = dir
  if (dir === 'rtl') {
    document.documentElement.classList.add('rtl-mode')
  } else {
    document.documentElement.classList.remove('rtl-mode')
  }
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguageState] = useState(initialLang)

  const isRTL = useMemo(() => currentLanguage === 'ar', [currentLanguage])
  const dir = useMemo(() => (isRTL ? 'rtl' : 'ltr'), [isRTL])

  const setLanguage = useCallback((langCode) => {
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === langCode)) {
      console.warn(`[i18n] Language code '${langCode}' is not supported.`)
      return
    }

    i18n.changeLanguage(langCode)
    setCurrentLanguageState(langCode)

    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, langCode)
    } catch {
      // Ignore storage errors
    }

    if (typeof document !== 'undefined') {
      const targetDir = langCode === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = langCode
      document.documentElement.dir = targetDir

      if (targetDir === 'rtl') {
        document.documentElement.classList.add('rtl-mode')
      } else {
        document.documentElement.classList.remove('rtl-mode')
      }
    }
  }, [])

  // Listen to i18n language change events
  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      if (lng !== currentLanguage) {
        setCurrentLanguageState(lng)
      }
    }
    i18n.on('languageChanged', handleLanguageChanged)
    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [currentLanguage])

  const value = useMemo(
    () => ({
      currentLanguage,
      setLanguage,
      isRTL,
      dir,
      supportedLanguages: SUPPORTED_LANGUAGES,
      currentLanguageMeta: SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0],
      t: i18n.t.bind(i18n),
    }),
    [currentLanguage, setLanguage, isRTL, dir]
  )

  return React.createElement(LanguageContext.Provider, { value }, children)
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Re-export standard useTranslation hook from react-i18next
export const useTranslation = useI18nextTranslation
export default i18n
