document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("notifyBtn");

  console.log("firebase notification.js loaded");

  btn.addEventListener("click", async () => {
    console.log("button clicked");

    // 1️⃣ Ask browser permission
    const permission = await Notification.requestPermission();
    console.log("permission:", permission);

    if (permission !== "granted") {
      console.log("User denied notifications");
      return;
    }

    // 2️⃣ Get FCM token (this is where your VAPID error happens)
    const { getToken } = await import("firebase/messaging");
    const { messaging } = await import("./firebase-messaging"); // adjust path

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY, // or process.env if bundled
    });

    console.log("FCM TOKEN:", token);
  });
});
