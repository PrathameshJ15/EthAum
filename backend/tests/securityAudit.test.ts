import { describe, it, expect } from 'vitest'
import request from 'supertest'
import fs from 'fs'
import path from 'path'
import { app } from '../src/app.js'

describe('Security & Authorization Audit', () => {
  describe('1. Patient-to-Patient Case Isolation', () => {
    it('prevents a patient from accessing another patient\'s medical case (returns 403)', async () => {
      // Case ET-8492 belongs to Eleanor Vance (pat-1)
      const res = await request(app)
        .get('/api/v1/cases/ET-8492')
        .set('Authorization', 'Bearer other-patient-token')

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('FORBIDDEN')
      expect(res.body.error.message).toContain('Access denied to this case')
    })

    it('allows patient owner to view their own medical case', async () => {
      const res = await request(app)
        .get('/api/v1/cases/ET-8492')
        .set('Authorization', 'Bearer patient-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe('ET-8492')
    })
  })

  describe('2. Patient-to-Patient Medical Record Isolation', () => {
    it('prevents a patient from accessing another patient\'s diagnostic record (returns 403)', async () => {
      // Record rec-1 belongs to pat-1
      const res = await request(app)
        .get('/api/v1/medical-records/rec-1')
        .set('Authorization', 'Bearer other-patient-token')

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('FORBIDDEN')
      expect(res.body.error.message).toContain('Access denied: You are only authorized to view your own sovereign medical records')
    })

    it('prevents a patient from generating download URL for another patient\'s record (returns 403)', async () => {
      const res = await request(app)
        .get('/api/v1/medical-records/rec-1/download-url')
        .set('Authorization', 'Bearer other-patient-token')

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('FORBIDDEN')
    })
  })

  describe('3. Provider Authorization & Sensitive Record Protection', () => {
    it('prevents unauthorized provider from accessing records without explicit patient permission (returns 403)', async () => {
      const res = await request(app)
        .get('/api/v1/medical-records/rec-1')
        .set('Authorization', 'Bearer unauthorized-provider-token')

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('FORBIDDEN')
      expect(res.body.error.message).toContain('Access denied: This medical record has not been shared with your hospital')
    })

    it('allows authorized provider with explicit consent to access diagnostic record', async () => {
      // provider-token belongs to apex-joint-delhi which is in rec-1 permissions
      const res = await request(app)
        .get('/api/v1/medical-records/rec-1')
        .set('Authorization', 'Bearer provider-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe('rec-1')
    })
  })

  describe('4. RBAC & Admin Endpoint Protection', () => {
    it('blocks normal patient from accessing admin audit ledger (returns 403)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/audit-ledger')
        .set('Authorization', 'Bearer patient-token')

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('FORBIDDEN')
      expect(res.body.error.message).toContain('Insufficient permissions')
    })

    it('blocks provider from accessing admin audit ledger (returns 403)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/audit-ledger')
        .set('Authorization', 'Bearer provider-token')

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('FORBIDDEN')
    })

    it('allows verified admin to access admin audit ledger (returns 200)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/audit-ledger')
        .set('Authorization', 'Bearer admin-token')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('secure')
    })
  })

  describe('5. Secret Keys Never Exposed to Frontend', () => {
    const frontendDir = path.resolve(__dirname, '../../frontend')

    it('verifies GROQ_API_KEY is never in frontend/.env', () => {
      const envPath = path.join(frontendDir, '.env')
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8')
        expect(content).not.toContain('GROQ_API_KEY')
        expect(content).not.toContain('VITE_GROQ_API_KEY')
        expect(content).not.toMatch(/gsk_[a-zA-Z0-9_-]+/)
      }
    })

    it('verifies GROQ_API_KEY is never in frontend/.env.example', () => {
      const envExPath = path.join(frontendDir, '.env.example')
      if (fs.existsSync(envExPath)) {
        const content = fs.readFileSync(envExPath, 'utf8')
        expect(content).not.toContain('GROQ_API_KEY')
        expect(content).not.toContain('VITE_GROQ_API_KEY')
      }
    })

    it('verifies SUPABASE_SERVICE_ROLE_KEY is never in frontend/.env or .env.example', () => {
      const envPath = path.join(frontendDir, '.env')
      const envExPath = path.join(frontendDir, '.env.example')

      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8')
        expect(content).not.toContain('SERVICE_ROLE')
        expect(content).not.toContain('service_role')
      }

      if (fs.existsSync(envExPath)) {
        const content = fs.readFileSync(envExPath, 'utf8')
        expect(content).not.toContain('SERVICE_ROLE')
        expect(content).not.toContain('service_role')
      }
    })

    it('scans all frontend src files to ensure no hardcoded Groq or service-role keys', () => {
      const srcDir = path.join(frontendDir, 'src')
      const checkDir = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          if (entry.isDirectory()) {
            checkDir(fullPath)
          } else if (/\.(js|jsx|ts|tsx|json|html)$/.test(entry.name)) {
            const content = fs.readFileSync(fullPath, 'utf8')
            expect(content).not.toContain('GROQ_API_KEY')
            expect(content).not.toMatch(/gsk_[a-zA-Z0-9]{20,}/)
            expect(content).not.toContain('SUPABASE_SERVICE_ROLE_KEY')
          }
        }
      }
      checkDir(srcDir)
    })
  })
})
