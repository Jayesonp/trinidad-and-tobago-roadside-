import { Stack } from 'expo-router';

export default function ComponentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ef4444' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' }
      }}
    >
      <Stack.Screen 
        name="buttons" 
        options={{ 
          title: 'Button Components',
          headerBackTitle: 'Back'
        }} 
      />
    </Stack>
  );
}
