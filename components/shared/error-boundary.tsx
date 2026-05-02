"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryFallbackProps {
  error: Error;
  reset: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode | ((props: ErrorBoundaryFallbackProps) => ReactNode);
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[error-boundary]", error, errorInfo);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (error) {
      if (typeof this.props.fallback === "function") {
        return this.props.fallback({ error, reset: this.reset });
      }

      return this.props.fallback;
    }

    return this.props.children;
  }
}
