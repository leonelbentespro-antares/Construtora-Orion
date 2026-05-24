import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'pt-BR', flag: '🇧🇷', label: 'Português' },
  { code: 'en',    flag: '🇺🇸', label: 'English'   },
  { code: 'es',    flag: '🇪🇸', label: 'Español'   },
]

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation()
  const [open, setOpen]     = useState(false)
  const ref                 = useRef<HTMLDivElement>(null)
  const current             = LANGS.find((l) => l.code === i18n.language) ?? LANGS[0]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const change = (code: string) => {
    i18n.changeLanguage(code)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs text-[#6E6E73] hover:bg-white hover:text-[#1D1D1F] transition-all w-full"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <span className="ml-auto text-[10px] opacity-50">▾</span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-36 bg-white border border-[#E5E5EA] rounded-[10px] shadow-lg overflow-hidden z-50">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => change(l.code)}
              className={[
                'flex items-center gap-2 w-full px-3 py-2 text-xs text-left transition-colors',
                l.code === i18n.language
                  ? 'bg-[#EFF6FF] text-[#1D4ED8] font-medium'
                  : 'text-[#1D1D1F] hover:bg-[#F5F5F7]',
              ].join(' ')}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
