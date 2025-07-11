import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { updateTechnicianLocation } from '../lib/database';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: Location.PermissionStatus;
}

// Request location permissions
export async function requestLocationPermissions(): Promise<LocationPermissionStatus> {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'RoadSide+ needs location access to provide roadside assistance services. Please enable location permissions in your device settings.',
        [{ text: 'OK' }]
      );
    }

    return {
      granted: status === 'granted',
      canAskAgain,
      status
    };
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: Location.PermissionStatus.DENIED
    };
  }
}

// Get current location
export async function getCurrentLocation(): Promise<LocationCoords | null> {
  try {
    const { granted } = await requestLocationPermissions();
    if (!granted) return null;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || undefined,
      speed: location.coords.speed || undefined,
      heading: location.coords.heading || undefined,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
}

// Watch location changes (for real-time tracking)
export function watchLocation(
  callback: (location: LocationCoords) => void,
  options?: {
    accuracy?: Location.Accuracy;
    timeInterval?: number;
    distanceInterval?: number;
  }
): Promise<Location.LocationSubscription | null> {
  return new Promise(async (resolve) => {
    try {
      const { granted } = await requestLocationPermissions();
      if (!granted) {
        resolve(null);
        return;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: options?.accuracy || Location.Accuracy.High,
          timeInterval: options?.timeInterval || 5000,
          distanceInterval: options?.distanceInterval || 10,
        },
        (location) => {
          callback({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
            speed: location.coords.speed || undefined,
            heading: location.coords.heading || undefined,
          });
        }
      );

      resolve(subscription);
    } catch (error) {
      console.error('Error watching location:', error);
      resolve(null);
    }
  });
}

// Calculate distance between two points (Haversine formula)
export function calculateDistance(
  point1: LocationCoords,
  point2: LocationCoords
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) * Math.cos(toRadians(point2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Get address from coordinates (reverse geocoding)
export async function getAddressFromCoords(coords: LocationCoords): Promise<string | null> {
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    if (addresses.length > 0) {
      const address = addresses[0];
      const parts = [
        address.streetNumber,
        address.street,
        address.district,
        address.city,
        address.region,
      ].filter(Boolean);
      
      return parts.join(', ');
    }
    
    return null;
  } catch (error) {
    console.error('Error getting address from coordinates:', error);
    return null;
  }
}

// Get coordinates from address (geocoding)
export async function getCoordsFromAddress(address: string): Promise<LocationCoords | null> {
  try {
    const locations = await Location.geocodeAsync(address);
    
    if (locations.length > 0) {
      return {
        latitude: locations[0].latitude,
        longitude: locations[0].longitude,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting coordinates from address:', error);
    return null;
  }
}

// Trinidad & Tobago specific location utilities
export const TRINIDAD_TOBAGO_BOUNDS = {
  north: 11.3626,
  south: 10.0375,
  east: -60.4953,
  west: -61.9508,
};

export function isLocationInTrinidadTobago(coords: LocationCoords): boolean {
  return (
    coords.latitude >= TRINIDAD_TOBAGO_BOUNDS.south &&
    coords.latitude <= TRINIDAD_TOBAGO_BOUNDS.north &&
    coords.longitude >= TRINIDAD_TOBAGO_BOUNDS.west &&
    coords.longitude <= TRINIDAD_TOBAGO_BOUNDS.east
  );
}

// Technician location tracking
export async function startTechnicianLocationTracking(
  serviceRequestId?: string
): Promise<Location.LocationSubscription | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  return watchLocation(
    async (location) => {
      try {
        await updateTechnicianLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          speed: location.speed,
          heading: location.heading,
          service_request_id: serviceRequestId,
        });
      } catch (error) {
        console.error('Error updating technician location:', error);
      }
    },
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 10000, // Update every 10 seconds
      distanceInterval: 20, // Update every 20 meters
    }
  );
}

// Emergency location sharing
export async function shareEmergencyLocation(): Promise<LocationCoords | null> {
  try {
    const location = await getCurrentLocation();
    if (!location) return null;

    // Store emergency location in database
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      await supabase
        .from('users')
        .update({
          location_lat: location.latitude,
          location_lng: location.longitude,
        })
        .eq('id', user.user.id);
    }

    return location;
  } catch (error) {
    console.error('Error sharing emergency location:', error);
    return null;
  }
}
