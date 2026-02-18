import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyCOGbOMT9dSe4crvK5aXqGD90bS5Rppm_4",
  authDomain: "vcampusgo.firebaseapp.com",
  projectId: "vcampusgo",
  storageBucket: "vcampusgo.firebasestorage.app",
  messagingSenderId: "532012102516",
  appId: "1:532012102516:web:75aa44bf4f31cd783c3221",
  measurementId: "G-ZS6HZLVNJD"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

document.getElementById("notifyBtnMH").addEventListener("click", async () => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const token = await getToken(messaging, {
    vapidKey: "qA0aB2Wh2BOQNyDh2e79ayWkauvUQephqEVticsde-Q"
  });

  console.log("FCM TOKEN:", token);
});
