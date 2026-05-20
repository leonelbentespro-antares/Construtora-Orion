import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { variants as motionVariants } from '../../lib/motion'

type CardVariant = 'default' | 'elevated' | 'bordered' | 'glass'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:  CardVariant
  clickable?: boolean
  padding?:  'none' | 'sm' | 'md' | 'lg'
  as?: 'div' | 'article' | 'section'
  animate?: boolean
}

const variantStyles: Record<CardVariant, string> = {
  default:
    'bg-white border border-[#E5E5EA] ' +
    'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]',
  elevated:
    'bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] border-0',
  bordered:
    'bg-white border-2 border-[#E5E5EA]',
  glass:
    'bg-white/80 backdrop-blur-xl border border-white/60 ' +
    'shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
}

const clickableStyles =
  'cursor-pointer hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] ' +
  'hover:-translate-y-0.5 transition-all duration-200'

const paddingStyles = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant  = 'default',
      clickable = false,
      padding  = 'md',
      animate  = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const classes = [
      'rounded-[14px] transition-all duration-200',
      variantStyles[variant],
      paddingStyles[padding],
      clickable ? clickableStyles : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    if (animate) {
      return (
        <motion.div
          ref={ref}
          variants={motionVariants.cardEnter}
          initial="hidden"
          animate="visible"
          className={classes}
          {...(props as HTMLMotionProps<'div'>)}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div
    className={`flex items-center justify-between mb-4 ${className}`}
    {...props}
  >
    {children}
  </div>
)

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <h3
    className={`text-lg font-semibold text-[#1D1D1F] tracking-tight ${className}`}
    {...props}
  >
    {children}
  </h3>
)

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <p className={`text-sm text-[#6E6E73] ${className}`} {...props}>
    {children}
  </p>
)
