import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Supabase anon key is a public project identifier — not a secret.
// Real security relies on Row Level Security (RLS) policies in the database.
// These fallbacks allow the app to run in fresh clones without a .env file.
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string
  || 'https://ppwbpjkqftqiozguvmrw.supabase.co'
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwd2JwamtxZnRxaW96Z3V2bXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTQzMDIsImV4cCI6MjA5MTE3MDMwMn0.pzgEg2om8M6qf2Q-AmbtqPRfMZE94OVzZmSIlwjoJ_I'

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession:    true,
    autoRefreshToken:  true,
    detectSessionInUrl:true,
  },
})

export type { Database }
