import fs from "fs";
import fetch from "node-fetch";

const meal = process.argv[2];

const data = JSON.parse(fs.readFileSync("mess_menu.json", "utf-8"));

const today = new Date();
const todayDate = today.getDate();

let todayEntry = data[String(todayDate)];

// Handle "Repeat Day X"
if (typeof todayEntry === "string") {
  const match = todayEntry.match(/\d+/);
  if (match) {
    todayEntry = data[match[0]];
  }
}

if (!todayEntry || !todayEntry[meal]) {
  console.log("No menu for today");
  process.exit(0);
}

const message = todayEntry[meal].join(", ");

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
