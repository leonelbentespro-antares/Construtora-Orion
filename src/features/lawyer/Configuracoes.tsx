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
import { StarRating } from '../../components/ui/StarRating'
import { useLawyerReviews, avgRating } from '../../hooks/useReviews'

export const LawyerConfiguracoes: React.FC = () => {
  const { profile, lawyer, signOut, refreshProfile } = useAuth()
  const updateProfile = useUpdateProfile()
  const { data: reviews = [] } = useLawyerReviews(lawyer?.id)
  const avg = avgRating(reviews)

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [pixKey,   setPixKey]   = useState((lawyer as any)?.pix_key ?? '')
  const [saved,    setSaved]    = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    setFullName(profile?.full_name ?? '')
    setPixKey((lawyer as any)?.pix_key ?? '')
  }, [profile, lawyer])

  const handleSave = async () => {
    setLoading(true)
    setError('')
    try {
      await updateProfile.mutateAsync({ fullName })
      if (lawyer?.id && pixKey !== (lawyer as any)?.pix_key) {
        const { error: err } = await supabase.schema('jurisflow').from('lawyers')
          .update({ pix_key: pixKey })
          .eq('id', lawyer.id)
        if (err) throw err
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

      {/* Lawyer profile */}
      <motion.div variants={variants.cardEnter}>
        <Card variant="default" padding="md">
          <CardHeader>
            <CardTitle>Perfil profissional</CardTitle>
            <Badge variant={lawyer?.status === 'active' ? 'green' : 'amber'} size="sm" dot>
              {lawyer?.status ?? '—'}
            </Badge>
          </CardHeader>
          {/* Rating below profile header */}
          <div className="flex items-center gap-3 mt-3 p-3 bg-[#FAFAFA] rounded-[10px]">
            <div className="w-12 h-12 rounded-full bg-[#DBEAFE] flex items-center justify-center text-sm font-bold text-[#1D4ED8] shrink-0">
              {(profile?.full_name ?? '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
            </div>
            <div>
              <StarRating value={avg} size="md" showValue={reviews.length > 0} />
              <p className="text-xs text-[#86868B] mt-0.5">
                {reviews.length === 0
                  ? 'Nenhuma avaliação ainda'
                  : `${reviews.length} avaliação${reviews.length > 1 ? 'ões' : ''} de clientes`}
              </p>
            </div>
          </div>

          <div className="space-y-4 mt-2">
            <Input
              label="Nome completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. João Silva"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Estado OAB"
                value={lawyer?.oab_state ?? '—'}
                disabled
              />
              <Input
                label="Número OAB"
                value={lawyer?.oab_number ?? '—'}
                disabled
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Payment */}
      <motion.div variants={variants.cardEnter}>
        <Card variant="default" padding="md">
          <CardTitle>Dados de pagamento</CardTitle>
          <div className="space-y-4 mt-4">
            <Input
              label="Chave PIX"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="CPF, e-mail, telefone ou chave aleatória"
            />
            <div className="bg-[#EFF6FF] rounded-[10px] p-3 text-xs text-[#1D4ED8]">
              ℹ Os repasses são processados todo dia 10 via PIX para a chave cadastrada.
            </div>
          </div>
        </Card>
      </motion.div>

      {error && (
        <p className="text-sm text-[#FF3B30] bg-[#FFF1F2] px-3 py-2 rounded-[8px]">{error}</p>
      )}
      {saved && (
        <p className="text-sm text-[#15803D] bg-[#F0FDF4] px-3 py-2 rounded-[8px]">✓ Salvo com sucesso!</p>
      )}

      <motion.div variants={variants.fadeUp} className="flex items-center justify-between">
        <Button variant="danger" size="sm" onClick={() => signOut()}>
          Sair da conta
        </Button>
        <Button variant="primary" size="md" loading={loading} onClick={handleSave}>
          Salvar alterações
        </Button>
      </motion.div>
    </motion.div>
  )
}
