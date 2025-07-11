import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import MapView, { Marker, Circle, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../constants/theme';
import { LocationCoords, getCurrentLocation, calculateDistance } from '../../services/locationService';
import { NearbyTechnician } from '../../types/database';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

interface ServiceMapProps {
  customerLocation?: LocationCoords;
  technicianLocation?: LocationCoords;
  nearbyTechnicians?: NearbyTechnician[];
  showRoute?: boolean;
  onTechnicianSelect?: (technician: NearbyTechnician) => void;
  onLocationSelect?: (location: LocationCoords) => void;
  style?: any;
}

export default function ServiceMap({
  customerLocation,
  technicianLocation,
  nearbyTechnicians = [],
  showRoute = false,
  onTechnicianSelect,
  onLocationSelect,
  style,
}: ServiceMapProps) {
  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<NearbyTechnician | null>(null);

  useEffect(() => {
    getCurrentUserLocation();
  }, []);

  useEffect(() => {
    if (customerLocation && technicianLocation && mapRef.current) {
      // Fit map to show both customer and technician locations
      const coordinates = [customerLocation, technicianLocation];
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [customerLocation, technicianLocation]);

  const getCurrentUserLocation = async () => {
    try {
      const location = await getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  const handleTechnicianPress = (technician: NearbyTechnician) => {
    setSelectedTechnician(technician);
    onTechnicianSelect?.(technician);
  };

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    onLocationSelect?.(coordinate);
  };

  const getTechnicianMarkerColor = (technician: NearbyTechnician) => {
    switch (technician.status) {
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

  const renderCustomerMarker = () => {
    const location = customerLocation || currentLocation;
    if (!location) return null;

    return (
      <Marker
        coordinate={location}
        title="Your Location"
        description="Customer location"
        pinColor={colors.primary.main}
      >
        <View style={styles.customerMarker}>
          <Ionicons name="person" size={20} color="white" />
        </View>
      </Marker>
    );
  };

  const renderTechnicianMarker = () => {
    if (!technicianLocation) return null;

    return (
      <Marker
        coordinate={technicianLocation}
        title="Technician"
        description="Assigned technician location"
        pinColor={colors.secondary.main}
      >
        <View style={[styles.technicianMarker, { backgroundColor: colors.secondary.main }]}>
          <Ionicons name="construct" size={20} color="white" />
        </View>
      </Marker>
    );
  };

  const renderNearbyTechnicians = () => {
    return nearbyTechnicians.map((technician) => (
      <Marker
        key={technician.id}
        coordinate={{
          latitude: technician.current_lat || 0,
          longitude: technician.current_lng || 0,
        }}
        title={technician.user?.full_name || 'Technician'}
        description={`${technician.status} • ${technician.distance?.toFixed(1)}km away`}
        onPress={() => handleTechnicianPress(technician)}
      >
        <View style={[
          styles.nearbyTechnicianMarker,
          { backgroundColor: getTechnicianMarkerColor(technician) }
        ]}>
          <Ionicons name="car" size={16} color="white" />
        </View>
      </Marker>
    ));
  };

  const renderRoute = () => {
    if (!showRoute || !customerLocation || !technicianLocation) return null;

    return (
      <Polyline
        coordinates={[customerLocation, technicianLocation]}
        strokeColor={colors.primary.main}
        strokeWidth={3}
        lineDashPattern={[5, 5]}
      />
    );
  };

  const renderServiceRadius = () => {
    const location = customerLocation || currentLocation;
    if (!location) return null;

    return (
      <Circle
        center={location}
        radius={5000} // 5km radius
        strokeColor={colors.primary.main}
        strokeWidth={2}
        fillColor={`${colors.primary.main}20`}
      />
    );
  };

  const initialRegion = {
    latitude: customerLocation?.latitude || currentLocation?.latitude || 10.6918, // Port of Spain
    longitude: customerLocation?.longitude || currentLocation?.longitude || -61.2225,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        onPress={handleMapPress}
        mapType="standard"
      >
        {renderCustomerMarker()}
        {renderTechnicianMarker()}
        {renderNearbyTechnicians()}
        {renderRoute()}
        {renderServiceRadius()}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  customerMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  technicianMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  nearbyTechnicianMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});
