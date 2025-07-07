import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: '#ef4444' },
          drawerActiveTintColor: '#ef4444'
        }}
      >
        <Drawer.Screen name="dashboard" options={{ title: 'Customer' }} />
        <Drawer.Screen name="technician" options={{ title: 'Technician' }} />
        <Drawer.Screen name="admin" options={{ title: 'Admin' }} />
        <Drawer.Screen name="partner" options={{ title: 'Partner' }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
