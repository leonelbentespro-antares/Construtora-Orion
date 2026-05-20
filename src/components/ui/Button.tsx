import React from 'react'
import { motion } from 'framer-motion'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize    = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?:   ButtonVariant
  size?:      ButtonSize
  loading?:   boolean
  leftIcon?:  React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  children?:  React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-sm ' +
    'hover:shadow-[0_0_0_4px_rgba(37,99,235,0.15)] ' +
    'focus-visible:ring-blue-500',
  secondary:
    'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E5E5EA] ' +
    'focus-visible:ring-[#D1D1D6]',
  ghost:
    'bg-transparent text-[#1D1D1F] hover:bg-[#F5F5F7] ' +
    'focus-visible:ring-[#D1D1D6]',
  danger:
    'bg-[#FF3B30] text-white hover:bg-[#E0342A] shadow-sm ' +
    'focus-visible:ring-red-400',
  outline:
    'border border-[#D1D1D6] text-[#1D1D1F] bg-transparent ' +
    'hover:bg-[#F5F5F7] hover:border-[#86868B] ' +
    'focus-visible:ring-[#D1D1D6]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8  px-3 gap-1.5 text-sm   rounded-[8px]',
  md: 'h-10 px-4 gap-2   text-base rounded-[10px]',
  lg: 'h-12 px-6 gap-2.5 text-[17px] rounded-[12px]',
}

const base =
  'inline-flex items-center justify-center font-medium ' +
  'transition-all duration-150 ease-out ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'disabled:opacity-40 disabled:cursor-not-allowed ' +
  'select-none'

const ButtonSpinner = () => (
  <svg
    className="animate-spin shrink-0"
    width="15" height="15"
    viewBox="0 0 15 15"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="7.5" cy="7.5" r="5.5"
      stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
    <path d="M13 7.5a5.5 5.5 0 0 0-5.5-5.5"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const MotionButton = motion.button

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = 'primary',
      size      = 'md',
      loading   = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    const cls = [
      base,
      variantStyles[variant],
      sizeStyles[size],
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <MotionButton
        ref={ref}
        whileTap={isDisabled ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.1 }}
        className={cls}
        disabled={isDisabled}
        type={props.type ?? 'button'}
        onClick={props.onClick}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        id={props.id}
        style={props.style}
        aria-label={props['aria-label']}
        aria-disabled={isDisabled}
        form={props.form}
        name={props.name}
        value={props.value}
        data-testid={(props as Record<string, unknown>)['data-testid'] as string}
      >
        {loading ? (
          <>
            <ButtonSpinner />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </MotionButton>
    )
  }
)

Button.displayName = 'Button'
