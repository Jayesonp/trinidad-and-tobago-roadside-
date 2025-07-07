import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { usePushNotifications } from '../hooks/usePushNotifications';
import {
  registerForPush,
  configureNotifications,
  sendLocalNotification
} from '../services/notificationService';

const NotificationContext = createContext({});

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const pushNotifications = usePushNotifications();

  useEffect(() => {
    // Configure notifications
    configureNotifications();

    // Listen for incoming notifications
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotifications(prev => [notification, ...prev]);
    });

    // Listen for notification responses (when user taps notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle notification tap here
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const sendNotification = async (title, body, data = {}) => {
    await sendLocalNotification(title, body, data);
  };

  const clearNotifications = () => {
    setNotifications([]);
    pushNotifications.clearNotifications();
  };

  const value = {
    expoPushToken: pushNotifications.expoPushToken,
    notifications,
    sendNotification,
    clearNotifications,
    pushNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
