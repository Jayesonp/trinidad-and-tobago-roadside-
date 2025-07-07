import { Stack } from 'expo-router';

export default function PaymentLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ef4444' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' }
      }}
    >
      <Stack.Screen
        name="checkout"
        options={{
          title: 'Quick Payment',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="service-checkout"
        options={{
          title: 'Book Service',
          headerBackTitle: 'Back'
        }}
      />
    </Stack>
  );
}
