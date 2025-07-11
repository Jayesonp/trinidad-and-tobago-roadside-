import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { 
  createServiceRequest, 
  updateServiceRequest, 
  getServiceRequest,
  subscribeToServiceRequestUpdates,
  createPayment,
  createReview
} from '../lib/database';
import { usePayment } from './usePayment';
import { useLocation } from './useLocation';
import { 
  ServiceRequest, 
  CreateServiceRequestData, 
  NearbyTechnician,
  Service,
  ServiceRequestWithDetails,
  RequestStatus
} from '../types/database';
import { LocationCoords } from '../services/locationService';

export interface ServiceBookingState {
  currentRequest: ServiceRequestWithDetails | null;
  selectedService: Service | null;
  selectedTechnician: NearbyTechnician | null;
  customerLocation: LocationCoords | null;
  bookingStep: 'service' | 'location' | 'technician' | 'payment' | 'confirmation' | 'tracking';
  loading: boolean;
  error: string | null;
}

export interface UseServiceBookingReturn extends ServiceBookingState {
  // Service selection
  selectService: (service: Service) => void;
  
  // Location selection
  setCustomerLocation: (location: LocationCoords) => void;
  
  // Technician selection
  selectTechnician: (technician: NearbyTechnician) => void;
  
  // Booking flow
  createBooking: (description?: string, isEmergency?: boolean) => Promise<ServiceRequest | null>;
  confirmBooking: () => Promise<boolean>;
  cancelBooking: (reason?: string) => Promise<boolean>;
  
  // Payment
  processPayment: (paymentMethodId: string) => Promise<boolean>;
  
  // Tracking
  trackService: (requestId: string) => void;
  stopTracking: () => void;
  
  // Rating
  submitRating: (rating: number, comment?: string) => Promise<boolean>;
  
  // Navigation
  goToStep: (step: ServiceBookingState['bookingStep']) => void;
  resetBooking: () => void;
}

export function useServiceBooking(): UseServiceBookingReturn {
  const [state, setState] = useState<ServiceBookingState>({
    currentRequest: null,
    selectedService: null,
    selectedTechnician: null,
    customerLocation: null,
    bookingStep: 'service',
    loading: false,
    error: null,
  });

  const { currentLocation } = useLocation();
  const payment = usePayment();

  // Auto-set customer location when available
  useEffect(() => {
    if (currentLocation && !state.customerLocation) {
      setState(prev => ({ ...prev, customerLocation: currentLocation }));
    }
  }, [currentLocation]);

  const selectService = (service: Service) => {
    setState(prev => ({
      ...prev,
      selectedService: service,
      bookingStep: 'location',
      error: null,
    }));
  };

  const setCustomerLocation = (location: LocationCoords) => {
    setState(prev => ({
      ...prev,
      customerLocation: location,
      bookingStep: 'technician',
    }));
  };

  const selectTechnician = (technician: NearbyTechnician) => {
    setState(prev => ({
      ...prev,
      selectedTechnician: technician,
      bookingStep: 'payment',
    }));
  };

  const createBooking = async (description?: string, isEmergency = false): Promise<ServiceRequest | null> => {
    const { selectedService, customerLocation, selectedTechnician } = state;
    
    if (!selectedService || !customerLocation) {
      setState(prev => ({ ...prev, error: 'Missing required booking information' }));
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const bookingData: CreateServiceRequestData = {
        service_id: selectedService.id,
        service_type: selectedService.type,
        location_lat: customerLocation.latitude,
        location_lng: customerLocation.longitude,
        description,
        emergency: isEmergency,
        estimated_price_ttd: selectedService.base_price_ttd * (isEmergency ? 1.5 : 1), // 50% emergency surcharge
        technician_id: selectedTechnician?.id,
      };

      const request = await createServiceRequest(bookingData);
      
      setState(prev => ({
        ...prev,
        currentRequest: { ...request, service: selectedService } as ServiceRequestWithDetails,
        bookingStep: 'confirmation',
        loading: false,
      }));

      return request;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      Alert.alert('Booking Failed', errorMessage);
      return null;
    }
  };

  const confirmBooking = async (): Promise<boolean> => {
    if (!state.currentRequest) return false;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await updateServiceRequest(state.currentRequest.id, {
        status: 'assigned' as RequestStatus,
      });

      setState(prev => ({
        ...prev,
        bookingStep: 'tracking',
        loading: false,
      }));

      // Start tracking the service request
      trackService(state.currentRequest.id);
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to confirm booking';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      Alert.alert('Confirmation Failed', errorMessage);
      return false;
    }
  };

  const cancelBooking = async (reason?: string): Promise<boolean> => {
    if (!state.currentRequest) return false;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await updateServiceRequest(state.currentRequest.id, {
        status: 'cancelled' as RequestStatus,
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
      });

      Alert.alert('Booking Cancelled', 'Your service request has been cancelled.');
      resetBooking();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      Alert.alert('Cancellation Failed', errorMessage);
      return false;
    }
  };

  const processPayment = async (paymentMethodId: string): Promise<boolean> => {
    const { currentRequest, selectedService } = state;
    
    if (!currentRequest || !selectedService) return false;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Create payment intent
      await payment.createPayment(selectedService.id, currentRequest.estimated_price_ttd || 0);
      
      // Process payment
      const paymentResult = await payment.processPayment(paymentMethodId);
      
      if (paymentResult) {
        // Create payment record
        await createPayment({
          service_request_id: currentRequest.id,
          amount_ttd: currentRequest.estimated_price_ttd || 0,
          payment_method: 'card',
          stripe_payment_intent_id: paymentResult.id,
          status: 'completed',
        });

        setState(prev => ({ ...prev, loading: false }));
        return true;
      }
      
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      Alert.alert('Payment Failed', errorMessage);
      return false;
    }
  };

  const trackService = (requestId: string) => {
    const subscription = subscribeToServiceRequestUpdates(requestId, (payload) => {
      if (payload.new) {
        setState(prev => ({
          ...prev,
          currentRequest: prev.currentRequest ? {
            ...prev.currentRequest,
            ...payload.new,
          } : null,
        }));
      }
    });

    // Store subscription for cleanup
    setState(prev => ({ ...prev, subscription }));
  };

  const stopTracking = () => {
    // Cleanup subscription if exists
    setState(prev => {
      if (prev.subscription) {
        prev.subscription.unsubscribe();
      }
      return { ...prev, subscription: undefined };
    });
  };

  const submitRating = async (rating: number, comment?: string): Promise<boolean> => {
    const { currentRequest, selectedTechnician } = state;
    
    if (!currentRequest || !selectedTechnician) return false;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await createReview({
        service_request_id: currentRequest.id,
        technician_id: selectedTechnician.id,
        rating,
        comment,
      });

      Alert.alert('Thank You!', 'Your rating has been submitted.');
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit rating';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      Alert.alert('Rating Failed', errorMessage);
      return false;
    }
  };

  const goToStep = (step: ServiceBookingState['bookingStep']) => {
    setState(prev => ({ ...prev, bookingStep: step }));
  };

  const resetBooking = () => {
    stopTracking();
    payment.resetPayment();
    setState({
      currentRequest: null,
      selectedService: null,
      selectedTechnician: null,
      customerLocation: null,
      bookingStep: 'service',
      loading: false,
      error: null,
    });
  };

  return {
    ...state,
    selectService,
    setCustomerLocation,
    selectTechnician,
    createBooking,
    confirmBooking,
    cancelBooking,
    processPayment,
    trackService,
    stopTracking,
    submitRating,
    goToStep,
    resetBooking,
  };
}
