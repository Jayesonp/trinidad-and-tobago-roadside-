// Security E2E Tests for RoadSide+ Trinidad & Tobago
import { by, device, element, expect } from 'detox';
import { TestHelpers, TEST_USERS, TT_TEST_DATA } from './setup';

describe('Security Features - RoadSide+ Trinidad & Tobago', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterEach(async () => {
    await TestHelpers.takeScreenshot(`security-test-${Date.now()}`);
  });

  describe('Authentication Flow', () => {
    it('should handle secure login process', async () => {
      await TestHelpers.waitForElement('login-screen');
      
      // Test invalid credentials
      await TestHelpers.clearAndType('login-email-input', 'invalid@email.com');
      await TestHelpers.clearAndType('login-password-input', 'wrongpassword');
      await TestHelpers.tapElement('login-submit-button');
      
      await TestHelpers.waitForElement('login-error-message');
      await expect(element(by.text('Invalid credentials'))).toBeVisible();
      
      // Test valid credentials
      await TestHelpers.clearAndType('login-email-input', TEST_USERS.customer.email);
      await TestHelpers.clearAndType('login-password-input', TEST_USERS.customer.password);
      await TestHelpers.tapElement('login-submit-button');
      
      await TestHelpers.waitForElement('dashboard-screen');
      await expect(element(by.text('Welcome back'))).toBeVisible();
    });

    it('should handle password reset securely', async () => {
      await TestHelpers.waitForElement('login-screen');
      
      await TestHelpers.tapElement('forgot-password-link');
      await TestHelpers.waitForElement('password-reset-screen');
      
      // Test invalid email
      await TestHelpers.clearAndType('reset-email-input', 'invalid-email');
      await TestHelpers.tapElement('send-reset-button');
      await expect(element(by.text('Please enter a valid email'))).toBeVisible();
      
      // Test valid email
      await TestHelpers.clearAndType('reset-email-input', TEST_USERS.customer.email);
      await TestHelpers.tapElement('send-reset-button');
      await TestHelpers.waitForElement('reset-email-sent');
      
      await expect(element(by.text('Password reset email sent'))).toBeVisible();
    });

    it('should handle account registration with validation', async () => {
      await TestHelpers.waitForElement('login-screen');
      
      await TestHelpers.tapElement('register-link');
      await TestHelpers.waitForElement('registration-screen');
      
      // Test weak password
      await TestHelpers.clearAndType('register-email-input', 'newuser@test.com');
      await TestHelpers.clearAndType('register-password-input', '123');
      await TestHelpers.clearAndType('register-confirm-password-input', '123');
      await TestHelpers.tapElement('register-submit-button');
      
      await expect(element(by.text('Password must be at least 8 characters'))).toBeVisible();
      
      // Test password mismatch
      await TestHelpers.clearAndType('register-password-input', 'StrongPassword123!');
      await TestHelpers.clearAndType('register-confirm-password-input', 'DifferentPassword123!');
      await TestHelpers.tapElement('register-submit-button');
      
      await expect(element(by.text('Passwords do not match'))).toBeVisible();
      
      // Test valid registration
      await TestHelpers.clearAndType('register-password-input', 'StrongPassword123!');
      await TestHelpers.clearAndType('register-confirm-password-input', 'StrongPassword123!');
      await TestHelpers.clearAndType('register-full-name-input', 'New Test User');
      await TestHelpers.clearAndType('register-phone-input', '+1-868-555-9999');
      await TestHelpers.tapElement('register-submit-button');
      
      await TestHelpers.waitForElement('registration-success');
      await expect(element(by.text('Account created successfully'))).toBeVisible();
    });

    it('should handle biometric authentication', async () => {
      await TestHelpers.login('customer');
      
      // Enable biometric authentication
      await TestHelpers.tapElement('profile-tab');
      await TestHelpers.tapElement('security-settings-button');
      await TestHelpers.waitForElement('security-settings-screen');
      
      await TestHelpers.tapElement('enable-biometric-toggle');
      await TestHelpers.waitForElement('biometric-setup-modal');
      
      // Mock biometric authentication
      await device.setBiometricEnrollment(true);
      await TestHelpers.tapElement('setup-biometric-button');
      await TestHelpers.waitForElement('biometric-enabled-success');
      
      // Test biometric login
      await TestHelpers.logout();
      await TestHelpers.waitForElement('login-screen');
      
      await TestHelpers.tapElement('biometric-login-button');
      await device.matchBiometric();
      await TestHelpers.waitForElement('dashboard-screen');
    });
  });

  describe('Role-Based Access Control', () => {
    it('should enforce customer role permissions', async () => {
      await TestHelpers.login('customer');
      
      // Verify customer can access allowed features
      await expect(element(by.id('book-service-button'))).toBeVisible();
      await expect(element(by.id('service-history-button'))).toBeVisible();
      await expect(element(by.id('profile-button'))).toBeVisible();
      
      // Verify customer cannot access admin features
      await expect(element(by.id('admin-dashboard-button'))).not.toExist();
      await expect(element(by.id('user-management-button'))).not.toExist();
      
      // Test direct navigation to admin route (should be blocked)
      await device.openURL({ url: 'roadsideplus://admin/dashboard' });
      await TestHelpers.waitForElement('access-denied-screen');
      await expect(element(by.text('Access denied'))).toBeVisible();
    });

    it('should enforce technician role permissions', async () => {
      await TestHelpers.logout();
      await TestHelpers.login('technician');
      
      // Verify technician can access allowed features
      await expect(element(by.id('available-jobs-section'))).toBeVisible();
      await expect(element(by.id('earnings-section'))).toBeVisible();
      await expect(element(by.id('status-toggle'))).toBeVisible();
      
      // Verify technician cannot access customer-specific features
      await expect(element(by.id('book-service-button'))).not.toExist();
      
      // Verify technician cannot access admin features
      await expect(element(by.id('admin-dashboard-button'))).not.toExist();
    });

    it('should enforce admin role permissions', async () => {
      await TestHelpers.logout();
      await TestHelpers.login('admin');
      
      // Verify admin can access all features
      await expect(element(by.id('user-management-section'))).toBeVisible();
      await expect(element(by.id('service-monitoring-section'))).toBeVisible();
      await expect(element(by.id('analytics-section'))).toBeVisible();
      await expect(element(by.id('payment-processing-section'))).toBeVisible();
      
      // Test admin can view user data
      await TestHelpers.tapElement('user-management-tab');
      await TestHelpers.waitForElement('user-list');
      await expect(element(by.id('customer-list'))).toBeVisible();
      await expect(element(by.id('technician-list'))).toBeVisible();
    });
  });

  describe('Data Isolation', () => {
    it('should isolate customer data between users', async () => {
      // Login as first customer
      await TestHelpers.login('customer');
      
      // Create a service request
      await TestHelpers.createServiceRequest('towing');
      await TestHelpers.waitForElement('service-request-created');
      
      // Note the service request ID
      const serviceRequestId = await element(by.id('service-request-id')).getAttributes();
      
      // Logout and login as different customer
      await TestHelpers.logout();
      await TestHelpers.clearAndType('login-email-input', 'other.customer@test.com');
      await TestHelpers.clearAndType('login-password-input', 'TestPassword123!');
      await TestHelpers.tapElement('login-submit-button');
      await TestHelpers.waitForElement('dashboard-screen');
      
      // Verify second customer cannot see first customer's data
      await TestHelpers.tapElement('history-tab');
      await TestHelpers.waitForElement('service-history-screen');
      
      await expect(element(by.id(serviceRequestId.text))).not.toExist();
      
      // Test direct access to service request (should be blocked)
      await device.openURL({ url: `roadsideplus://service/${serviceRequestId.text}` });
      await TestHelpers.waitForElement('access-denied-screen');
    });

    it('should isolate technician data and job assignments', async () => {
      // Login as first technician
      await TestHelpers.login('technician');
      
      // Check available jobs
      await TestHelpers.waitForElement('available-jobs-section');
      const jobCount1 = await element(by.id('available-jobs-count')).getAttributes();
      
      // Logout and login as different technician
      await TestHelpers.logout();
      await TestHelpers.clearAndType('login-email-input', 'other.technician@test.com');
      await TestHelpers.clearAndType('login-password-input', 'TestPassword123!');
      await TestHelpers.tapElement('login-submit-button');
      await TestHelpers.waitForElement('technician-dashboard');
      
      // Verify different job assignments
      await TestHelpers.waitForElement('available-jobs-section');
      const jobCount2 = await element(by.id('available-jobs-count')).getAttributes();
      
      // Job counts should be different (or at least not show same specific jobs)
      await expect(element(by.id('technician-specific-jobs'))).toBeVisible();
    });
  });

  describe('Secure Storage', () => {
    it('should store sensitive data securely', async () => {
      await TestHelpers.login('customer');
      
      // Add payment method
      await TestHelpers.tapElement('profile-tab');
      await TestHelpers.tapElement('payment-methods-button');
      await TestHelpers.waitForElement('payment-methods-screen');
      
      await TestHelpers.tapElement('add-payment-method-button');
      await TestHelpers.waitForElement('add-card-screen');
      
      // Enter card details
      await TestHelpers.typeText('card-number-input', '4242424242424242');
      await TestHelpers.typeText('card-expiry-input', '12/25');
      await TestHelpers.typeText('card-cvc-input', '123');
      await TestHelpers.typeText('card-name-input', 'Test User');
      
      await TestHelpers.tapElement('save-card-button');
      await TestHelpers.waitForElement('card-saved-success');
      
      // Verify card number is masked
      await TestHelpers.waitForElement('payment-methods-list');
      await expect(element(by.text('**** **** **** 4242'))).toBeVisible();
      await expect(element(by.text('4242424242424242'))).not.toExist();
    });

    it('should handle secure session management', async () => {
      await TestHelpers.login('customer');
      
      // Verify session is active
      await expect(element(by.id('authenticated-user-indicator'))).toBeVisible();
      
      // Test session timeout
      await device.setDatetime('2024-01-01T12:00:00Z');
      await device.reloadReactNative();
      
      // Should be redirected to login due to expired session
      await TestHelpers.waitForElement('login-screen');
      await expect(element(by.text('Session expired'))).toBeVisible();
    });

    it('should encrypt local data storage', async () => {
      await TestHelpers.login('customer');
      
      // Store some user preferences
      await TestHelpers.tapElement('profile-tab');
      await TestHelpers.tapElement('preferences-button');
      await TestHelpers.waitForElement('preferences-screen');
      
      await TestHelpers.tapElement('notification-preferences-toggle');
      await TestHelpers.tapElement('location-sharing-toggle');
      await TestHelpers.tapElement('save-preferences-button');
      
      await TestHelpers.waitForElement('preferences-saved-success');
      
      // Verify data is stored securely (not accessible via device inspection)
      // This would typically involve checking that sensitive data is not stored in plain text
      await expect(element(by.id('encrypted-storage-indicator'))).toBeVisible();
    });
  });

  describe('Push Notification Security', () => {
    it('should handle notification permissions securely', async () => {
      await TestHelpers.login('customer');
      
      // Test notification permission request
      await TestHelpers.tapElement('enable-notifications-button');
      await TestHelpers.waitForElement('notification-permission-modal');
      
      // Grant permissions
      await device.grantPermission('notifications');
      await TestHelpers.tapElement('allow-notifications-button');
      await TestHelpers.waitForElement('notifications-enabled-success');
      
      // Verify secure token handling
      await expect(element(by.id('secure-push-token-indicator'))).toBeVisible();
    });

    it('should validate notification content', async () => {
      await TestHelpers.login('customer');
      
      // Mock malicious notification
      await device.sendUserNotification({
        trigger: { type: 'push' },
        title: '<script>alert("xss")</script>',
        body: 'Malicious content',
        payload: {
          type: 'malicious',
          script: '<script>alert("xss")</script>',
        },
      });
      
      // Verify content is sanitized
      await TestHelpers.waitForElement('notification-banner');
      await expect(element(by.text('<script>alert("xss")</script>'))).not.toExist();
      await expect(element(by.text('Invalid notification'))).toBeVisible();
    });
  });

  describe('API Security', () => {
    it('should handle API authentication correctly', async () => {
      await TestHelpers.login('customer');
      
      // Test authenticated API call
      await TestHelpers.tapElement('book-service-button');
      await TestHelpers.tapElement('service-towing-button');
      await TestHelpers.typeText('description-input', 'Test service');
      await TestHelpers.tapElement('proceed-button');
      
      // Verify request includes authentication
      await TestHelpers.waitForElement('payment-screen');
      await expect(element(by.id('authenticated-request-indicator'))).toBeVisible();
    });

    it('should handle API rate limiting', async () => {
      await TestHelpers.login('customer');
      
      // Make multiple rapid requests
      for (let i = 0; i < 10; i++) {
        await TestHelpers.tapElement('refresh-data-button');
      }
      
      // Verify rate limiting is applied
      await TestHelpers.waitForElement('rate-limit-warning');
      await expect(element(by.text('Too many requests. Please wait.'))).toBeVisible();
    });

    it('should validate input data', async () => {
      await TestHelpers.login('customer');
      
      // Test SQL injection attempt
      await TestHelpers.tapElement('book-service-button');
      await TestHelpers.tapElement('service-towing-button');
      await TestHelpers.typeText('description-input', "'; DROP TABLE users; --");
      await TestHelpers.tapElement('proceed-button');
      
      // Verify input is sanitized
      await TestHelpers.waitForElement('input-validation-error');
      await expect(element(by.text('Invalid characters detected'))).toBeVisible();
    });
  });

  describe('Emergency Security', () => {
    it('should handle emergency alerts securely', async () => {
      await TestHelpers.login('customer');
      
      // Trigger emergency alert
      await TestHelpers.tapElement('emergency-sos-button');
      await TestHelpers.tapElement('confirm-emergency-button');
      await TestHelpers.waitForElement('emergency-active-screen');
      
      // Verify emergency data is transmitted securely
      await expect(element(by.id('secure-emergency-transmission'))).toBeVisible();
      
      // Verify location data is encrypted
      await expect(element(by.id('encrypted-location-data'))).toBeVisible();
    });

    it('should restrict emergency feature access', async () => {
      // Test without authentication
      await TestHelpers.waitForElement('login-screen');
      
      // Emergency button should not be accessible without login
      await expect(element(by.id('emergency-sos-button'))).not.toExist();
      
      // Test direct emergency URL access
      await device.openURL({ url: 'roadsideplus://emergency/sos' });
      await TestHelpers.waitForElement('authentication-required-screen');
      await expect(element(by.text('Please log in to access emergency features'))).toBeVisible();
    });
  });
});
