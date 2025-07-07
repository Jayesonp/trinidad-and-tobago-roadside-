import { View, Text } from 'react-native';
import { Link, router } from 'expo-router';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Button, EmergencyButton } from '../../src/components/Button';

export default function Dashboard() {
  return (
    <View className="flex-1 bg-slate-900 items-center justify-center p-6">
      <Text className="text-white text-2xl font-bold mb-8">Customer Dashboard</Text>

      <View className="w-full max-w-sm space-y-4">
        <PrimaryButton onPress={() => router.push('/payment/service-checkout')}>
          Book Roadside Service
        </PrimaryButton>

        <Button
          variant="secondary"
          onPress={() => router.push('/upload/service-photos')}
        >
          Document Vehicle Issue
        </Button>

        <Button
          variant="outline"
          onPress={() => router.push('/settings')}
        >
          Settings & Theme
        </Button>

        <Button
          variant="ghost"
          onPress={() => router.push('/notifications/demo')}
        >
          Test Push Notifications
        </Button>

        <Button
          variant="ghost"
          onPress={() => router.push('/components/buttons')}
        >
          View Components Demo
        </Button>

        <EmergencyButton
          size="lg"
          onPress={() => router.push('/payment/checkout')}
        >
          🚨 Emergency SOS
        </EmergencyButton>
      </View>

      <View className="mt-8">
        <Link href="/payment/checkout" className="text-red-400 underline">
          Quick Payment Demo
        </Link>
      </View>
    </View>
  );
}
