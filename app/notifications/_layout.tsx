import { Stack } from 'expo-router';

export default function NotificationsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ef4444' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' }
      }}
    >
      <Stack.Screen 
        name="demo" 
        options={{ 
          title: 'Push Notifications Demo',
          headerBackTitle: 'Back'
        }} 
      />
    </Stack>
  );
}
