// Trinidad & Tobago Specific E2E Tests for RoadSide+ 
import { by, device, element, expect } from 'detox';
import { TestHelpers, TEST_USERS, TT_TEST_DATA } from './setup';

describe('Trinidad & Tobago Specific Features', () => {
  beforeAll(async () => {
    await device.launchApp();
    await TestHelpers.enableLocation();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await TestHelpers.login('customer');
  });

  afterEach(async () => {
    await TestHelpers.takeScreenshot(`tt-specific-test-${Date.now()}`);
    await TestHelpers.logout();
  });

  describe('TTD Currency Handling', () => {
    it('should display all prices in TTD format', async () => {
      await TestHelpers.tapElement('book-service-button');
      await TestHelpers.waitForElement('service-selection-screen');
      
      // Verify all services show TTD pricing
      for (const [serviceType, service] of Object.entries(TT_TEST_DATA.services)) {
        await TestHelpers.verifyTTDCurrency(`service-${serviceType}-price`, service.basePrice);
      }
    });

    it('should calculate VAT correctly at 12.5%', async () => {
      const service = await TestHelpers.createServiceRequest('towing');
      await TestHelpers.waitForElement('payment-breakdown-screen');
      
      // Verify VAT calculation
      const baseAmount = service.basePrice;
      const platformFee = baseAmount * 0.05;
      const processingFee = baseAmount * 0.029 + 0.30;
      const subtotal = baseAmount + platformFee + processingFee;
      const expectedVAT = subtotal * TT_TEST_DATA.currency.vatRate;
      
      await TestHelpers.verifyTTDCurrency('vat-amount', expectedVAT);
      await expect(element(by.text('VAT (12.5%)'))).toBeVisible();
    });

    it('should handle TTD payment processing', async () => {
      await TestHelpers.createServiceRequest('battery');
      await TestHelpers.waitForElement('payment-screen');
      
      // Verify TTD currency in payment form
      await expect(element(by.text('Amount (TTD)'))).toBeVisible();
      await TestHelpers.verifyTTDCurrency('payment-total', 80.00);
      
      // Complete payment
      await TestHelpers.completePayment(80.00);
      
      // Verify TTD confirmation
      await TestHelpers.waitForElement('payment-success-screen');
      await expect(element(by.text('Payment of TTD $80.00 successful'))).toBeVisible();
    });

    it('should format TTD amounts consistently', async () => {
      await TestHelpers.tapElement('history-tab');
      await TestHelpers.waitForElement('service-history-screen');
      
      // Check TTD formatting in history
      await expect(element(by.text('TTD $200.00'))).toBeVisible();
      await expect(element(by.text('TTD $80.00'))).toBeVisible();
      
      // Verify no other currency symbols
      await expect(element(by.text('USD'))).not.toExist();
      await expect(element(by.text('$200.00'))).not.toExist(); // Without TTD prefix
    });
  });

  describe('Emergency Numbers Integration', () => {
    it('should display correct Trinidad & Tobago emergency numbers', async () => {
      await TestHelpers.tapElement('emergency-sos-button');
      await TestHelpers.waitForElement('emergency-screen');
      
      // Verify all emergency numbers
      await TestHelpers.verifyEmergencyNumber('emergency-number-display', 'emergency');
      await TestHelpers.verifyEmergencyNumber('police-number-display', 'police');
      await TestHelpers.verifyEmergencyNumber('fire-number-display', 'fire');
      await TestHelpers.verifyEmergencyNumber('ambulance-number-display', 'ambulance');
      
      // Verify emergency numbers are clickable
      await expect(element(by.id('call-999-button'))).toBeVisible();
      await expect(element(by.id('call-990-button'))).toBeVisible();
      await expect(element(by.id('call-811-button'))).toBeVisible();
    });

    it('should integrate with local emergency services', async () => {
      await TestHelpers.tapElement('emergency-sos-button');
      await TestHelpers.tapElement('confirm-emergency-button');
      await TestHelpers.waitForElement('emergency-active-screen');
      
      // Verify Trinidad & Tobago emergency context
      await expect(element(by.text('Trinidad & Tobago Emergency Services'))).toBeVisible();
      await expect(element(by.text('Your location has been shared with local authorities'))).toBeVisible();
      
      // Test emergency service contact
      await TestHelpers.tapElement('contact-emergency-services-button');
      await TestHelpers.waitForElement('emergency-contact-options');
      
      await expect(element(by.text('Trinidad & Tobago Police Service'))).toBeVisible();
      await expect(element(by.text('Trinidad & Tobago Fire Service'))).toBeVisible();
    });

    it('should handle emergency alerts with local context', async () => {
      await TestHelpers.mockLocation(TT_TEST_DATA.locations.portOfSpain);
      
      await TestHelpers.tapElement('emergency-sos-button');
      await TestHelpers.tapElement('confirm-emergency-button');
      await TestHelpers.waitForElement('emergency-alert-sent');
      
      // Verify location context
      await expect(element(by.text('Port of Spain, Trinidad'))).toBeVisible();
      await expect(element(by.text('Trinidad & Tobago'))).toBeVisible();
      
      // Verify emergency broadcast includes local information
      await expect(element(by.text('Emergency in Trinidad & Tobago'))).toBeVisible();
    });
  });

  describe('Geographic Restrictions', () => {
    it('should restrict services to Trinidad & Tobago', async () => {
      // Mock location outside Trinidad & Tobago
      await TestHelpers.mockLocation({
        latitude: 25.7617, // Miami, FL
        longitude: -80.1918,
        address: 'Miami, Florida, USA'
      });
      
      await TestHelpers.tapElement('book-service-button');
      await TestHelpers.waitForElement('location-restriction-warning');
      
      await expect(element(by.text('Service not available in this location'))).toBeVisible();
      await expect(element(by.text('RoadSide+ is currently only available in Trinidad & Tobago'))).toBeVisible();
    });

    it('should allow services within Trinidad bounds', async () => {
      await TestHelpers.mockLocation(TT_TEST_DATA.locations.portOfSpain);
      
      await TestHelpers.tapElement('book-service-button');
      await TestHelpers.waitForElement('service-selection-screen');
      
      // Verify services are available
      await expect(element(by.id('service-towing-button'))).toBeVisible();
      await expect(element(by.id('service-battery-button'))).toBeVisible();
    });

    it('should allow services within Tobago bounds', async () => {
      await TestHelpers.mockLocation(TT_TEST_DATA.locations.scarborough);
      
      await TestHelpers.tapElement('book-service-button');
      await TestHelpers.waitForElement('service-selection-screen');
      
      // Verify services are available in Tobago
      await expect(element(by.id('service-towing-button'))).toBeVisible();
      await expect(element(by.text('Available in Tobago'))).toBeVisible();
    });

    it('should handle border cases correctly', async () => {
      // Test location just outside Trinidad & Tobago bounds
      await TestHelpers.mockLocation({
        latitude: 12.0, // Just north of Trinidad & Tobago
        longitude: -61.0,
        address: 'Caribbean Sea'
      });
      
      await TestHelpers.tapElement('book-service-button');
      await TestHelpers.waitForElement('location-verification-screen');
      
      await expect(element(by.text('Location verification required'))).toBeVisible();
      await expect(element(by.text('Please confirm you are in Trinidad & Tobago'))).toBeVisible();
    });
  });

  describe('Local Time Zone Handling', () => {
    it('should display times in America/Port_of_Spain timezone', async () => {
      await TestHelpers.tapElement('history-tab');
      await TestHelpers.waitForElement('service-history-screen');
      
      // Verify timezone display
      await expect(element(by.text('AST'))).toBeVisible(); // Atlantic Standard Time
      
      // Check service timestamps
      await TestHelpers.tapElement('history-item-1');
      await TestHelpers.waitForElement('service-details-screen');
      
      await expect(element(by.text('Time Zone: Atlantic Standard Time'))).toBeVisible();
    });

    it('should handle daylight saving time correctly', async () => {
      // Note: Trinidad & Tobago does not observe daylight saving time
      await TestHelpers.tapElement('profile-tab');
      await TestHelpers.tapElement('settings-button');
      await TestHelpers.waitForElement('settings-screen');
      
      await expect(element(by.text('Timezone: AST (UTC-4)'))).toBeVisible();
      await expect(element(by.text('No daylight saving time'))).toBeVisible();
    });

    it('should schedule services in local time', async () => {
      await TestHelpers.createServiceRequest('tire');
      await TestHelpers.waitForElement('service-scheduling-screen');
      
      // Verify scheduling uses local time
      await expect(element(by.text('Schedule in AST'))).toBeVisible();
      
      // Test scheduling
      await TestHelpers.tapElement('schedule-later-button');
      await TestHelpers.waitForElement('time-picker');
      
      await TestHelpers.tapElement('time-2pm-option');
      await TestHelpers.tapElement('confirm-schedule-button');
      
      await expect(element(by.text('Scheduled for 2:00 PM AST'))).toBeVisible();
    });
  });

  describe('Local Business Integration', () => {
    it('should display Trinidad & Tobago service providers', async () => {
      await TestHelpers.logout();
      await TestHelpers.login('admin');
      
      await TestHelpers.tapElement('partners-tab');
      await TestHelpers.waitForElement('partners-screen');
      
      // Verify local partners
      await expect(element(by.text('Trinidad Towing Services Ltd.'))).toBeVisible();
      await expect(element(by.text('Tobago Roadside Rescue'))).toBeVisible();
      await expect(element(by.text('Guardian Security Services'))).toBeVisible();
      
      // Verify partner locations
      await expect(element(by.text('Port of Spain, Trinidad'))).toBeVisible();
      await expect(element(by.text('Scarborough, Tobago'))).toBeVisible();
    });

    it('should handle local licensing requirements', async () => {
      await TestHelpers.logout();
      await TestHelpers.login('technician');
      
      await TestHelpers.tapElement('profile-tab');
      await TestHelpers.waitForElement('technician-profile-screen');
      
      // Verify Trinidad & Tobago licensing
      await expect(element(by.text('T&T License Number'))).toBeVisible();
      await expect(element(by.text('TT-TECH-001'))).toBeVisible();
      
      // Test license verification
      await TestHelpers.tapElement('verify-license-button');
      await TestHelpers.waitForElement('license-verification-screen');
      
      await expect(element(by.text('Trinidad & Tobago Licensing Authority'))).toBeVisible();
    });

    it('should integrate with local insurance providers', async () => {
      await TestHelpers.logout();
      await TestHelpers.login('customer');
      
      await TestHelpers.tapElement('profile-tab');
      await TestHelpers.tapElement('insurance-info-button');
      await TestHelpers.waitForElement('insurance-screen');
      
      // Verify local insurance options
      await expect(element(by.text('TTIP Insurance Partners'))).toBeVisible();
      await expect(element(by.text('Trinidad & Tobago Insurance'))).toBeVisible();
      
      // Test insurance claim integration
      await TestHelpers.tapElement('file-insurance-claim-button');
      await TestHelpers.waitForElement('insurance-claim-form');
      
      await expect(element(by.text('T&T Insurance Claim'))).toBeVisible();
    });
  });

  describe('Cultural and Language Considerations', () => {
    it('should use appropriate Caribbean English', async () => {
      await TestHelpers.waitForElement('dashboard-screen');
      
      // Verify appropriate language usage
      await expect(element(by.text('Welcome to RoadSide+'))).toBeVisible();
      await expect(element(by.text('Book a service'))).toBeVisible();
      
      // Check for Caribbean context
      await TestHelpers.tapElement('about-button');
      await TestHelpers.waitForElement('about-screen');
      
      await expect(element(by.text('Serving Trinidad & Tobago'))).toBeVisible();
      await expect(element(by.text('Local roadside assistance'))).toBeVisible();
    });

    it('should handle local address formats', async () => {
      await TestHelpers.tapElement('profile-tab');
      await TestHelpers.tapElement('edit-address-button');
      await TestHelpers.waitForElement('address-form');
      
      // Verify Trinidad & Tobago address format
      await expect(element(by.text('Street Address'))).toBeVisible();
      await expect(element(by.text('City/Town'))).toBeVisible();
      await expect(element(by.text('Region'))).toBeVisible();
      await expect(element(by.text('Country: Trinidad & Tobago'))).toBeVisible();
      
      // Test address validation
      await TestHelpers.typeText('street-input', '123 Main Street');
      await TestHelpers.typeText('city-input', 'Port of Spain');
      await TestHelpers.tapElement('region-selector');
      await TestHelpers.tapElement('trinidad-region-option');
      
      await TestHelpers.tapElement('save-address-button');
      await TestHelpers.waitForElement('address-saved-success');
    });

    it('should display appropriate contact information', async () => {
      await TestHelpers.tapElement('help-button');
      await TestHelpers.waitForElement('help-screen');
      
      // Verify local contact information
      await expect(element(by.text('+1-868-555-HELP'))).toBeVisible();
      await expect(element(by.text('support@roadsideplus.tt'))).toBeVisible();
      
      // Verify business hours in local time
      await expect(element(by.text('Monday - Friday: 6:00 AM - 10:00 PM AST'))).toBeVisible();
      await expect(element(by.text('Saturday - Sunday: 8:00 AM - 8:00 PM AST'))).toBeVisible();
    });
  });

  describe('Compliance and Regulations', () => {
    it('should handle local tax requirements', async () => {
      await TestHelpers.logout();
      await TestHelpers.login('admin');
      
      await TestHelpers.tapElement('reports-tab');
      await TestHelpers.tapElement('tax-reports-button');
      await TestHelpers.waitForElement('tax-reports-screen');
      
      // Verify VAT reporting
      await expect(element(by.text('Trinidad & Tobago VAT Report'))).toBeVisible();
      await expect(element(by.text('VAT Registration Number'))).toBeVisible();
      
      // Test tax report generation
      await TestHelpers.tapElement('generate-vat-report-button');
      await TestHelpers.waitForElement('vat-report-generated');
      
      await expect(element(by.text('VAT Report for Trinidad & Tobago'))).toBeVisible();
    });

    it('should comply with local data protection laws', async () => {
      await TestHelpers.logout();
      await TestHelpers.waitForElement('login-screen');
      
      await TestHelpers.tapElement('privacy-policy-link');
      await TestHelpers.waitForElement('privacy-policy-screen');
      
      // Verify local privacy compliance
      await expect(element(by.text('Trinidad & Tobago Data Protection'))).toBeVisible();
      await expect(element(by.text('Your data is stored and processed in accordance with Trinidad & Tobago laws'))).toBeVisible();
    });

    it('should handle local business registration requirements', async () => {
      await TestHelpers.logout();
      await TestHelpers.login('partner');
      
      await TestHelpers.tapElement('business-registration-tab');
      await TestHelpers.waitForElement('business-registration-screen');
      
      // Verify local registration requirements
      await expect(element(by.text('Trinidad & Tobago Business Registration'))).toBeVisible();
      await expect(element(by.text('Companies Registry Number'))).toBeVisible();
      await expect(element(by.text('VAT Registration Number'))).toBeVisible();
      
      // Test registration form
      await TestHelpers.typeText('company-registry-input', 'CR-123456');
      await TestHelpers.typeText('vat-number-input', 'VAT-789012');
      
      await TestHelpers.tapElement('verify-registration-button');
      await TestHelpers.waitForElement('registration-verified');
    });
  });
});
