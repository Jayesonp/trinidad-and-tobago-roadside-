import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../constants/theme';
import { useLocation } from '../../hooks/useLocation';
import { NearbyTechnician } from '../../types/database';
import { calculateDistance } from '../../services/locationService';
import ServiceMap from './ServiceMap';

interface TechnicianFinderProps {
  onTechnicianSelect: (technician: NearbyTechnician) => void;
  selectedServiceType?: string;
  showMap?: boolean;
}

export default function TechnicianFinder({
  onTechnicianSelect,
  selectedServiceType,
  showMap = true,
}: TechnicianFinderProps) {
  const {
    currentLocation,
    nearbyTechnicians,
    loading,
    error,
    refreshLocation,
    refreshNearbyTechnicians,
  } = useLocation();

  const [selectedTechnician, setSelectedTechnician] = useState<NearbyTechnician | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  useEffect(() => {
    if (currentLocation) {
      refreshNearbyTechnicians();
    }
  }, [currentLocation, selectedServiceType]);

  const handleTechnicianSelect = (technician: NearbyTechnician) => {
    setSelectedTechnician(technician);
    onTechnicianSelect(technician);
  };

  const handleRefresh = async () => {
    await refreshLocation();
    await refreshNearbyTechnicians();
  };

  const getFilteredTechnicians = () => {
    if (!selectedServiceType) return nearbyTechnicians;
    
    return nearbyTechnicians.filter(technician =>
      technician.specializations?.includes(selectedServiceType as any) ||
      technician.status === 'available'
    );
  };

  const getTechnicianStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return colors.success.main;
      case 'busy':
        return colors.warning.main;
      case 'emergency':
        return colors.error.main;
      default:
        return colors.text.secondary;
    }
  };

  const getTechnicianStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'emergency':
        return 'Emergency';
      default:
        return 'Offline';
    }
  };

  const renderTechnicianCard = ({ item: technician }: { item: NearbyTechnician }) => {
    const distance = currentLocation && technician.current_lat && technician.current_lng
      ? calculateDistance(
          currentLocation,
          { latitude: technician.current_lat, longitude: technician.current_lng }
        )
      : technician.distance || 0;

    return (
      <TouchableOpacity
        style={[
          styles.technicianCard,
          selectedTechnician?.id === technician.id && styles.selectedCard
        ]}
        onPress={() => handleTechnicianSelect(technician)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.technicianInfo}>
            <Text style={styles.technicianName}>
              {technician.user?.full_name || 'Technician'}
            </Text>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusDot,
                { backgroundColor: getTechnicianStatusColor(technician.status) }
              ]} />
              <Text style={styles.statusText}>
                {getTechnicianStatusText(technician.status)}
              </Text>
            </View>
          </View>
          <View style={styles.distanceContainer}>
            <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.distanceText}>{distance.toFixed(1)} km</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={colors.warning.main} />
            <Text style={styles.ratingText}>{technician.rating.toFixed(1)}</Text>
            <Text style={styles.jobsText}>({technician.total_jobs} jobs)</Text>
          </View>

          {technician.specializations && technician.specializations.length > 0 && (
            <View style={styles.specializationsContainer}>
              {technician.specializations.slice(0, 3).map((spec, index) => (
                <View key={index} style={styles.specializationTag}>
                  <Text style={styles.specializationText}>{spec}</Text>
                </View>
              ))}
              {technician.specializations.length > 3 && (
                <Text style={styles.moreText}>+{technician.specializations.length - 3}</Text>
              )}
            </View>
          )}

          {technician.vehicle_info && (
            <View style={styles.vehicleInfo}>
              <Ionicons name="car-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.vehicleText}>
                {technician.vehicle_info.color} {technician.vehicle_info.make} {technician.vehicle_info.model}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>
        {getFilteredTechnicians().length} Technicians Nearby
      </Text>
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'map' && styles.activeToggle]}
          onPress={() => setViewMode('map')}
        >
          <Ionicons name="map-outline" size={20} color={
            viewMode === 'map' ? colors.primary.contrast : colors.text.secondary
          } />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
          onPress={() => setViewMode('list')}
        >
          <Ionicons name="list-outline" size={20} color={
            viewMode === 'list' ? colors.primary.contrast : colors.text.secondary
          } />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && nearbyTechnicians.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Finding nearby technicians...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={48} color={colors.error.main} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {viewMode === 'map' && showMap ? (
        <View style={styles.mapContainer}>
          <ServiceMap
            customerLocation={currentLocation || undefined}
            nearbyTechnicians={getFilteredTechnicians()}
            onTechnicianSelect={handleTechnicianSelect}
          />
        </View>
      ) : (
        <FlatList
          data={getFilteredTechnicians()}
          renderItem={renderTechnicianCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              tintColor={colors.primary.main}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  title: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.semibold,
    color: colors.text.primary,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface.secondary,
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: colors.primary.main,
  },
  mapContainer: {
    flex: 1,
  },
  listContainer: {
    padding: spacing.md,
  },
  technicianCard: {
    backgroundColor: colors.surface.primary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  selectedCard: {
    borderColor: colors.primary.main,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.medium,
    color: colors.text.secondary,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.medium,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  cardBody: {
    gap: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.semibold,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  jobsText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  specializationTag: {
    backgroundColor: colors.primary.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  specializationText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.medium,
    color: colors.primary.main,
  },
  moreText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.medium,
    color: colors.text.secondary,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.medium,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.semibold,
    color: colors.primary.contrast,
  },
});
