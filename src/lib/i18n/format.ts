import i18n from './config'

export const formatCurrency = (
  value: number,
  currency = 'BRL',
  locale?: string
): string =>
  new Intl.NumberFormat(locale ?? i18n.language, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)

export const formatDate = (
  date: string | Date,
  options?: Intl.DateTimeFormatOptions,
  locale?: string
): string =>
  new Intl.DateTimeFormat(locale ?? i18n.language, options ?? { dateStyle: 'medium' }).format(
    typeof date === 'string' ? new Date(date) : date
  )

export const formatDateTime = (date: string | Date, locale?: string): string =>
  new Intl.DateTimeFormat(locale ?? i18n.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(typeof date === 'string' ? new Date(date) : date)

export const formatDateShort = (date: string | Date, locale?: string): string =>
  new Intl.DateTimeFormat(locale ?? i18n.language, { dateStyle: 'short' }).format(
    typeof date === 'string' ? new Date(date) : date
  )
