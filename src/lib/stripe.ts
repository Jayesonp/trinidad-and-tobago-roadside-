import axios from 'axios';
import Constants from 'expo-constants';

const { supabaseUrl } = Constants.expoConfig!.extra as any;

// Base API configuration for Stripe functions
const api = axios.create({
  baseURL: `${supabaseUrl}/functions/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface PaymentIntentResponse {
  clientSecret: string;
  customerId: string;
  ephemeralKey: string;
  paymentIntent: string;
}

export async function createPaymentIntent(amount: number): Promise<{ data: PaymentIntentResponse }> {
  try {
    const response = await api.post('/create-payment-intent', {
      amount,
      currency: 'ttd', // Trinidad & Tobago Dollar
      metadata: {
        platform: 'roadside-plus',
        country: 'TT'
      }
    });
    
    return { data: response.data };
  } catch (error) {
    console.error('Failed to create payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
}

export async function createServicePaymentIntent(
  serviceType: string,
  amount: number,
  location?: { latitude: number; longitude: number }
): Promise<{ data: PaymentIntentResponse }> {
  try {
    const response = await api.post('/create-service-payment', {
      amount,
      currency: 'ttd',
      serviceType,
      location,
      metadata: {
        platform: 'roadside-plus',
        serviceType,
        country: 'TT',
        location: location ? `${location.latitude},${location.longitude}` : undefined
      }
    });
    
    return { data: response.data };
  } catch (error) {
    console.error('Failed to create service payment intent:', error);
    throw new Error('Failed to create service payment intent');
  }
}

export async function createEmergencyPaymentIntent(
  serviceType: 'towing' | 'battery' | 'tire' | 'lockout' | 'fuel',
  location: { latitude: number; longitude: number }
): Promise<{ data: PaymentIntentResponse }> {
  // Emergency service rates in TTD cents
  const emergencyRates = {
    towing: 20000,    // TTD $200.00
    battery: 8000,    // TTD $80.00
    tire: 6000,       // TTD $60.00
    lockout: 5000,    // TTD $50.00
    fuel: 4000        // TTD $40.00
  };

  try {
    const response = await api.post('/create-emergency-payment', {
      amount: emergencyRates[serviceType],
      currency: 'ttd',
      serviceType,
      location,
      metadata: {
        platform: 'roadside-plus',
        emergency: true,
        serviceType,
        country: 'TT',
        location: `${location.latitude},${location.longitude}`
      }
    });
    
    return { data: response.data };
  } catch (error) {
    console.error('Failed to create emergency payment intent:', error);
    throw new Error('Failed to create emergency payment intent');
  }
}

export async function confirmPayment(paymentIntentId: string): Promise<any> {
  try {
    const response = await api.post('/confirm-payment', {
      paymentIntentId
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to confirm payment:', error);
    throw new Error('Failed to confirm payment');
  }
}

export async function getPaymentStatus(paymentIntentId: string): Promise<any> {
  try {
    const response = await api.get(`/payment-status/${paymentIntentId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get payment status:', error);
    throw new Error('Failed to get payment status');
  }
}

// Trinidad & Tobago specific payment utilities
export function formatTTDAmount(amountInCents: number): string {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('en-TT', {
    style: 'currency',
    currency: 'TTD',
    minimumFractionDigits: 2
  }).format(amount);
}

export function calculateTTDFees(baseAmountInCents: number) {
  const baseAmount = baseAmountInCents / 100;
  const platformFee = baseAmount * 0.05; // 5% platform fee
  const processingFee = baseAmount * 0.029 + 0.30; // Stripe fees
  const vat = (baseAmount + platformFee) * 0.125; // 12.5% VAT for T&T
  
  return {
    baseAmount: Math.round(baseAmount * 100),
    platformFee: Math.round(platformFee * 100),
    processingFee: Math.round(processingFee * 100),
    vat: Math.round(vat * 100),
    totalAmount: Math.round((baseAmount + platformFee + processingFee + vat) * 100)
  };
}

export const ROADSIDE_SERVICES = {
  towing: {
    name: 'Towing Service',
    basePrice: 20000, // TTD $200.00 in cents
    description: 'Vehicle towing to nearest service center',
    estimatedTime: '30-45 minutes'
  },
  battery: {
    name: 'Battery Jump Start',
    basePrice: 8000, // TTD $80.00 in cents
    description: 'Jump start your vehicle battery',
    estimatedTime: '15-30 minutes'
  },
  tire: {
    name: 'Tire Change',
    basePrice: 6000, // TTD $60.00 in cents
    description: 'Change flat tire with spare',
    estimatedTime: '20-30 minutes'
  },
  lockout: {
    name: 'Vehicle Lockout',
    basePrice: 5000, // TTD $50.00 in cents
    description: 'Unlock your vehicle safely',
    estimatedTime: '15-25 minutes'
  },
  fuel: {
    name: 'Fuel Delivery',
    basePrice: 4000, // TTD $40.00 in cents
    description: 'Emergency fuel delivery',
    estimatedTime: '20-35 minutes'
  }
} as const;

export type RoadsideServiceType = keyof typeof ROADSIDE_SERVICES;
