import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { variants } from '../../lib/motion'
import { useAuth } from '../../context/AuthContext'
import { useUpdateProfile } from '../../hooks/useFinanceiro'
import { supabase } from '../../lib/supabase'

export const ClientConfiguracoes: React.FC = () => {
  const { profile, company, signOut, refreshProfile } = useAuth()
  const updateProfile = useUpdateProfile()

  const [fullName, setFullName]       = useState(profile?.full_name ?? '')
  const [companyName, setCompanyName] = useState(company?.company_name ?? '')
  const [saved,     setSaved]         = useState(false)
  const [loading,   setLoading]       = useState(false)
  const [error,     setError]         = useState('')

  useEffect(() => {
    setFullName(profile?.full_name ?? '')
    setCompanyName(company?.company_name ?? '')
  }, [profile, company])

  const handleSave = async () => {
    setLoading(true)
    setError('')
    try {
      await updateProfile.mutateAsync({ fullName })
      if (company?.id && companyName !== company.company_name) {
        const { error: compErr } = await supabase.schema('jurisflow').from('companies')
          .update({ company_name: companyName })
          .eq('id', company.id)
        if (compErr) throw compErr
      }
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao salvar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      variants={variants.stagger}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-xl"
    >
      <motion.div variants={variants.fadeUp}>
        <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Configurações</h1>
      </motion.div>

      {/* Profile */}
      <motion.div variants={variants.cardEnter}>
        <Card variant="default" padding="md">
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <Badge variant={profile?.role === 'client' ? 'blue' : 'green'} size="sm">
              {profile?.role === 'client' ? 'Empresa' : profile?.role ?? '—'}
            </Badge>
          </CardHeader>

          <div className="space-y-4 mt-2">
            <Input
              label="Nome de contato"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome completo"
            />
            {company && (
              <Input
                label="Razão social"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nome da empresa"
              />
            )}
            {company?.cnpj && (
              <Input
                label="CNPJ"
                value={company.cnpj}
                disabled
                placeholder="00.000.000/0000-00"
              />
            )}
            <Input
              label="E-mail"
              type="email"
              value={profile?.id ? `(vinculado à conta)` : '—'}
              disabled
              placeholder="voce@empresa.com.br"
            />
          </div>

          {error && (
            <p className="mt-3 text-sm text-[#FF3B30] bg-[#FFF1F2] px-3 py-2 rounded-[8px]">{error}</p>
          )}
          {saved && (
            <p className="mt-3 text-sm text-[#15803D] bg-[#F0FDF4] px-3 py-2 rounded-[8px]">✓ Salvo com sucesso!</p>
          )}

          <Button
            variant="primary"
            size="md"
            loading={loading}
            onClick={handleSave}
            className="mt-4"
          >
            Salvar alterações
          </Button>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div variants={variants.cardEnter}>
        <Card variant="default" padding="md">
          <CardTitle>Segurança</CardTitle>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-[#1D1D1F]">Alterar senha</p>
                <p className="text-xs text-[#86868B]">Um link de redefinição será enviado ao seu e-mail</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const email = prompt('Digite seu e-mail para redefinição de senha:')
                  if (email) await supabase.auth.resetPasswordForEmail(email)
                  alert('Se o e-mail estiver cadastrado, você receberá o link.')
                }}
              >
                Redefinir
              </Button>
            </div>
            <div className="border-t border-[#F5F5F7] pt-3">
              <Button variant="danger" size="sm" onClick={() => signOut()}>
                Sair da conta
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
