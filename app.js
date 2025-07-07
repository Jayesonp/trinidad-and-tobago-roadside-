// RoadSide+ Multi-Tenant Platform JavaScript - Fixed Version

// Application Data
const appData = {
  services: [
    {
      id: 1,
      name: "Towing Service",
      price: 150,
      responseTime: 30,
      duration: 45,
      icon: "🚛",
      description: "Vehicle towing to nearest service center"
    },
    {
      id: 2,
      name: "Battery Jump Start",
      price: 75,
      responseTime: 30,
      duration: 20,
      icon: "🔋",
      description: "Jump start for dead batteries"
    },
    {
      id: 3,
      name: "Tire Change",
      price: 100,
      responseTime: 30,
      duration: 30,
      icon: "🛞",
      description: "Flat tire replacement service"
    },
    {
      id: 4,
      name: "Vehicle Lockout",
      price: 85,
      responseTime: 30,
      duration: 20,
      icon: "🔑",
      description: "Unlock locked vehicle doors"
    },
    {
      id: 5,
      name: "Fuel Delivery",
      price: 60,
      responseTime: 30,
      duration: 15,
      icon: "⛽",
      description: "Emergency fuel delivery"
    },
    {
      id: 6,
      name: "Winch Recovery",
      price: 200,
      responseTime: 45,
      duration: 60,
      icon: "🪝",
      description: "Vehicle recovery from ditches"
    }
  ],
  technicians: [
    {
      id: 1,
      name: "John Smith",
      rating: 4.8,
      completedJobs: 245,
      earnings: 3420,
      status: "online",
      location: "Downtown Area",
      services: ["towing", "battery", "tire"]
    },
    {
      id: 2,
      name: "Sarah Johnson",
      rating: 4.9,
      completedJobs: 312,
      earnings: 4250,
      status: "busy",
      location: "North District",
      services: ["lockout", "fuel", "battery"]
    },
    {
      id: 3,
      name: "Mike Davis",
      rating: 4.7,
      completedJobs: 189,
      earnings: 2890,
      status: "offline",
      location: "South Area",
      services: ["winch", "towing", "tire"]
    }
  ],
  analytics: {
    totalUsers: 15420,
    activeRequests: 87,
    monthlyRevenue: 245000,
    averageResponseTime: 28,
    customerSatisfaction: 4.6,
    emergencyRequests: 23
  }
};

// Global variables
let currentPanel = 'customer';
let selectedService = null;
let trackingInterval = null;
let charts = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  setupPanelSwitching();
  setupCustomerPanel();
  setupTechnicianPanel();
  setupAdminPanel();
  setupPartnerPanel();
  setupSecurityPanel();
  setupWhiteLabelPanel();
  startRealTimeUpdates();
}

// Panel Switching
function setupPanelSwitching() {
  const panelItems = document.querySelectorAll('.panel-item');
  const panels = document.querySelectorAll('.panel');

  panelItems.forEach(item => {
    item.addEventListener('click', function() {
      const panelId = this.dataset.panel;
      
      // Update active panel item with visual feedback
      panelItems.forEach(p => {
        p.classList.remove('active');
        p.style.transform = 'scale(1)';
      });
      this.classList.add('active');
      this.style.transform = 'scale(1.05)';
      
      // Update active panel with smooth transition
      panels.forEach(p => {
        p.classList.remove('active');
        p.style.opacity = '0';
      });
      
      setTimeout(() => {
        const targetPanel = document.getElementById(`${panelId}-panel`);
        if (targetPanel) {
          targetPanel.classList.add('active');
          targetPanel.style.opacity = '1';
        }
      }, 150);
      
      currentPanel = panelId;
      
      // Initialize panel-specific features with delay for smooth transition
      setTimeout(() => {
        if (panelId === 'admin') {
          initializeAdminCharts();
        } else if (panelId === 'technician') {
          initializeTechnicianCharts();
        } else if (panelId === 'partner') {
          initializePartnerCharts();
        } else if (panelId === 'security') {
          initializeSecurityCharts();
        } else if (panelId === 'whitelabel') {
          initializeWhiteLabelCharts();
        }
      }, 200);
    });
  });
}

// Customer Panel Setup
function setupCustomerPanel() {
  renderServices();
  setupServiceBooking();
  setupSOSButton();
}

function renderServices() {
  const serviceGrid = document.querySelector('.service-grid');
  if (!serviceGrid) return;

  serviceGrid.innerHTML = appData.services.map(service => `
    <div class="service-item" data-service-id="${service.id}">
      <div class="service-icon">${service.icon}</div>
      <div class="service-name">${service.name}</div>
      <div class="service-price">$${service.price}</div>
    </div>
  `).join('');

  // Add click handlers with visual feedback
  document.querySelectorAll('.service-item').forEach(item => {
    item.addEventListener('click', function() {
      // Add click animation
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 150);
      
      const serviceId = parseInt(this.dataset.serviceId);
      selectService(serviceId);
    });
  });
}

function selectService(serviceId) {
  const service = appData.services.find(s => s.id === serviceId);
  if (!service) return;

  selectedService = service;

  // Update UI with smooth transitions
  document.querySelectorAll('.service-item').forEach(item => {
    item.classList.remove('selected');
    item.style.opacity = '0.6';
  });
  const selectedItem = document.querySelector(`[data-service-id="${serviceId}"]`);
  selectedItem.classList.add('selected');
  selectedItem.style.opacity = '1';

  // Show service details with animation
  const serviceDetails = document.querySelector('.service-details');
  serviceDetails.style.display = 'block';
  serviceDetails.style.opacity = '0';
  serviceDetails.style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    serviceDetails.style.opacity = '1';
    serviceDetails.style.transform = 'translateY(0)';
  }, 100);

  document.getElementById('selected-service-name').textContent = service.name;
  document.getElementById('selected-service-desc').textContent = service.description;
  document.getElementById('selected-service-price').textContent = `$${service.price}`;
  document.getElementById('selected-service-eta').textContent = `${service.responseTime} min`;

  // Hide service grid with animation
  const serviceGrid = document.querySelector('.service-grid');
  serviceGrid.style.opacity = '0';
  setTimeout(() => {
    serviceGrid.style.display = 'none';
  }, 300);
}

function setupServiceBooking() {
  const bookServiceBtn = document.getElementById('book-service-btn');
  const backToServicesBtn = document.getElementById('back-to-services-btn');

  if (bookServiceBtn) {
    bookServiceBtn.addEventListener('click', function() {
      // Add loading state
      this.innerHTML = '<span>Booking...</span>';
      this.disabled = true;
      
      const location = document.getElementById('service-location').value;
      if (!location.trim()) {
        this.innerHTML = 'Book Now';
        this.disabled = false;
        
        // Highlight location field
        const locationField = document.getElementById('service-location');
        locationField.style.borderColor = '#ef4444';
        locationField.focus();
        
        setTimeout(() => {
          locationField.style.borderColor = '';
        }, 2000);
        
        alert('Please enter your location');
        return;
      }
      
      setTimeout(() => {
        bookService();
        this.innerHTML = 'Book Now';
        this.disabled = false;
      }, 1500);
    });
  }

  if (backToServicesBtn) {
    backToServicesBtn.addEventListener('click', function() {
      const serviceDetails = document.querySelector('.service-details');
      const serviceGrid = document.querySelector('.service-grid');
      
      // Animate transition back
      serviceDetails.style.opacity = '0';
      serviceDetails.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        serviceDetails.style.display = 'none';
        serviceGrid.style.display = 'grid';
        serviceGrid.style.opacity = '1';
        
        document.querySelectorAll('.service-item').forEach(item => {
          item.classList.remove('selected');
          item.style.opacity = '1';
        });
        
        selectedService = null;
      }, 300);
    });
  }
}

function bookService() {
  if (!selectedService) return;

  // Update tracking status with animation
  const trackingStatus = document.getElementById('tracking-status');
  trackingStatus.style.transform = 'scale(1.1)';
  trackingStatus.textContent = 'Service Booked';
  trackingStatus.className = 'status-badge busy';
  
  setTimeout(() => {
    trackingStatus.style.transform = 'scale(1)';
  }, 200);

  // Start tracking simulation
  startServiceTracking();

  // Show success message
  showNotification(`${selectedService.name} has been booked! A technician is on the way.`, 'success');
  
  // Reset form
  setTimeout(() => {
    document.querySelector('.service-details').style.display = 'none';
    document.querySelector('.service-grid').style.display = 'grid';
    document.getElementById('service-location').value = '';
  }, 2000);
}

function startServiceTracking() {
  const trackingDetails = document.getElementById('tracking-details');
  const technicianMarker = document.getElementById('technician-marker');
  
  technicianMarker.style.display = 'block';
  
  let elapsed = 0;
  const totalTime = selectedService.responseTime;
  
  trackingInterval = setInterval(() => {
    elapsed += 1;
    const remaining = totalTime - elapsed;
    
    if (remaining > 0) {
      trackingDetails.innerHTML = `
        <p><strong>Technician en route</strong></p>
        <p>ETA: ${remaining} minutes</p>
        <p>Service: ${selectedService.name}</p>
        <p>Status: On the way</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${((totalTime - remaining) / totalTime) * 100}%;"></div>
        </div>
      `;
    } else {
      trackingDetails.innerHTML = `
        <p><strong>Technician arrived</strong></p>
        <p>Service: ${selectedService.name}</p>
        <p>Status: In progress</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 100%;"></div>
        </div>
      `;
      
      // Complete service after duration
      setTimeout(() => {
        completeService();
      }, selectedService.duration * 100); // Reduced for demo
      
      clearInterval(trackingInterval);
    }
  }, 1000);
}

function completeService() {
  const trackingStatus = document.getElementById('tracking-status');
  const trackingDetails = document.getElementById('tracking-details');
  const technicianMarker = document.getElementById('technician-marker');
  
  trackingStatus.textContent = 'Service Completed';
  trackingStatus.className = 'status-badge online';
  
  trackingDetails.innerHTML = `
    <p><strong>Service completed successfully!</strong></p>
    <p>Thank you for using RoadSide+</p>
    <p>Rate your experience: ⭐⭐⭐⭐⭐</p>
  `;
  
  technicianMarker.style.display = 'none';
  
  showNotification('Service completed successfully! Thank you for using RoadSide+', 'success');
  
  setTimeout(() => {
    trackingStatus.textContent = 'No active service';
    trackingStatus.className = 'status-badge';
    trackingDetails.innerHTML = '<p>Book a service to start tracking</p>';
  }, 10000);
}

function setupSOSButton() {
  const sosButton = document.querySelector('.sos-button');
  if (sosButton) {
    sosButton.addEventListener('click', function() {
      // Add urgent animation
      this.style.animation = 'pulse 0.5s infinite';
      
      if (confirm('🚨 EMERGENCY ALERT\n\nThis will immediately notify emergency services and security personnel. Only use for genuine emergencies.\n\nContinue?')) {
        triggerEmergencyAlert();
      }
      
      this.style.animation = 'pulse 2s infinite';
    });
  }
}

function triggerEmergencyAlert() {
  showNotification('🚨 Emergency alert sent! Security services have been notified and are responding.', 'emergency');
  
  // Update emergency count in analytics
  appData.analytics.emergencyRequests += 1;
  updateAnalyticsDisplay();
  
  // Add emergency alert to security panel
  addEmergencyToSecurityPanel();
}

function addEmergencyToSecurityPanel() {
  const alertGrid = document.querySelector('.alert-grid');
  if (alertGrid) {
    const newAlert = document.createElement('div');
    newAlert.className = 'alert-card critical';
    newAlert.innerHTML = `
      <div class="alert-header">
        <div class="alert-title">Customer SOS</div>
        <div class="alert-priority">Critical</div>
      </div>
      <div class="alert-details">
        <div class="alert-location">Current Location</div>
        <div class="alert-time">${new Date().toLocaleTimeString()}, Today</div>
      </div>
      <div class="alert-actions">
        <button class="btn btn--sm btn--primary">Respond</button>
        <button class="btn btn--sm btn--outline">Escalate</button>
      </div>
    `;
    alertGrid.insertBefore(newAlert, alertGrid.firstChild);
  }
}

// Technician Panel Setup
function setupTechnicianPanel() {
  setupStatusToggle();
  setupJobManagement();
  setupTechnicianTabs();
  setupChat();
}

function setupStatusToggle() {
  const statusToggle = document.getElementById('tech-status-toggle');
  const statusValue = document.getElementById('tech-status-value');

  if (statusToggle && statusValue) {
    statusToggle.addEventListener('change', function() {
      // Immediate visual feedback
      statusValue.style.transform = 'scale(1.1)';
      
      if (this.checked) {
        statusValue.textContent = 'Online';
        statusValue.className = 'status-value online';
        showNotification('You are now online and available for jobs', 'success');
      } else {
        statusValue.textContent = 'Offline';
        statusValue.className = 'status-value offline';
        showNotification('You are now offline', 'info');
      }
      
      setTimeout(() => {
        statusValue.style.transform = 'scale(1)';
      }, 200);
    });
  }
}

function setupJobManagement() {
  // Accept job buttons with improved feedback
  document.addEventListener('click', function(e) {
    if (e.target.textContent === 'Accept') {
      const button = e.target;
      
      // Add loading state
      button.innerHTML = 'Accepting...';
      button.disabled = true;
      
      setTimeout(() => {
        button.textContent = 'Accepted';
        button.classList.remove('btn--primary');
        button.classList.add('btn--secondary');
        
        showNotification('Job accepted successfully!', 'success');
        
        // Move job to assigned tab
        const jobItem = button.closest('.job-item');
        if (jobItem) {
          const assignedJobsTab = document.getElementById('assigned-jobs');
          const newJobItem = jobItem.cloneNode(true);
          const newButton = newJobItem.querySelector('.btn');
          newButton.textContent = 'Navigate';
          newButton.disabled = false;
          newButton.classList.remove('btn--secondary');
          newButton.classList.add('btn--secondary');
          
          assignedJobsTab.querySelector('.job-list').appendChild(newJobItem);
          jobItem.remove();
        }
      }, 1000);
    }
    
    if (e.target.textContent === 'Navigate') {
      showNotification('Opening navigation to customer location...', 'info');
    }
  });
}

function setupTechnicianTabs() {
  setupTabNavigation();
}

function setupChat() {
  const sendMessageBtn = document.getElementById('send-message-btn');
  const messageInput = document.getElementById('message-input');
  const chatMessages = document.getElementById('chat-messages');

  if (sendMessageBtn && messageInput && chatMessages) {
    sendMessageBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Add loading indicator
    sendMessageBtn.innerHTML = 'Sending...';
    sendMessageBtn.disabled = true;

    setTimeout(() => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message technician';
      messageElement.innerHTML = `
        <div class="message-content">${message}</div>
        <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
      `;

      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      messageInput.value = '';
      
      sendMessageBtn.innerHTML = 'Send';
      sendMessageBtn.disabled = false;
      
      // Auto-reply simulation
      setTimeout(() => {
        const replyElement = document.createElement('div');
        replyElement.className = 'message customer';
        replyElement.innerHTML = `
          <div class="message-content">Thanks for the update!</div>
          <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        `;
        chatMessages.appendChild(replyElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 2000);
    }, 500);
  }
}

// Admin Panel Setup
function setupAdminPanel() {
  setupUserManagement();
  setupConfigurationManagement();
  updateAnalyticsDisplay();
}

function setupUserManagement() {
  const addUserBtn = document.getElementById('add-user-btn');
  if (addUserBtn) {
    addUserBtn.addEventListener('click', function() {
      // Add visual feedback
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 150);
      
      showNotification('Add User functionality - This would open a user creation modal', 'info');
    });
  }

  // Fixed delete user buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) {
      e.preventDefault();
      e.stopPropagation();
      
      const userName = e.target.closest('tr').querySelector('td:nth-child(2)').textContent;
      
      if (confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
        const row = e.target.closest('tr');
        row.style.opacity = '0';
        row.style.transform = 'translateX(-100%)';
        
        setTimeout(() => {
          row.remove();
          showNotification(`User "${userName}" has been deleted`, 'success');
        }, 300);
      }
    }
    
    // Fixed edit buttons
    if (e.target.textContent === 'Edit' && e.target.closest('.user-table')) {
      e.preventDefault();
      e.stopPropagation();
      
      const userName = e.target.closest('tr').querySelector('td:nth-child(2)').textContent;
      showNotification(`Edit functionality for "${userName}" - This would open an edit modal`, 'info');
    }
  });
}

function setupConfigurationManagement() {
  // Configuration toggles with improved feedback
  document.querySelectorAll('.config-item input[type="checkbox"]').forEach(toggle => {
    toggle.addEventListener('change', function() {
      const label = this.closest('.toggle-switch').querySelector('.toggle-label');
      const configLabel = this.closest('.config-item').querySelector('.config-label').textContent;
      
      if (label) {
        label.style.transform = 'scale(1.05)';
        label.textContent = this.checked ? 'Enabled' : 'Disabled';
        
        setTimeout(() => {
          label.style.transform = 'scale(1)';
        }, 200);
        
        showNotification(`${configLabel} ${this.checked ? 'enabled' : 'disabled'}`, 'info');
      }
    });
  });
  
  // Save configuration button
  document.addEventListener('click', function(e) {
    if (e.target.textContent === 'Save Changes') {
      e.target.innerHTML = 'Saving...';
      e.target.disabled = true;
      
      setTimeout(() => {
        e.target.innerHTML = 'Save Changes';
        e.target.disabled = false;
        showNotification('Configuration saved successfully!', 'success');
      }, 1500);
    }
  });
}

function updateAnalyticsDisplay() {
  const elements = {
    'total-users': appData.analytics.totalUsers.toLocaleString(),
    'active-requests': appData.analytics.activeRequests,
    'monthly-revenue': `$${appData.analytics.monthlyRevenue.toLocaleString()}`,
    'response-time': `${appData.analytics.averageResponseTime} min`,
    'customer-satisfaction': `${appData.analytics.customerSatisfaction} ★`,
    'emergency-requests': appData.analytics.emergencyRequests
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      // Add animation for value changes
      element.style.transform = 'scale(1.1)';
      element.textContent = value;
      
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 200);
    }
  });
}

// Partner Panel Setup
function setupPartnerPanel() {
  setupOnboardingSteps();
}

function setupOnboardingSteps() {
  document.addEventListener('click', function(e) {
    if (e.target.textContent === 'Continue' && e.target.classList.contains('btn--primary')) {
      const step = e.target.closest('.step');
      
      // Add loading state
      e.target.innerHTML = 'Processing...';
      e.target.disabled = true;
      
      setTimeout(() => {
        step.classList.remove('active');
        step.classList.add('completed');
        
        const nextStep = step.nextElementSibling;
        if (nextStep && nextStep.classList.contains('step')) {
          nextStep.classList.add('active');
          
          // Update progress
          const progressFill = document.querySelector('.progress-fill');
          const progressText = document.querySelector('.progress-text');
          const completedSteps = document.querySelectorAll('.step.completed').length;
          const totalSteps = document.querySelectorAll('.step').length;
          const progress = (completedSteps / totalSteps) * 100;
          
          progressFill.style.width = `${progress}%`;
          progressText.textContent = `${Math.round(progress)}% Complete`;
          
          showNotification('Step completed successfully!', 'success');
        } else {
          showNotification('Onboarding completed! Welcome to RoadSide+', 'success');
        }
        
        e.target.innerHTML = 'Continue';
        e.target.disabled = false;
      }, 1500);
    }
  });
}

// Security Panel Setup
function setupSecurityPanel() {
  setupEmergencyAlerts();
  setupIncidentManagement();
}

function setupEmergencyAlerts() {
  // Alert action buttons with improved feedback
  document.addEventListener('click', function(e) {
    if (e.target.textContent === 'Respond' && e.target.closest('.alert-card')) {
      const alertCard = e.target.closest('.alert-card');
      const button = e.target;
      
      button.innerHTML = 'Responding...';
      button.disabled = true;
      alertCard.style.borderColor = '#f59e0b';
      
      setTimeout(() => {
        button.textContent = 'Completed';
        button.classList.remove('btn--primary');
        button.classList.add('btn--secondary');
        alertCard.style.borderColor = '#10b981';
        alertCard.style.opacity = '0.7';
        
        showNotification('Emergency response dispatched successfully', 'success');
      }, 3000);
    }
    
    if (e.target.textContent === 'Escalate' && e.target.closest('.alert-card')) {
      showNotification('Alert escalated to authorities', 'warning');
    }
  });
}

function setupIncidentManagement() {
  // Incident detail buttons
  document.addEventListener('click', function(e) {
    if (e.target.textContent === 'Details' && e.target.closest('.incident-item')) {
      const incidentTitle = e.target.closest('.incident-item').querySelector('.incident-title').textContent;
      showNotification(`Opening details for: ${incidentTitle}`, 'info');
    }
  });
}

// White Label Panel Setup
function setupWhiteLabelPanel() {
  setupTenantManagement();
  setupBrandingCustomization();
  setupFeatureToggles();
  setupFileUploads();
}

function setupTenantManagement() {
  document.addEventListener('click', function(e) {
    if (e.target.closest('.tenant-item.add-tenant')) {
      showNotification('Add New Tenant - This would open a tenant creation wizard', 'info');
    }
    
    // Tenant edit buttons
    if (e.target.textContent === 'Edit' && e.target.closest('.tenant-item')) {
      const tenantName = e.target.closest('.tenant-item').querySelector('.tenant-name').textContent;
      showNotification(`Edit tenant: ${tenantName} - This would open tenant configuration`, 'info');
    }
  });
}

function setupBrandingCustomization() {
  const colorPickers = document.querySelectorAll('.color-picker');
  colorPickers.forEach(picker => {
    picker.addEventListener('change', function() {
      updateBrandingPreview();
      showNotification('Branding colors updated', 'success');
    });
  });

  const brandingInputs = document.querySelectorAll('.branding-group input[type="text"], .branding-group input[type="email"], .branding-group input[type="tel"]');
  brandingInputs.forEach(input => {
    input.addEventListener('input', function() {
      updateBrandingPreview();
    });
  });
}

function setupFileUploads() {
  // Replace upload buttons with functional file inputs
  document.addEventListener('click', function(e) {
    if (e.target.textContent === 'Upload Logo') {
      // Create and trigger file input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
          e.target.textContent = `✓ ${file.name}`;
          e.target.classList.add('btn--secondary');
          showNotification(`Logo "${file.name}" uploaded successfully`, 'success');
        }
      };
      fileInput.click();
    }
    
    if (e.target.textContent === 'Upload Favicon') {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
          e.target.textContent = `✓ ${file.name}`;
          e.target.classList.add('btn--secondary');
          showNotification(`Favicon "${file.name}" uploaded successfully`, 'success');
        }
      };
      fileInput.click();
    }
  });
}

function updateBrandingPreview() {
  const companyName = document.querySelector('input[value="RoadSide+ Standard"]')?.value || 'RoadSide+ Standard';
  const primaryColor = document.querySelector('input[value="#dc2626"]')?.value || '#dc2626';
  
  const previewHeader = document.querySelector('.preview-header');
  const previewButton = document.querySelector('.preview-button');
  const previewLogo = document.querySelector('.preview-logo');
  
  if (previewHeader) previewHeader.textContent = companyName;
  if (previewButton) previewButton.style.backgroundColor = primaryColor;
  if (previewLogo) previewLogo.style.backgroundColor = primaryColor;
}

function setupFeatureToggles() {
  document.querySelectorAll('.feature-item input[type="checkbox"]').forEach(toggle => {
    toggle.addEventListener('change', function() {
      const featureTitle = this.closest('.feature-item').querySelector('.feature-title').textContent;
      const status = this.checked ? 'enabled' : 'disabled';
      showNotification(`${featureTitle} ${status}`, 'info');
    });
  });
}

// Tab Navigation
function setupTabNavigation() {
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('tab-btn')) {
      const tabGroup = e.target.closest('.card');
      const tabId = e.target.dataset.tab;
      
      // Add visual feedback
      e.target.style.transform = 'scale(0.95)';
      setTimeout(() => {
        e.target.style.transform = 'scale(1)';
      }, 150);
      
      // Update tab buttons
      tabGroup.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      e.target.classList.add('active');
      
      // Update tab content
      tabGroup.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.opacity = '0';
      });
      
      setTimeout(() => {
        const targetContent = document.getElementById(tabId);
        if (targetContent) {
          targetContent.classList.add('active');
          targetContent.style.opacity = '1';
        }
      }, 150);
    }
  });
}

// Notification System
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());
  
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${getNotificationIcon(type)}</span>
      <span class="notification-message">${message}</span>
    </div>
    <button class="notification-close">&times;</button>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-base);
    padding: var(--space-16);
    box-shadow: var(--glass-shadow);
    backdrop-filter: blur(20px);
    z-index: 10000;
    max-width: 400px;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
  `;
  
  if (type === 'success') {
    notification.style.borderColor = '#10b981';
  } else if (type === 'error' || type === 'emergency') {
    notification.style.borderColor = '#ef4444';
  } else if (type === 'warning') {
    notification.style.borderColor = '#f59e0b';
  }
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Auto remove
  setTimeout(() => {
    removeNotification(notification);
  }, type === 'emergency' ? 10000 : 5000);
  
  // Close button
  notification.querySelector('.notification-close').addEventListener('click', () => {
    removeNotification(notification);
  });
}

function getNotificationIcon(type) {
  switch (type) {
    case 'success': return '✅';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    case 'emergency': return '🚨';
    default: return 'ℹ️';
  }
}

function removeNotification(notification) {
  notification.style.opacity = '0';
  notification.style.transform = 'translateX(100%)';
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 300);
}

// Chart Initialization (keeping existing chart functions but adding error handling)
function initializeAdminCharts() {
  try {
    if (charts.revenueChart) {
      charts.revenueChart.destroy();
    }
    
    const ctx = document.getElementById('revenue-chart');
    if (ctx) {
      charts.revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Revenue',
            data: [180000, 195000, 210000, 225000, 235000, 245000],
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: '#f1f5f9'
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#94a3b8'
              },
              grid: {
                color: 'rgba(148, 163, 184, 0.1)'
              }
            },
            y: {
              ticks: {
                color: '#94a3b8',
                callback: function(value) {
                  return '$' + value.toLocaleString();
                }
              },
              grid: {
                color: 'rgba(148, 163, 184, 0.1)'
              }
            }
          }
        }
      });
    }

    // Initialize other admin charts with similar error handling...
    initializeOtherAdminCharts();
  } catch (error) {
    console.error('Error initializing admin charts:', error);
    showNotification('Charts could not be loaded', 'error');
  }
}

function initializeOtherAdminCharts() {
  // Revenue Detail Chart
  const revenueDetailCtx = document.getElementById('revenue-detail-chart');
  if (revenueDetailCtx) {
    charts.revenueDetailChart = new Chart(revenueDetailCtx, {
      type: 'bar',
      data: {
        labels: ['Towing', 'Battery', 'Tire', 'Lockout', 'Fuel', 'Winch'],
        datasets: [{
          label: 'Revenue by Service',
          data: [75000, 45000, 38000, 32000, 28000, 27000],
          backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#94a3b8'
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.1)'
            }
          },
          y: {
            ticks: {
              color: '#94a3b8',
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.1)'
            }
          }
        }
      }
    });
  }

  // Expenses Chart
  const expensesCtx = document.getElementById('expenses-chart');
  if (expensesCtx) {
    charts.expensesChart = new Chart(expensesCtx, {
      type: 'doughnut',
      data: {
        labels: ['Technician Payments', 'Operations', 'Marketing', 'Support'],
        datasets: [{
          data: [120000, 45000, 25000, 15000],
          backgroundColor: ['#dc2626', '#f59e0b', '#10b981', '#3b82f6']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#f1f5f9'
            }
          }
        }
      }
    });
  }

  // Profit Chart
  const profitCtx = document.getElementById('profit-chart');
  if (profitCtx) {
    charts.profitChart = new Chart(profitCtx, {
      type: 'line',
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          label: 'Profit',
          data: [35000, 42000, 38000, 45000],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#f1f5f9'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#94a3b8'
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.1)'
            }
          },
          y: {
            ticks: {
              color: '#94a3b8',
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.1)'
            }
          }
        }
      }
    });
  }
}

// Keep existing chart initialization functions for other panels...
function initializeTechnicianCharts() {
  try {
    // Daily Earnings Chart
    const dailyCtx = document.getElementById('daily-earnings-chart');
    if (dailyCtx) {
      charts.dailyEarningsChart = new Chart(dailyCtx, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Daily Earnings',
            data: [85, 120, 95, 110, 125, 140, 95],
            backgroundColor: '#dc2626'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#94a3b8'
              },
              grid: {
                color: 'rgba(148, 163, 184, 0.1)'
              }
            },
            y: {
              ticks: {
                color: '#94a3b8',
                callback: function(value) {
                  return '$' + value;
                }
              },
              grid: {
                color: 'rgba(148, 163, 184, 0.1)'
              }
            }
          }
        }
      });
    }
    
    // Initialize other technician charts...
    initializeOtherTechnicianCharts();
  } catch (error) {
    console.error('Error initializing technician charts:', error);
  }
}

function initializeOtherTechnicianCharts() {
  // Weekly Earnings Chart
  const weeklyCtx = document.getElementById('weekly-earnings-chart');
  if (weeklyCtx) {
    charts.weeklyEarningsChart = new Chart(weeklyCtx, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          label: 'Weekly Earnings',
          data: [750, 820, 875, 920],
          borderColor: '#dc2626',
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#94a3b8'
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.1)'
            }
          },
          y: {
            ticks: {
              color: '#94a3b8',
              callback: function(value) {
                return '$' + value;
              }
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.1)'
            }
          }
        }
      }
    });
  }

  // Monthly Earnings Chart
  const monthlyCtx = document.getElementById('monthly-earnings-chart');
  if (monthlyCtx) {
    charts.monthlyEarningsChart = new Chart(monthlyCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Monthly Earnings',
          data: [2800, 3100, 3350, 3200, 3420, 3650],
          backgroundColor: '#dc2626'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#94a3b8'
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.1)'
            }
          },
          y: {
            ticks: {
              color: '#94a3b8',
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.1)'
            }
          }
        }
      }
    });
  }
}

// Continue with remaining chart functions...
function initializePartnerCharts() {
  // Similar improvements for partner charts...
}

function initializeSecurityCharts() {
  // Similar improvements for security charts...
}

function initializeWhiteLabelCharts() {
  try {
    // Tenant Comparison Chart
    const tenantComparisonCtx = document.getElementById('tenant-comparison-chart');
    if (tenantComparisonCtx) {
      charts.tenantComparisonChart = new Chart(tenantComparisonCtx, {
        type: 'bar',
        data: {
          labels: ['Users', 'Revenue', 'Services', 'Satisfaction'],
          datasets: [
            {
              label: 'RoadSide+ Standard',
              data: [15420, 245000, 1250, 4.6],
              backgroundColor: '#dc2626'
            },
            {
              label: 'Quick Tow Services',
              data: [8500, 125000, 680, 4.7],
              backgroundColor: '#ef4444'
            },
            {
              label: 'Emergency Auto Care',
              data: [6200, 95000, 520, 4.8],
              backgroundColor: '#f59e0b'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: '#f1f5f9'
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#94a3b8'
              },
              grid: {
                color: 'rgba(148, 163, 184, 0.1)'
              }
            },
            y: {
              ticks: {
                color: '#94a3b8'
              },
              grid: {
                color: 'rgba(148, 163, 184, 0.1)'
              }
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Error initializing white label charts:', error);
  }
}

// Real-time Updates
function startRealTimeUpdates() {
  setInterval(() => {
    updateRealTimeData();
  }, 5000); // Update every 5 seconds
}

function updateRealTimeData() {
  // Simulate real-time data updates
  appData.analytics.activeRequests = Math.floor(Math.random() * 20) + 80;
  appData.analytics.averageResponseTime = Math.floor(Math.random() * 10) + 25;
  
  // Update display if on admin panel
  if (currentPanel === 'admin') {
    updateAnalyticsDisplay();
  }
  
  // Update emergency alerts count randomly
  if (Math.random() < 0.1) { // 10% chance every 5 seconds
    appData.analytics.emergencyRequests += 1;
    if (currentPanel === 'admin') {
      updateAnalyticsDisplay();
    }
  }
}

// Error Handling
window.addEventListener('error', function(e) {
  console.error('Application error:', e.error);
  showNotification('An error occurred. Please refresh the page if issues persist.', 'error');
});

// Initialize tab navigation on load
document.addEventListener('DOMContentLoaded', function() {
  setupTabNavigation();
});

console.log('RoadSide+ Multi-Tenant Platform initialized successfully!');