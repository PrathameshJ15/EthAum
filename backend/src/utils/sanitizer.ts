/**
 * Redacts sensitive fields from objects before logging
 */
const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'apikey',
  'api_key',
  'groq_api_key',
  'service_role_key',
  'medicalrecordcontent',
  'filecontent',
  'ssn',
  'creditcard',
  'authorization',
])

export function sanitizeForLogging(data: unknown): unknown {
  if (data === null || data === undefined) return data

  if (typeof data === 'string') {
    // Redact bearer tokens if present in raw strings
    return data.replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForLogging(item))
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase().replace(/[-_]/g, '')
      if (SENSITIVE_KEYS.has(lowerKey)) {
        sanitized[key] = '[REDACTED]'
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeForLogging(value)
      } else {
        sanitized[key] = value
      }
    }
    return sanitized
  }

  return data
}
