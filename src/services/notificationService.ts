import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import {
  sendEnhancedPush,
  notifyServiceRequestUpdate,
  notifyTechnicianNewJob,
  notifyPaymentUpdate,
  notifyEmergencyAlert,
  broadcastEmergencyToTechnicians,
  notifyTrinidadEmergencyServices
} from '../lib/pushNotifications';
import type { ServiceRequest, EmergencyAlert, Payment } from '../types/database';

export async function registerForPush(): Promise<string | null> {
  if (!Device.isDevice) return null;
  const { status } = await Notifications.getPermissionsAsync();
  let finalStatus = status;
  if (finalStatus !== 'granted') {
    const { status: askStatus } = await Notifications.requestPermissionsAsync();
    finalStatus = askStatus;
  }
  if (finalStatus !== 'granted') return null;
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default', importance: Notifications.AndroidImportance.DEFAULT
    });
  }
  return token;
}

// Configure notification handler
export const configureNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

// Send local notification
export const sendLocalNotification = async (title: string, body: string, data: any = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: { seconds: 1 },
  });
};

// Send push notification (server-side function)
export const sendPushNotification = async (
  expoPushToken: string,
  title: string,
  body: string,
  data: any = {}
) => {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
};

// Emergency notification with high priority
export const sendEmergencyNotification = async (title: string, body: string, data: any = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      sound: 'default',
    },
    trigger: null, // Show immediately
  });
};

// Clear all notifications
export const clearAllNotifications = async () => {
  await Notifications.dismissAllNotificationsAsync();
};

// Get notification permissions status
export const getNotificationPermissions = async () => {
  return await Notifications.getPermissionsAsync();
};

// Request notification permissions
export const requestNotificationPermissions = async () => {
  return await Notifications.requestPermissionsAsync();
};

// Store and manage push tokens
export async function storePushToken(userId: string, pushToken: string): Promise<void> {
  try {
    // Update user's push token in the database
    const { error } = await supabase
      .from('users')
      .update({ push_token: pushToken })
      .eq('id', userId);

    if (error) {
      console.error('Failed to store push token:', error);
      throw error;
    }

    console.log('Push token stored successfully for user:', userId);
  } catch (error) {
    console.error('Error storing push token:', error);
    throw error;
  }
}

export async function removePushToken(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ push_token: null })
      .eq('id', userId);

    if (error) {
      console.error('Failed to remove push token:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error removing push token:', error);
    throw error;
  }
}

// Get user's push token
async function getUserPushToken(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('push_token')
      .eq('id', userId)
      .single();

    if (error || !data?.push_token) {
      return null;
    }

    return data.push_token;
  } catch (error) {
    console.error('Error getting user push token:', error);
    return null;
  }
}

// Service request notifications
export async function notifyServiceRequestStatusChange(
  serviceRequest: ServiceRequest,
  previousStatus?: string
): Promise<void> {
  try {
    // Notify customer
    const customerToken = await getUserPushToken(serviceRequest.user_id);
    if (customerToken) {
      let technicianName: string | undefined;

      if (serviceRequest.technician_id) {
        const { data: technician } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', serviceRequest.technician_id)
          .single();

        technicianName = technician?.full_name;
      }

      await notifyServiceRequestUpdate(
        customerToken,
        serviceRequest.id,
        serviceRequest.status,
        technicianName
      );
    }

    // Notify technician if assigned
    if (serviceRequest.technician_id && serviceRequest.status === 'assigned') {
      const technicianToken = await getUserPushToken(serviceRequest.technician_id);
      if (technicianToken) {
        await notifyTechnicianNewJob(
          technicianToken,
          serviceRequest.id,
          serviceRequest.service_type,
          serviceRequest.location_address || 'Unknown location',
          serviceRequest.emergency
        );
      }
    }

    // Store notification in database
    await createDatabaseNotification(
      serviceRequest.user_id,
      'Service Update',
      `Your ${serviceRequest.service_type} service is now ${serviceRequest.status}`,
      'service_update',
      { serviceRequestId: serviceRequest.id, status: serviceRequest.status }
    );

  } catch (error) {
    console.error('Error sending service request notification:', error);
  }
}

// Emergency alert notifications
export async function notifyEmergencyAlertCreated(alert: EmergencyAlert): Promise<void> {
  try {
    // Get all available emergency responders
    const { data: responders } = await supabase
      .from('users')
      .select('id, push_token, role')
      .in('role', ['security', 'admin', 'super_admin'])
      .not('push_token', 'is', null);

    // Get available technicians
    const { data: technicians } = await supabase
      .from('technicians')
      .select('id, users!inner(push_token)')
      .eq('status', 'available')
      .eq('active', true)
      .not('users.push_token', 'is', null);

    // Collect all tokens
    const responderTokens = responders?.map(r => r.push_token).filter(Boolean) || [];
    const technicianTokens = technicians?.map(t => t.users.push_token).filter(Boolean) || [];
    const allTokens = [...responderTokens, ...technicianTokens];

    if (allTokens.length > 0) {
      await broadcastEmergencyToTechnicians(
        allTokens,
        alert.id,
        alert.alert_type,
        alert.location_address || `${alert.location_lat}, ${alert.location_lng}`
      );
    }

  } catch (error) {
    console.error('Error sending emergency alert notifications:', error);
  }
}

// Database notification storage
async function createDatabaseNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  data?: any
): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        title,
        message,
        type,
        data,
      }]);

    if (error) {
      console.error('Failed to create database notification:', error);
    }
  } catch (error) {
    console.error('Error creating database notification:', error);
  }
}
