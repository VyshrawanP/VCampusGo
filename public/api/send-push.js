import webpush from "web-push";
import fs from "fs";
import path from "path";
import { subscriptions } from "./subscribe.js";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

function getTodayMenu(meal) {
  const filePath = path.join(process.cwd(), "mess_menu.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const today = new Date();
  const todayDate = today.getDate();
  const todayDay = today.toLocaleDateString("en-US", { weekday: "long" });

  const todayMenu = data.menu.find(
    d => d.date === todayDate && d.day === todayDay
  );

  if (!todayMenu) return null;
  return todayMenu[meal]?.join(", ") || "Menu not available";
}

export default async function handler(req, res) {
  const meal = req.query.meal;
  if (!meal) return res.status(400).end();

  const menuText = getTodayMenu(meal);
  if (!menuText) return res.json({ skipped: true });

  const payload = JSON.stringify({
    title: `${meal.toUpperCase()} in 1 hour`,
    body: menuText
  });

  await Promise.all(
    subscriptions.map(sub =>
      webpush.sendNotification(sub, payload).catch(() => {})
    )
  );

  res.json({ sent: true });
}
