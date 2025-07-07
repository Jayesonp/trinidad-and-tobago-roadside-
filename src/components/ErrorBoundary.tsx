import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // You can also log the error to an error reporting service here
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View className="flex-1 justify-center items-center p-6 bg-slate-50 dark:bg-slate-900">
          <View className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-700 max-w-sm w-full">
            <Text className="text-red-600 dark:text-red-400 text-xl font-bold mb-4 text-center">
              🚨 Something went wrong
            </Text>
            
            <Text className="text-slate-700 dark:text-slate-300 text-center mb-6">
              We're sorry, but something unexpected happened. Please try again or contact support if the problem persists.
            </Text>

            {__DEV__ && this.state.error && (
              <View className="bg-red-50 dark:bg-red-900/20 p-3 rounded mb-4">
                <Text className="text-red-800 dark:text-red-200 text-xs font-mono">
                  {this.state.error.toString()}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={this.handleRetry}
              className="bg-red-600 dark:bg-red-500 py-3 px-6 rounded-lg active:bg-red-700 dark:active:bg-red-600"
            >
              <Text className="text-white text-center font-semibold">
                Try Again
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                // Navigate to support or home
                console.log('Contact support');
              }}
              className="mt-3 py-2 px-4"
            >
              <Text className="text-red-600 dark:text-red-400 text-center">
                Contact Support
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
