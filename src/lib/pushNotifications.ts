import { Expo } from 'expo-server-sdk';
const expo = new Expo();

export async function sendPush(token: string, title: string, body: string) {
  if (!Expo.isExpoPushToken(token)) return;
  const message = { to: token, sound: 'default', title, body };
  const chunks = expo.chunkPushNotifications([message]);
  for (const chunk of chunks) await expo.sendPushNotificationsAsync(chunk);
}

// Enhanced push notification functions for RoadSide+ Trinidad & Tobago

interface PushNotificationData {
  type: 'service_update' | 'payment' | 'emergency' | 'technician_assigned' | 'job_completed' | 'system';
  serviceRequestId?: string;
  technicianId?: string;
  paymentId?: string;
  emergencyAlertId?: string;
  [key: string]: any;
}

interface PushMessage {
  to: string;
  sound: 'default' | null;
  title: string;
  body: string;
  data?: PushNotificationData;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

export async function sendEnhancedPush(
  token: string,
  title: string,
  body: string,
  data?: PushNotificationData,
  options?: {
    sound?: 'default' | null;
    badge?: number;
    priority?: 'default' | 'normal' | 'high';
  }
) {
  if (!Expo.isExpoPushToken(token)) {
    console.warn('Invalid Expo push token:', token);
    return;
  }

  const message: PushMessage = {
    to: token,
    sound: options?.sound || 'default',
    title,
    body,
    data,
    badge: options?.badge,
    priority: options?.priority || 'default',
  };

  // Set Android notification channel based on type
  if (data?.type === 'emergency') {
    message.channelId = 'emergency';
    message.priority = 'high';
  } else if (data?.type === 'service_update') {
    message.channelId = 'service_updates';
  }

  try {
    const chunks = expo.chunkPushNotifications([message]);
    const tickets = [];
    
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    // Handle any errors
    for (const ticket of tickets) {
      if (ticket.status === 'error') {
        console.error('Push notification error:', ticket.message);
        if (ticket.details?.error === 'DeviceNotRegistered') {
          // Token is invalid, should be removed from database
          console.warn('Device not registered, token should be removed:', token);
        }
      }
    }

    return tickets;
  } catch (error) {
    console.error('Failed to send push notification:', error);
    throw error;
  }
}

// Service-specific notification functions

export async function notifyServiceRequestUpdate(
  token: string,
  serviceRequestId: string,
  status: string,
  technicianName?: string
) {
  const statusMessages = {
    assigned: `Your service request has been assigned to ${technicianName || 'a technician'}`,
    in_progress: `${technicianName || 'Your technician'} has started working on your request`,
    completed: 'Your service request has been completed',
    cancelled: 'Your service request has been cancelled',
  };

  const title = 'Service Update';
  const body = statusMessages[status as keyof typeof statusMessages] || `Service status updated to ${status}`;

  await sendEnhancedPush(token, title, body, {
    type: 'service_update',
    serviceRequestId,
    status,
  });
}

export async function notifyTechnicianNewJob(
  token: string,
  serviceRequestId: string,
  serviceType: string,
  location: string,
  emergency: boolean = false
) {
  const title = emergency ? '🚨 Emergency Job Available' : 'New Job Available';
  const body = `${serviceType} service needed at ${location}`;

  await sendEnhancedPush(token, title, body, {
    type: 'technician_assigned',
    serviceRequestId,
    serviceType,
    emergency,
  }, {
    priority: emergency ? 'high' : 'default',
  });
}

export async function notifyPaymentUpdate(
  token: string,
  paymentId: string,
  status: string,
  amount: number
) {
  const statusMessages = {
    completed: `Payment of TTD $${amount.toFixed(2)} completed successfully`,
    failed: `Payment of TTD $${amount.toFixed(2)} failed. Please try again`,
    refunded: `Refund of TTD $${amount.toFixed(2)} has been processed`,
  };

  const title = 'Payment Update';
  const body = statusMessages[status as keyof typeof statusMessages] || `Payment status: ${status}`;

  await sendEnhancedPush(token, title, body, {
    type: 'payment',
    paymentId,
    status,
    amount,
  });
}

export async function notifyEmergencyAlert(
  token: string,
  emergencyAlertId: string,
  alertType: string,
  location: string
) {
  const title = '🚨 Emergency Alert';
  const body = `${alertType} emergency at ${location}. Immediate assistance required.`;

  await sendEnhancedPush(token, title, body, {
    type: 'emergency',
    emergencyAlertId,
    alertType,
    location,
  }, {
    priority: 'high',
    sound: 'default',
  });
}

export async function notifyTechnicianArrival(
  token: string,
  serviceRequestId: string,
  technicianName: string,
  estimatedArrival: string
) {
  const title = 'Technician En Route';
  const body = `${technicianName} is on the way. ETA: ${estimatedArrival}`;

  await sendEnhancedPush(token, title, body, {
    type: 'service_update',
    serviceRequestId,
    status: 'en_route',
  });
}

export async function notifyRatingRequest(
  token: string,
  serviceRequestId: string,
  technicianName: string
) {
  const title = 'Rate Your Service';
  const body = `How was your experience with ${technicianName}? Please rate your service.`;

  await sendEnhancedPush(token, title, body, {
    type: 'service_update',
    serviceRequestId,
    action: 'rate_service',
  });
}

// Batch notification functions

export async function sendBatchNotifications(
  notifications: Array<{
    token: string;
    title: string;
    body: string;
    data?: PushNotificationData;
  }>
) {
  const validNotifications = notifications.filter(n => 
    Expo.isExpoPushToken(n.token)
  );

  if (validNotifications.length === 0) {
    console.warn('No valid push tokens provided');
    return;
  }

  const messages: PushMessage[] = validNotifications.map(n => ({
    to: n.token,
    sound: 'default',
    title: n.title,
    body: n.body,
    data: n.data,
  }));

  try {
    const chunks = expo.chunkPushNotifications(messages);
    const allTickets = [];

    for (const chunk of chunks) {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      allTickets.push(...tickets);
    }

    return allTickets;
  } catch (error) {
    console.error('Failed to send batch notifications:', error);
    throw error;
  }
}

// Emergency broadcast to all available technicians
export async function broadcastEmergencyToTechnicians(
  technicianTokens: string[],
  emergencyAlertId: string,
  alertType: string,
  location: string
) {
  const notifications = technicianTokens.map(token => ({
    token,
    title: '🚨 Emergency Broadcast',
    body: `${alertType} emergency at ${location}. All available technicians please respond.`,
    data: {
      type: 'emergency' as const,
      emergencyAlertId,
      alertType,
      location,
      broadcast: true,
    },
  }));

  return await sendBatchNotifications(notifications);
}

// Trinidad & Tobago specific emergency notifications
export async function notifyTrinidadEmergencyServices(
  token: string,
  alertType: string,
  location: string,
  userPhone?: string
) {
  const title = '🇹🇹 Trinidad & Tobago Emergency';
  const body = `${alertType} reported at ${location}. ${userPhone ? `Contact: ${userPhone}` : 'Immediate response required.'}`;

  await sendEnhancedPush(token, title, body, {
    type: 'emergency',
    alertType,
    location,
    country: 'TT',
    userPhone,
  }, {
    priority: 'high',
  });
}

// Utility functions

export function validatePushToken(token: string): boolean {
  return Expo.isExpoPushToken(token);
}

export async function handlePushTickets(tickets: any[]) {
  const receiptIds = tickets
    .filter(ticket => ticket.status === 'ok')
    .map(ticket => ticket.id);

  if (receiptIds.length === 0) return;

  try {
    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    
    for (const chunk of receiptIdChunks) {
      const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      
      for (const receiptId in receipts) {
        const receipt = receipts[receiptId];
        
        if (receipt.status === 'error') {
          console.error('Push notification receipt error:', receipt.message);
          
          if (receipt.details?.error === 'DeviceNotRegistered') {
            // Token is invalid and should be removed from database
            console.warn('Device not registered, remove token from database');
          }
        }
      }
    }
  } catch (error) {
    console.error('Error handling push receipts:', error);
  }
}
