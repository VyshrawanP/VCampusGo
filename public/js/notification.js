// ================================
// NOTIFICATIONS (SIMPLE & SAFE)
// ================================

const notifyBtn = document.getElementById("notifyBtn");

// 1️⃣ Ask permission when user clicks
document.getElementById("notifyBtn").addEventListener("click", () => {
  OneSignal.push(() => {
    OneSignal.showSlidedownPrompt();
  });
});

import fs from "fs";
import fetch from "node-fetch";

const meal = process.argv[2];

const data = JSON.parse(fs.readFileSync("mess_menu.json", "utf-8"));

const today = new Date();
const todayDate = today.getDate();
const todayDay = today.toLocaleDateString("en-US", { weekday: "long" });

const todayMenu = data.menu.find(
  d => d.date === todayDate && d.day === todayDay
);

if (!todayMenu || !todayMenu[meal]) {
  console.log("No menu for today");
  process.exit(0);
}

const message = todayMenu[meal].join(", ");

await fetch("https://onesignal.com/api/v1/notifications", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`
  },
  body: JSON.stringify({
    app_id: process.env.ONESIGNAL_APP_ID,
    headings: { en: `${meal.toUpperCase()} in 1 hour` },
    contents: { en: message },
    included_segments: ["Subscribed Users"]
  })
});

console.log("Notification sent");



