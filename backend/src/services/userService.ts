import { User, Patient } from '../types/index.js'
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js'

const MOCK_USERS: User[] = [
  {
    id: 'usr-patient-1',
    email: 'patient@ethaum.com',
    role: 'patient',
    name: 'Eleanor Vance',
    phone: '+44 7911 123456',
    country: 'United Kingdom',
    createdAt: '2026-09-12T10:00:00Z',
    updatedAt: '2026-09-12T10:00:00Z',
  },
  {
    id: 'usr-demo-patient',
    email: 'patient@ethaum.com',
    role: 'patient',
    name: 'Demo Patient',
    phone: '+1 555 123456',
    country: 'United States',
    createdAt: '2026-09-12T10:00:00Z',
    updatedAt: '2026-09-12T10:00:00Z',
  },
  {
    id: 'usr-provider-1',
    email: 'doctor@ethaum.com',
    role: 'provider',
    name: 'Dr. Vikram Oberoi',
    organization: 'Apex Orthopedic & Robotic Joint Institute',
    specialty: 'Adult Knee & Hip Reconstruction',
    country: 'India',
    createdAt: '2026-08-01T12:00:00Z',
    updatedAt: '2026-08-01T12:00:00Z',
  },
  {
    id: 'usr-admin-1',
    email: 'admin@ethaum.com',
    role: 'admin',
    name: 'EthAum Compliance Officer',
    organization: 'EthAum Global Platform',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

const MOCK_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    userId: 'usr-patient-1',
    gender: 'Female',
    age: 58,
    companionTraveling: true,
    medicalSummary: 'Severe osteoarthritis Grade IV. Cruciate-retaining candidate.',
    createdAt: '2026-09-12T10:00:00Z',
    updatedAt: '2026-09-12T10:00:00Z',
  },
  {
    id: 'pat-1',
    userId: 'usr-demo-patient',
    gender: 'Female',
    age: 58,
    companionTraveling: true,
    medicalSummary: 'Severe osteoarthritis Grade IV. Cruciate-retaining candidate.',
    createdAt: '2026-09-12T10:00:00Z',
    updatedAt: '2026-09-12T10:00:00Z',
  },
]

export const userService = {
  async getUserById(id: string): Promise<User | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', id)
          .single()

        if (!error && data) {
          return {
            id: data.id,
            authUserId: data.auth_user_id,
            email: data.email,
            role: data.role,
            name: data.name,
            phone: data.phone,
            country: data.country,
            avatarUrl: data.avatar_url,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          }
        }
      } catch (err: any) {
        console.warn(`[userService] Supabase getUserById fallback: ${err.message}`)
      }
    }

    return MOCK_USERS.find((u) => u.id === id) || null
  },

  async getUserByEmail(email: string): Promise<User | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .ilike('email', email)
          .single()

        if (!error && data) {
          return {
            id: data.id,
            authUserId: data.auth_user_id,
            email: data.email,
            role: data.role,
            name: data.name,
            phone: data.phone,
            country: data.country,
            avatarUrl: data.avatar_url,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          }
        }
      } catch (err: any) {
        console.warn(`[userService] Supabase getUserByEmail fallback: ${err.message}`)
      }
    }

    return MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
  },

  async createUser(user: User): Promise<User> {
    if (isSupabaseConfigured()) {
      try {
        await supabaseAdmin.from('users').insert({
          id: user.id,
          auth_user_id: user.authUserId,
          email: user.email,
          role: user.role,
          name: user.name,
          phone: user.phone,
          country: user.country,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        })
      } catch (err: any) {
        console.warn(`[userService] Supabase createUser fallback: ${err.message}`)
      }
    }

    MOCK_USERS.push(user)
    return user
  },
}

export const patientService = {
  async getPatientByUserId(userId: string): Promise<Patient | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabaseAdmin
          .from('patients')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (!error && data) {
          return {
            id: data.id,
            userId: data.user_id,
            gender: data.gender,
            dateOfBirth: data.date_of_birth,
            companionTraveling: data.companion_traveling,
            medicalSummary: data.medical_summary,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          }
        }
      } catch (err: any) {
        console.warn(`[patientService] Supabase getPatientByUserId fallback: ${err.message}`)
      }
    }

    return MOCK_PATIENTS.find((p) => p.userId === userId || p.id === userId) || null
  },

  async updatePatient(userId: string, data: Partial<Patient>): Promise<Patient | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data: updated, error } = await supabaseAdmin
          .from('patients')
          .update({
            gender: data.gender,
            date_of_birth: data.dateOfBirth,
            companion_traveling: data.companionTraveling,
            medical_summary: data.medicalSummary,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .select()
          .single()

        if (!error && updated) {
          return {
            id: updated.id,
            userId: updated.user_id,
            gender: updated.gender,
            dateOfBirth: updated.date_of_birth,
            companionTraveling: updated.companion_traveling,
            medicalSummary: updated.medical_summary,
            createdAt: updated.created_at,
            updatedAt: updated.updated_at,
          }
        }
      } catch (err: any) {
        console.warn(`[patientService] Supabase updatePatient fallback: ${err.message}`)
      }
    }

    let patient = MOCK_PATIENTS.find((p) => p.userId === userId || p.id === userId)
    if (!patient) {
      // Create record if not found
      patient = {
        id: `pat-${Date.now()}`,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      MOCK_PATIENTS.push(patient)
    }
    Object.assign(patient, data, { updatedAt: new Date().toISOString() })
    return patient
  },
}
