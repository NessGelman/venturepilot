import React, { ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col items-center justify-center p-8">
          <div className="max-w-md w-full bg-[var(--bg-glass)] backdrop-blur-sm rounded-3xl p-12 border border-[rgba(255,255,255,0.08)] text-center shadow-2xl">
            <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-[rgba(239,68,68,0.15)] flex items-center justify-center border-2 border-[rgba(239,68,68,0.3)]">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black mb-4 bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
              Something went wrong
            </h1>
            <p className="text-[var(--text-muted)] mb-8 leading-relaxed">
              We're sorry, an unexpected error occurred. Please try again.
            </p>
            <div className="space-y-3">
              <button
                onClick={this.resetError}
                className="w-full py-3 px-6 rounded-2xl bg-[var(--accent)] text-white font-black text-lg shadow-glow hover:shadow-glow-lg hover:scale-[1.02] transition-all focus:outline-none focus:ring-4 focus:ring-[var(--accent-light)]/30"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-6 rounded-2xl border-2 border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text-primary)] font-semibold hover:bg-[rgba(255,255,255,0.1)] hover:glow-hover transition-all"
              >
                Reload App
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 p-4 bg-[rgba(255,255,255,0.03)] rounded-xl border border-[rgba(255,255,255,0.05)]">
                <summary className="cursor-pointer font-semibold mb-2 text-[var(--text-secondary)]">Error Details</summary>
                <pre className="text-xs text-[var(--text-muted)] overflow-auto max-h-40 bg-[rgba(0,0,0,0.3)] p-3 rounded-xl">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

