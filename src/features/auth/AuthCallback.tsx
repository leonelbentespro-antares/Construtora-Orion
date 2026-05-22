import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export const AuthCallback: React.FC = () => {
  const { profile, loading, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!user) { navigate('/login', { replace: true }); return }
    if (!profile) return

    if (profile.role === 'lawyer') navigate('/advogado/dashboard', { replace: true })
    else if (profile.role === 'admin') navigate('/admin/overview', { replace: true })
    else navigate('/portal/dashboard', { replace: true })
  }, [profile, loading, user, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
