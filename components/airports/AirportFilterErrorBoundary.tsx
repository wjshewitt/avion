'use client';

import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class AirportFilterErrorBoundary extends Component<Props, State> {
  state: State = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  private handleReset = () => {
    this.setState({ error: null });
  };

  override render() {
    if (this.state.error) {
      return (
        <div className="rounded-sm border border-red-200 dark:border-red-900/40 bg-red-50/80 dark:bg-red-900/10 p-4 text-sm text-red-900 dark:text-red-100" role="alert">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
            <div className="space-y-1">
              <p className="font-semibold">Unable to load airports</p>
              <p className="text-xs text-red-800/80 dark:text-red-200/80">
                {this.state.error.message || 'Something went wrong while rendering the airport filters.'}
              </p>
              <button
                type="button"
                onClick={this.handleReset}
                className="mt-1 inline-flex items-center rounded-sm border border-red-500/40 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-red-700 hover:bg-red-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
