document.addEventListener("DOMContentLoaded", () => {
  const notifyBtn = document.getElementById("notifyBtn");

  if (!notifyBtn) return;

  notifyBtn.addEventListener("click", () => {
    if (!window.OneSignal) {
      alert("Notification service not ready. Try again.");
      return;
    }

    OneSignal.push(() => {
      OneSignal.showSlidedownPrompt();
    });
  });
});
