import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOGbOMT9dSe4crvK5aXqGD90bS5Rppm_4",
  projectId: "vcampusgo",
  messagingSenderId: "532012102516",
  appId: "1:532012102516:web:75aa44bf4f31cd783c3221",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

console.log("✅ Firebase FCM module loaded");

// Hostel configurations
const HOSTEL_CONFIGS = {
  mh: {
    topic: 'mh-mess-menu',
    name: "Men's Hostel",
    buttonId: 'notifyBtnMH',
    storageKey: 'mh-subscribed',
    tokenKey: 'mh-token'
  },
  lh: {
    topic: 'lh-mess-menu',
    name: "Ladies Hostel",
    buttonId: 'notifyBtnLH',
    storageKey: 'lh-subscribed',
    tokenKey: 'lh-token'
  }
};

// Check if browser supports notifications
function isNotificationSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

// Check subscription status for both hostels
function checkAllSubscriptionStatus() {
  Object.keys(HOSTEL_CONFIGS).forEach(hostel => {
    const config = HOSTEL_CONFIGS[hostel];
    const isSubscribed = localStorage.getItem(config.storageKey) === 'true';
    updateButtonState(config.buttonId, isSubscribed, hostel);
  });
}

// Update button state
function updateButtonState(buttonId, isSubscribed, hostel) {
  const button = document.getElementById(buttonId);
  
  if (!button) {
    console.warn(`⚠️ Button ${buttonId} not found`);
    return;
  }
  
  const hostelLabel = hostel.toUpperCase();
  
  if (isSubscribed) {
    button.classList.add('subscribed');
    button.innerHTML = `<i class="fas fa-check-circle"></i> ${hostelLabel} Notifications Active`;
    button.disabled = true;
  } else {
    button.classList.remove('subscribed');
    button.innerHTML = `<i class="fas fa-bell"></i> Enable ${hostelLabel} Notifications`;
    button.disabled = false;
  }
}

// Request notification permission
async function requestNotificationPermission() {
  console.log("🔔 Requesting notification permission...");
  
  try {
    const permission = await Notification.requestPermission();
    console.log("Permission result:", permission);
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      return true;
    } else if (permission === 'denied') {
      console.log('❌ Notification permission denied');
      alert('Please enable notifications in your browser settings to receive mess menu updates.');
      return false;
    } else {
      console.log('⚠️ Notification permission dismissed');
      alert('Please allow notifications to receive mess menu updates');
      return false;
    }
  } catch (error) {
    console.error('❌ Error requesting permission:', error);
    alert('Failed to request notification permission. Please try again.');
    return false;
  }
}

// Get FCM token
async function getFCMToken() {
  console.log("🎫 Getting FCM token...");
  
  try {
    // Check for VAPID key
    if (!window.VAPID_KEY) {
      throw new Error("VAPID key is missing");
    }

    console.log("VAPID key found");

    // Check if we already have a token
    let token = localStorage.getItem('shared-fcm-token');
    
    if (token) {
      console.log('✅ Reusing existing FCM token');
      return token;
    }

    console.log("🔄 Requesting new FCM token...");

    // Get new token from Firebase
    token = await getToken(messaging, {
      vapidKey: window.VAPID_KEY,
    });

    if (!token) {
      throw new Error('Failed to get FCM token');
    }

    // Save token
    localStorage.setItem('shared-fcm-token', token);
    console.log('✅ FCM Token obtained:', token.substring(0, 20) + '...');
    
    return token;
    
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
    throw error;
  }
}

// Subscribe to topic
async function subscribeToTopic(token, topic, hostel) {
  console.log(`📡 Subscribing to topic: ${topic}`);
  
  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        token: token,
        topic: topic,
        hostel: hostel
      }),
    });

    console.log("Server response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      throw new Error(`Failed to subscribe: ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Subscribed to ${topic}:`, data);
    
    return data;
    
  } catch (error) {
    console.error(`❌ Error subscribing to ${topic}:`, error);
    throw error;
  }
}

// Main subscription function
async function subscribeToNotifications(hostel) {
  console.log(`\n🔔 ${hostel.toUpperCase()} SUBSCRIPTION STARTED`);
  
  const config = HOSTEL_CONFIGS[hostel];
  const button = document.getElementById(config.buttonId);
  
  if (!button) {
    console.error(`❌ Button ${config.buttonId} not found`);
    return;
  }
  
  try {
    // Show loading
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Setting up...';
    
    // Step 1: Request permission
    console.log("Step 1: Requesting permission");
    const hasPermission = await requestNotificationPermission();
    
    if (!hasPermission) {
      console.log("❌ Permission denied");
      updateButtonState(config.buttonId, false, hostel);
      return;
    }
    
    // Step 2: Get FCM token
    console.log("Step 2: Getting FCM token");
    const token = await getFCMToken();
    
    // Step 3: Subscribe to topic
    console.log("Step 3: Subscribing to topic");
    await subscribeToTopic(token, config.topic, hostel);
    
    // Step 4: Save subscription
    console.log("Step 4: Saving subscription");
    localStorage.setItem(config.storageKey, 'true');
    localStorage.setItem(config.tokenKey, token);
    localStorage.setItem(`${hostel}-subscribed-time`, new Date().toISOString());
    
    // Step 5: Update button
    updateButtonState(config.buttonId, true, hostel);
    
    console.log(`✅ ${hostel.toUpperCase()} SUBSCRIPTION COMPLETE`);
    alert(`🎉 Successfully subscribed to ${config.name} mess notifications!`);
    
  } catch (error) {
    console.error(`❌ ${hostel.toUpperCase()} SUBSCRIPTION FAILED:`, error);
    
    // Reset button
    updateButtonState(config.buttonId, false, hostel);
    
    // Error message
    let errorMessage = 'Failed to enable notifications. ';
    
    if (error.message.includes('VAPID')) {
      errorMessage += 'Configuration error.';
    } else if (error.message.includes('permission')) {
      errorMessage += 'Please enable notifications in browser settings.';
    } else if (error.message.includes('subscribe')) {
      errorMessage += 'Could not connect to server. Make sure backend is running.';
    } else {
      errorMessage += 'Please try again.';
    }
    
    alert(errorMessage);
  }
}

// Handle foreground messages
onMessage(messaging, (payload) => {
  console.log('📬 Message received:', payload);
  
  const hostel = payload.data?.hostel || 'mh';
  const notificationTitle = payload.notification?.title || `${hostel.toUpperCase()} Mess Update`;
  const notificationBody = payload.notification?.body || 'Check the latest mess menu';
  
  const notificationOptions = {
    body: notificationBody,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: `${hostel}-notification`,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      hostel: hostel
    }
  };
  
  if (Notification.permission === 'granted') {
    const notification = new Notification(notificationTitle, notificationOptions);
    
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();
      
      // Scroll to mess section
      const messSection = document.getElementById('mess');
      if (messSection) {
        messSection.scrollIntoView({ behavior: 'smooth' });
        
        // Switch to correct hostel
        const hostelBtn = document.querySelector(`[data-hostel="${hostel}"]`);
        if (hostelBtn) {
          hostelBtn.click();
        }
      }
    };
  }
});

// Initialize
function initializeNotifications() {
  console.log('🚀 Initializing notification system');
  
  // Check support
  if (!isNotificationSupported()) {
    console.warn('⚠️ Notifications not supported');
    
    Object.values(HOSTEL_CONFIGS).forEach(config => {
      const button = document.getElementById(config.buttonId);
      if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-times"></i> Not Supported';
      }
    });
    
    return;
  }
  
  console.log('✅ Notifications supported');
  
  // Check VAPID key
  if (!window.VAPID_KEY) {
    console.error('❌ VAPID key missing');
    
    Object.values(HOSTEL_CONFIGS).forEach(config => {
      const button = document.getElementById(config.buttonId);
      if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Config Error';
      }
    });
    
    return;
  }
  
  console.log('✅ VAPID key found');
  
  // Check subscription status
  checkAllSubscriptionStatus();
  
  // Add button handlers
  const mhButton = document.getElementById('notifyBtnMH');
  const lhButton = document.getElementById('notifyBtnLH');
  
  if (mhButton) {
    mhButton.addEventListener('click', () => {
      console.log('🔔 MH button clicked');
      subscribeToNotifications('mh');
    });
    console.log('✅ MH button handler added');
  } else {
    console.warn('⚠️ MH button not found');
  }
  
  if (lhButton) {
    lhButton.addEventListener('click', () => {
      console.log('🔔 LH button clicked');
      subscribeToNotifications('lh');
    });
    console.log('✅ LH button handler added');
  } else {
    console.warn('⚠️ LH button not found');
  }
  
  console.log('✅ Notification system initialized');
}

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeNotifications);
} else {
  initializeNotifications();
}

// Debug tools
window.debugNotifications = {
  checkStatus: () => {
    console.log('=== Status ===');
    console.log('MH:', localStorage.getItem('mh-subscribed'));
    console.log('LH:', localStorage.getItem('lh-subscribed'));
    console.log('Token:', localStorage.getItem('shared-fcm-token')?.substring(0, 20) + '...');
    checkAllSubscriptionStatus();
  },
  
  subscribeMH: () => subscribeToNotifications('mh'),
  subscribeLH: () => subscribeToNotifications('lh'),
  
  getToken: () => {
    const token = localStorage.getItem('shared-fcm-token');
    console.log('Token:', token);
    return token;
  },
  
  clearAll: () => {
    if (confirm('Clear all notification data?')) {
      localStorage.removeItem('mh-subscribed');
      localStorage.removeItem('mh-token');
      localStorage.removeItem('lh-subscribed');
      localStorage.removeItem('lh-token');
      localStorage.removeItem('shared-fcm-token');
      console.log('✅ Cleared');
      checkAllSubscriptionStatus();
    }
  }
};
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('📨 Message from Service Worker:', event.data);
    
    if (event.data.type === 'NAVIGATE_TO_MESS') {
      const hostel = event.data.hostel;
      
      // Scroll to mess section
      const messSection = document.getElementById('mess');
      if (messSection) {
        messSection.scrollIntoView({ behavior: 'smooth' });
        
        // Switch to correct hostel tab
        setTimeout(() => {
          const hostelBtn = document.querySelector(`[data-hostel="${hostel}"]`);
          if (hostelBtn) {
            hostelBtn.click();
          }
        }, 300);
      }
    }
  });
}
console.log('💡 Debug: window.debugNotifications');