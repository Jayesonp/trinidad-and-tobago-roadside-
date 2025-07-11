# 🚀 RoadSide+ Implementation Guide

## Critical Features Implementation - Complete Setup Guide

This guide provides step-by-step instructions to implement the critical missing features in the RoadSide+ Trinidad & Tobago application.

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js 18+ and npm 8+
- Expo CLI: `npm install -g @expo/cli`
- Supabase account and project
- Google Maps API key
- Stripe account for payments

## 🗺️ 1. GOOGLE MAPS & LOCATION FEATURES

### Step 1: Install Dependencies

```bash
npm install react-native-maps expo-location --legacy-peer-deps
```

### Step 2: Configure Google Maps API

1. **Get Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Maps SDK for Android, Maps SDK for iOS, and Places API
   - Create API key and restrict it to your app

2. **Update Environment Variables:**
   ```bash
   # Add to .env.local
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

3. **Update app.config.js:**
   ```javascript
   export default {
     expo: {
       // ... existing config
       android: {
         config: {
           googleMaps: {
             apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
           }
         }
       },
       ios: {
         config: {
           googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
         }
       }
     }
   };
   ```

### Step 3: Configure Location Permissions

Add to `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "RoadSide+ needs location access to provide roadside assistance services.",
          "locationAlwaysPermission": "RoadSide+ needs background location access to track technicians during service calls.",
          "locationWhenInUsePermission": "RoadSide+ needs location access to find nearby technicians and provide assistance.",
          "isIosBackgroundLocationEnabled": true,
          "isAndroidBackgroundLocationEnabled": true
        }
      ]
    ]
  }
}
```

### Step 4: Implement Location Services

The following files have been created:
- ✅ `src/services/locationService.ts` - Core location functionality
- ✅ `src/hooks/useLocation.ts` - Location hooks for components
- ✅ `src/components/maps/ServiceMap.tsx` - Map component
- ✅ `src/components/maps/TechnicianFinder.tsx` - Technician finder with map

### Step 5: Integration Instructions

1. **Add to Customer Dashboard:**
   ```typescript
   import TechnicianFinder from '../components/maps/TechnicianFinder';
   
   // In your dashboard component
   <TechnicianFinder 
     onTechnicianSelect={handleTechnicianSelect}
     selectedServiceType="towing"
   />
   ```

2. **Add to Service Booking Flow:**
   ```typescript
   import ServiceMap from '../components/maps/ServiceMap';
   import { useLocation } from '../hooks/useLocation';
   
   const { currentLocation, nearbyTechnicians } = useLocation();
   
   <ServiceMap
     customerLocation={currentLocation}
     nearbyTechnicians={nearbyTechnicians}
     onTechnicianSelect={handleSelect}
   />
   ```

## 🛠️ 2. SERVICE BOOKING WORKFLOW

### Step 1: Database Setup

1. **Deploy Database Schema:**
   ```bash
   # In your Supabase SQL editor, run:
   # 1. Copy contents of database/schema.sql
   # 2. Execute the SQL to create all tables and functions
   # 3. Copy contents of database/sample_data.sql  
   # 4. Execute to insert sample data
   ```

2. **Configure Row Level Security:**
   - The schema includes RLS policies
   - Ensure your Supabase project has RLS enabled
   - Test policies with different user roles

### Step 2: Implement Service Booking

The following files have been created:
- ✅ `src/hooks/useServiceBooking.ts` - Complete booking workflow
- ✅ `src/screens/customer/ServiceBookingScreen.tsx` - Booking UI
- ✅ `src/screens/customer/ServiceTrackingScreen.tsx` - Service tracking

### Step 3: Integration with Navigation

1. **Add to App Router:**
   ```typescript
   // app/(tabs)/services.tsx
   import ServiceBookingScreen from '../../src/screens/customer/ServiceBookingScreen';
   export default ServiceBookingScreen;
   
   // app/tracking/[requestId].tsx
   import ServiceTrackingScreen from '../../src/screens/customer/ServiceTrackingScreen';
   export default ServiceTrackingScreen;
   ```

2. **Update Navigation:**
   ```typescript
   // In your dashboard or service selection
   import { router } from 'expo-router';
   
   const handleBookService = () => {
     router.push('/services');
   };
   
   const handleTrackService = (requestId: string) => {
     router.push(`/tracking/${requestId}`);
   };
   ```

### Step 4: Payment Integration

1. **Configure Stripe:**
   ```bash
   # Already installed: @stripe/stripe-react-native
   # Update .env.local:
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
   ```

2. **Initialize Stripe Provider:**
   ```typescript
   // In app/_layout.tsx
   import { StripeProvider } from '@stripe/stripe-react-native';
   
   export default function RootLayout() {
     return (
       <StripeProvider publishableKey={process.env.STRIPE_PUBLISHABLE_KEY}>
         {/* Your app content */}
       </StripeProvider>
     );
   }
   ```

## 🔄 3. REAL-TIME UPDATES

### Step 1: Configure Supabase Real-time

1. **Enable Real-time in Supabase:**
   - Go to your Supabase project settings
   - Enable Real-time for tables: `service_requests`, `technicians`, `locations`

2. **Test Real-time Subscriptions:**
   ```typescript
   import { subscribeToServiceRequestUpdates } from '../lib/database';
   
   const subscription = subscribeToServiceRequestUpdates(requestId, (payload) => {
     console.log('Service request updated:', payload.new);
   });
   
   // Don't forget to unsubscribe
   subscription.unsubscribe();
   ```

### Step 2: Implement Location Tracking

1. **For Technicians:**
   ```typescript
   import { useTechnicianTracking } from '../hooks/useLocation';
   
   const { startTracking, stopTracking } = useTechnicianTracking(serviceRequestId);
   
   // Start tracking when service begins
   await startTracking();
   
   // Stop when service completes
   stopTracking();
   ```

2. **For Customers:**
   ```typescript
   import { useLocation } from '../hooks/useLocation';
   
   const { currentLocation, nearbyTechnicians, refreshNearbyTechnicians } = useLocation();
   
   // Automatically updates nearby technicians when location changes
   ```

## 🧪 4. TESTING THE IMPLEMENTATION

### Step 1: Test Location Services

```bash
# Run the app and test location features
npm run dev

# Test on device (location doesn't work in simulator)
npm run ios # or npm run android
```

### Step 2: Test Service Booking Flow

1. **Create Test User:**
   - Sign up through the app
   - Verify email in Supabase Auth

2. **Test Booking Steps:**
   - Select service → Location → Technician → Payment → Tracking
   - Verify database records are created
   - Test real-time updates

### Step 3: Test Payment Flow

1. **Use Stripe Test Cards:**
   ```
   Success: 4242 4242 4242 4242
   Decline: 4000 0000 0000 0002
   ```

2. **Verify TTD Calculations:**
   ```sql
   SELECT * FROM calculate_ttd_total(100.00);
   -- Should return: base=100, platform_fee=5, vat=13.13, total=118.13
   ```

## 🚨 5. EMERGENCY FEATURES

### Step 1: Emergency Location Sharing

```typescript
import { useEmergencyLocation } from '../hooks/useLocation';

const { shareLocation, location, sharing } = useEmergencyLocation();

// In emergency button handler
const handleEmergency = async () => {
  await shareLocation();
  // Location is now shared with emergency responders
};
```

### Step 2: Emergency Service Requests

```typescript
// Create emergency service request
const emergencyRequest = await booking.createBooking(
  'Emergency assistance needed',
  true // isEmergency = true (adds 50% surcharge)
);
```

## 📱 6. PLATFORM-SPECIFIC SETUP

### iOS Setup

1. **Add to Info.plist:**
   ```xml
   <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
   <string>RoadSide+ needs location access to provide roadside assistance</string>
   <key>NSLocationWhenInUseUsageDescription</key>
   <string>RoadSide+ needs location access to find nearby technicians</string>
   ```

2. **Build and Test:**
   ```bash
   npx expo run:ios
   ```

### Android Setup

1. **Add to AndroidManifest.xml:**
   ```xml
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
   <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
   ```

2. **Build and Test:**
   ```bash
   npx expo run:android
   ```

## 🔧 7. TROUBLESHOOTING

### Common Issues

1. **Maps Not Showing:**
   - Verify Google Maps API key is correct
   - Check API key restrictions
   - Ensure Maps SDK is enabled

2. **Location Permission Denied:**
   - Check device location settings
   - Verify app permissions
   - Test on physical device (not simulator)

3. **Real-time Updates Not Working:**
   - Check Supabase real-time settings
   - Verify RLS policies
   - Check network connectivity

4. **Payment Failures:**
   - Verify Stripe keys are correct
   - Check test card numbers
   - Review Stripe dashboard for errors

### Performance Optimization

1. **Location Updates:**
   ```typescript
   // Optimize location update frequency
   const subscription = await watchLocation(callback, {
     timeInterval: 10000, // 10 seconds
     distanceInterval: 50, // 50 meters
   });
   ```

2. **Map Performance:**
   ```typescript
   // Limit nearby technicians
   const technicians = await getNearbyTechnicians({
     latitude,
     longitude,
     radius_km: 5, // Smaller radius
     limit: 10, // Fewer results
   });
   ```

## 🎯 8. NEXT STEPS

After implementing these critical features:

1. **Test thoroughly** on physical devices
2. **Deploy database schema** to production Supabase
3. **Configure production API keys** (Google Maps, Stripe)
4. **Set up monitoring** and error tracking
5. **Implement push notifications** for service updates
6. **Add analytics** for user behavior tracking
7. **Optimize performance** based on usage patterns

## 📞 Support

If you encounter issues during implementation:

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test individual components in isolation
4. Review Supabase logs for database issues
5. Check Stripe dashboard for payment issues

The implementation provides a solid foundation for a production-ready roadside assistance platform with real-time tracking, comprehensive service booking, and integrated payments specifically designed for Trinidad & Tobago.
