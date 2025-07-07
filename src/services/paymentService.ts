import axios from 'axios';
import Constants from 'expo-constants';

const { supabaseUrl } = Constants.expoConfig!.extra as any;

// Base API configuration
const api = axios.create({
  baseURL: `${supabaseUrl}/functions/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function createPaymentIntent(amount: number) {
  return axios.post('https://your-cloud-function.com/create-payment-intent', {
    amount
  });
}

// Create payment intent for service
export async function createServicePaymentIntent(
  serviceId: string,
  amount: number,
  currency: string = 'TTD'
) {
  try {
    const response = await api.post('/create-payment-intent', {
      serviceId,
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        serviceId,
        platform: 'roadside-plus',
        country: 'TT'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    throw new Error('Failed to create payment intent');
  }
}

// Confirm payment
export async function confirmPayment(
  paymentIntentId: string,
  paymentMethodId: string
) {
  try {
    const response = await api.post('/confirm-payment', {
      paymentIntentId,
      paymentMethodId
    });
    return response.data;
  } catch (error) {
    console.error('Payment confirmation failed:', error);
    throw new Error('Failed to confirm payment');
  }
}

// Get payment status
export async function getPaymentStatus(paymentIntentId: string) {
  try {
    const response = await api.get(`/payment-status/${paymentIntentId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get payment status:', error);
    throw new Error('Failed to retrieve payment status');
  }
}

// Process refund
export async function processRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: string
) {
  try {
    const response = await api.post('/process-refund', {
      paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason || 'Service cancellation'
    });
    return response.data;
  } catch (error) {
    console.error('Refund processing failed:', error);
    throw new Error('Failed to process refund');
  }
}

// Calculate service fees (Trinidad & Tobago specific)
export function calculateServiceFees(baseAmount: number) {
  const platformFee = baseAmount * 0.05; // 5% platform fee
  const processingFee = baseAmount * 0.029 + 0.30; // Stripe fees
  const vat = (baseAmount + platformFee) * 0.125; // 12.5% VAT for T&T
  
  return {
    baseAmount,
    platformFee: Math.round(platformFee * 100) / 100,
    processingFee: Math.round(processingFee * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    totalAmount: Math.round((baseAmount + platformFee + processingFee + vat) * 100) / 100
  };
}

// Format currency for Trinidad & Tobago
export function formatTTDCurrency(amount: number): string {
  return new Intl.NumberFormat('en-TT', {
    style: 'currency',
    currency: 'TTD',
    minimumFractionDigits: 2
  }).format(amount);
}

// Validate payment amount
export function validatePaymentAmount(amount: number): boolean {
  // Minimum $5 TTD, Maximum $5000 TTD for roadside services
  return amount >= 5 && amount <= 5000;
}

// Emergency payment (for SOS services)
export async function createEmergencyPaymentIntent(
  serviceType: 'towing' | 'battery' | 'tire' | 'lockout' | 'fuel',
  location: { latitude: number; longitude: number }
) {
  const emergencyRates = {
    towing: 200,
    battery: 80,
    tire: 60,
    lockout: 50,
    fuel: 40
  };

  const baseAmount = emergencyRates[serviceType];
  const fees = calculateServiceFees(baseAmount);

  try {
    const response = await api.post('/create-emergency-payment', {
      serviceType,
      location,
      amount: Math.round(fees.totalAmount * 100),
      currency: 'ttd',
      metadata: {
        emergency: true,
        serviceType,
        location: `${location.latitude},${location.longitude}`,
        platform: 'roadside-plus'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Emergency payment creation failed:', error);
    throw new Error('Failed to create emergency payment');
  }
}

// Payment methods for Trinidad & Tobago
export const SUPPORTED_PAYMENT_METHODS = {
  cards: ['visa', 'mastercard', 'amex'],
  localMethods: ['linx', 'wired'], // Local T&T payment methods
  digitalWallets: ['apple_pay', 'google_pay']
};

// Payment error handling
export function handlePaymentError(error: any): string {
  const errorMessages: Record<string, string> = {
    'card_declined': 'Your card was declined. Please try a different payment method.',
    'insufficient_funds': 'Insufficient funds. Please check your account balance.',
    'expired_card': 'Your card has expired. Please use a different card.',
    'incorrect_cvc': 'Your card security code is incorrect.',
    'processing_error': 'There was an error processing your payment. Please try again.',
    'authentication_required': 'Additional authentication is required for this payment.',
    'currency_not_supported': 'TTD currency is not supported by this payment method.'
  };

  const errorCode = error?.code || error?.type || 'processing_error';
  return errorMessages[errorCode] || 'An unexpected payment error occurred. Please try again.';
}

// Payment analytics
export async function trackPaymentEvent(
  event: 'payment_initiated' | 'payment_succeeded' | 'payment_failed',
  data: {
    amount: number;
    serviceType: string;
    paymentMethod?: string;
    error?: string;
  }
) {
  try {
    await api.post('/track-payment-event', {
      event,
      timestamp: new Date().toISOString(),
      ...data
    });
  } catch (error) {
    console.error('Failed to track payment event:', error);
  }
}
