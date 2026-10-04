import React, { useState, useCallback } from 'react'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import { ToastContext } from './ToastContext'

const TOAST_ICONS = {
  success: <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-[#B07D1E] shrink-0" />,
  error: <AlertCircle className="w-4 h-4 text-[#A33B39] shrink-0" />,
  info: <Info className="w-4 h-4 text-[#2B5975] shrink-0" />,
}

const TOAST_STYLES = {
  success: 'bg-[#EBF5EE] text-[#1B5E3C] border-[#CFEADB]',
  warning: 'bg-[#FEF7EA] text-[#9A6708] border-[#F8E2B5]',
  error: 'bg-[#FDF2F2] text-[#963836] border-[#F6D0D0]',
  info: 'bg-[#EDF5F9] text-[#1B4B68] border-[#CEE1ED]',
}

export function ToastItem({ id, type = 'info', title, message, onDismiss }) {
  const icon = TOAST_ICONS[type] || TOAST_ICONS.info
  const style = TOAST_STYLES[type] || TOAST_STYLES.info

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-3.5 rounded-xl border shadow-md shadow-[#172321]/5 bg-white transition-all duration-200 ease-out max-w-sm w-full ${style}`}
    >
      <div className="pt-0.5">{icon}</div>
      <div className="flex-1 min-w-0 text-left">
        {title && <h4 className="text-xs font-semibold text-[#172321]">{title}</h4>}
        {message && <p className="text-xs text-[#172321]/80 mt-0.5 leading-relaxed">{message}</p>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={() => onDismiss(id)}
          className="text-[#172321]/40 hover:text-[#172321] p-1 rounded-md transition-colors cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6)
    setToasts((prev) => [...prev, { id, type, title, message }])

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem {...toast} onDismiss={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastItem
