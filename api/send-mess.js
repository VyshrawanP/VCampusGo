import fs from "fs";
import path from "path";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    )
  });
}

export default async function handler(req, res) {
  const { meal } = req.query; // breakfast | lunch | snacks | dinner
  const today = new Date().getDate().toString();

  const menuPath = path.join(process.cwd(), "public/data/mess-menue.json");
  const menu = JSON.parse(fs.readFileSync(menuPath, "utf8"));

  const items = menu[today]?.[meal];
  if (!items) {
    return res.status(404).json({ error: "Menu not found" });
  }

  const titles = {
    breakfast: "🍳 Breakfast Menu",
    lunch: "🍛 Lunch Menu",
    snacks: "☕ Snacks Menu",
    dinner: "🍽 Dinner Menu"
  };

  const body = "• " + items.join("\n• ");

  await admin.messaging().send({
    topic: "mess-alerts",
    notification: {
      title: titles[meal],
      body
    },
    webpush: {
      fcmOptions: {
        link: "https://vcampusgo.vercel.app"
      }
    }
  });

  res.json({ sent: meal });
}
