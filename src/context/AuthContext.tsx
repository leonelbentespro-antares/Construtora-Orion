import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile, Company, Lawyer } from '../lib/database.types'

interface AuthContextValue {
  user:        User | null
  session:     Session | null
  profile:     Profile | null
  company:     Company | null
  lawyer:      Lawyer | null
  loading:     boolean
  signIn:      (email: string, password: string) => Promise<{ error: string | null; role: string | null }>
  signUp:      (params: SignUpParams) => Promise<{ error: string | null }>
  signOut:     () => Promise<void>
  refreshProfile: () => Promise<void>
}

interface SignUpParams {
  email:    string
  password: string
  fullName: string
  role:     'client' | 'lawyer'
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,    setUser]    = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [lawyer,  setLawyer]  = useState<Lawyer | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const { data: prof } = await supabase
      .schema('jurisflow')
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!prof) return
    setProfile(prof)

    if (prof.role === 'client') {
      const { data: comp } = await supabase
        .schema('jurisflow')
        .from('companies')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      setCompany(comp)
    }

    if (prof.role === 'lawyer') {
      const { data: law } = await supabase
        .schema('jurisflow')
        .from('lawyers')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      setLawyer(law)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id).finally(() => setLoading(false))
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setCompany(null)
        setLawyer(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message, role: null as string | null }
    let role: string | null = null
    if (data.user) {
      const { data: prof } = await supabase.schema('jurisflow').from('profiles')
        .select('role').eq('id', data.user.id).single()
      role = prof?.role ?? null
    }
    return { error: null, role }
  }

  const signUp = async ({ email, password, fullName, role }: SignUpParams) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setCompany(null)
    setLawyer(null)
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id)
  }

  return (
    <AuthContext.Provider value={{
      user, session, profile, company, lawyer, loading,
      signIn, signUp, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
