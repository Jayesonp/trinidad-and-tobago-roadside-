import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { colors, spacing, typography } from '../../constants/theme';
import { 
  getServiceRequest, 
  subscribeToServiceRequestUpdates,
  subscribeToTechnicianLocationUpdates,
  updateServiceRequest,
  createReview
} from '../../lib/database';
import { ServiceRequestWithDetails, RequestStatus } from '../../types/database';
import { LocationCoords } from '../../services/locationService';
import ServiceMap from '../../components/maps/ServiceMap';
import { PrimaryButton } from '../../components/PrimaryButton';

export default function ServiceTrackingScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const [serviceRequest, setServiceRequest] = useState<ServiceRequestWithDetails | null>(null);
  const [technicianLocation, setTechnicianLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (requestId) {
      loadServiceRequest();
      setupRealTimeUpdates();
    }

    return () => {
      // Cleanup subscriptions
    };
  }, [requestId]);

  const loadServiceRequest = async () => {
    try {
      setLoading(true);
      const request = await getServiceRequest(requestId);
      setServiceRequest(request);
      
      if (request.status === 'completed') {
        setShowRating(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load service request');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    // Subscribe to service request updates
    const requestSubscription = subscribeToServiceRequestUpdates(requestId, (payload) => {
      if (payload.new) {
        setServiceRequest(prev => prev ? { ...prev, ...payload.new } : null);
        
        if (payload.new.status === 'completed') {
          setShowRating(true);
        }
      }
    });

    // Subscribe to technician location updates if technician is assigned
    let locationSubscription: any = null;
    if (serviceRequest?.technician_id) {
      locationSubscription = subscribeToTechnicianLocationUpdates(
        serviceRequest.technician_id,
        (payload) => {
          if (payload.new) {
            setTechnicianLocation({
              latitude: payload.new.latitude,
              longitude: payload.new.longitude,
              accuracy: payload.new.accuracy,
              speed: payload.new.speed,
              heading: payload.new.heading,
            });
          }
        }
      );
    }

    return () => {
      requestSubscription?.unsubscribe();
      locationSubscription?.unsubscribe();
    };
  };

  const handleCallTechnician = () => {
    if (serviceRequest?.technician?.phone) {
      Linking.openURL(`tel:${serviceRequest.technician.phone}`);
    } else {
      Alert.alert('Contact Info', 'Technician contact information not available');
    }
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Call',
      'Call Trinidad & Tobago Emergency Services?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call 999', onPress: () => Linking.openURL('tel:999') },
      ]
    );
  };

  const handleCancelService = () => {
    Alert.alert(
      'Cancel Service',
      'Are you sure you want to cancel this service request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateServiceRequest(requestId, {
                status: 'cancelled' as RequestStatus,
                cancelled_at: new Date().toISOString(),
                cancellation_reason: 'Cancelled by customer',
              });
              Alert.alert('Cancelled', 'Service request has been cancelled');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel service request');
            }
          },
        },
      ]
    );
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting');
      return;
    }

    try {
      await createReview({
        service_request_id: requestId,
        technician_id: serviceRequest?.technician_id || '',
        rating,
        comment: comment.trim() || undefined,
      });

      Alert.alert('Thank You!', 'Your rating has been submitted');
      setShowRating(false);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit rating');
    }
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return colors.warning.main;
      case 'assigned':
        return colors.info.main;
      case 'in_progress':
        return colors.primary.main;
      case 'completed':
        return colors.success.main;
      case 'cancelled':
        return colors.error.main;
      case 'emergency':
        return colors.error.main;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusText = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return 'Finding Technician...';
      case 'assigned':
        return 'Technician Assigned';
      case 'in_progress':
        return 'Service in Progress';
      case 'completed':
        return 'Service Completed';
      case 'cancelled':
        return 'Service Cancelled';
      case 'emergency':
        return 'Emergency Service';
      default:
        return 'Unknown Status';
    }
  };

  const renderStatusCard = () => (
    <View style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(serviceRequest?.status || 'pending') }]} />
        <Text style={styles.statusText}>{getStatusText(serviceRequest?.status || 'pending')}</Text>
      </View>
      
      {serviceRequest?.emergency && (
        <View style={styles.emergencyBadge}>
          <Ionicons name="warning" size={16} color={colors.error.main} />
          <Text style={styles.emergencyText}>Emergency Service</Text>
        </View>
      )}
    </View>
  );

  const renderServiceDetails = () => (
    <View style={styles.detailsCard}>
      <Text style={styles.cardTitle}>Service Details</Text>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Service:</Text>
        <Text style={styles.detailValue}>{serviceRequest?.service?.name}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Request ID:</Text>
        <Text style={styles.detailValue}>{serviceRequest?.id}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Price:</Text>
        <Text style={styles.detailValue}>
          ${serviceRequest?.estimated_price_ttd?.toFixed(2)} TTD
        </Text>
      </View>
      
      {serviceRequest?.description && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Description:</Text>
          <Text style={styles.detailValue}>{serviceRequest.description}</Text>
        </View>
      )}
    </View>
  );

  const renderTechnicianInfo = () => {
    if (!serviceRequest?.technician) return null;

    return (
      <View style={styles.detailsCard}>
        <Text style={styles.cardTitle}>Your Technician</Text>
        
        <View style={styles.technicianHeader}>
          <View style={styles.technicianInfo}>
            <Text style={styles.technicianName}>
              {serviceRequest.technician.full_name || 'Technician'}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={colors.warning.main} />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.callButton} onPress={handleCallTechnician}>
            <Ionicons name="call" size={20} color={colors.primary.contrast} />
          </TouchableOpacity>
        </View>
        
        {serviceRequest.technician.phone && (
          <Text style={styles.technicianPhone}>{serviceRequest.technician.phone}</Text>
        )}
      </View>
    );
  };

  const renderMap = () => {
    const customerLocation = serviceRequest ? {
      latitude: serviceRequest.location_lat,
      longitude: serviceRequest.location_lng,
    } : undefined;

    return (
      <View style={styles.mapContainer}>
        <ServiceMap
          customerLocation={customerLocation}
          technicianLocation={technicianLocation || undefined}
          showRoute={!!technicianLocation}
          style={styles.map}
        />
      </View>
    );
  };

  const renderActionButtons = () => {
    const canCancel = serviceRequest?.status === 'pending' || serviceRequest?.status === 'assigned';
    
    return (
      <View style={styles.actionButtons}>
        {canCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelService}>
            <Text style={styles.cancelButtonText}>Cancel Service</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
          <Ionicons name="warning" size={20} color={colors.error.contrast} />
          <Text style={styles.emergencyButtonText}>Emergency 999</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRatingModal = () => {
    if (!showRating) return null;

    return (
      <View style={styles.ratingOverlay}>
        <View style={styles.ratingModal}>
          <Text style={styles.ratingTitle}>Rate Your Service</Text>
          <Text style={styles.ratingSubtitle}>How was your experience?</Text>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={32}
                  color={star <= rating ? colors.warning.main : colors.text.secondary}
                />
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.commentContainer}>
            <Text style={styles.commentLabel}>Additional Comments (Optional)</Text>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Tell us about your experience..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={3}
            />
          </View>
          
          <View style={styles.ratingButtons}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => setShowRating(false)}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            
            <PrimaryButton onPress={handleRatingSubmit}>
              Submit Rating
            </PrimaryButton>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading service details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Service</Text>
        <TouchableOpacity onPress={loadServiceRequest}>
          <Ionicons name="refresh" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStatusCard()}
        {renderMap()}
        {renderServiceDetails()}
        {renderTechnicianInfo()}
        {renderActionButtons()}
      </ScrollView>

      {renderRatingModal()}
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
  statusCard: {
    backgroundColor: colors.surface.primary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.semibold,
    color: colors.text.primary,
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  emergencyText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.medium,
    color: colors.error.main,
    marginLeft: spacing.xs,
  },
  mapContainer: {
    height: 250,
    margin: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  detailsCard: {
    backgroundColor: colors.surface.primary,
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.medium,
    color: colors.text.secondary,
    flex: 1,
  },
  detailValue: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.semibold,
    color: colors.text.primary,
    flex: 2,
    textAlign: 'right',
  },
  technicianHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  technicianInfo: {
    flex: 1,
  },
  technicianName: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.medium,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  callButton: {
    backgroundColor: colors.primary.main,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  technicianPhone: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.text.secondary,
  },
  actionButtons: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  cancelButton: {
    backgroundColor: colors.surface.primary,
    borderWidth: 1,
    borderColor: colors.error.main,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.semibold,
    color: colors.error.main,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error.main,
    borderRadius: 8,
    padding: spacing.md,
  },
  emergencyButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.semibold,
    color: colors.error.contrast,
    marginLeft: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.medium,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  ratingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingModal: {
    backgroundColor: colors.surface.primary,
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: 16,
    width: '90%',
  },
  ratingTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  ratingSubtitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  starButton: {
    padding: spacing.sm,
  },
  commentContainer: {
    marginBottom: spacing.lg,
  },
  commentLabel: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  commentInput: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.regular,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    textAlignVertical: 'top',
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: spacing.md,
  },
  skipButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.medium,
    color: colors.text.secondary,
  },
});
