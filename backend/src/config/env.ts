import dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config()

export interface EnvConfig {
  PORT: number
  NODE_ENV: 'development' | 'production' | 'test'
  FRONTEND_URL: string
  SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  SUPABASE_ANON_KEY?: string
  GROQ_API_KEY?: string
  PAYMENT_PROVIDER?: 'razorpay' | 'stripe' | 'mock'
  RAZORPAY_KEY_ID?: string
  RAZORPAY_KEY_SECRET?: string
  RAZORPAY_WEBHOOK_SECRET?: string
  STRIPE_PUBLISHABLE_KEY?: string
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
}

export const env: EnvConfig = {
  PORT: parseInt(process.env.PORT || '8000', 10),
  NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  SUPABASE_URL: process.env.SUPABASE_URL || undefined,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || undefined,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || undefined,
  GROQ_API_KEY: process.env.GROQ_API_KEY || undefined,
  PAYMENT_PROVIDER: (process.env.PAYMENT_PROVIDER as EnvConfig['PAYMENT_PROVIDER']) || 'mock',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || undefined,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || undefined,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || undefined,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || undefined,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || undefined,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || undefined,
}

