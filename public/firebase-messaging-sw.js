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

messaging.onBackgroundMessage((payload) => {
  console.log("📬 Background message:", payload);

  const hostel = payload.data?.hostel || "mh";
  const hostelLabel = hostel.toUpperCase();

  const title =
    payload.data?.title || `${hostelLabel} Mess Menu Update`;

const items = payload.data?.items
  ? JSON.parse(payload.data.items)
  : [];

const body = items.length
  ? "• " + items.join("\n• ")
  : "Check today's mess menu";

  return self.registration.showNotification(title, {
    body,
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: `${hostel}-menu`,
    vibrate: [200, 100, 200],
    data: { hostel },
    actions: [
      { action: "view", title: "View Menu" },
      { action: "close", title: "Close" }
    ]
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const hostel = event.notification.data?.hostel || "mh";

  const url = `https://vcampusgo.vercel.app/?hostel=${hostel}#mess`;

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