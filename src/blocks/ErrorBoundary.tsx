import React from 'react'
import { ErrorBoundaryProps, ErrorBoundaryState } from './types'

export class BlockErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Block Error:', error, errorInfo)
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="block-error p-4 border border-red-500 rounded">
          <h3 className="text-red-500 font-bold">Component Error</h3>
          <p className="text-sm text-gray-600">
            This component encountered an error. A fallback has been rendered to maintain page stability.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
