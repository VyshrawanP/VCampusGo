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

const db = admin.firestore();

export default async function handler(req, res) {
  const { meal } = req.query; // breakfast | lunch | snacks | dinner
  const istDate = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
);
const today = istDate.getDate().toString();

  const docId = `${todayKey}_${meal}`;
  const docRef = db.collection("daily_notifications").doc(docId);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    console.log("⛔ Notification already sent:", docId);
    return res.json({ skipped: true, reason: "already_sent_today" });
  }


  const menuPath = path.join(process.cwd(), "public/data/mess_menue.json");
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



await docRef.set({
    meal,
    date: todayKey,
    sentAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log("✅ Notification sent:", docId);

  return res.json({ sent: true, meal });

  res.json({ sent: meal });
}

