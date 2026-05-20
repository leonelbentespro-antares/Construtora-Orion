import React from 'react'
import { Button } from './ui/Button'

interface State {
  hasError: boolean
  errorMessage: string
}

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[JurisFlow ErrorBoundary]', error, info)
    // In production: send to monitoring service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#FFF1F2] flex items-center justify-center text-2xl mb-4">
            ⚠️
          </div>
          <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2">Algo deu errado</h3>
          <p className="text-sm text-[#6E6E73] mb-6 max-w-sm">
            Estamos investigando. Se o problema persistir, entre em contato com o suporte.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              this.setState({ hasError: false, errorMessage: '' })
              window.location.reload()
            }}
          >
            Tentar novamente
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
