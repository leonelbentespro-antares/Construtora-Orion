import React from 'react'

// Eyebrow: small uppercase label above section titles
interface EyebrowProps extends React.HTMLAttributes<HTMLParagraphElement> {
  color?: 'blue' | 'gray'
}

export const Eyebrow: React.FC<EyebrowProps> = ({
  color = 'blue',
  className = '',
  children,
  ...props
}) => (
  <p
    className={[
      'text-xs font-semibold tracking-[0.12em] uppercase',
      color === 'blue' ? 'text-[#2563EB]' : 'text-[#86868B]',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...props}
  >
    {children}
  </p>
)

// Headline: display font with tight letter-spacing
type HeadlineLevel = 'h1' | 'h2' | 'h3' | 'h4'
type HeadlineSize  = '6xl' | '5xl' | '4xl' | '3xl' | '2xl' | 'xl'

const headlineSize: Record<HeadlineSize, string> = {
  '6xl': 'text-6xl',
  '5xl': 'text-5xl',
  '4xl': 'text-4xl',
  '3xl': 'text-3xl',
  '2xl': 'text-2xl',
  'xl':  'text-xl',
}

interface HeadlineProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?:     HeadlineLevel
  size?:   HeadlineSize
  weight?: 'light' | 'regular' | 'semibold'
  serif?:  boolean
}

export const Headline: React.FC<HeadlineProps> = ({
  as:      Tag     = 'h2',
  size            = '4xl',
  weight          = 'semibold',
  serif           = true,
  className = '',
  children,
  ...props
}) => {
  const weights = {
    light:    'font-light',
    regular:  'font-normal',
    semibold: 'font-semibold',
  }

  return (
    <Tag
      className={[
        headlineSize[size],
        weights[weight],
        serif ? 'font-display' : 'font-sans',
        'text-[#1D1D1F]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Tag>
  )
}

// Body text
type BodySize = 'lg' | 'base' | 'sm'

interface BodyProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?:  BodySize
  muted?: boolean
  as?:    'p' | 'span' | 'div'
}

const bodySizeMap: Record<BodySize, string> = {
  lg:   'text-lg',
  base: 'text-base',
  sm:   'text-sm',
}

export const Body: React.FC<BodyProps> = ({
  size  = 'base',
  muted = false,
  as:   Tag = 'p',
  className = '',
  children,
  ...props
}) => (
  <Tag
    className={[
      'font-sans',
      bodySizeMap[size],
      muted ? 'text-[#6E6E73]' : 'text-[#1D1D1F]',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...props}
  >
    {children}
  </Tag>
)

// Section header: Eyebrow + Headline combo
interface SectionHeaderProps {
  eyebrow?:    string
  title:       string
  description?: string
  align?:      'left' | 'center'
  className?:  string
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  align    = 'left',
  className = '',
}) => (
  <div
    className={[
      'space-y-3',
      align === 'center' ? 'text-center' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <Headline size="4xl">{title}</Headline>
    {description && (
      <Body size="lg" muted className="max-w-2xl">
        {description}
      </Body>
    )}
  </div>
)
