// Customer App E2E Tests for RoadSide+ Trinidad & Tobago
import { by, device, element, expect } from 'detox';
import { TestHelpers, TEST_USERS, TT_TEST_DATA } from './setup';

describe('Customer App - RoadSide+ Trinidad & Tobago', () => {
  beforeAll(async () => {
    await device.launchApp();
    await TestHelpers.enableLocation();
    await TestHelpers.mockLocation(TT_TEST_DATA.locations.portOfSpain);
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await TestHelpers.login('customer');
  });

  afterEach(async () => {
    await TestHelpers.takeScreenshot(`customer-test-${Date.now()}`);
    await TestHelpers.logout();
  });

  describe('Dashboard and Navigation', () => {
    it('should display customer dashboard with all main features', async () => {
      await TestHelpers.waitForElement('dashboard-screen');
      
      // Verify main action buttons
      await expect(element(by.id('book-service-button'))).toBeVisible();
      await expect(element(by.id('emergency-sos-button'))).toBeVisible();
      await expect(element(by.id('service-history-button'))).toBeVisible();
      await expect(element(by.id('profile-button'))).toBeVisible();
      
      // Verify Trinidad & Tobago branding
      await expect(element(by.text('RoadSide+ Trinidad & Tobago'))).toBeVisible();
    });

    it('should navigate between main tabs', async () => {
      // Test tab navigation
      await TestHelpers.tapElement('services-tab');
      await TestHelpers.waitForElement('services-screen');
      
      await TestHelpers.tapElement('history-tab');
      await TestHelpers.waitForElement('history-screen');
      
      await TestHelpers.tapElement('profile-tab');
      await TestHelpers.waitForElement('profile-screen');
      
      await TestHelpers.tapElement('dashboard-tab');
      await TestHelpers.waitForElement('dashboard-screen');
    });

    it('should handle deep linking correctly', async () => {
      // Test deep link to service request
      await device.openURL({ url: 'roadsideplus://service/new?type=towing' });
      await TestHelpers.waitForElement('service-selection-screen');
      await expect(element(by.id('service-towing-selected'))).toBeVisible();
    });
  });

  describe('Service Request Flow', () => {
    it('should complete towing service request with TTD payment', async () => {
      const service = await TestHelpers.createServiceRequest('towing');
      
      // Verify service details
      await expect(element(by.text(service.name))).toBeVisible();
      await TestHelpers.verifyTTDCurrency('service-base-price', service.basePrice);
      
      // Calculate expected total with VAT
      const expectedTotal = TestHelpers.calculateTTDTotal(service.basePrice);
      await TestHelpers.verifyTTDCurrency('service-total-price', expectedTotal);
      
      // Complete payment
      await TestHelpers.completePayment(expectedTotal);
      
      // Verify service request created
      await TestHelpers.waitForElement('service-request-created');
      await expect(element(by.text('Service request submitted successfully'))).toBeVisible();
    });

    it('should handle all service types with correct TTD pricing', async () => {
      const serviceTypes = Object.keys(TT_TEST_DATA.services) as Array<keyof typeof TT_TEST_DATA.services>;
      
      for (const serviceType of serviceTypes) {
        const service = TT_TEST_DATA.services[serviceType];
        
        await TestHelpers.tapElement('book-service-button');
        await TestHelpers.waitForElement('service-selection-screen');
        
        // Verify service is available
        await expect(element(by.id(`service-${serviceType}-button`))).toBeVisible();
        
        // Check pricing
        await TestHelpers.verifyTTDCurrency(`service-${serviceType}-price`, service.basePrice);
        
        // Go back to dashboard
        await TestHelpers.tapElement('back-button');
        await TestHelpers.waitForElement('dashboard-screen');
      }
    });

    it('should track service request status in real-time', async () => {
      await TestHelpers.createServiceRequest('battery');
      
      // Navigate to active service
      await TestHelpers.tapElement('view-active-service-button');
      await TestHelpers.waitForElement('service-tracking-screen');
      
      // Verify status updates
      await expect(element(by.text('Pending'))).toBeVisible();
      
      // Mock status change
      await device.sendUserNotification({
        trigger: {
          type: 'push',
        },
        title: 'Service Update',
        body: 'Your technician has been assigned',
        payload: {
          type: 'service_update',
          status: 'assigned',
        },
      });
      
      await TestHelpers.waitForElement('status-assigned');
      await expect(element(by.text('Assigned'))).toBeVisible();
    });
  });

  describe('Emergency Features', () => {
    it('should trigger emergency SOS with location', async () => {
      await TestHelpers.tapElement('emergency-sos-button');
      await TestHelpers.waitForElement('emergency-confirmation-modal');
      
      // Confirm emergency
      await TestHelpers.tapElement('confirm-emergency-button');
      await TestHelpers.waitForElement('emergency-active-screen');
      
      // Verify emergency details
      await expect(element(by.text('Emergency Alert Active'))).toBeVisible();
      await expect(element(by.text('Port of Spain, Trinidad'))).toBeVisible();
      
      // Verify emergency numbers displayed
      await TestHelpers.verifyEmergencyNumber('emergency-number', 'emergency');
      await TestHelpers.verifyEmergencyNumber('police-number', 'police');
      await TestHelpers.verifyEmergencyNumber('fire-number', 'fire');
      await TestHelpers.verifyEmergencyNumber('ambulance-number', 'ambulance');
    });

    it('should handle emergency service pricing with surcharge', async () => {
      // Create emergency service request
      await TestHelpers.tapElement('emergency-sos-button');
      await TestHelpers.tapElement('request-emergency-service-button');
      
      await TestHelpers.waitForElement('emergency-service-selection');
      await TestHelpers.tapElement('emergency-towing-button');
      
      // Verify emergency surcharge applied
      const basePrice = TT_TEST_DATA.services.towing.basePrice;
      const emergencyPrice = basePrice * 1.5; // 50% surcharge
      await TestHelpers.verifyTTDCurrency('emergency-service-price', emergencyPrice);
    });
  });

  describe('Payment Processing', () => {
    it('should handle TTD payment with VAT calculation', async () => {
      await TestHelpers.createServiceRequest('tire');
      
      await TestHelpers.waitForElement('payment-breakdown-screen');
      
      // Verify payment breakdown
      const baseAmount = TT_TEST_DATA.services.tire.basePrice;
      await TestHelpers.verifyTTDCurrency('base-amount', baseAmount);
      
      const platformFee = baseAmount * 0.05;
      await TestHelpers.verifyTTDCurrency('platform-fee', platformFee);
      
      const vat = (baseAmount + platformFee) * TT_TEST_DATA.currency.vatRate;
      await TestHelpers.verifyTTDCurrency('vat-amount', vat);
      
      // Verify VAT rate display
      await expect(element(by.text('VAT (12.5%)'))).toBeVisible();
    });

    it('should support multiple payment methods', async () => {
      await TestHelpers.createServiceRequest('lockout');
      
      await TestHelpers.waitForElement('payment-methods-screen');
      
      // Verify available payment methods
      await expect(element(by.id('credit-card-option'))).toBeVisible();
      await expect(element(by.id('linx-card-option'))).toBeVisible();
      await expect(element(by.id('wired-card-option'))).toBeVisible();
    });
  });

  describe('Profile Management', () => {
    it('should allow profile updates', async () => {
      await TestHelpers.tapElement('profile-tab');
      await TestHelpers.waitForElement('profile-screen');
      
      await TestHelpers.tapElement('edit-profile-button');
      await TestHelpers.waitForElement('edit-profile-screen');
      
      // Update profile information
      await TestHelpers.clearAndType('full-name-input', 'Updated Test Customer');
      await TestHelpers.clearAndType('phone-input', '+1-868-555-9999');
      
      await TestHelpers.tapElement('save-profile-button');
      await TestHelpers.waitForElement('profile-updated-success');
      
      // Verify changes saved
      await expect(element(by.text('Updated Test Customer'))).toBeVisible();
    });

    it('should manage emergency contacts', async () => {
      await TestHelpers.tapElement('profile-tab');
      await TestHelpers.tapElement('emergency-contacts-button');
      await TestHelpers.waitForElement('emergency-contacts-screen');
      
      await TestHelpers.tapElement('add-emergency-contact-button');
      await TestHelpers.typeText('emergency-name-input', 'Emergency Contact');
      await TestHelpers.typeText('emergency-phone-input', '+1-868-555-1111');
      
      await TestHelpers.tapElement('save-emergency-contact-button');
      await expect(element(by.text('Emergency Contact'))).toBeVisible();
    });
  });

  describe('Theme and Accessibility', () => {
    it('should switch between light and dark themes', async () => {
      // Test light theme
      await TestHelpers.switchTheme('light');
      await expect(element(by.id('theme-light-indicator'))).toBeVisible();
      
      // Test dark theme
      await TestHelpers.switchTheme('dark');
      await expect(element(by.id('theme-dark-indicator'))).toBeVisible();
      
      // Verify button styling in both themes
      await TestHelpers.verifyButtonStates('primary-button');
      await TestHelpers.verifyButtonStates('emergency-button');
    });

    it('should support accessibility features', async () => {
      await device.enableAccessibility();
      
      // Verify accessibility labels
      await expect(element(by.id('book-service-button'))).toHaveAccessibilityLabel('Book roadside service');
      await expect(element(by.id('emergency-sos-button'))).toHaveAccessibilityLabel('Emergency SOS button');
      
      // Test voice over navigation
      await element(by.id('book-service-button')).accessibilityActivate();
      await TestHelpers.waitForElement('service-selection-screen');
    });
  });

  describe('Notifications', () => {
    it('should receive and handle push notifications', async () => {
      // Mock push notification
      await device.sendUserNotification({
        trigger: { type: 'push' },
        title: 'Service Update',
        body: 'Your technician is on the way',
        payload: {
          type: 'service_update',
          serviceRequestId: 'test-123',
        },
      });
      
      // Verify notification appears
      await TestHelpers.waitForElement('notification-banner');
      await expect(element(by.text('Service Update'))).toBeVisible();
      
      // Tap notification to navigate
      await TestHelpers.tapElement('notification-banner');
      await TestHelpers.waitForElement('service-details-screen');
    });

    it('should manage notification preferences', async () => {
      await TestHelpers.tapElement('settings-menu');
      await TestHelpers.tapElement('notification-settings-button');
      await TestHelpers.waitForElement('notification-settings-screen');
      
      // Toggle notification types
      await TestHelpers.tapElement('service-updates-toggle');
      await TestHelpers.tapElement('payment-notifications-toggle');
      await TestHelpers.tapElement('emergency-alerts-toggle');
      
      await TestHelpers.tapElement('save-notification-settings');
      await TestHelpers.waitForElement('settings-saved-success');
    });
  });

  describe('Service History', () => {
    it('should display service history with TTD amounts', async () => {
      await TestHelpers.tapElement('history-tab');
      await TestHelpers.waitForElement('service-history-screen');
      
      // Verify history items
      await expect(element(by.id('history-item-1'))).toBeVisible();
      
      // Check TTD formatting in history
      await TestHelpers.verifyTTDCurrency('history-item-1-amount', 200.00);
      
      // Test filtering
      await TestHelpers.tapElement('filter-button');
      await TestHelpers.tapElement('filter-towing');
      await TestHelpers.tapElement('apply-filter');
      
      await expect(element(by.text('Emergency Towing'))).toBeVisible();
    });

    it('should allow rating and feedback', async () => {
      await TestHelpers.tapElement('history-tab');
      await TestHelpers.tapElement('history-item-1');
      await TestHelpers.waitForElement('service-details-screen');
      
      await TestHelpers.tapElement('rate-service-button');
      await TestHelpers.waitForElement('rating-modal');
      
      // Give 5-star rating
      await TestHelpers.tapElement('star-5');
      await TestHelpers.typeText('feedback-input', 'Excellent service!');
      
      await TestHelpers.tapElement('submit-rating-button');
      await TestHelpers.waitForElement('rating-submitted-success');
    });
  });
});
