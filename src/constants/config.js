import Constants from 'expo-constants';

// Helper function to get environment variables
const getEnvVar = (name, defaultValue = '') => {
  return Constants.expoConfig?.extra?.[name] || process.env[name] || defaultValue;
};

// App Configuration
export const APP_CONFIG = {
  name: getEnvVar('APP_NAME', 'RoadSide+ Trinidad & Tobago'),
  version: getEnvVar('APP_VERSION', '1.0.0'),
  environment: getEnvVar('ENVIRONMENT', 'development'),
  isDev: getEnvVar('DEV_MODE', 'true') === 'true',
};

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: getEnvVar('SUPABASE_URL', 'https://xyzcompany.supabase.co'),
  anonKey: getEnvVar('SUPABASE_ANON_KEY', 'your_anon_key'),
};

// Stripe Configuration
export const STRIPE_CONFIG = {
  publishableKey: getEnvVar('STRIPE_PUBLISHABLE_KEY', 'pk_live_123'),
  // Note: Secret key should only be used on server-side
};

// Google Maps Configuration
export const MAPS_CONFIG = {
  apiKey: getEnvVar('GOOGLE_MAPS_API_KEY', 'your-google-maps-api-key'),
};

// Monitoring Configuration
export const MONITORING_CONFIG = {
  sentryDsn: getEnvVar('SENTRY_DSN', ''),
  googleAnalyticsId: getEnvVar('GOOGLE_ANALYTICS_ID', ''),
};

// Trinidad & Tobago Emergency Numbers
export const EMERGENCY_NUMBERS = {
  emergency: getEnvVar('TT_EMERGENCY_NUMBER', '999'),
  police: getEnvVar('TT_POLICE_NUMBER', '999'),
  fire: getEnvVar('TT_FIRE_SERVICE', '990'),
  ambulance: getEnvVar('TT_AMBULANCE', '811'),
};

// Business Configuration
export const BUSINESS_CONFIG = {
  currency: getEnvVar('DEFAULT_CURRENCY', 'TTD'),
  timezone: getEnvVar('DEFAULT_TIMEZONE', 'America/Port_of_Spain'),
  supportedLanguages: getEnvVar('SUPPORTED_LANGUAGES', 'en,es').split(','),
};

// Feature Flags
export const FEATURE_FLAGS = {
  emergencySOS: getEnvVar('ENABLE_EMERGENCY_SOS', 'true') === 'true',
  realTimeTracking: getEnvVar('ENABLE_REAL_TIME_TRACKING', 'true') === 'true',
  paymentProcessing: getEnvVar('ENABLE_PAYMENT_PROCESSING', 'true') === 'true',
  multiLanguage: getEnvVar('ENABLE_MULTI_LANGUAGE', 'false') === 'true',
};

// API Configuration
export const API_CONFIG = {
  timeout: parseInt(getEnvVar('API_TIMEOUT', '10000'), 10),
  baseUrl: SUPABASE_CONFIG.url,
};

// Validation
const validateConfig = () => {
  const requiredVars = [
    { key: 'SUPABASE_URL', value: SUPABASE_CONFIG.url },
    { key: 'SUPABASE_ANON_KEY', value: SUPABASE_CONFIG.anonKey },
  ];

  const missing = requiredVars.filter(
    ({ value }) => !value || value.includes('your_') || value.includes('xyzcompany')
  );

  if (missing.length > 0 && APP_CONFIG.isDev) {
    console.warn(
      '⚠️ Missing or placeholder environment variables:',
      missing.map(({ key }) => key).join(', ')
    );
    console.warn('Please check your .env file and update the values.');
  }
};

// Run validation in development
if (APP_CONFIG.isDev) {
  validateConfig();
}

export default {
  APP_CONFIG,
  SUPABASE_CONFIG,
  STRIPE_CONFIG,
  MAPS_CONFIG,
  MONITORING_CONFIG,
  EMERGENCY_NUMBERS,
  BUSINESS_CONFIG,
  FEATURE_FLAGS,
  API_CONFIG,
};
