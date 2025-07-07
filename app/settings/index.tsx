import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ThemeToggle from '../../src/components/ThemeToggle';
import ThemeToggleCard from '../../src/components/ThemeToggleCard';

export default function SettingsScreen() {
  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="p-6">
        <Text className="text-slate-900 dark:text-slate-100 text-2xl font-bold mb-6">
          Settings
        </Text>

        {/* Theme Section */}
        <View className="mb-6">
          <Text className="text-slate-700 dark:text-slate-300 text-lg font-semibold mb-4">
            Appearance
          </Text>
          
          {/* Enhanced Theme Toggle */}
          <ThemeToggleCard />
          
          {/* Simple Theme Toggle */}
          <View className="bg-white dark:bg-slate-800 rounded-lg p-4 mt-3 border border-slate-200 dark:border-slate-700">
            <View className="flex-row items-center justify-between">
              <Text className="text-slate-900 dark:text-slate-100 font-medium">
                Simple Toggle
              </Text>
              <ThemeToggle />
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View className="mb-6">
          <Text className="text-slate-700 dark:text-slate-300 text-lg font-semibold mb-4">
            Account
          </Text>
          
          <View className="space-y-3">
            <TouchableOpacity className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="person-outline" size={20} color="#ef4444" />
                  <Text className="text-slate-900 dark:text-slate-100 font-medium ml-3">
                    Profile Settings
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="notifications-outline" size={20} color="#ef4444" />
                  <Text className="text-slate-900 dark:text-slate-100 font-medium ml-3">
                    Notifications
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="card-outline" size={20} color="#ef4444" />
                  <Text className="text-slate-900 dark:text-slate-100 font-medium ml-3">
                    Payment Methods
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Section */}
        <View className="mb-6">
          <Text className="text-slate-700 dark:text-slate-300 text-lg font-semibold mb-4">
            App
          </Text>
          
          <View className="space-y-3">
            <TouchableOpacity className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="language-outline" size={20} color="#ef4444" />
                  <Text className="text-slate-900 dark:text-slate-100 font-medium ml-3">
                    Language
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-slate-500 dark:text-slate-400 mr-2">English</Text>
                  <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={20} color="#ef4444" />
                  <Text className="text-slate-900 dark:text-slate-100 font-medium ml-3">
                    Location Services
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="help-circle-outline" size={20} color="#ef4444" />
                  <Text className="text-slate-900 dark:text-slate-100 font-medium ml-3">
                    Help & Support
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Section */}
        <View className="mb-6">
          <Text className="text-slate-700 dark:text-slate-300 text-lg font-semibold mb-4">
            Emergency
          </Text>
          
          <View className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <View className="flex-row items-center">
              <Ionicons name="warning" size={20} color="#ea580c" />
              <Text className="text-orange-800 dark:text-orange-200 font-medium ml-3 flex-1">
                Emergency Numbers (Trinidad & Tobago)
              </Text>
            </View>
            <View className="mt-3 space-y-1">
              <Text className="text-orange-700 dark:text-orange-300 text-sm">
                Police/Fire/Ambulance: 999
              </Text>
              <Text className="text-orange-700 dark:text-orange-300 text-sm">
                Fire Service: 990
              </Text>
              <Text className="text-orange-700 dark:text-orange-300 text-sm">
                Ambulance: 811
              </Text>
            </View>
          </View>
        </View>

        <View className="items-center mt-8">
          <Link href="/(tabs)/dashboard" className="text-red-500 dark:text-red-400 underline">
            Back to Dashboard
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
