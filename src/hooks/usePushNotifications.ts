import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { registerForPush, storePushToken, removePushToken } from '../services/notificationService';
import { router } from 'expo-router';

interface NotificationData {
  type?: 'service_update' | 'payment' | 'emergency' | 'technician_assigned' | 'job_completed' | 'system';
  serviceRequestId?: string;
  technicianId?: string;
  paymentId?: string;
  emergencyAlertId?: string;
  action?: string;
  [key: string]: any;
}

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string>();
  const [notification, setNotification] = useState<Notifications.Notification>();
  const [error, setError] = useState<string>();
  const { user } = useAuth();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const data = notification.request.content.data as NotificationData;
        
        return {
          shouldShowAlert: true,
          shouldPlaySound: data?.type === 'emergency' ? true : true,
          shouldSetBadge: true,
        };
      },
    });

    // Register for push notifications
    registerForPushNotifications();

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      console.log('Notification received:', notification);
    });

    // Listen for notification responses (when user taps notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      handleNotificationResponse(response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user]);

  const registerForPushNotifications = async () => {
    try {
      const token = await registerForPush();
      
      if (token && user) {
        setExpoPushToken(token);
        await storePushToken(user.id, token);
        console.log('Push token registered:', token);
      } else if (!token) {
        setError('Failed to get push token');
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      setError('Failed to register for push notifications');
    }
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data as NotificationData;
    console.log('Notification tapped:', data);

    // Navigate based on notification type
    switch (data?.type) {
      case 'service_update':
        if (data.serviceRequestId) {
          if (data.action === 'rate_service') {
            router.push(`/service/${data.serviceRequestId}/review`);
          } else {
            router.push(`/service/${data.serviceRequestId}`);
          }
        }
        break;

      case 'technician_assigned':
        if (data.serviceRequestId) {
          router.push(`/technician/job/${data.serviceRequestId}`);
        }
        break;

      case 'payment':
        if (data.paymentId) {
          router.push(`/payment/${data.paymentId}`);
        } else {
          router.push('/payment/history');
        }
        break;

      case 'emergency':
        if (data.emergencyAlertId) {
          router.push(`/emergency/${data.emergencyAlertId}`);
        } else {
          router.push('/emergency');
        }
        break;

      case 'job_completed':
        router.push('/technician/earnings');
        break;

      case 'system':
        router.push('/notifications');
        break;

      default:
        router.push('/(tabs)/dashboard');
        break;
    }
  };

  const sendTestNotification = async () => {
    if (!expoPushToken) {
      setError('No push token available');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'This is a test notification from RoadSide+ Trinidad & Tobago',
          data: { type: 'system', test: true },
        },
        trigger: { seconds: 1 },
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      setError('Failed to send test notification');
    }
  };

  const clearNotifications = async () => {
    try {
      await Notifications.dismissAllNotificationsAsync();
      setNotification(undefined);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const setBadgeCount = async (count: number) => {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  };

  const unregisterForPushNotifications = async () => {
    try {
      if (user) {
        await removePushToken(user.id);
        setExpoPushToken(undefined);
        console.log('Push token unregistered');
      }
    } catch (error) {
      console.error('Error unregistering push notifications:', error);
      setError('Failed to unregister push notifications');
    }
  };

  // Create notification channels for Android
  const createNotificationChannels = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#ef4444',
      });

      await Notifications.setNotificationChannelAsync('emergency', {
        name: 'Emergency Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250, 250, 250],
        lightColor: '#ff0000',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('service_updates', {
        name: 'Service Updates',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#ef4444',
      });
    }
  };

  // Initialize notification channels
  useEffect(() => {
    createNotificationChannels();
  }, []);

  return {
    expoPushToken,
    notification,
    error,
    sendTestNotification,
    clearNotifications,
    setBadgeCount,
    unregisterForPushNotifications,
    registerForPushNotifications,
  };
};
