import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from 'react-query';

import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationProvider';
import { StripeProvider } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import ErrorBoundary from './ErrorBoundary';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const { stripePublishableKey } = Constants.expoConfig!.extra as any;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <StripeProvider
              publishableKey={stripePublishableKey}
              merchantIdentifier="merchant.com.roadsideplus.tt"
              urlScheme="roadsideplus"
            >
              <AuthProvider>
                <NotificationProvider>
                  <StatusBar style="auto" />
                  {children}
                </NotificationProvider>
              </AuthProvider>
            </StripeProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
