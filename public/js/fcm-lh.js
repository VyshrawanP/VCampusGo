import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js";

// 🔥 GIRLS FIREBASE CONFIG (New Project)
const firebaseConfig = {
  apiKey: "AIzaSyC43qLiPw-3nqGOHCTCVCihGJfH2y0-X-I",
  projectId: "vcampusgo-lh",
  messagingSenderId: "85291708068",
  appId: "1:85291708068:web:4c751969329e76b29d4031",
};

const VAPID_KEY_LH = "BMMoFSPbuzx_nxrJCjTTcgauL2YkE1RFx0MgALF_YwL-bbIaIlmZe3SpjsIjOCMuehLynDorgFgbo22cJs7y78A"; // Web Push cert from girls project

const app = initializeApp(firebaseConfig, "lh-app"); // Named app
const messaging = getMessaging(app);

document.getElementById("notifyBtn-lh")?.addEventListener("click", async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Please allow notifications!");
      return;
    }

    const token = await getToken(messaging, { vapidKey: VAPID_KEY_LH });
    console.log("LH Token:", token);

    // Send to LH-specific endpoint
    const res = await fetch("/api/subscribe-lh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (res.ok) {
      alert("✅ Subscribed to LH notifications!");
    } else {
      alert("❌ Failed to subscribe");
    }

  } catch (err) {
    console.error("LH FCM error:", err);
    alert("Error: " + err.message);
  }
});