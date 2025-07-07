# RoadSide+ Project Structure

This document outlines the complete project structure for the RoadSide+ Trinidad & Tobago mobile application.

## 📁 Directory Structure

```
RoadSidePlus/
├── app/                             # Expo Router app directory
│   ├── (auth)/                      # Authentication routes
│   │   ├── _layout.tsx              # Auth layout
│   │   ├── login.tsx                # Login screen
│   │   ├── register.tsx             # Register screen
│   │   └── forgot-password.tsx      # Password reset
│   ├── (tabs)/                      # Tab navigation routes
│   │   ├── _layout.tsx              # Tab layout with role-based routing
│   │   ├── customer.tsx             # Customer dashboard
│   │   ├── technician.tsx           # Technician dashboard
│   │   ├── admin.tsx                # Admin dashboard
│   │   ├── services.tsx             # Services screen
│   │   ├── tracking.tsx             # Tracking screen
│   │   └── profile.tsx              # Profile screen
│   ├── (modals)/                    # Modal routes
│   │   ├── emergency.tsx            # Emergency SOS modal
│   │   └── service-request.tsx      # Service request modal
│   ├── _layout.tsx                  # Root layout
│   └── index.tsx                    # Entry point with auth routing
│
├── assets/                          # Static assets
│   ├── images/                      # App images and illustrations
│   ├── icons/                       # Custom icons
│   ├── fonts/                       # Custom fonts
│   ├── icon.png                     # App icon
│   ├── splash.png                   # Splash screen
│   ├── adaptive-icon.png            # Android adaptive icon
│   └── favicon.png                  # Web favicon
│
├── src/                             # Source code
│   ├── components/                  # Reusable UI components
│   │   ├── common/                  # Common components
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Card.js
│   │   │   ├── Modal.js
│   │   │   ├── LoadingScreen.js
│   │   │   └── ErrorBoundary.js
│   │   ├── forms/                   # Form components
│   │   │   ├── LoginForm.js
│   │   │   ├── RegisterForm.js
│   │   │   └── ServiceRequestForm.js
│   │   ├── charts/                  # Chart components
│   │   │   ├── LineChart.js
│   │   │   ├── BarChart.js
│   │   │   └── PieChart.js
│   │   ├── ServiceCard.js           # Service display card
│   │   ├── JobCard.js               # Job display card
│   │   ├── EmergencyButton.js       # SOS emergency button
│   │   ├── ActiveServiceCard.js     # Active service tracking
│   │   ├── QuickStatsCard.js        # Statistics display
│   │   ├── AnalyticsCard.js         # Analytics display
│   │   ├── ChartCard.js             # Chart container
│   │   ├── AlertCard.js             # Alert notifications
│   │   ├── QuickActionCard.js       # Quick action buttons
│   │   ├── EarningsCard.js          # Earnings display
│   │   ├── StatusCard.js            # Status indicator
│   │   └── PerformanceChart.js      # Performance metrics
│   │
│   ├── screens/                     # Screen components
│   │   ├── auth/                    # Authentication screens
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   └── ForgotPasswordScreen.js
│   │   ├── customer/                # Customer-specific screens
│   │   │   ├── CustomerDashboard.js
│   │   │   ├── ServiceBookingScreen.js
│   │   │   ├── TrackingScreen.js
│   │   │   ├── ServiceHistoryScreen.js
│   │   │   └── ProfileScreen.js
│   │   ├── technician/              # Technician-specific screens
│   │   │   ├── TechnicianDashboard.js
│   │   │   ├── JobManagementScreen.js
│   │   │   ├── EarningsScreen.js
│   │   │   └── NavigationScreen.js
│   │   ├── admin/                   # Admin-specific screens
│   │   │   ├── AdminDashboard.js
│   │   │   ├── UserManagementScreen.js
│   │   │   ├── AnalyticsScreen.js
│   │   │   └── ConfigurationScreen.js
│   │   ├── partner/                 # Partner-specific screens
│   │   │   ├── PartnerDashboard.js
│   │   │   ├── PartnerOnboardingScreen.js
│   │   │   └── PerformanceScreen.js
│   │   ├── security/                # Security company screens
│   │   │   ├── SecurityDashboard.js
│   │   │   ├── EmergencyResponseScreen.js
│   │   │   └── IncidentManagementScreen.js
│   │   └── shared/                  # Shared screens
│   │       ├── NotificationScreen.js
│   │       ├── SettingsScreen.js
│   │       └── HelpScreen.js
│   │
│   ├── navigation/                  # Navigation configuration
│   │   ├── AppNavigator.js          # Main navigation setup
│   │   ├── AuthNavigator.js         # Authentication flow
│   │   ├── CustomerNavigator.js     # Customer navigation
│   │   ├── TechnicianNavigator.js   # Technician navigation
│   │   └── AdminNavigator.js        # Admin navigation
│   │
│   ├── store/                       # Redux store configuration
│   │   ├── store.js                 # Store setup
│   │   ├── slices/                  # Redux slices
│   │   │   ├── authSlice.js
│   │   │   ├── servicesSlice.js
│   │   │   ├── jobsSlice.js
│   │   │   ├── locationSlice.js
│   │   │   └── notificationsSlice.js
│   │   └── api/                     # RTK Query API slices
│   │       ├── authApi.js
│   │       ├── servicesApi.js
│   │       ├── jobsApi.js
│   │       └── analyticsApi.js
│   │
│   ├── services/                    # External service integrations
│   │   ├── api.js                   # API client configuration
│   │   ├── locationService.js       # GPS and location services
│   │   ├── notificationService.js   # Push notifications
│   │   ├── paymentService.js        # Payment processing
│   │   ├── mapService.js            # Maps integration
│   │   └── emergencyService.js      # Emergency services
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuth.js               # Authentication hook
│   │   ├── useLocation.js           # Location tracking hook
│   │   ├── useServices.js           # Services data hook
│   │   ├── useTechnicianJobs.js     # Technician jobs hook
│   │   ├── useTechnicianStatus.js   # Technician status hook
│   │   ├── useActiveService.js      # Active service tracking
│   │   ├── useAdminAnalytics.js     # Admin analytics hook
│   │   ├── useSystemAlerts.js       # System alerts hook
│   │   ├── useNotifications.js      # Notifications hook
│   │   └── useRealTime.js           # Real-time updates hook
│   │
│   ├── utils/                       # Utility functions
│   │   ├── supabaseClient.js        # Supabase client setup
│   │   ├── validation.js            # Input validation
│   │   ├── formatting.js            # Data formatting
│   │   ├── permissions.js           # Permission handling
│   │   ├── storage.js               # Local storage utilities
│   │   ├── dateUtils.js             # Date manipulation
│   │   ├── locationUtils.js         # Location calculations
│   │   └── errorHandling.js         # Error handling utilities
│   │
│   ├── constants/                   # App constants
│   │   ├── theme.js                 # Theme configuration
│   │   ├── colors.js                # Color palette
│   │   ├── typography.js            # Typography system
│   │   ├── spacing.js               # Spacing system
│   │   ├── api.js                   # API endpoints
│   │   ├── config.js                # App configuration
│   │   └── trinidad.js              # Trinidad & Tobago specific data
│   │
│   ├── types/                       # TypeScript type definitions
│   │   ├── auth.ts                  # Authentication types
│   │   ├── services.ts              # Service types
│   │   ├── user.ts                  # User types
│   │   ├── navigation.ts            # Navigation types
│   │   └── api.ts                   # API response types
│   │
│   ├── contexts/                    # React contexts
│   │   ├── AuthContext.js           # Authentication context
│   │   ├── ThemeContext.js          # Theme context
│   │   ├── LocationContext.js       # Location context
│   │   └── NotificationContext.js   # Notification context
│   │
│   └── App.js                       # Main app component
│
├── __tests__/                       # Test files
│   ├── components/                  # Component tests
│   ├── screens/                     # Screen tests
│   ├── hooks/                       # Hook tests
│   ├── utils/                       # Utility tests
│   └── __mocks__/                   # Mock files
│
├── docs/                            # Documentation
│   ├── API.md                       # API documentation
│   ├── DEPLOYMENT.md                # Deployment guide
│   ├── CONTRIBUTING.md              # Contribution guidelines
│   └── TROUBLESHOOTING.md           # Troubleshooting guide
│
├── .github/                         # GitHub configuration
│   ├── workflows/                   # CI/CD workflows
│   │   ├── ci.yml                   # Continuous integration
│   │   ├── build.yml                # Build workflow
│   │   └── deploy.yml               # Deployment workflow
│   ├── ISSUE_TEMPLATE/              # Issue templates
│   └── PULL_REQUEST_TEMPLATE.md     # PR template
│
├── .expo/                           # Expo configuration (auto-generated)
├── node_modules/                    # Dependencies (auto-generated)
│
├── .gitignore                       # Git ignore rules
├── .eslintrc.js                     # ESLint configuration
├── .prettierrc                      # Prettier configuration
├── babel.config.js                  # Babel configuration
├── metro.config.js                  # Metro bundler configuration
├── jest.config.js                   # Jest testing configuration
├── app.json                         # Expo app configuration
├── eas.json                         # EAS Build configuration
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── README.md                        # Project documentation
├── PRODUCTION_CHECKLIST.md          # Production readiness checklist
├── SECURITY_FIXES.md                # Security vulnerability fixes
└── PROJECT_STRUCTURE.md             # This file
```

## 🏗️ Architecture Overview

### Frontend Architecture
- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router with file-based routing
- **UI Framework**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React Query for server state management
- **Real-time**: Socket.io client for live updates
- **Maps**: React Native Maps with Google Maps integration

### Backend Integration
- **Primary Backend**: Supabase (PostgreSQL + Real-time + Auth + Storage)
- **Authentication**: JWT-based with Supabase Auth
- **Real-time**: Supabase real-time subscriptions
- **File Storage**: Supabase Storage with CDN
- **Payment Processing**: Stripe integration

### Key Features by User Role

#### Customer Features
- Service booking and tracking
- Real-time technician location
- Payment processing
- Service history
- Emergency SOS button

#### Technician Features
- Job management dashboard
- Earnings tracking
- GPS navigation
- Customer communication
- Status management

#### Admin Features
- User management
- System analytics
- Configuration management
- Emergency operations
- Financial reporting

#### Partner Features
- Partner onboarding
- Performance monitoring
- Billing integration
- Territory management

#### Security Features
- Emergency response
- Incident management
- Real-time monitoring
- Alert management

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

3. **Run on specific platform**:
   ```bash
   npm run ios     # iOS simulator
   npm run android # Android emulator
   npm run web     # Web browser
   ```

## 📱 Platform Support

- **iOS**: iOS 13.4+
- **Android**: API level 21+ (Android 5.0+)
- **Web**: Modern browsers with ES2020 support

## 🔧 Development Tools

- **Code Quality**: ESLint + Prettier
- **Testing**: Jest + React Native Testing Library + Detox
- **CI/CD**: GitHub Actions + EAS Build
- **Monitoring**: Sentry for error tracking
- **Analytics**: Custom analytics with Supabase

This structure provides a scalable, maintainable foundation for the RoadSide+ Trinidad & Tobago application.
