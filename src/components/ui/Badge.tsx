import React from 'react'

type BadgeVariant = 'default' | 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray'
type BadgeSize    = 'sm' | 'md'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?:    BadgeSize
  dot?:     boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[#F5F5F7] text-[#1D1D1F]',
  blue:    'bg-[#EFF6FF] text-[#1D4ED8]',
  green:   'bg-[#F0FDF4] text-[#15803D]',
  amber:   'bg-[#FFFBEB] text-[#B45309]',
  red:     'bg-[#FFF1F2] text-[#BE123C]',
  purple:  'bg-[#FAF5FF] text-[#7C3AED]',
  gray:    'bg-[#F9FAFB] text-[#6B7280]',
}

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-[#86868B]',
  blue:    'bg-[#2563EB]',
  green:   'bg-[#16A34A]',
  amber:   'bg-[#D97706]',
  red:     'bg-[#DC2626]',
  purple:  'bg-[#7C3AED]',
  gray:    'bg-[#9CA3AF]',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1   text-xs     gap-1.5',
}

export const Badge: React.FC<BadgeProps> = ({
  variant  = 'default',
  size     = 'md',
  dot      = false,
  className = '',
  children,
  ...props
}) => (
  <span
    className={[
      'inline-flex items-center font-medium rounded-full tracking-wide',
      variantStyles[variant],
      sizeStyles[size],
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...props}
  >
    {dot && (
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`}
        aria-hidden="true"
      />
    )}
    {children}
  </span>
)

// Pre-built consultation status badges
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    aguardando:     { label: 'Aguardando',    variant: 'amber'   },
    em_andamento:   { label: 'Em andamento',  variant: 'blue'    },
    concluida:      { label: 'Concluída',     variant: 'green'   },
    arquivada:      { label: 'Arquivada',     variant: 'gray'    },
    ai_draft:       { label: 'Em geração',    variant: 'purple'  },
    revisando:      { label: 'Revisando',     variant: 'amber'   },
    approved:       { label: 'Pronto',        variant: 'green'   },
    signed:         { label: 'Assinado',      variant: 'blue'    },
    active:         { label: 'Ativo',         variant: 'green'   },
    inactive:       { label: 'Inativo',       variant: 'gray'    },
    pending:        { label: 'Pendente',      variant: 'amber'   },
    suspended:      { label: 'Suspenso',      variant: 'red'     },
  }

  const config = map[status] ?? { label: status, variant: 'default' as BadgeVariant }
  return <Badge variant={config.variant} dot>{config.label}</Badge>
}

// Plan tier badges
export const PlanBadge: React.FC<{ plan: 'essencial' | 'profissional' | 'empresarial' }> = ({ plan }) => {
  const map = {
    essencial:    { label: 'Essencial',    variant: 'default' as BadgeVariant },
    profissional: { label: 'Profissional', variant: 'blue'    as BadgeVariant },
    empresarial:  { label: 'Empresarial',  variant: 'purple'  as BadgeVariant },
  }
  const config = map[plan]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
