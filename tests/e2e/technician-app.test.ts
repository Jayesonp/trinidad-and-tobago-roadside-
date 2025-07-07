// Technician App E2E Tests for RoadSide+ Trinidad & Tobago
import { by, device, element, expect } from 'detox';
import { TestHelpers, TEST_USERS, TT_TEST_DATA } from './setup';

describe('Technician App - RoadSide+ Trinidad & Tobago', () => {
  beforeAll(async () => {
    await device.launchApp();
    await TestHelpers.enableLocation();
    await TestHelpers.mockLocation(TT_TEST_DATA.locations.portOfSpain);
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await TestHelpers.login('technician');
  });

  afterEach(async () => {
    await TestHelpers.takeScreenshot(`technician-test-${Date.now()}`);
    await TestHelpers.logout();
  });

  describe('Technician Dashboard', () => {
    it('should display technician dashboard with job management', async () => {
      await TestHelpers.waitForElement('technician-dashboard');
      
      // Verify main features
      await expect(element(by.id('available-jobs-section'))).toBeVisible();
      await expect(element(by.id('active-job-section'))).toBeVisible();
      await expect(element(by.id('earnings-summary'))).toBeVisible();
      await expect(element(by.id('status-toggle'))).toBeVisible();
      
      // Verify Trinidad & Tobago context
      await expect(element(by.text('Trinidad & Tobago'))).toBeVisible();
    });

    it('should toggle availability status', async () => {
      await TestHelpers.waitForElement('status-toggle');
      
      // Check current status
      await expect(element(by.id('status-available'))).toBeVisible();
      
      // Toggle to offline
      await TestHelpers.tapElement('status-toggle');
      await expect(element(by.id('status-offline'))).toBeVisible();
      
      // Toggle back to available
      await TestHelpers.tapElement('status-toggle');
      await expect(element(by.id('status-available'))).toBeVisible();
    });

    it('should display earnings in TTD', async () => {
      await TestHelpers.waitForElement('earnings-summary');
      
      // Verify TTD currency formatting
      await TestHelpers.verifyTTDCurrency('daily-earnings', 450.00);
      await TestHelpers.verifyTTDCurrency('weekly-earnings', 2100.00);
      await TestHelpers.verifyTTDCurrency('monthly-earnings', 8500.00);
      
      // Check earnings breakdown
      await TestHelpers.tapElement('earnings-details-button');
      await TestHelpers.waitForElement('earnings-breakdown-screen');
      
      await expect(element(by.text('Service Fees'))).toBeVisible();
      await expect(element(by.text('Tips'))).toBeVisible();
      await expect(element(by.text('Bonuses'))).toBeVisible();
    });
  });

  describe('Job Management', () => {
    it('should accept and manage job assignments', async () => {
      // Mock incoming job
      await device.sendUserNotification({
        trigger: { type: 'push' },
        title: 'New Job Available',
        body: 'Towing service needed in Port of Spain',
        payload: {
          type: 'technician_assigned',
          serviceRequestId: 'test-job-123',
          serviceType: 'towing',
        },
      });
      
      await TestHelpers.waitForElement('job-notification');
      await TestHelpers.tapElement('view-job-button');
      await TestHelpers.waitForElement('job-details-screen');
      
      // Verify job details
      await expect(element(by.text('Emergency Towing'))).toBeVisible();
      await expect(element(by.text('Port of Spain, Trinidad'))).toBeVisible();
      await TestHelpers.verifyTTDCurrency('job-payment', 200.00);
      
      // Accept job
      await TestHelpers.tapElement('accept-job-button');
      await TestHelpers.waitForElement('job-accepted-screen');
      
      await expect(element(by.text('Job Accepted'))).toBeVisible();
    });

    it('should navigate to customer location', async () => {
      // Assume job is accepted
      await TestHelpers.waitForElement('active-job-screen');
      
      await TestHelpers.tapElement('navigate-to-customer-button');
      await TestHelpers.waitForElement('navigation-screen');
      
      // Verify navigation started
      await expect(element(by.text('Navigating to customer'))).toBeVisible();
      await expect(element(by.id('map-view'))).toBeVisible();
      
      // Test arrival notification
      await TestHelpers.tapElement('arrived-button');
      await TestHelpers.waitForElement('arrival-confirmation');
      
      await expect(element(by.text('Arrived at customer location'))).toBeVisible();
    });

    it('should update job status and complete service', async () => {
      await TestHelpers.waitForElement('active-job-screen');
      
      // Start service
      await TestHelpers.tapElement('start-service-button');
      await TestHelpers.waitForElement('service-in-progress');
      
      await expect(element(by.text('Service In Progress'))).toBeVisible();
      
      // Add service notes
      await TestHelpers.typeText('service-notes-input', 'Vehicle towed to nearest service center');
      
      // Upload photos
      await TestHelpers.tapElement('upload-photo-button');
      await TestHelpers.waitForElement('camera-screen');
      await TestHelpers.tapElement('take-photo-button');
      await TestHelpers.tapElement('confirm-photo-button');
      
      // Complete service
      await TestHelpers.tapElement('complete-service-button');
      await TestHelpers.waitForElement('service-completion-screen');
      
      // Verify completion
      await expect(element(by.text('Service Completed'))).toBeVisible();
      await TestHelpers.verifyTTDCurrency('service-payment', 200.00);
    });

    it('should handle emergency jobs with priority', async () => {
      // Mock emergency job
      await device.sendUserNotification({
        trigger: { type: 'push' },
        title: '🚨 Emergency Job',
        body: 'Emergency towing needed - High Priority',
        payload: {
          type: 'emergency',
          serviceRequestId: 'emergency-123',
          emergency: true,
        },
      });
      
      await TestHelpers.waitForElement('emergency-job-notification');
      
      // Verify emergency styling
      await expect(element(by.id('emergency-job-badge'))).toBeVisible();
      await expect(element(by.text('EMERGENCY'))).toBeVisible();
      
      // Check emergency surcharge
      const emergencyPrice = TT_TEST_DATA.services.towing.basePrice * 1.5;
      await TestHelpers.verifyTTDCurrency('emergency-job-payment', emergencyPrice);
      
      await TestHelpers.tapElement('accept-emergency-job-button');
      await TestHelpers.waitForElement('emergency-job-accepted');
    });
  });

  describe('Location Tracking', () => {
    it('should track and update technician location', async () => {
      await TestHelpers.waitForElement('technician-dashboard');
      
      // Verify location sharing is enabled
      await expect(element(by.id('location-sharing-active'))).toBeVisible();
      
      // Mock location update
      await TestHelpers.mockLocation(TT_TEST_DATA.locations.sanFernando);
      
      // Verify location updated
      await TestHelpers.waitForElement('location-updated-indicator');
      await expect(element(by.text('San Fernando, Trinidad'))).toBeVisible();
    });

    it('should share location with customers during active jobs', async () => {
      // Accept a job first
      await TestHelpers.waitForElement('active-job-screen');
      
      // Verify location sharing with customer
      await expect(element(by.id('sharing-location-with-customer'))).toBeVisible();
      await expect(element(by.text('Customer can see your location'))).toBeVisible();
      
      // Test ETA updates
      await TestHelpers.tapElement('update-eta-button');
      await TestHelpers.typeText('eta-input', '15');
      await TestHelpers.tapElement('send-eta-button');
      
      await TestHelpers.waitForElement('eta-sent-confirmation');
    });
  });

  describe('Earnings and Payments', () => {
    it('should track earnings with TTD breakdown', async () => {
      await TestHelpers.tapElement('earnings-tab');
      await TestHelpers.waitForElement('earnings-screen');
      
      // Verify earnings summary
      await TestHelpers.verifyTTDCurrency('total-earnings', 2500.00);
      await TestHelpers.verifyTTDCurrency('pending-earnings', 300.00);
      await TestHelpers.verifyTTDCurrency('paid-earnings', 2200.00);
      
      // Check individual job earnings
      await TestHelpers.tapElement('earnings-history-button');
      await TestHelpers.waitForElement('earnings-history-screen');
      
      await expect(element(by.text('Emergency Towing'))).toBeVisible();
      await TestHelpers.verifyTTDCurrency('job-1-earnings', 200.00);
    });

    it('should handle payment processing and withdrawals', async () => {
      await TestHelpers.tapElement('earnings-tab');
      await TestHelpers.tapElement('withdraw-earnings-button');
      await TestHelpers.waitForElement('withdrawal-screen');
      
      // Verify available balance
      await TestHelpers.verifyTTDCurrency('available-balance', 2200.00);
      
      // Request withdrawal
      await TestHelpers.typeText('withdrawal-amount-input', '1000');
      await TestHelpers.tapElement('bank-account-selector');
      await TestHelpers.tapElement('primary-bank-account');
      
      await TestHelpers.tapElement('request-withdrawal-button');
      await TestHelpers.waitForElement('withdrawal-requested-success');
      
      await expect(element(by.text('Withdrawal requested'))).toBeVisible();
    });
  });

  describe('Profile and Vehicle Management', () => {
    it('should manage technician profile and credentials', async () => {
      await TestHelpers.tapElement('profile-tab');
      await TestHelpers.waitForElement('technician-profile-screen');
      
      // Verify profile information
      await expect(element(by.text(TEST_USERS.technician.name))).toBeVisible();
      await expect(element(by.text(TEST_USERS.technician.license))).toBeVisible();
      
      // Update specializations
      await TestHelpers.tapElement('edit-specializations-button');
      await TestHelpers.waitForElement('specializations-screen');
      
      await TestHelpers.tapElement('towing-specialization');
      await TestHelpers.tapElement('battery-specialization');
      await TestHelpers.tapElement('save-specializations-button');
      
      await TestHelpers.waitForElement('specializations-updated-success');
    });

    it('should manage vehicle information', async () => {
      await TestHelpers.tapElement('profile-tab');
      await TestHelpers.tapElement('vehicle-info-button');
      await TestHelpers.waitForElement('vehicle-info-screen');
      
      // Update vehicle details
      await TestHelpers.clearAndType('vehicle-make-input', 'Toyota');
      await TestHelpers.clearAndType('vehicle-model-input', 'Hilux');
      await TestHelpers.clearAndType('vehicle-year-input', '2022');
      await TestHelpers.clearAndType('vehicle-plate-input', 'TT-TECH-001');
      
      await TestHelpers.tapElement('save-vehicle-info-button');
      await TestHelpers.waitForElement('vehicle-info-updated-success');
    });
  });

  describe('Communication', () => {
    it('should communicate with customers during service', async () => {
      await TestHelpers.waitForElement('active-job-screen');
      
      await TestHelpers.tapElement('contact-customer-button');
      await TestHelpers.waitForElement('communication-options');
      
      // Test in-app messaging
      await TestHelpers.tapElement('send-message-button');
      await TestHelpers.waitForElement('message-screen');
      
      await TestHelpers.typeText('message-input', 'I am on my way to your location');
      await TestHelpers.tapElement('send-message-button');
      
      await TestHelpers.waitForElement('message-sent-confirmation');
      
      // Test call customer
      await TestHelpers.tapElement('call-customer-button');
      await TestHelpers.waitForElement('call-initiated');
    });

    it('should handle emergency communication', async () => {
      // During emergency job
      await TestHelpers.waitForElement('emergency-job-screen');
      
      await TestHelpers.tapElement('emergency-contact-button');
      await TestHelpers.waitForElement('emergency-communication-screen');
      
      // Verify emergency numbers available
      await TestHelpers.verifyEmergencyNumber('emergency-services-number', 'emergency');
      await TestHelpers.verifyEmergencyNumber('police-number', 'police');
      
      // Test emergency broadcast
      await TestHelpers.tapElement('broadcast-status-button');
      await TestHelpers.typeText('status-message-input', 'Responding to emergency in Port of Spain');
      await TestHelpers.tapElement('send-broadcast-button');
      
      await TestHelpers.waitForElement('broadcast-sent-confirmation');
    });
  });

  describe('Performance Metrics', () => {
    it('should display performance analytics', async () => {
      await TestHelpers.tapElement('performance-tab');
      await TestHelpers.waitForElement('performance-screen');
      
      // Verify key metrics
      await expect(element(by.text('4.8'))).toBeVisible(); // Rating
      await expect(element(by.text('95%'))).toBeVisible(); // Completion rate
      await expect(element(by.text('12 min'))).toBeVisible(); // Avg response time
      
      // Check performance trends
      await TestHelpers.tapElement('performance-trends-button');
      await TestHelpers.waitForElement('trends-screen');
      
      await expect(element(by.id('performance-chart'))).toBeVisible();
    });

    it('should track service quality metrics', async () => {
      await TestHelpers.tapElement('performance-tab');
      await TestHelpers.tapElement('quality-metrics-button');
      await TestHelpers.waitForElement('quality-metrics-screen');
      
      // Verify quality indicators
      await expect(element(by.text('Customer Satisfaction'))).toBeVisible();
      await expect(element(by.text('Service Completion Time'))).toBeVisible();
      await expect(element(by.text('First-Time Fix Rate'))).toBeVisible();
      
      // Check recent feedback
      await TestHelpers.tapElement('recent-feedback-button');
      await TestHelpers.waitForElement('feedback-screen');
      
      await expect(element(by.text('Excellent service!'))).toBeVisible();
    });
  });
});
