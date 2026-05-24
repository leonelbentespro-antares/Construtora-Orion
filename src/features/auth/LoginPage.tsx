import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthLayout } from './AuthLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
)

export const LoginPage: React.FC = () => {
  const { t }                         = useTranslation('auth')
  const { t: tCommon }                = useTranslation('common')
  const [loading,     setLoading]     = useState(false)
  const [resetLoading,setResetLoading]= useState(false)
  const [apiError,    setApiError]    = useState('')
  const [resetEmail,  setResetEmail]  = useState('')
  const [showReset,   setShowReset]   = useState(false)
  const [resetSent,   setResetSent]   = useState(false)
  const { signIn }                    = useAuth()
  const navigate                      = useNavigate()

  const schema = z.object({
    email:    z.string().email(tCommon('errors.email_invalid')),
    password: z.string().min(6, tCommon('errors.password_short')),
  })
  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setApiError('')
    const { error, role } = await signIn(data.email, data.password)
    setLoading(false)

    if (error) {
      setApiError(t('login.error_credentials'))
      return
    }

    if (role === 'lawyer') navigate('/advogado/dashboard')
    else if (role === 'admin') navigate('/admin/overview')
    else navigate('/portal/dashboard')
  }

  const handleReset = async () => {
    if (!resetEmail) return
    setResetLoading(true)
    await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/login`,
    })
    setResetLoading(false)
    setResetSent(true)
  }

  if (showReset) {
    return (
      <AuthLayout title={t('reset.title')}>
        {resetSent ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#F0FDF4] flex items-center justify-center text-xl mx-auto">✓</div>
            <p className="text-sm text-[#6E6E73]">{t('reset.success')}</p>
            <Button variant="primary" size="md" fullWidth onClick={() => { setShowReset(false); setResetSent(false) }}>
              {t('reset.back_login')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label={t('reset.email_label')}
              type="email"
              placeholder={t('login.placeholder_email')}
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            <Button variant="primary" size="lg" fullWidth loading={resetLoading} onClick={handleReset}>
              {t('reset.submit')}
            </Button>
            <Button variant="ghost" size="md" fullWidth onClick={() => setShowReset(false)}>
              {t('reset.back')}
            </Button>
          </div>
        )}
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title={t('login.title')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label={t('login.email')}
          type="email"
          placeholder={t('login.placeholder_email')}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={t('login.password')}
          type="password"
          placeholder={t('login.placeholder_password')}
          error={errors.password?.message}
          {...register('password')}
        />

        {apiError && (
          <p className="text-sm text-[#FF3B30] bg-[#FFF1F2] px-3 py-2 rounded-[8px]">
            {apiError}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => { setResetEmail(getValues('email') ?? ''); setShowReset(true) }}
            className="text-sm text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            {t('login.forgot')}
          </button>
        </div>

        <Button variant="primary" size="lg" fullWidth loading={loading} type="submit">
          {t('login.submit')}
        </Button>

        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-[#E5E5EA]" />
          <span className="text-xs text-[#86868B]">{t('login.or_continue')}</span>
          <div className="flex-1 h-px bg-[#E5E5EA]" />
        </div>

        <Button
          variant="outline"
          size="lg"
          fullWidth
          leftIcon={<GoogleIcon />}
          type="button"
          onClick={async () => {
            await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/portal/dashboard` } })
          }}
        >
          Google
        </Button>

        <p className="text-sm text-center text-[#6E6E73]">
          {t('login.no_account')}{' '}
          <a href="/cadastro" className="text-[#2563EB] hover:text-[#1D4ED8] font-medium">
            {t('login.create_free')}
          </a>
        </p>

        <div className="flex justify-center pt-1">
          <LanguageSwitcher />
        </div>
      </form>
    </AuthLayout>
  )
}
