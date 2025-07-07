import { Stack } from 'expo-router';

export default function UploadLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ef4444' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' }
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Upload Files',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="service-photos"
        options={{
          title: 'Service Photos',
          headerBackTitle: 'Back'
        }}
      />
    </Stack>
  );
}
