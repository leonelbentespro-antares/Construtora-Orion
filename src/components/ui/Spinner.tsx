import React from 'react'

interface SpinnerProps {
  size?:  'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => (
  <svg
    className={`animate-spin text-[#2563EB] ${sizes[size]} ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    aria-label="Carregando"
    role="status"
  >
    <circle
      cx="12" cy="12" r="10"
      stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2"
    />
    <path
      d="M22 12a10 10 0 0 0-10-10"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    />
  </svg>
)

interface LoadingOverlayProps {
  text?: string
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ text = 'Carregando...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16">
    <Spinner size="lg" />
    <p className="text-sm text-[#6E6E73]">{text}</p>
  </div>
)
