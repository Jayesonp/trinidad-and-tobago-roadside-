import { View, Text, ScrollView, Alert } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '../../src/components/Button';
import { usePushNotifications } from '../../src/hooks/usePushNotifications';
import { useNotifications } from '../../src/contexts/NotificationProvider';
import { sendPush } from '../../src/lib/pushNotifications';

export default function NotificationDemo() {
  const { 
    expoPushToken, 
    notification, 
    error, 
    sendTestNotification,
    clearNotifications,
    setBadgeCount 
  } = usePushNotifications();
  
  const { notifications } = useNotifications();

  const handleTestLocalNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert('Success', 'Test notification scheduled');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const handleTestPushNotification = async () => {
    if (!expoPushToken) {
      Alert.alert('Error', 'No push token available');
      return;
    }

    try {
      await sendPush(
        expoPushToken,
        'RoadSide+ Test',
        'This is a test push notification from Trinidad & Tobago!'
      );
      Alert.alert('Success', 'Push notification sent');
    } catch (error) {
      Alert.alert('Error', 'Failed to send push notification');
    }
  };

  const handleEmergencyTest = async () => {
    if (!expoPushToken) {
      Alert.alert('Error', 'No push token available');
      return;
    }

    try {
      await sendPush(
        expoPushToken,
        '🚨 Emergency Alert Test',
        'This is a test emergency alert for Trinidad & Tobago roadside assistance'
      );
      Alert.alert('Success', 'Emergency notification sent');
    } catch (error) {
      Alert.alert('Error', 'Failed to send emergency notification');
    }
  };

  const handleServiceUpdateTest = async () => {
    if (!expoPushToken) {
      Alert.alert('Error', 'No push token available');
      return;
    }

    try {
      await sendPush(
        expoPushToken,
        'Service Update',
        'Your towing service has been assigned to John Doe. ETA: 15 minutes.'
      );
      Alert.alert('Success', 'Service update notification sent');
    } catch (error) {
      Alert.alert('Error', 'Failed to send service notification');
    }
  };

  const handlePaymentTest = async () => {
    if (!expoPushToken) {
      Alert.alert('Error', 'No push token available');
      return;
    }

    try {
      await sendPush(
        expoPushToken,
        'Payment Successful',
        'Your payment of TTD $200.00 for towing service has been processed successfully.'
      );
      Alert.alert('Success', 'Payment notification sent');
    } catch (error) {
      Alert.alert('Error', 'Failed to send payment notification');
    }
  };

  const handleSetBadge = async (count: number) => {
    try {
      await setBadgeCount(count);
      Alert.alert('Success', `Badge count set to ${count}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to set badge count');
    }
  };

  const handleClearNotifications = async () => {
    try {
      await clearNotifications();
      Alert.alert('Success', 'All notifications cleared');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear notifications');
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900 p-6">
      <Text className="text-slate-900 dark:text-slate-100 text-2xl font-bold mb-6">
        Push Notifications Demo
      </Text>

      {/* Token Status */}
      <View className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-slate-200 dark:border-slate-700">
        <Text className="text-slate-900 dark:text-slate-100 text-lg font-semibold mb-2">
          Push Token Status
        </Text>
        {expoPushToken ? (
          <View>
            <Text className="text-green-600 dark:text-green-400 font-medium mb-2">
              ✅ Push token registered
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-mono">
              {expoPushToken.substring(0, 50)}...
            </Text>
          </View>
        ) : (
          <Text className="text-red-600 dark:text-red-400 font-medium">
            ❌ No push token available
          </Text>
        )}
        {error && (
          <Text className="text-red-600 dark:text-red-400 text-sm mt-2">
            Error: {error}
          </Text>
        )}
      </View>

      {/* Test Notifications */}
      <View className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-slate-200 dark:border-slate-700">
        <Text className="text-slate-900 dark:text-slate-100 text-lg font-semibold mb-4">
          Test Notifications
        </Text>
        
        <View className="space-y-3">
          <Button 
            variant="primary" 
            onPress={handleTestLocalNotification}
            disabled={!expoPushToken}
          >
            Send Local Test Notification
          </Button>

          <Button 
            variant="secondary" 
            onPress={handleTestPushNotification}
            disabled={!expoPushToken}
          >
            Send Push Test Notification
          </Button>

          <Button 
            variant="outline" 
            onPress={handleServiceUpdateTest}
            disabled={!expoPushToken}
          >
            Test Service Update
          </Button>

          <Button 
            variant="outline" 
            onPress={handlePaymentTest}
            disabled={!expoPushToken}
          >
            Test Payment Notification
          </Button>

          <Button 
            variant="emergency" 
            onPress={handleEmergencyTest}
            disabled={!expoPushToken}
          >
            🚨 Test Emergency Alert
          </Button>
        </View>
      </View>

      {/* Badge Management */}
      <View className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-slate-200 dark:border-slate-700">
        <Text className="text-slate-900 dark:text-slate-100 text-lg font-semibold mb-4">
          Badge Management
        </Text>
        
        <View className="flex-row space-x-3">
          <Button 
            variant="ghost" 
            size="sm"
            onPress={() => handleSetBadge(1)}
          >
            Badge: 1
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onPress={() => handleSetBadge(5)}
          >
            Badge: 5
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onPress={() => handleSetBadge(0)}
          >
            Clear Badge
          </Button>
        </View>
      </View>

      {/* Notification History */}
      <View className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-slate-200 dark:border-slate-700">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-slate-900 dark:text-slate-100 text-lg font-semibold">
            Recent Notifications ({notifications.length})
          </Text>
          <Button 
            variant="ghost" 
            size="sm"
            onPress={handleClearNotifications}
          >
            Clear All
          </Button>
        </View>

        {notifications.length === 0 ? (
          <Text className="text-slate-500 dark:text-slate-400 text-center py-4">
            No notifications received yet
          </Text>
        ) : (
          <View className="space-y-3">
            {notifications.slice(0, 5).map((notif, index) => (
              <View 
                key={index}
                className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg"
              >
                <Text className="text-slate-900 dark:text-slate-100 font-medium">
                  {notif.request.content.title}
                </Text>
                <Text className="text-slate-600 dark:text-slate-300 text-sm">
                  {notif.request.content.body}
                </Text>
                <Text className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                  {new Date(notif.date).toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Current Notification */}
      {notification && (
        <View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
          <Text className="text-blue-900 dark:text-blue-100 text-lg font-semibold mb-2">
            Latest Notification
          </Text>
          <Text className="text-blue-800 dark:text-blue-200 font-medium">
            {notification.request.content.title}
          </Text>
          <Text className="text-blue-700 dark:text-blue-300 text-sm">
            {notification.request.content.body}
          </Text>
          {notification.request.content.data && (
            <Text className="text-blue-600 dark:text-blue-400 text-xs mt-2 font-mono">
              Data: {JSON.stringify(notification.request.content.data, null, 2)}
            </Text>
          )}
        </View>
      )}

      <View className="items-center mt-6">
        <Link href="/(tabs)/dashboard" className="text-red-500 dark:text-red-400 underline">
          Back to Dashboard
        </Link>
      </View>
    </ScrollView>
  );
}
