import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { LocationCoords, getCurrentLocation, watchLocation, requestLocationPermissions } from '../services/locationService';
import { getNearbyTechnicians } from '../lib/database';
import { NearbyTechnician } from '../types/database';

export interface UseLocationReturn {
  currentLocation: LocationCoords | null;
  nearbyTechnicians: NearbyTechnician[];
  isTracking: boolean;
  permissionGranted: boolean;
  loading: boolean;
  error: string | null;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  refreshLocation: () => Promise<void>;
  refreshNearbyTechnicians: () => Promise<void>;
}

export function useLocation(): UseLocationReturn {
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
  const [nearbyTechnicians, setNearbyTechnicians] = useState<NearbyTechnician[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    initializeLocation();
    return () => {
      stopTracking();
    };
  }, []);

  useEffect(() => {
    if (currentLocation && permissionGranted) {
      refreshNearbyTechnicians();
    }
  }, [currentLocation, permissionGranted]);

  const initializeLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      const permission = await requestLocationPermissions();
      setPermissionGranted(permission.granted);

      if (permission.granted) {
        const location = await getCurrentLocation();
        if (location) {
          setCurrentLocation(location);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize location');
    } finally {
      setLoading(false);
    }
  };

  const startTracking = async () => {
    if (!permissionGranted) {
      const permission = await requestLocationPermissions();
      if (!permission.granted) {
        setError('Location permission is required for tracking');
        return;
      }
      setPermissionGranted(true);
    }

    try {
      setError(null);
      const subscription = await watchLocation(
        (location) => {
          setCurrentLocation(location);
        },
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        }
      );

      if (subscription) {
        locationSubscription.current = subscription;
        setIsTracking(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start location tracking');
    }
  };

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
      setIsTracking(false);
    }
  };

  const refreshLocation = async () => {
    if (!permissionGranted) return;

    try {
      setLoading(true);
      setError(null);
      const location = await getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh location');
    } finally {
      setLoading(false);
    }
  };

  const refreshNearbyTechnicians = async () => {
    if (!currentLocation) return;

    try {
      setError(null);
      const technicians = await getNearbyTechnicians({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        radius_km: 10, // 10km radius
        limit: 20,
      });
      setNearbyTechnicians(technicians);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch nearby technicians');
    }
  };

  return {
    currentLocation,
    nearbyTechnicians,
    isTracking,
    permissionGranted,
    loading,
    error,
    startTracking,
    stopTracking,
    refreshLocation,
    refreshNearbyTechnicians,
  };
}

// Hook specifically for technician location tracking
export function useTechnicianTracking(serviceRequestId?: string) {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const startTracking = async () => {
    try {
      setError(null);
      const { startTechnicianLocationTracking } = await import('../services/locationService');
      const subscription = await startTechnicianLocationTracking(serviceRequestId);
      
      if (subscription) {
        locationSubscription.current = subscription;
        setIsTracking(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start technician tracking');
    }
  };

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
      setIsTracking(false);
    }
  };

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return {
    isTracking,
    error,
    startTracking,
    stopTracking,
  };
}

// Hook for emergency location sharing
export function useEmergencyLocation() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareLocation = async () => {
    try {
      setSharing(true);
      setError(null);
      
      const { shareEmergencyLocation } = await import('../services/locationService');
      const emergencyLocation = await shareEmergencyLocation();
      
      if (emergencyLocation) {
        setLocation(emergencyLocation);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share emergency location');
    } finally {
      setSharing(false);
    }
  };

  return {
    location,
    sharing,
    error,
    shareLocation,
  };
}
