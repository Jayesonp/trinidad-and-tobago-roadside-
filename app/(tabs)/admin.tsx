import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function Admin() {
  return (
    <View className="flex-1 bg-slate-900 items-center justify-center space-y-4">
      <Text className="text-white text-2xl font-bold">Admin Dashboard</Text>
      <Link href="/admin/users" className="text-red-400 underline">
        Manage Users
      </Link>
      <Link href="/admin/analytics" className="text-red-400 underline">
        View Analytics
      </Link>
      <Link href="/admin/settings" className="text-red-400 underline">
        System Settings
      </Link>
    </View>
  );
}
