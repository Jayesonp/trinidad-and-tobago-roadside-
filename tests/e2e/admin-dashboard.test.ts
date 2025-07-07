// Admin Dashboard E2E Tests for RoadSide+ Trinidad & Tobago
import { by, device, element, expect } from 'detox';
import { TestHelpers, TEST_USERS, TT_TEST_DATA } from './setup';

describe('Admin Dashboard - RoadSide+ Trinidad & Tobago', () => {
  beforeAll(async () => {
    await device.launchApp();
    await TestHelpers.enableLocation();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await TestHelpers.login('admin');
  });

  afterEach(async () => {
    await TestHelpers.takeScreenshot(`admin-test-${Date.now()}`);
    await TestHelpers.logout();
  });

  describe('Admin Dashboard Overview', () => {
    it('should display comprehensive admin dashboard', async () => {
      await TestHelpers.waitForElement('admin-dashboard');
      
      // Verify main admin sections
      await expect(element(by.id('user-management-section'))).toBeVisible();
      await expect(element(by.id('service-monitoring-section'))).toBeVisible();
      await expect(element(by.id('analytics-section'))).toBeVisible();
      await expect(element(by.id('payment-processing-section'))).toBeVisible();
      await expect(element(by.id('emergency-management-section'))).toBeVisible();
      
      // Verify Trinidad & Tobago specific metrics
      await expect(element(by.text('Trinidad & Tobago Operations'))).toBeVisible();
      await TestHelpers.verifyTTDCurrency('total-revenue', 125000.00);
    });

    it('should display real-time system metrics', async () => {
      await TestHelpers.waitForElement('system-metrics-section');
      
      // Verify key performance indicators
      await expect(element(by.id('active-users-count'))).toBeVisible();
      await expect(element(by.id('active-technicians-count'))).toBeVisible();
      await expect(element(by.id('pending-requests-count'))).toBeVisible();
      await expect(element(by.id('emergency-alerts-count'))).toBeVisible();
      
      // Check system health indicators
      await expect(element(by.id('system-health-good'))).toBeVisible();
      await expect(element(by.text('All systems operational'))).toBeVisible();
    });
  });

  describe('User Management', () => {
    it('should manage customer accounts', async () => {
      await TestHelpers.tapElement('user-management-tab');
      await TestHelpers.waitForElement('user-management-screen');
      
      await TestHelpers.tapElement('customers-filter');
      await TestHelpers.waitForElement('customers-list');
      
      // Verify customer list
      await expect(element(by.id('customer-list-item-1'))).toBeVisible();
      
      // View customer details
      await TestHelpers.tapElement('customer-list-item-1');
      await TestHelpers.waitForElement('customer-details-screen');
      
      await expect(element(by.text('Customer Profile'))).toBeVisible();
      await expect(element(by.text('Service History'))).toBeVisible();
      await expect(element(by.text('Payment History'))).toBeVisible();
      
      // Test customer actions
      await TestHelpers.tapElement('customer-actions-menu');
      await expect(element(by.text('Suspend Account'))).toBeVisible();
      await expect(element(by.text('Reset Password'))).toBeVisible();
      await expect(element(by.text('View Activity Log'))).toBeVisible();
    });

    it('should manage technician accounts and verification', async () => {
      await TestHelpers.tapElement('user-management-tab');
      await TestHelpers.tapElement('technicians-filter');
      await TestHelpers.waitForElement('technicians-list');
      
      // View pending technician applications
      await TestHelpers.tapElement('pending-applications-tab');
      await TestHelpers.waitForElement('pending-technicians-list');
      
      await TestHelpers.tapElement('pending-technician-1');
      await TestHelpers.waitForElement('technician-verification-screen');
      
      // Verify technician credentials
      await expect(element(by.text('License Verification'))).toBeVisible();
      await expect(element(by.text('Background Check'))).toBeVisible();
      await expect(element(by.text('Vehicle Documentation'))).toBeVisible();
      
      // Approve technician
      await TestHelpers.tapElement('approve-technician-button');
      await TestHelpers.waitForElement('approval-confirmation-modal');
      
      await TestHelpers.tapElement('confirm-approval-button');
      await TestHelpers.waitForElement('technician-approved-success');
    });

    it('should handle role-based access control', async () => {
      await TestHelpers.tapElement('user-management-tab');
      await TestHelpers.tapElement('roles-permissions-tab');
      await TestHelpers.waitForElement('roles-management-screen');
      
      // Verify role types
      await expect(element(by.text('Customer'))).toBeVisible();
      await expect(element(by.text('Technician'))).toBeVisible();
      await expect(element(by.text('Admin'))).toBeVisible();
      await expect(element(by.text('Partner'))).toBeVisible();
      await expect(element(by.text('Security'))).toBeVisible();
      
      // Test role assignment
      await TestHelpers.tapElement('assign-role-button');
      await TestHelpers.waitForElement('role-assignment-modal');
      
      await TestHelpers.tapElement('user-selector');
      await TestHelpers.tapElement('test-user-option');
      await TestHelpers.tapElement('role-selector');
      await TestHelpers.tapElement('partner-role-option');
      
      await TestHelpers.tapElement('assign-role-confirm-button');
      await TestHelpers.waitForElement('role-assigned-success');
    });
  });

  describe('Service Monitoring', () => {
    it('should monitor active service requests', async () => {
      await TestHelpers.tapElement('service-monitoring-tab');
      await TestHelpers.waitForElement('service-monitoring-screen');
      
      // Verify service request overview
      await expect(element(by.id('active-requests-map'))).toBeVisible();
      await expect(element(by.id('requests-list'))).toBeVisible();
      
      // Check request details
      await TestHelpers.tapElement('service-request-1');
      await TestHelpers.waitForElement('request-details-modal');
      
      await expect(element(by.text('Emergency Towing'))).toBeVisible();
      await expect(element(by.text('Port of Spain, Trinidad'))).toBeVisible();
      await TestHelpers.verifyTTDCurrency('request-amount', 200.00);
      
      // Test admin intervention
      await TestHelpers.tapElement('admin-actions-menu');
      await expect(element(by.text('Reassign Technician'))).toBeVisible();
      await expect(element(by.text('Cancel Request'))).toBeVisible();
      await expect(element(by.text('Contact Customer'))).toBeVisible();
    });

    it('should handle emergency service coordination', async () => {
      await TestHelpers.tapElement('emergency-management-tab');
      await TestHelpers.waitForElement('emergency-management-screen');
      
      // Verify emergency dashboard
      await expect(element(by.id('active-emergencies-count'))).toBeVisible();
      await expect(element(by.id('emergency-response-map'))).toBeVisible();
      
      // Check emergency alert details
      await TestHelpers.tapElement('emergency-alert-1');
      await TestHelpers.waitForElement('emergency-details-screen');
      
      await expect(element(by.text('SOS Alert'))).toBeVisible();
      await expect(element(by.text('Port of Spain, Trinidad'))).toBeVisible();
      
      // Verify Trinidad & Tobago emergency numbers
      await TestHelpers.verifyEmergencyNumber('emergency-contact-999', 'emergency');
      await TestHelpers.verifyEmergencyNumber('police-contact-999', 'police');
      
      // Test emergency response coordination
      await TestHelpers.tapElement('coordinate-response-button');
      await TestHelpers.waitForElement('response-coordination-screen');
      
      await TestHelpers.tapElement('notify-emergency-services-button');
      await TestHelpers.waitForElement('emergency-services-notified');
    });

    it('should track service quality metrics', async () => {
      await TestHelpers.tapElement('service-monitoring-tab');
      await TestHelpers.tapElement('quality-metrics-tab');
      await TestHelpers.waitForElement('quality-metrics-screen');
      
      // Verify quality indicators
      await expect(element(by.text('Average Response Time'))).toBeVisible();
      await expect(element(by.text('Customer Satisfaction'))).toBeVisible();
      await expect(element(by.text('Service Completion Rate'))).toBeVisible();
      
      // Check Trinidad & Tobago specific metrics
      await expect(element(by.text('Trinidad Coverage: 95%'))).toBeVisible();
      await expect(element(by.text('Tobago Coverage: 88%'))).toBeVisible();
      
      // Test quality alerts
      await TestHelpers.tapElement('quality-alerts-tab');
      await TestHelpers.waitForElement('quality-alerts-list');
      
      await expect(element(by.text('Low satisfaction rating detected'))).toBeVisible();
    });
  });

  describe('Analytics and Reporting', () => {
    it('should display comprehensive analytics dashboard', async () => {
      await TestHelpers.tapElement('analytics-tab');
      await TestHelpers.waitForElement('analytics-dashboard');
      
      // Verify revenue analytics with TTD
      await TestHelpers.verifyTTDCurrency('monthly-revenue', 45000.00);
      await TestHelpers.verifyTTDCurrency('quarterly-revenue', 125000.00);
      await TestHelpers.verifyTTDCurrency('annual-revenue', 480000.00);
      
      // Check service type breakdown
      await expect(element(by.text('Towing: 45%'))).toBeVisible();
      await expect(element(by.text('Battery: 25%'))).toBeVisible();
      await expect(element(by.text('Tire: 20%'))).toBeVisible();
      
      // Verify geographic distribution
      await expect(element(by.text('Port of Spain: 35%'))).toBeVisible();
      await expect(element(by.text('San Fernando: 25%'))).toBeVisible();
      await expect(element(by.text('Chaguanas: 20%'))).toBeVisible();
      await expect(element(by.text('Tobago: 15%'))).toBeVisible();
    });

    it('should generate detailed reports', async () => {
      await TestHelpers.tapElement('analytics-tab');
      await TestHelpers.tapElement('reports-tab');
      await TestHelpers.waitForElement('reports-screen');
      
      // Test revenue report generation
      await TestHelpers.tapElement('generate-revenue-report-button');
      await TestHelpers.waitForElement('report-parameters-modal');
      
      await TestHelpers.tapElement('date-range-selector');
      await TestHelpers.tapElement('last-month-option');
      await TestHelpers.tapElement('currency-selector');
      await TestHelpers.tapElement('ttd-option');
      
      await TestHelpers.tapElement('generate-report-button');
      await TestHelpers.waitForElement('report-generated-success');
      
      // Verify report contents
      await TestHelpers.tapElement('view-report-button');
      await TestHelpers.waitForElement('report-viewer');
      
      await expect(element(by.text('Revenue Report - TTD'))).toBeVisible();
      await TestHelpers.verifyTTDCurrency('report-total-revenue', 45000.00);
    });

    it('should track user engagement metrics', async () => {
      await TestHelpers.tapElement('analytics-tab');
      await TestHelpers.tapElement('user-engagement-tab');
      await TestHelpers.waitForElement('engagement-metrics-screen');
      
      // Verify engagement metrics
      await expect(element(by.text('Daily Active Users'))).toBeVisible();
      await expect(element(by.text('Monthly Active Users'))).toBeVisible();
      await expect(element(by.text('User Retention Rate'))).toBeVisible();
      
      // Check Trinidad & Tobago specific engagement
      await expect(element(by.text('Trinidad Users: 1,250'))).toBeVisible();
      await expect(element(by.text('Tobago Users: 380'))).toBeVisible();
      
      // Test engagement trends
      await TestHelpers.tapElement('engagement-trends-button');
      await TestHelpers.waitForElement('trends-chart');
      
      await expect(element(by.id('engagement-chart'))).toBeVisible();
    });
  });

  describe('Payment Processing', () => {
    it('should manage payment transactions', async () => {
      await TestHelpers.tapElement('payment-processing-tab');
      await TestHelpers.waitForElement('payment-management-screen');
      
      // Verify payment overview
      await TestHelpers.verifyTTDCurrency('total-processed', 125000.00);
      await TestHelpers.verifyTTDCurrency('pending-payments', 5500.00);
      await TestHelpers.verifyTTDCurrency('failed-payments', 1200.00);
      
      // Check payment transactions list
      await TestHelpers.tapElement('transactions-tab');
      await TestHelpers.waitForElement('transactions-list');
      
      await TestHelpers.tapElement('transaction-1');
      await TestHelpers.waitForElement('transaction-details-modal');
      
      // Verify transaction details
      await expect(element(by.text('Payment ID'))).toBeVisible();
      await expect(element(by.text('Customer'))).toBeVisible();
      await expect(element(by.text('Service Type'))).toBeVisible();
      await TestHelpers.verifyTTDCurrency('transaction-amount', 200.00);
      
      // Test payment actions
      await TestHelpers.tapElement('payment-actions-menu');
      await expect(element(by.text('Refund Payment'))).toBeVisible();
      await expect(element(by.text('View Receipt'))).toBeVisible();
    });

    it('should handle TTD currency and VAT processing', async () => {
      await TestHelpers.tapElement('payment-processing-tab');
      await TestHelpers.tapElement('vat-management-tab');
      await TestHelpers.waitForElement('vat-management-screen');
      
      // Verify VAT calculations
      await expect(element(by.text('VAT Rate: 12.5%'))).toBeVisible();
      await TestHelpers.verifyTTDCurrency('vat-collected', 15625.00);
      await TestHelpers.verifyTTDCurrency('vat-pending', 687.50);
      
      // Test VAT report generation
      await TestHelpers.tapElement('generate-vat-report-button');
      await TestHelpers.waitForElement('vat-report-modal');
      
      await TestHelpers.tapElement('quarterly-report-option');
      await TestHelpers.tapElement('generate-vat-report-confirm');
      await TestHelpers.waitForElement('vat-report-generated');
      
      await expect(element(by.text('VAT Report Generated'))).toBeVisible();
    });

    it('should manage refunds and disputes', async () => {
      await TestHelpers.tapElement('payment-processing-tab');
      await TestHelpers.tapElement('refunds-disputes-tab');
      await TestHelpers.waitForElement('refunds-disputes-screen');
      
      // Check pending refunds
      await TestHelpers.tapElement('pending-refunds-tab');
      await TestHelpers.waitForElement('pending-refunds-list');
      
      await TestHelpers.tapElement('refund-request-1');
      await TestHelpers.waitForElement('refund-details-modal');
      
      // Process refund
      await TestHelpers.tapElement('approve-refund-button');
      await TestHelpers.waitForElement('refund-confirmation-modal');
      
      await TestHelpers.verifyTTDCurrency('refund-amount', 200.00);
      await TestHelpers.tapElement('confirm-refund-button');
      await TestHelpers.waitForElement('refund-processed-success');
    });
  });

  describe('System Configuration', () => {
    it('should manage platform settings', async () => {
      await TestHelpers.tapElement('settings-tab');
      await TestHelpers.waitForElement('system-settings-screen');
      
      // Verify Trinidad & Tobago specific settings
      await expect(element(by.text('Default Currency: TTD'))).toBeVisible();
      await expect(element(by.text('Timezone: America/Port_of_Spain'))).toBeVisible();
      await expect(element(by.text('VAT Rate: 12.5%'))).toBeVisible();
      
      // Test emergency numbers configuration
      await TestHelpers.tapElement('emergency-settings-tab');
      await TestHelpers.waitForElement('emergency-settings-screen');
      
      await TestHelpers.verifyEmergencyNumber('emergency-number-setting', 'emergency');
      await TestHelpers.verifyEmergencyNumber('police-number-setting', 'police');
      await TestHelpers.verifyEmergencyNumber('fire-number-setting', 'fire');
      await TestHelpers.verifyEmergencyNumber('ambulance-number-setting', 'ambulance');
    });

    it('should configure service pricing and fees', async () => {
      await TestHelpers.tapElement('settings-tab');
      await TestHelpers.tapElement('pricing-settings-tab');
      await TestHelpers.waitForElement('pricing-settings-screen');
      
      // Verify current pricing
      await TestHelpers.verifyTTDCurrency('towing-base-price', 200.00);
      await TestHelpers.verifyTTDCurrency('battery-base-price', 80.00);
      await TestHelpers.verifyTTDCurrency('tire-base-price', 60.00);
      
      // Test pricing updates
      await TestHelpers.tapElement('edit-towing-price-button');
      await TestHelpers.waitForElement('price-edit-modal');
      
      await TestHelpers.clearAndType('price-input', '220.00');
      await TestHelpers.tapElement('save-price-button');
      await TestHelpers.waitForElement('price-updated-success');
      
      await TestHelpers.verifyTTDCurrency('towing-base-price', 220.00);
    });

    it('should manage notification templates', async () => {
      await TestHelpers.tapElement('settings-tab');
      await TestHelpers.tapElement('notifications-tab');
      await TestHelpers.waitForElement('notification-templates-screen');
      
      // Verify notification templates
      await expect(element(by.text('Service Assigned'))).toBeVisible();
      await expect(element(by.text('Payment Confirmation'))).toBeVisible();
      await expect(element(by.text('Emergency Alert'))).toBeVisible();
      
      // Test template editing
      await TestHelpers.tapElement('service-assigned-template');
      await TestHelpers.waitForElement('template-editor-screen');
      
      await TestHelpers.clearAndType('template-title-input', 'Service Assigned - Trinidad & Tobago');
      await TestHelpers.clearAndType('template-body-input', 'Your roadside service has been assigned to a technician in Trinidad & Tobago.');
      
      await TestHelpers.tapElement('save-template-button');
      await TestHelpers.waitForElement('template-saved-success');
    });
  });
});
