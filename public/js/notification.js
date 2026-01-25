// ================================
// NOTIFICATIONS (SIMPLE & SAFE)
// ================================

const notifyBtn = document.getElementById("notifyBtn");

// 1️⃣ Ask permission when user clicks
notifyBtn.addEventListener("click", async () => {
  if (!("serviceWorker" in navigator)) {
    alert("Service workers not supported");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    alert("Notifications denied");
    return;
  }

  alert("Meal notifications enabled ✅");
});

// 2️⃣ Morning notification logic
function sendMorningNotification() {
  navigator.serviceWorker.ready.then(reg => {
    reg.showNotification("🌅 Good Morning", {
      body: "Breakfast will be available soon",
    });
  });
}

// 3️⃣ Time check (6:30 AM)
function checkMorningNotification() {
  const now = new Date();
  const isAfterMorning =
    now.getHours() > 6 ||
    (now.getHours() === 6 && now.getMinutes() >= 30);

  const today = now.toDateString();
  const alreadySent = localStorage.getItem("morningSent") === today;

  if (isAfterMorning && !alreadySent) {
    sendMorningNotification();
    localStorage.setItem("morningSent", today);
  }
}

// 4️⃣ Run check on page load
checkMorningNotification();

// ================================
// DEBUG (THIS IS WHAT YOU ASKED)
// ================================

window.testMorning = () => {
  sendMorningNotification();
};
