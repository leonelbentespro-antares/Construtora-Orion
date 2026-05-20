import React from 'react'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?:  string | number
  height?: string | number
  rounded?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  rounded = false,
  className = '',
  style,
  ...props
}) => (
  <div
    className={[
      'animate-pulse bg-[#E5E5EA]',
      rounded ? 'rounded-full' : 'rounded-[8px]',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    style={{ width, height, ...style }}
    aria-hidden="true"
    {...props}
  />
)

export const CardSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="bg-white border border-[#E5E5EA] rounded-[14px] p-6 space-y-4">
    <Skeleton height={20} width="60%" />
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} height={14} width={`${80 - i * 10}%`} />
    ))}
  </div>
)

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white border border-[#E5E5EA] rounded-[14px] p-6 space-y-3">
    <Skeleton height={12} width="40%" />
    <Skeleton height={32} width="55%" />
    <Skeleton height={12} width="30%" />
  </div>
)

export const ListRowSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 py-3 border-b border-[#E5E5EA]">
        <Skeleton width={36} height={36} rounded />
        <div className="flex-1 space-y-2">
          <Skeleton height={14} width="45%" />
          <Skeleton height={12} width="30%" />
        </div>
        <Skeleton height={24} width={70} />
      </div>
    ))}
  </div>
)
