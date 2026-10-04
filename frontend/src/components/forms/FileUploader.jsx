import React, { useState, useRef } from 'react'
import { UploadCloud, FileText, X, Check, AlertCircle } from 'lucide-react'

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (typeof bytes === 'string') return bytes
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function FileUploader({
  label = 'Upload Medical Documents',
  helperText = 'Attach MRI, CT scans, blood reports, or doctor prescriptions (PDF, JPG, PNG, DICOM up to 25MB)',
  accept = '.pdf,.jpg,.jpeg,.png,.dcm',
  multiple = true,
  maxSizeMB = 25,
  files = [],
  onFilesChange,
  className = '',
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFiles = (incomingFiles) => {
    setError(null)
    const validFiles = []
    const maxSizeBytes = maxSizeMB * 1024 * 1024

    Array.from(incomingFiles).forEach((file) => {
      if (file.size > maxSizeBytes) {
        setError(`File "${file.name}" exceeds the maximum allowed size of ${maxSizeMB}MB.`)
      } else {
        validFiles.push(file)
      }
    })

    if (validFiles.length > 0) {
      const updated = multiple ? [...files, ...validFiles] : validFiles
      if (onFilesChange) onFilesChange(updated)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeFile = (indexToRemove) => {
    const updated = files.filter((_, idx) => idx !== indexToRemove)
    if (onFilesChange) onFilesChange(updated)
  }

  return (
    <div className={`w-full text-left ${className}`.trim()}>
      {label && (
        <label className="block text-xs font-sans text-[var(--text-secondary)] mb-1.5 select-none">
          {label}
        </label>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-[4px] border border-dashed transition-all duration-200 cursor-pointer text-center
          ${
            isDragging
              ? 'border-[var(--copper)] bg-[var(--bg-elevated)]'
              : 'border-[var(--border-default)] bg-[var(--bg-card)] hover:border-[var(--border-strong)]'
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files)
            }
          }}
          className="hidden"
        />

        <div className="w-10 h-10 rounded-[3px] bg-[var(--bg-base)] text-[var(--copper)] flex items-center justify-center mb-3 border border-[var(--border-hairline)]">
          <UploadCloud className="w-5 h-5 stroke-[1.75]" />
        </div>

        <p className="text-sm font-medium text-[var(--text-primary)] font-sans mb-1">
          <span className="text-[var(--copper)] underline underline-offset-4">Click to browse</span>{' '}
          or drag medical records here
        </p>

        {helperText && <p className="text-xs text-[var(--text-muted)] font-sans font-light max-w-sm">{helperText}</p>}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400 font-sans">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-sans px-1">
            <span>Uploaded Documents ({files.length})</span>
          </div>

          {files.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between p-3 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-hairline)]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-[3px] bg-[var(--bg-base)] text-[var(--copper)] flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-medium text-[var(--text-primary)] font-sans truncate">{file.name}</p>
                  <p className="text-[11px] text-[var(--text-muted)] font-sans">{formatFileSize(file.size)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span title="Ready for AI extraction" className="text-[var(--green-rich)] flex items-center">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(idx)
                  }}
                  className="p-1 rounded-[3px] text-[var(--text-muted)] hover:text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
                  aria-label={`Remove file ${file.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUploader
