import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { Providers } from '../src/components/Providers';
import { colors, typography, spacing } from '../src/constants/theme';

function IndexContent() {
  const { user } = useAuth();

  // Redirect based on authentication status
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Redirect to drawer navigation
  return <Redirect href="/(tabs)/dashboard" />;
}

export default function IndexScreen() {
  return (
    <Providers>
      <IndexContent />
    </Providers>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    fontFamily: typography.fonts.medium,
  },
});
