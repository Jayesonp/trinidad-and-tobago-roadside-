# 🚀 RoadSide+ Trinidad & Tobago - Deployment Guide

Complete deployment guide for the RoadSide+ Trinidad & Tobago roadside assistance platform.

## 📋 Prerequisites

- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g @expo/cli`
- EAS CLI installed globally: `npm install -g eas-cli`
- Expo account and EAS subscription
- Supabase project set up
- Stripe account with TTD support
- Google Cloud Platform account (for Maps API)

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the environment template and fill in your live keys:
```bash
cp .env.example .env
```

#### Required Environment Variables
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# Stripe Configuration (Trinidad & Tobago)
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Trinidad & Tobago Emergency Numbers
TT_EMERGENCY_NUMBER=999
TT_POLICE_NUMBER=999
TT_FIRE_SERVICE=990
TT_AMBULANCE=811

# App Configuration
DEFAULT_CURRENCY=TTD
DEFAULT_TIMEZONE=America/Port_of_Spain
SUPPORTED_LANGUAGES=en,es

# Feature Flags
ENABLE_EMERGENCY_SOS=true
ENABLE_REAL_TIME_TRACKING=true
ENABLE_PAYMENT_PROCESSING=true
ENABLE_MULTI_LANGUAGE=false

# Optional: Monitoring & Analytics
SENTRY_DSN=your_sentry_dsn
GOOGLE_ANALYTICS_ID=your_ga_id

# Development Settings
DEV_MODE=false
API_TIMEOUT=10000
```

### 3. Generate Native Projects & Sync Plugins
```bash
npx expo prebuild
```

This command:
- Generates native iOS and Android projects
- Installs and configures native dependencies
- Syncs Expo plugins with native code
- Sets up platform-specific configurations

### 4. Create Development Client & Test
```bash
eas build --profile development --platform all
```

This creates development builds for testing:
- **iOS**: Development client for iPhone/iPad testing
- **Android**: Development APK for Android device testing
- **Internal Distribution**: For team testing

### 5. Production Builds

#### iOS Production Build
```bash
eas build --profile production --platform ios
```

#### Android Production Build
```bash
eas build --profile production --platform android
```

## 🏗️ Build Profiles

### EAS Build Configuration (`eas.json`)
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium",
        "simulator": false
      },
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-id",
        "appleTeamId": "your-apple-team-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

## 🗄️ Database Setup

### Supabase Configuration

1. **Create Supabase Project**
   ```bash
   # Initialize Supabase in your project
   npx supabase init
   
   # Link to your remote project
   npx supabase link --project-ref your-project-ref
   ```

2. **Run Database Migrations**
   ```bash
   # Push migrations to remote database
   npx supabase db push
   
   # Generate TypeScript types
   npx supabase gen types typescript --project-id your-project-ref > src/types/supabase.ts
   ```

3. **Set Up Storage Buckets**
   ```sql
   -- Create storage bucket for files
   INSERT INTO storage.buckets (id, name, public) VALUES ('files', 'files', true);
   
   -- Set up RLS policies for file access
   -- (See supabase/migrations/ for complete policies)
   ```

### Database Schema
The application includes:
- **Users**: Multi-role user management
- **Service Requests**: Complete request lifecycle
- **Technicians**: Technician profiles and tracking
- **Payments**: TTD payment processing with VAT
- **Emergency Alerts**: SOS and emergency response
- **File Uploads**: Photo and document management

## 💳 Payment Configuration

### Stripe Setup for Trinidad & Tobago

1. **Enable TTD Currency**
   - Log into Stripe Dashboard
   - Go to Settings → Account details
   - Add Trinidad and Tobago as a supported country
   - Enable TTD currency processing

2. **Configure Webhooks**
   ```bash
   # Webhook endpoint for payment events
   https://your-app.com/api/stripe/webhook
   
   # Required events:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - payment_intent.canceled
   ```

3. **Tax Configuration**
   - Set up 12.5% VAT for Trinidad & Tobago
   - Configure automatic tax calculation
   - Set up tax reporting for local compliance

## 🗺️ Maps Configuration

### Google Maps Setup

1. **Enable Required APIs**
   - Maps SDK for iOS
   - Maps SDK for Android
   - Places API
   - Directions API
   - Geocoding API

2. **Configure API Restrictions**
   ```bash
   # Restrict API key to your app bundle IDs
   iOS: com.roadsideplus.tt
   Android: com.roadsideplus.tt
   ```

3. **Trinidad & Tobago Specific**
   - Default region: Port of Spain, Trinidad
   - Enable local business listings
   - Configure emergency service locations

## 🔔 Push Notifications

### Expo Push Notifications Setup

1. **Configure Push Credentials**
   ```bash
   # iOS: Upload APNs key or certificate
   eas credentials:configure --platform ios
   
   # Android: Configure FCM
   eas credentials:configure --platform android
   ```

2. **Server Configuration**
   ```typescript
   // Server-side push notification setup
   import { Expo } from 'expo-server-sdk';
   const expo = new Expo();
   
   // Send notifications to Trinidad & Tobago users
   await sendPush(token, title, body);
   ```

## 📱 App Store Deployment

### iOS App Store

1. **Prepare for Submission**
   ```bash
   # Build production iOS app
   eas build --profile production --platform ios
   
   # Submit to App Store
   eas submit --platform ios
   ```

2. **App Store Connect Configuration**
   - App name: "RoadSide+ Trinidad & Tobago"
   - Category: Travel & Navigation
   - Age rating: 4+ (suitable for all ages)
   - Keywords: roadside assistance, emergency, Trinidad, Tobago, towing

3. **Required Screenshots**
   - iPhone 6.7" (iPhone 14 Pro Max)
   - iPhone 6.5" (iPhone 11 Pro Max)
   - iPad Pro 12.9" (6th generation)

### Android Google Play

1. **Prepare for Submission**
   ```bash
   # Build production Android app
   eas build --profile production --platform android
   
   # Submit to Google Play
   eas submit --platform android
   ```

2. **Google Play Console Configuration**
   - App name: "RoadSide+ Trinidad & Tobago"
   - Category: Maps & Navigation
   - Content rating: Everyone
   - Target audience: 18+ (due to emergency services)

3. **Required Assets**
   - High-res icon (512x512)
   - Feature graphic (1024x500)
   - Screenshots for phones and tablets

## 🔒 Security Configuration

### App Security

1. **Code Obfuscation**
   ```json
   // Enable ProGuard for Android
   {
     "android": {
       "proguardFiles": ["proguard-rules.pro"]
     }
   }
   ```

2. **Certificate Pinning**
   ```typescript
   // Pin Supabase and Stripe certificates
   const pinnedCertificates = [
     'supabase.co',
     'api.stripe.com'
   ];
   ```

3. **Sensitive Data Protection**
   - Use Expo SecureStore for sensitive data
   - Implement biometric authentication
   - Enable app transport security

## 🌍 Localization

### Trinidad & Tobago Specific

1. **Currency Formatting**
   ```typescript
   // TTD currency formatting
   const formatter = new Intl.NumberFormat('en-TT', {
     style: 'currency',
     currency: 'TTD'
   });
   ```

2. **Emergency Numbers**
   ```typescript
   const emergencyNumbers = {
     emergency: '999',
     police: '999',
     fire: '990',
     ambulance: '811'
   };
   ```

3. **Time Zone**
   ```typescript
   // America/Port_of_Spain timezone
   const timezone = 'America/Port_of_Spain';
   ```

## 📊 Monitoring & Analytics

### Error Tracking

1. **Sentry Configuration**
   ```typescript
   import * as Sentry from '@sentry/react-native';
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
   });
   ```

2. **Performance Monitoring**
   - Track app startup time
   - Monitor API response times
   - Track user interaction patterns

### Analytics

1. **Google Analytics**
   ```typescript
   // Track user events
   analytics.track('service_requested', {
     service_type: 'towing',
     location: 'Port of Spain'
   });
   ```

## 🚀 Continuous Deployment

### GitHub Actions

```yaml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: eas build --platform all --non-interactive
```

## 🆘 Emergency Deployment

### Hotfix Process

1. **Critical Bug Fix**
   ```bash
   # Create hotfix branch
   git checkout -b hotfix/critical-fix
   
   # Make fixes and test
   npm test
   
   # Build and deploy immediately
   eas build --profile production --platform all
   eas submit --platform all
   ```

2. **Emergency Rollback**
   ```bash
   # Rollback to previous version
   eas build --profile production --platform all --clear-cache
   ```

## 📞 Support & Maintenance

### Monitoring Checklist
- [ ] App performance metrics
- [ ] Error rates and crash reports
- [ ] Payment processing success rates
- [ ] Emergency response times
- [ ] User feedback and ratings

### Regular Maintenance
- Weekly dependency updates
- Monthly security audits
- Quarterly feature releases
- Annual compliance reviews

---

**RoadSide+ Trinidad & Tobago** - Reliable roadside assistance deployment guide. 🇹🇹
