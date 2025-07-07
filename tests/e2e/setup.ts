// E2E Testing Setup for RoadSide+ Trinidad & Tobago
import { by, device, element, expect } from 'detox';

// Test configuration
export const TEST_CONFIG = {
  timeout: 30000,
  retries: 2,
  screenshots: true,
  videos: true,
};

// Test users for different roles
export const TEST_USERS = {
  customer: {
    email: 'test.customer@roadsideplus.tt',
    password: 'TestCustomer123!',
    phone: '+1-868-555-0001',
    name: 'Test Customer',
  },
  technician: {
    email: 'test.technician@roadsideplus.tt',
    password: 'TestTechnician123!',
    phone: '+1-868-555-0002',
    name: 'Test Technician',
    license: 'TT-TECH-001',
  },
  admin: {
    email: 'test.admin@roadsideplus.tt',
    password: 'TestAdmin123!',
    phone: '+1-868-555-0003',
    name: 'Test Admin',
  },
  partner: {
    email: 'test.partner@roadsideplus.tt',
    password: 'TestPartner123!',
    phone: '+1-868-555-0004',
    name: 'Test Partner',
    organization: 'Test Towing Services Ltd.',
  },
};

// Trinidad & Tobago test data
export const TT_TEST_DATA = {
  locations: {
    portOfSpain: {
      latitude: 10.6596,
      longitude: -61.5089,
      address: 'Port of Spain, Trinidad',
    },
    sanFernando: {
      latitude: 10.2796,
      longitude: -61.4589,
      address: 'San Fernando, Trinidad',
    },
    scarborough: {
      latitude: 11.1817,
      longitude: -60.7428,
      address: 'Scarborough, Tobago',
    },
  },
  emergencyNumbers: {
    emergency: '999',
    police: '999',
    fire: '990',
    ambulance: '811',
  },
  currency: {
    code: 'TTD',
    symbol: '$',
    vatRate: 0.125,
  },
  services: {
    towing: { basePrice: 200.00, name: 'Emergency Towing' },
    battery: { basePrice: 80.00, name: 'Battery Jump Start' },
    tire: { basePrice: 60.00, name: 'Flat Tire Change' },
    lockout: { basePrice: 50.00, name: 'Vehicle Lockout' },
    fuel: { basePrice: 40.00, name: 'Emergency Fuel Delivery' },
  },
};

// Helper functions
export class TestHelpers {
  static async waitForElement(testID: string, timeout = TEST_CONFIG.timeout) {
    await waitFor(element(by.id(testID)))
      .toBeVisible()
      .withTimeout(timeout);
  }

  static async tapElement(testID: string) {
    await element(by.id(testID)).tap();
  }

  static async typeText(testID: string, text: string) {
    await element(by.id(testID)).typeText(text);
  }

  static async clearAndType(testID: string, text: string) {
    await element(by.id(testID)).clearText();
    await element(by.id(testID)).typeText(text);
  }

  static async scrollTo(testID: string, direction: 'up' | 'down' = 'down') {
    await element(by.id(testID)).scroll(200, direction);
  }

  static async takeScreenshot(name: string) {
    if (TEST_CONFIG.screenshots) {
      await device.takeScreenshot(name);
    }
  }

  static async login(userType: keyof typeof TEST_USERS) {
    const user = TEST_USERS[userType];
    
    await this.waitForElement('login-email-input');
    await this.clearAndType('login-email-input', user.email);
    await this.clearAndType('login-password-input', user.password);
    await this.tapElement('login-submit-button');
    
    // Wait for dashboard to load
    await this.waitForElement('dashboard-screen');
  }

  static async logout() {
    await this.tapElement('profile-menu');
    await this.tapElement('logout-button');
    await this.waitForElement('login-screen');
  }

  static formatTTD(amount: number): string {
    return `TTD $${amount.toFixed(2)}`;
  }

  static calculateTTDTotal(baseAmount: number) {
    const platformFee = baseAmount * 0.05;
    const processingFee = baseAmount * 0.029 + 0.30;
    const subtotal = baseAmount + platformFee + processingFee;
    const vat = subtotal * TT_TEST_DATA.currency.vatRate;
    return subtotal + vat;
  }

  static async enableLocation() {
    await device.enableSynchronization();
    // Grant location permissions
    await device.launchApp({
      permissions: { location: 'always', notifications: 'YES' }
    });
  }

  static async mockLocation(location: typeof TT_TEST_DATA.locations.portOfSpain) {
    await device.setLocation(location.latitude, location.longitude);
  }

  static async verifyTTDCurrency(testID: string, expectedAmount: number) {
    const expectedText = this.formatTTD(expectedAmount);
    await expect(element(by.id(testID))).toHaveText(expectedText);
  }

  static async verifyEmergencyNumber(testID: string, numberType: keyof typeof TT_TEST_DATA.emergencyNumbers) {
    const expectedNumber = TT_TEST_DATA.emergencyNumbers[numberType];
    await expect(element(by.id(testID))).toHaveText(expectedNumber);
  }

  static async switchTheme(theme: 'light' | 'dark') {
    await this.tapElement('settings-menu');
    await this.waitForElement('theme-toggle');
    
    // Check current theme and toggle if needed
    const currentTheme = await element(by.id('theme-indicator')).getAttributes();
    if (currentTheme.text !== theme) {
      await this.tapElement('theme-toggle');
    }
  }

  static async verifyButtonStates(buttonTestID: string) {
    // Test normal state
    await expect(element(by.id(buttonTestID))).toBeVisible();

    // Test disabled state
    await element(by.id(`${buttonTestID}-disable`)).tap();
    await expect(element(by.id(buttonTestID))).not.toBeEnabled();

    // Test loading state
    await element(by.id(`${buttonTestID}-loading`)).tap();
    await this.waitForElement(`${buttonTestID}-spinner`);

    // Reset to normal state
    await element(by.id(`${buttonTestID}-reset`)).tap();
  }

  static async testAllButtonVariants() {
    const buttonVariants = ['primary', 'secondary', 'outline', 'ghost', 'emergency'];

    for (const variant of buttonVariants) {
      await this.verifyButtonStates(`${variant}-button`);

      // Test theme compatibility
      await this.switchTheme('dark');
      await expect(element(by.id(`${variant}-button`))).toBeVisible();

      await this.switchTheme('light');
      await expect(element(by.id(`${variant}-button`))).toBeVisible();
    }
  }

  static async createServiceRequest(serviceType: keyof typeof TT_TEST_DATA.services) {
    const service = TT_TEST_DATA.services[serviceType];
    
    await this.tapElement('book-service-button');
    await this.waitForElement('service-selection-screen');
    
    await this.tapElement(`service-${serviceType}-button`);
    await this.waitForElement('service-details-screen');
    
    // Add description
    await this.typeText('service-description-input', `Test ${service.name} request`);
    
    // Confirm location
    await this.tapElement('confirm-location-button');
    
    // Proceed to payment
    await this.tapElement('proceed-to-payment-button');
    
    return service;
  }

  static async completePayment(expectedAmount: number) {
    await this.waitForElement('payment-screen');
    
    // Verify amount
    await this.verifyTTDCurrency('payment-amount', expectedAmount);
    
    // Use test card
    await this.typeText('card-number-input', '4242424242424242');
    await this.typeText('card-expiry-input', '12/25');
    await this.typeText('card-cvc-input', '123');
    
    await this.tapElement('pay-button');
    await this.waitForElement('payment-success-screen');
  }
}
