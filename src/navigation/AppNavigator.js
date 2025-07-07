import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Customer Screens
import CustomerDashboard from '../screens/customer/CustomerDashboard';
import ServiceBookingScreen from '../screens/customer/ServiceBookingScreen';
import TrackingScreen from '../screens/customer/TrackingScreen';
import ServiceHistoryScreen from '../screens/customer/ServiceHistoryScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';

// Technician Screens
import TechnicianDashboard from '../screens/technician/TechnicianDashboard';
import JobManagementScreen from '../screens/technician/JobManagementScreen';
import EarningsScreen from '../screens/technician/EarningsScreen';
import NavigationScreen from '../screens/technician/NavigationScreen';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import ConfigurationScreen from '../screens/admin/ConfigurationScreen';

// Partner Screens
import PartnerDashboard from '../screens/partner/PartnerDashboard';
import PartnerOnboardingScreen from '../screens/partner/PartnerOnboardingScreen';
import PerformanceScreen from '../screens/partner/PerformanceScreen';

// Security Screens
import SecurityDashboard from '../screens/security/SecurityDashboard';
import EmergencyResponseScreen from '../screens/security/EmergencyResponseScreen';
import IncidentManagementScreen from '../screens/security/IncidentManagementScreen';

// Shared Screens
import NotificationScreen from '../screens/shared/NotificationScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';
import HelpScreen from '../screens/shared/HelpScreen';

import { useAuth } from '../hooks/useAuth';
import LoadingScreen from '../components/LoadingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#0f172a' }
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

// Customer Tab Navigator
function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Services') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Tracking') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ef4444',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
        },
        headerStyle: {
          backgroundColor: '#1e293b',
        },
        headerTintColor: '#f1f5f9',
      })}
    >
      <Tab.Screen name="Dashboard" component={CustomerDashboard} />
      <Tab.Screen name="Services" component={ServiceBookingScreen} />
      <Tab.Screen name="Tracking" component={TrackingScreen} />
      <Tab.Screen name="History" component={ServiceHistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Technician Tab Navigator
function TechnicianTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'Jobs') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Earnings') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Navigation') {
            iconName = focused ? 'navigate' : 'navigate-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ef4444',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
        },
        headerStyle: {
          backgroundColor: '#1e293b',
        },
        headerTintColor: '#f1f5f9',
      })}
    >
      <Tab.Screen name="Dashboard" component={TechnicianDashboard} />
      <Tab.Screen name="Jobs" component={JobManagementScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Navigation" component={NavigationScreen} />
    </Tab.Navigator>
  );
}

// Admin Drawer Navigator
function AdminDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#1e293b',
        },
        drawerActiveTintColor: '#ef4444',
        drawerInactiveTintColor: '#94a3b8',
        headerStyle: {
          backgroundColor: '#1e293b',
        },
        headerTintColor: '#f1f5f9',
      }}
    >
      <Drawer.Screen name="Dashboard" component={AdminDashboard} />
      <Drawer.Screen name="Users" component={UserManagementScreen} />
      <Drawer.Screen name="Analytics" component={AnalyticsScreen} />
      <Drawer.Screen name="Configuration" component={ConfigurationScreen} />
    </Drawer.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    return <AuthStack />;
  }
  
  // Route based on user role
  const getUserNavigator = () => {
    switch (user.role) {
      case 'customer':
        return <CustomerTabs />;
      case 'technician':
        return <TechnicianTabs />;
      case 'admin':
      case 'super_admin':
        return <AdminDrawer />;
      case 'partner':
        return <PartnerDashboard />;
      case 'security':
        return <SecurityDashboard />;
      default:
        return <CustomerTabs />;
    }
  };
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={getUserNavigator} />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationScreen}
        options={{ 
          headerShown: true,
          title: 'Notifications',
          headerStyle: { backgroundColor: '#1e293b' },
          headerTintColor: '#f1f5f9'
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ 
          headerShown: true,
          title: 'Settings',
          headerStyle: { backgroundColor: '#1e293b' },
          headerTintColor: '#f1f5f9'
        }}
      />
      <Stack.Screen 
        name="Help" 
        component={HelpScreen}
        options={{ 
          headerShown: true,
          title: 'Help & Support',
          headerStyle: { backgroundColor: '#1e293b' },
          headerTintColor: '#f1f5f9'
        }}
      />
    </Stack.Navigator>
  );
}
