import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyCOGbOMT9dSe4crvK5aXqGD90bS5Rppm_4",
  projectId: "vcampusgo",
  messagingSenderId: "532012102516",
  appId: "1:532012102516:web:75aa44bf4f31cd783c3221",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

document.getElementById("notifyBtn").addEventListener("click", async () => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.log("Notification permission denied");
    return;
  }

  console.log("VAPID KEY:", window.VAPID_KEY);

  const token = await getToken(messaging, {
    vapidKey: window.VAPID_KEY,
  });

  console.log("FCM TOKEN:", token);
});
