document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("notifyBtn");

  console.log("notification.js loaded");

  btn.addEventListener("click", async () => {
    console.log("button clicked");

    const permission = await OneSignal.getNotificationPermission();
    console.log("current permission:", permission);

    OneSignal.showNativePrompt();
  });
});
