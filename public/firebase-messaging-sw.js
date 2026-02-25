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

const messaging = firebase.messaging();

console.log("✅ SW loaded");

// FCM handles notification display automatically
// onBackgroundMessage is only for data-only messages
messaging.onBackgroundMessage((payload) => {
  console.log("📬 Background message:", payload);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const url = "https://vcampusgo.vercel.app";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsArr) => {
        for (const client of clientsArr) {
          if (client.url.includes(self.location.origin)) {
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});