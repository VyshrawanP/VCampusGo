// Import Firebase scripts
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

// Firebase configuration
firebase.initializeApp({
  apiKey: "AIzaSyCOGbOMT9dSe4crvK5aXqGD90bS5Rppm_4",
  projectId: "vcampusgo",
  messagingSenderId: "532012102516",
  appId: "1:532012102516:web:75aa44bf4f31cd783c3221"
});

// Get messaging instance
const messaging = firebase.messaging();

console.log("✅ Firebase Messaging Service Worker loaded");

// Handle background messages (when app is closed or in background)
messaging.onBackgroundMessage((payload) => {
  console.log("📬 Background message received:", payload);
  
  // Extract hostel info from payload
  const hostel = payload.data?.hostel || 'mh';
  const hostelLabel = hostel.toUpperCase();
  
  // Notification title and body
  const notificationTitle = payload.notification?.title || `${hostelLabel} Mess Menu Update`;
  const notificationBody = payload.notification?.body || 'Check out today\'s mess menu!';
  
  console.log(`Showing notification for ${hostelLabel}`);
  
  // Notification options
  const notificationOptions = {
    body: notificationBody,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: `${hostel}-notification`,
    data: {
      url: '/',
      hostel: hostel,
      timestamp: new Date().toISOString(),
      ...payload.data
    },
    requireInteraction: false,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'view',
        title: 'View Menu',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  };
  
  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log("🔔 Notification clicked:", event.notification);
  
  const hostel = event.notification.data?.hostel || 'mh';
  const action = event.action;
  
  // Close notification
  event.notification.close();
  
  if (action === 'close') {
    console.log('User closed notification');
    return;
  }
  
  // Handle notification click or "view" action
  console.log(`Opening app for ${hostel.toUpperCase()} hostel`);
  
  const urlToOpen = `/?hostel=${hostel}#mess`;
  
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((clientList) => {
      console.log(`Found ${clientList.length} open windows`);
      
      // Check if there's already a window open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        
        // If window is already open, focus it
        if ('focus' in client) {
          console.log('Focusing existing window');
          return client.focus().then(() => {
            // Navigate to mess section
            return client.postMessage({
              type: 'NAVIGATE_TO_MESS',
              hostel: hostel
            });
          });
        }
      }
      
      // No window open, open a new one
      if (clients.openWindow) {
        console.log('Opening new window');
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log("🔕 Notification closed:", event.notification.tag);
});

// Service Worker activation
self.addEventListener('activate', (event) => {
  console.log("✅ Service Worker activated");
  event.waitUntil(self.clients.claim());
});

// Service Worker installation
self.addEventListener('install', (event) => {
  console.log("✅ Service Worker installed");
  self.skipWaiting();
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  console.log("📨 Message received in Service Worker:", event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log("✅ Firebase Messaging Service Worker ready");