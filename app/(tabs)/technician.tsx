import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function Technician() {
  return (
    <View className="flex-1 bg-slate-900 items-center justify-center space-y-4">
      <Text className="text-white text-2xl font-bold">Technician Dashboard</Text>
      <Link href="/jobs/available" className="text-red-400 underline">
        View Available Jobs
      </Link>
      <Link href="/earnings/summary" className="text-red-400 underline">
        Earnings Summary
      </Link>
    </View>
  );
}
