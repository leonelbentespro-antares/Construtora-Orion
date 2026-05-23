import React, { Component, type ReactNode } from 'react'

interface Props {
  children:  ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?:   Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">⚠️</p>
          <p className="text-sm font-medium text-[#1D1D1F]">Algo deu errado nesta seção.</p>
          <p className="text-xs text-[#86868B] mt-1 max-w-xs mx-auto">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 text-sm text-[#2563EB] hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
