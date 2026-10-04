import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from './env.js'

/**
 * EthAum Centralized Supabase Client Foundation
 * 
 * Configures:
 * 1. Admin/Service-Role Client: Used for privileged backend database operations,
 *    storage management, and user identity administration.
 *    (Bypasses RLS server-side while enforcing application-level and ACL checks).
 * 2. Anon Client: Used when executing operations scoped to the requesting user session.
 * 
 * SECURITY:
 * SUPABASE_SERVICE_ROLE_KEY is strictly server-side and is never sent to the client.
 */

let adminClientInstance: SupabaseClient | null = null
let anonClientInstance: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  return Boolean(
    env.SUPABASE_URL &&
    env.SUPABASE_URL.startsWith('http') &&
    env.SUPABASE_SERVICE_ROLE_KEY &&
    env.SUPABASE_SERVICE_ROLE_KEY.length > 20 &&
    !env.SUPABASE_SERVICE_ROLE_KEY.includes('your-supabase')
  )
}

/**
 * Returns the centralized Supabase Admin client with Service Role privileges.
 * Lazy-initialized singleton.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (adminClientInstance) {
    return adminClientInstance
  }

  const supabaseUrl = env.SUPABASE_URL || 'https://placeholder.supabase.co'
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key-for-testing'

  adminClientInstance = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return adminClientInstance
}

/**
 * Returns the Supabase client initialized with anon key.
 */
export function getSupabaseAnon(): SupabaseClient {
  if (anonClientInstance) {
    return anonClientInstance
  }

  const supabaseUrl = env.SUPABASE_URL || 'https://placeholder.supabase.co'
  const anonKey = env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-anon-key'

  anonClientInstance = createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
    },
  })

  return anonClientInstance
}

/** Centralized export */
export const supabaseAdmin = getSupabaseAdmin()
