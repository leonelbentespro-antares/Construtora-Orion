import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:   string
  error?:   string
  hint?:    string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#1D1D1F]"
          >
            {label}
            {props.required && (
              <span className="text-[#FF3B30] ml-0.5" aria-hidden="true">*</span>
            )}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full h-10 rounded-[10px] border bg-white',
              'text-base text-[#1D1D1F] placeholder:text-[#86868B]',
              'transition-all duration-150 outline-none',
              'focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-0 focus:border-[#2563EB]',
              error
                ? 'border-[#FF3B30] focus:ring-[#FF3B30]'
                : 'border-[#D1D1D6] hover:border-[#86868B]',
              leftIcon  ? 'pl-9'  : 'pl-3',
              rightIcon ? 'pr-9'  : 'pr-3',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B]">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-[#FF3B30]" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-sm text-[#6E6E73]">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:   string
  error?:   string
  hint?:    string
  maxLength?: number
  showCount?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, hint, showCount = false, maxLength, className = '', id, ...props },
    ref
  ) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    const [count, setCount] = React.useState(0)

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-[#1D1D1F]">
            {label}
            {props.required && (
              <span className="text-[#FF3B30] ml-0.5" aria-hidden="true">*</span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          onChange={(e) => {
            setCount(e.target.value.length)
            props.onChange?.(e)
          }}
          className={[
            'w-full min-h-[120px] rounded-[10px] border bg-white px-3 py-2.5',
            'text-base text-[#1D1D1F] placeholder:text-[#86868B] resize-y',
            'transition-all duration-150 outline-none',
            'focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]',
            error
              ? 'border-[#FF3B30] focus:ring-[#FF3B30]'
              : 'border-[#D1D1D6] hover:border-[#86868B]',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        <div className="flex justify-between items-center">
          {error ? (
            <p className="text-sm text-[#FF3B30]" role="alert">{error}</p>
          ) : hint ? (
            <p className="text-sm text-[#6E6E73]">{hint}</p>
          ) : (
            <span />
          )}
          {showCount && maxLength && (
            <span className="text-xs text-[#86868B]">
              {count}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
