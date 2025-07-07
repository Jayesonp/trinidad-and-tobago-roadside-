import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function Partner() {
  return (
    <View className="flex-1 bg-slate-900 items-center justify-center space-y-4">
      <Text className="text-white text-2xl font-bold">Partner Dashboard</Text>
      <Link href="/partner/onboarding" className="text-red-400 underline">
        Partner Onboarding
      </Link>
      <Link href="/partner/performance" className="text-red-400 underline">
        Performance Metrics
      </Link>
      <Link href="/partner/billing" className="text-red-400 underline">
        Billing & Payments
      </Link>
    </View>
  );
}
