import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { colors, spacing, typography } from '../../constants/theme';
import { useServiceBooking } from '../../hooks/useServiceBooking';
import { getServices } from '../../lib/database';
import { Service } from '../../types/database';
import ServiceCard from '../../components/ServiceCard';
import TechnicianFinder from '../../components/maps/TechnicianFinder';
import ServiceMap from '../../components/maps/ServiceMap';
import { PrimaryButton } from '../../components/PrimaryButton';

export default function ServiceBookingScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [description, setDescription] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [loading, setLoading] = useState(false);

  const booking = useServiceBooking();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const servicesData = await getServices();
      setServices(servicesData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    booking.selectService(service);
  };

  const handleLocationConfirm = () => {
    if (booking.customerLocation) {
      booking.goToStep('technician');
    } else {
      Alert.alert('Location Required', 'Please select your location on the map');
    }
  };

  const handleTechnicianSelect = (technician: any) => {
    booking.selectTechnician(technician);
  };

  const handleBookingCreate = async () => {
    const request = await booking.createBooking(description, isEmergency);
    if (request) {
      Alert.alert(
        'Booking Created',
        'Your service request has been created. Proceed to payment?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Pay Now', onPress: () => booking.goToStep('payment') },
        ]
      );
    }
  };

  const handlePayment = async () => {
    // This would integrate with your payment flow
    // For now, we'll simulate a successful payment
    const success = await booking.processPayment('pm_card_visa'); // Mock payment method
    if (success) {
      await booking.confirmBooking();
      Alert.alert('Success', 'Payment processed and booking confirmed!');
    }
  };

  const renderServiceSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select a Service</Text>
      <Text style={styles.stepDescription}>
        Choose the type of roadside assistance you need
      </Text>
      
      <ScrollView style={styles.servicesContainer} showsVerticalScrollIndicator={false}>
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={{
              id: service.id,
              name: service.name,
              description: service.description || '',
              price: service.base_price_ttd,
              responseTime: service.estimated_duration_minutes || 30,
            }}
            onPress={() => handleServiceSelect(service)}
            style={styles.serviceCard}
          />
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.emergencyToggle}
        onPress={() => setIsEmergency(!isEmergency)}
      >
        <Ionicons
          name={isEmergency ? 'checkbox' : 'square-outline'}
          size={24}
          color={isEmergency ? colors.error.main : colors.text.secondary}
        />
        <Text style={styles.emergencyText}>This is an emergency (+50% surcharge)</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLocationSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Confirm Your Location</Text>
      <Text style={styles.stepDescription}>
        Make sure your location is accurate for the technician to find you
      </Text>

      <View style={styles.mapContainer}>
        <ServiceMap
          customerLocation={booking.customerLocation || undefined}
          onLocationSelect={booking.setCustomerLocation}
          style={styles.map}
        />
      </View>

      <View style={styles.locationInfo}>
        <Ionicons name="location" size={20} color={colors.primary.main} />
        <Text style={styles.locationText}>
          {booking.customerLocation
            ? `${booking.customerLocation.latitude.toFixed(4)}, ${booking.customerLocation.longitude.toFixed(4)}`
            : 'Tap on the map to set your location'
          }
        </Text>
      </View>

      <PrimaryButton onPress={handleLocationConfirm} disabled={!booking.customerLocation}>
        Confirm Location
      </PrimaryButton>
    </View>
  );

  const renderTechnicianSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose a Technician</Text>
      <Text style={styles.stepDescription}>
        Select from available technicians near your location
      </Text>

      <TechnicianFinder
        onTechnicianSelect={handleTechnicianSelect}
        selectedServiceType={booking.selectedService?.type}
      />

      {booking.selectedTechnician && (
        <View style={styles.selectedTechnicianInfo}>
          <Text style={styles.selectedTechnicianText}>
            Selected: {booking.selectedTechnician.user?.full_name}
          </Text>
          <PrimaryButton onPress={() => booking.goToStep('payment')}>
            Continue to Payment
          </PrimaryButton>
        </View>
      )}
    </View>
  );

  const renderPaymentStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Service Details</Text>
      
      <View style={styles.bookingSummary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service:</Text>
          <Text style={styles.summaryValue}>{booking.selectedService?.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Technician:</Text>
          <Text style={styles.summaryValue}>
            {booking.selectedTechnician?.user?.full_name}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Base Price:</Text>
          <Text style={styles.summaryValue}>
            ${booking.selectedService?.base_price_ttd} TTD
          </Text>
        </View>
        {isEmergency && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Emergency Surcharge:</Text>
            <Text style={styles.summaryValue}>
              +${((booking.selectedService?.base_price_ttd || 0) * 0.5).toFixed(2)} TTD
            </Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>
            ${((booking.selectedService?.base_price_ttd || 0) * (isEmergency ? 1.5 : 1)).toFixed(2)} TTD
          </Text>
        </View>
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionLabel}>Additional Details (Optional)</Text>
        <TextInput
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your situation or provide additional details..."
          placeholderTextColor={colors.text.tertiary}
          multiline
          numberOfLines={3}
        />
      </View>

      <PrimaryButton onPress={handleBookingCreate} loading={booking.loading}>
        Create Booking
      </PrimaryButton>
    </View>
  );

  const renderConfirmationStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.confirmationIcon}>
        <Ionicons name="checkmark-circle" size={64} color={colors.success.main} />
      </View>
      <Text style={styles.confirmationTitle}>Booking Created!</Text>
      <Text style={styles.confirmationText}>
        Your service request has been created and sent to the technician.
      </Text>

      <View style={styles.confirmationDetails}>
        <Text style={styles.confirmationLabel}>Request ID:</Text>
        <Text style={styles.confirmationValue}>{booking.currentRequest?.id}</Text>
      </View>

      <PrimaryButton onPress={handlePayment} loading={booking.loading}>
        Process Payment
      </PrimaryButton>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => booking.cancelBooking('Customer cancelled')}
      >
        <Text style={styles.cancelButtonText}>Cancel Booking</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTrackingStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Service in Progress</Text>
      <Text style={styles.stepDescription}>
        Your technician is on the way. You can track their progress below.
      </Text>

      <View style={styles.trackingContainer}>
        <ServiceMap
          customerLocation={booking.customerLocation || undefined}
          technicianLocation={booking.selectedTechnician ? {
            latitude: booking.selectedTechnician.current_lat || 0,
            longitude: booking.selectedTechnician.current_lng || 0,
          } : undefined}
          showRoute={true}
          style={styles.trackingMap}
        />
      </View>

      <TouchableOpacity
        style={styles.contactButton}
        onPress={() => Alert.alert('Contact', 'Calling technician...')}
      >
        <Ionicons name="call" size={20} color={colors.primary.contrast} />
        <Text style={styles.contactButtonText}>Contact Technician</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStepContent = () => {
    switch (booking.bookingStep) {
      case 'service':
        return renderServiceSelection();
      case 'location':
        return renderLocationSelection();
      case 'technician':
        return renderTechnicianSelection();
      case 'payment':
        return renderPaymentStep();
      case 'confirmation':
        return renderConfirmationStep();
      case 'tracking':
        return renderTrackingStep();
      default:
        return renderServiceSelection();
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Book Service</Text>
      <TouchableOpacity onPress={booking.resetBooking}>
        <Ionicons name="refresh" size={24} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {renderHeader()}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderStepContent()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.semibold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: spacing.lg,
  },
  stepTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  stepDescription: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.regular,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  servicesContainer: {
    maxHeight: 400,
  },
  serviceCard: {
    marginBottom: spacing.md,
  },
  emergencyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface.primary,
    borderRadius: 8,
  },
  emergencyText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.medium,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  map: {
    flex: 1,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface.primary,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  locationText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.medium,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  selectedTechnicianInfo: {
    padding: spacing.md,
    backgroundColor: colors.surface.primary,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  selectedTechnicianText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  bookingSummary: {
    backgroundColor: colors.surface.primary,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.medium,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.semibold,
    color: colors.text.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  totalLabel: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.bold,
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.bold,
    color: colors.primary.main,
  },
  descriptionContainer: {
    marginBottom: spacing.lg,
  },
  descriptionLabel: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  descriptionInput: {
    backgroundColor: colors.surface.primary,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.regular,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    textAlignVertical: 'top',
  },
  confirmationIcon: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  confirmationTitle: {
    fontSize: typography.sizes['2xl'],
    fontFamily: typography.fonts.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  confirmationText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  confirmationDetails: {
    backgroundColor: colors.surface.primary,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  confirmationLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.medium,
    color: colors.text.secondary,
  },
  confirmationValue: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.semibold,
    color: colors.text.primary,
  },
  cancelButton: {
    marginTop: spacing.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.medium,
    color: colors.error.main,
  },
  trackingContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  trackingMap: {
    flex: 1,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main,
    borderRadius: 8,
    padding: spacing.md,
  },
  contactButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.semibold,
    color: colors.primary.contrast,
    marginLeft: spacing.sm,
  },
});
