export type Plan = 'essencial' | 'profissional' | 'empresarial'

export const SLA_HOURS: Record<Plan, number> = {
  essencial:    8,
  profissional: 4,
  empresarial:  2,
}

export type SLAStatus = 'critical' | 'warning' | 'ok' | 'overdue'

export function getSLADeadline(createdAt: Date, plan: Plan): Date {
  const deadline = new Date(createdAt)
  deadline.setHours(deadline.getHours() + SLA_HOURS[plan])
  return deadline
}

export function getSLAStatus(deadline: Date): SLAStatus {
  const now = Date.now()
  const remaining = deadline.getTime() - now

  if (remaining < 0) return 'overdue'
  if (remaining < 2 * 3600 * 1000)  return 'critical'
  if (remaining < 8 * 3600 * 1000)  return 'warning'
  return 'ok'
}

export function getSLAColorClass(status: SLAStatus): string {
  const map: Record<SLAStatus, string> = {
    critical: 'text-[#DC2626] font-semibold',
    warning:  'text-[#D97706]',
    ok:       'text-[#6E6E73]',
    overdue:  'text-white',
  }
  return map[status]
}

export function getSLABgClass(status: SLAStatus): string {
  const map: Record<SLAStatus, string> = {
    critical: 'bg-[#FFF1F2]',
    warning:  'bg-[#FFFBEB]',
    ok:       '',
    overdue:  'bg-[#DC2626]',
  }
  return map[status]
}

export function getRemainingText(deadline: Date): string {
  const now = Date.now()
  const remaining = deadline.getTime() - now

  if (remaining < 0) {
    const overdue = Math.abs(remaining)
    const h = Math.floor(overdue / 3600000)
    const m = Math.floor((overdue % 3600000) / 60000)
    return h > 0 ? `Atrasado ${h}h${m}min` : `Atrasado ${m}min`
  }

  const h = Math.floor(remaining / 3600000)
  const m = Math.floor((remaining % 3600000) / 60000)

  if (h === 0) return `${m}min restantes`
  if (m === 0) return `${h}h restantes`
  return `${h}h ${m}min restantes`
}
