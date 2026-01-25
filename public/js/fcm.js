import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyCOGbOMT9dSe4crvK5aXqGD90bS5Rppm_4",
  projectId: "vcampusgo",
  messagingSenderId: "532012102516",
  appId: "1:532012102516:web:75aa44bf4f31cd783c3221"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const VAPID_KEY = "qA0aB2Wh2BOQNyDh2e79ayWkauvUQephqEVticsde-Q";

const notifyBtn = document.getElementById("notifyBtn");

notifyBtn.addEventListener("click", async () => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    alert("Notifications blocked");
    return;
  }

  const token = await getToken(messaging, { vapidKey: VAPID_KEY });

  if (!token) {
    alert("Failed to get token");
    return;
  }

  await fetch("/api/save-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token })
  });

  notifyBtn.innerText = "Notifications Enabled ✅";
  notifyBtn.disabled = true;
});
