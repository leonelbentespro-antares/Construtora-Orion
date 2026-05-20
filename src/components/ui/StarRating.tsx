import React, { useState } from 'react'

interface StarRatingProps {
  value:        number
  max?:         number
  interactive?: boolean
  onChange?:    (v: number) => void
  size?:        'sm' | 'md' | 'lg'
  showValue?:   boolean
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  max         = 5,
  interactive = false,
  onChange,
  size        = 'md',
  showValue   = false,
}) => {
  const [hovered, setHovered] = useState<number | null>(null)

  const sizeClass = { sm: 'text-sm gap-0.5', md: 'text-lg gap-0.5', lg: 'text-2xl gap-1' }[size]
  const display   = hovered ?? value

  return (
    <div className={`flex items-center ${sizeClass}`}>
      {Array.from({ length: max }).map((_, i) => {
        const star   = i + 1
        const filled = display >= star
        const half   = !filled && display >= star - 0.5

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(null)}
            onClick={() => { interactive && onChange?.(star) }}
            className={[
              'leading-none transition-transform',
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default',
              filled || half ? 'text-[#F59E0B]' : 'text-[#D1D1D6]',
            ].join(' ')}
          >
            ★
          </button>
        )
      })}
      {showValue && value > 0 && (
        <span className="ml-1.5 text-xs font-semibold text-[#6E6E73] tabular-nums">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  )
}
