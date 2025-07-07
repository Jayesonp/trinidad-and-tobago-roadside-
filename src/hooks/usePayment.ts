import { useState } from 'react';
import { useStripe } from '@stripe/stripe-react-native';
import { 
  createServicePaymentIntent, 
  confirmPayment, 
  createEmergencyPaymentIntent,
  calculateServiceFees,
  handlePaymentError,
  trackPaymentEvent
} from '../services/paymentService';

export interface PaymentState {
  loading: boolean;
  error: string | null;
  paymentIntent: any;
  clientSecret: string | null;
}

export const usePayment = () => {
  const { confirmPayment: stripeConfirmPayment } = useStripe();
  const [state, setState] = useState<PaymentState>({
    loading: false,
    error: null,
    paymentIntent: null,
    clientSecret: null,
  });

  const createPayment = async (serviceId: string, amount: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await trackPaymentEvent('payment_initiated', {
        amount,
        serviceType: serviceId,
      });

      const response = await createServicePaymentIntent(serviceId, amount);
      
      setState(prev => ({
        ...prev,
        loading: false,
        paymentIntent: response.paymentIntent,
        clientSecret: response.clientSecret,
      }));

      return response;
    } catch (error: any) {
      const errorMessage = handlePaymentError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      await trackPaymentEvent('payment_failed', {
        amount,
        serviceType: serviceId,
        error: errorMessage,
      });

      throw error;
    }
  };

  const processPayment = async (paymentMethodId: string) => {
    if (!state.clientSecret) {
      throw new Error('No payment intent available');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { error, paymentIntent } = await stripeConfirmPayment(
        state.clientSecret,
        {
          paymentMethodType: 'Card',
          paymentMethodData: {
            paymentMethodId,
          },
        }
      );

      if (error) {
        throw error;
      }

      await trackPaymentEvent('payment_succeeded', {
        amount: paymentIntent?.amount ? paymentIntent.amount / 100 : 0,
        serviceType: paymentIntent?.metadata?.serviceId || 'unknown',
        paymentMethod: 'card',
      });

      setState(prev => ({
        ...prev,
        loading: false,
        paymentIntent,
      }));

      return paymentIntent;
    } catch (error: any) {
      const errorMessage = handlePaymentError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      await trackPaymentEvent('payment_failed', {
        amount: state.paymentIntent?.amount ? state.paymentIntent.amount / 100 : 0,
        serviceType: state.paymentIntent?.metadata?.serviceId || 'unknown',
        error: errorMessage,
      });

      throw error;
    }
  };

  const createEmergencyPayment = async (
    serviceType: 'towing' | 'battery' | 'tire' | 'lockout' | 'fuel',
    location: { latitude: number; longitude: number }
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await trackPaymentEvent('payment_initiated', {
        amount: 0, // Will be calculated by service
        serviceType,
      });

      const response = await createEmergencyPaymentIntent(serviceType, location);
      
      setState(prev => ({
        ...prev,
        loading: false,
        paymentIntent: response.paymentIntent,
        clientSecret: response.clientSecret,
      }));

      return response;
    } catch (error: any) {
      const errorMessage = handlePaymentError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      await trackPaymentEvent('payment_failed', {
        amount: 0,
        serviceType,
        error: errorMessage,
      });

      throw error;
    }
  };

  const calculateFees = (amount: number) => {
    return calculateServiceFees(amount);
  };

  const resetPayment = () => {
    setState({
      loading: false,
      error: null,
      paymentIntent: null,
      clientSecret: null,
    });
  };

  return {
    ...state,
    createPayment,
    processPayment,
    createEmergencyPayment,
    calculateFees,
    resetPayment,
  };
};
