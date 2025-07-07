import 'dotenv/config';

export default {
  expo: {
    name: "RoadSide+ Trinidad & Tobago",
    slug: "roadside-plus-tt",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#0f172a"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    scheme: "roadsideplus",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.roadsideplus.tt",
      buildNumber: "1",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "This app needs access to your location to provide roadside assistance services.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "This app needs access to your location to provide roadside assistance services.",
        NSCameraUsageDescription: "This app needs access to your camera to take photos for service documentation.",
        NSMicrophoneUsageDescription: "This app needs access to your microphone for voice calls with technicians.",
        NSPhotoLibraryUsageDescription: "This app needs access to your photo library to attach images to service requests."
      },
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0f172a"
      },
      package: "com.roadsideplus.tt",
      versionCode: 1,
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "VIBRATE",
        "RECEIVE_BOOT_COMPLETED",
        "WAKE_LOCK"
      ],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-router",
      "expo-location",
      "expo-notifications",
      "expo-camera",
      "expo-image-picker",
      "expo-secure-store",
      "expo-font",
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: "34.0.0"
          },
          ios: {
            deploymentTarget: "13.4"
          }
        }
      ]
    ],
    extra: {
      // Environment variables accessible via Constants.expoConfig.extra
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
      SENTRY_DSN: process.env.SENTRY_DSN,
      GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
      TT_EMERGENCY_NUMBER: process.env.TT_EMERGENCY_NUMBER,
      TT_POLICE_NUMBER: process.env.TT_POLICE_NUMBER,
      TT_FIRE_SERVICE: process.env.TT_FIRE_SERVICE,
      TT_AMBULANCE: process.env.TT_AMBULANCE,
      DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY,
      DEFAULT_TIMEZONE: process.env.DEFAULT_TIMEZONE,
      SUPPORTED_LANGUAGES: process.env.SUPPORTED_LANGUAGES,
      ENABLE_EMERGENCY_SOS: process.env.ENABLE_EMERGENCY_SOS,
      ENABLE_REAL_TIME_TRACKING: process.env.ENABLE_REAL_TIME_TRACKING,
      ENABLE_PAYMENT_PROCESSING: process.env.ENABLE_PAYMENT_PROCESSING,
      ENABLE_MULTI_LANGUAGE: process.env.ENABLE_MULTI_LANGUAGE,
      DEV_MODE: process.env.DEV_MODE,
      API_TIMEOUT: process.env.API_TIMEOUT,
      eas: {
        projectId: "your-eas-project-id"
      }
    },
    owner: "roadsideplus-tt"
  }
};
