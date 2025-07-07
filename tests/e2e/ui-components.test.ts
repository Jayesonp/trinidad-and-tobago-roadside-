// UI Components E2E Tests for RoadSide+ Trinidad & Tobago
import { by, device, element, expect } from 'detox';
import { TestHelpers, TEST_USERS, TT_TEST_DATA } from './setup';

describe('UI Components - RoadSide+ Trinidad & Tobago', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await TestHelpers.login('customer');
  });

  afterEach(async () => {
    await TestHelpers.takeScreenshot(`ui-components-test-${Date.now()}`);
    await TestHelpers.logout();
  });

  describe('Button Components', () => {
    it('should test all button variants and states', async () => {
      // Navigate to components demo
      await TestHelpers.tapElement('components-demo-button');
      await TestHelpers.waitForElement('components-demo-screen');
      
      await TestHelpers.tapElement('buttons-demo-tab');
      await TestHelpers.waitForElement('buttons-demo-screen');
      
      // Test all button variants
      await TestHelpers.testAllButtonVariants();
    });

    it('should verify button accessibility', async () => {
      await device.enableAccessibility();
      
      await TestHelpers.tapElement('components-demo-button');
      await TestHelpers.waitForElement('buttons-demo-screen');
      
      // Test accessibility labels
      await expect(element(by.id('primary-button'))).toHaveAccessibilityLabel('Primary action button');
      await expect(element(by.id('emergency-button'))).toHaveAccessibilityLabel('Emergency SOS button');
      
      // Test voice over navigation
      await element(by.id('primary-button')).accessibilityActivate();
      await TestHelpers.waitForElement('button-activated-feedback');
    });

    it('should handle button interactions correctly', async () => {
      await TestHelpers.tapElement('components-demo-button');
      await TestHelpers.waitForElement('buttons-demo-screen');
      
      // Test tap interactions
      await TestHelpers.tapElement('primary-button');
      await TestHelpers.waitForElement('button-pressed-feedback');
      
      // Test long press
      await element(by.id('secondary-button')).longPress();
      await TestHelpers.waitForElement('button-long-pressed-feedback');
      
      // Test double tap
      await element(by.id('outline-button')).multiTap(2);
      await TestHelpers.waitForElement('button-double-tapped-feedback');
    });
  });

  describe('Theme Toggle Component', () => {
    it('should switch themes correctly', async () => {
      await TestHelpers.tapElement('settings-menu');
      await TestHelpers.waitForElement('settings-screen');
      
      // Test theme toggle functionality
      await TestHelpers.switchTheme('dark');
      await expect(element(by.id('dark-theme-active'))).toBeVisible();
      
      await TestHelpers.switchTheme('light');
      await expect(element(by.id('light-theme-active'))).toBeVisible();
      
      // Verify theme persistence
      await device.reloadReactNative();
      await TestHelpers.login('customer');
      await expect(element(by.id('light-theme-active'))).toBeVisible();
    });

    it('should update all UI elements with theme change', async () => {
      await TestHelpers.tapElement('settings-menu');
      
      // Switch to dark theme
      await TestHelpers.switchTheme('dark');
      
      // Verify dark theme styling
      await expect(element(by.id('dark-background'))).toBeVisible();
      await expect(element(by.id('dark-text-color'))).toBeVisible();
      
      // Test button styling in dark theme
      await TestHelpers.tapElement('dashboard-tab');
      await expect(element(by.id('primary-button-dark'))).toBeVisible();
      await expect(element(by.id('emergency-button-dark'))).toBeVisible();
    });
  });

  describe('Navigation Components', () => {
    it('should handle tab navigation correctly', async () => {
      // Test all main tabs
      const tabs = ['dashboard', 'services', 'history', 'profile'];
      
      for (const tab of tabs) {
        await TestHelpers.tapElement(`${tab}-tab`);
        await TestHelpers.waitForElement(`${tab}-screen`);
        await expect(element(by.id(`${tab}-tab-active`))).toBeVisible();
      }
    });

    it('should handle stack navigation and back buttons', async () => {
      // Navigate through stack
      await TestHelpers.tapElement('book-service-button');
      await TestHelpers.waitForElement('service-selection-screen');
      
      await TestHelpers.tapElement('service-towing-button');
      await TestHelpers.waitForElement('service-details-screen');
      
      // Test back navigation
      await TestHelpers.tapElement('back-button');
      await TestHelpers.waitForElement('service-selection-screen');
      
      await TestHelpers.tapElement('back-button');
      await TestHelpers.waitForElement('dashboard-screen');
    });

    it('should handle deep linking navigation', async () => {
      // Test various deep links
      const deepLinks = [
        { url: 'roadsideplus://service/new', screen: 'service-selection-screen' },
        { url: 'roadsideplus://profile', screen: 'profile-screen' },
        { url: 'roadsideplus://history', screen: 'history-screen' },
        { url: 'roadsideplus://emergency', screen: 'emergency-screen' },
      ];
      
      for (const link of deepLinks) {
        await device.openURL({ url: link.url });
        await TestHelpers.waitForElement(link.screen);
      }
    });
  });

  describe('Form Components', () => {
    it('should handle form inputs correctly', async () => {
      await TestHelpers.tapElement('profile-tab');
      await TestHelpers.tapElement('edit-profile-button');
      await TestHelpers.waitForElement('edit-profile-form');
      
      // Test text inputs
      await TestHelpers.clearAndType('full-name-input', 'Test User Name');
      await expect(element(by.id('full-name-input'))).toHaveText('Test User Name');
      
      // Test phone input with Trinidad & Tobago format
      await TestHelpers.clearAndType('phone-input', '+1-868-555-1234');
      await expect(element(by.id('phone-input'))).toHaveText('+1-868-555-1234');
      
      // Test email validation
      await TestHelpers.clearAndType('email-input', 'invalid-email');
      await TestHelpers.tapElement('save-profile-button');
      await expect(element(by.text('Please enter a valid email'))).toBeVisible();
      
      await TestHelpers.clearAndType('email-input', 'valid@email.com');
      await TestHelpers.tapElement('save-profile-button');
      await TestHelpers.waitForElement('profile-saved-success');
    });

    it('should handle form validation', async () => {
      await TestHelpers.tapElement('book-service-button');
      await TestHelpers.tapElement('service-towing-button');
      await TestHelpers.waitForElement('service-details-form');
      
      // Test required field validation
      await TestHelpers.tapElement('proceed-button');
      await expect(element(by.text('Description is required'))).toBeVisible();
      
      // Test field length validation
      await TestHelpers.typeText('description-input', 'A'.repeat(501));
      await TestHelpers.tapElement('proceed-button');
      await expect(element(by.text('Description must be less than 500 characters'))).toBeVisible();
      
      // Test valid form submission
      await TestHelpers.clearAndType('description-input', 'Valid service description');
      await TestHelpers.tapElement('proceed-button');
      await TestHelpers.waitForElement('payment-screen');
    });
  });

  describe('Modal Components', () => {
    it('should handle modal interactions', async () => {
      // Test emergency confirmation modal
      await TestHelpers.tapElement('emergency-sos-button');
      await TestHelpers.waitForElement('emergency-confirmation-modal');
      
      // Test modal overlay tap to close
      await TestHelpers.tapElement('modal-overlay');
      await TestHelpers.waitForElement('dashboard-screen');
      
      // Test modal close button
      await TestHelpers.tapElement('emergency-sos-button');
      await TestHelpers.waitForElement('emergency-confirmation-modal');
      await TestHelpers.tapElement('modal-close-button');
      await TestHelpers.waitForElement('dashboard-screen');
      
      // Test modal action buttons
      await TestHelpers.tapElement('emergency-sos-button');
      await TestHelpers.waitForElement('emergency-confirmation-modal');
      await TestHelpers.tapElement('confirm-emergency-button');
      await TestHelpers.waitForElement('emergency-active-screen');
    });

    it('should handle modal stacking', async () => {
      // Open first modal
      await TestHelpers.tapElement('profile-tab');
      await TestHelpers.tapElement('settings-button');
      await TestHelpers.waitForElement('settings-modal');
      
      // Open second modal on top
      await TestHelpers.tapElement('notification-settings-button');
      await TestHelpers.waitForElement('notification-settings-modal');
      
      // Close second modal
      await TestHelpers.tapElement('notification-modal-close');
      await TestHelpers.waitForElement('settings-modal');
      
      // Close first modal
      await TestHelpers.tapElement('settings-modal-close');
      await TestHelpers.waitForElement('profile-screen');
    });
  });

  describe('List Components', () => {
    it('should handle scrollable lists', async () => {
      await TestHelpers.tapElement('history-tab');
      await TestHelpers.waitForElement('service-history-list');
      
      // Test list scrolling
      await TestHelpers.scrollTo('service-history-list', 'down');
      await expect(element(by.id('history-item-10'))).toBeVisible();
      
      await TestHelpers.scrollTo('service-history-list', 'up');
      await expect(element(by.id('history-item-1'))).toBeVisible();
      
      // Test pull to refresh
      await element(by.id('service-history-list')).swipe('down', 'fast', 0.8);
      await TestHelpers.waitForElement('refreshing-indicator');
      await TestHelpers.waitForElement('refresh-complete');
    });

    it('should handle list item interactions', async () => {
      await TestHelpers.tapElement('history-tab');
      await TestHelpers.waitForElement('service-history-list');
      
      // Test item tap
      await TestHelpers.tapElement('history-item-1');
      await TestHelpers.waitForElement('service-details-screen');
      
      // Test item swipe actions
      await TestHelpers.tapElement('back-button');
      await TestHelpers.waitForElement('service-history-list');
      
      await element(by.id('history-item-2')).swipe('left');
      await expect(element(by.id('delete-action'))).toBeVisible();
      await expect(element(by.id('share-action'))).toBeVisible();
    });
  });

  describe('Loading and Error States', () => {
    it('should display loading states correctly', async () => {
      // Test loading during service request
      await TestHelpers.tapElement('book-service-button');
      await TestHelpers.tapElement('service-towing-button');
      await TestHelpers.typeText('description-input', 'Test service');
      await TestHelpers.tapElement('proceed-button');
      
      // Verify loading state
      await TestHelpers.waitForElement('loading-spinner');
      await expect(element(by.text('Processing request...'))).toBeVisible();
      
      // Wait for completion
      await TestHelpers.waitForElement('payment-screen');
    });

    it('should handle error states gracefully', async () => {
      // Mock network error
      await device.setNetworkConnection('none');
      
      await TestHelpers.tapElement('book-service-button');
      await TestHelpers.tapElement('service-towing-button');
      await TestHelpers.typeText('description-input', 'Test service');
      await TestHelpers.tapElement('proceed-button');
      
      // Verify error state
      await TestHelpers.waitForElement('error-message');
      await expect(element(by.text('Network connection error'))).toBeVisible();
      await expect(element(by.id('retry-button'))).toBeVisible();
      
      // Test retry functionality
      await device.setNetworkConnection('wifi');
      await TestHelpers.tapElement('retry-button');
      await TestHelpers.waitForElement('payment-screen');
    });
  });

  describe('Accessibility Features', () => {
    it('should support screen reader navigation', async () => {
      await device.enableAccessibility();
      
      // Test screen reader labels
      await expect(element(by.id('dashboard-screen'))).toHaveAccessibilityLabel('Dashboard screen');
      await expect(element(by.id('book-service-button'))).toHaveAccessibilityLabel('Book roadside service');
      
      // Test accessibility hints
      await expect(element(by.id('emergency-sos-button'))).toHaveAccessibilityHint('Double tap to activate emergency SOS');
      
      // Test accessibility roles
      await expect(element(by.id('primary-button'))).toHaveAccessibilityRole('button');
      await expect(element(by.id('service-history-list'))).toHaveAccessibilityRole('list');
    });

    it('should support high contrast mode', async () => {
      await device.enableHighContrast();
      
      // Verify high contrast styling
      await expect(element(by.id('high-contrast-theme'))).toBeVisible();
      await expect(element(by.id('high-contrast-buttons'))).toBeVisible();
      
      // Test button visibility in high contrast
      await TestHelpers.testAllButtonVariants();
    });

    it('should support large text scaling', async () => {
      await device.setTextScale(2.0);
      
      // Verify text scaling
      await expect(element(by.id('scaled-text'))).toBeVisible();
      
      // Test layout adaptation
      await expect(element(by.id('adaptive-layout'))).toBeVisible();
      
      // Reset text scale
      await device.setTextScale(1.0);
    });
  });
});
