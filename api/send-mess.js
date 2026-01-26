import fs from "fs";
import path from "path";
import admin from "firebase-admin";

// ================================
// FIREBASE INIT (UNCHANGED)
// ================================
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    )
  });
}

const db = admin.firestore();

// ================================
// API HANDLER
// ================================
export default async function handler(req, res) {
  const { meal } = req.query; // breakfast | lunch | snacks | dinner
  if (!meal) {
    return res.status(400).json({ error: "Meal not provided" });
  }

  // -------------------------------
  // IST DATE (UNCHANGED)
  // -------------------------------
  const istDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const todayDate = istDate.getDate().toString();
  const todayKey = istDate.toISOString().split("T")[0]; // YYYY-MM-DD

  console.log("⏰ AUTO RUN", { meal, todayKey });

  // -------------------------------
  // 🔐 DUPLICATE PROTECTION (NEW)
  // -------------------------------
  const docId = `${todayKey}_${meal}`;
  const docRef = db.collection("daily_notifications").doc(docId);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    console.log("⛔ Notification already sent:", docId);
    return res.json({ skipped: true, reason: "already_sent_today" });
  }

  // -------------------------------
  // LOAD MESS MENU (FIXED PATH)
  // -------------------------------
  const menuPath = path.join(process.cwd(), "data/mess_menue.json");
  const menu = JSON.parse(fs.readFileSync(menuPath, "utf8"));

  const items = menu[todayDate]?.[meal];
  if (!items) {
    return res.status(404).json({ error: "Menu not found" });
  }

  // -------------------------------
  // NOTIFICATION CONTENT
  // -------------------------------
  const titles = {
    breakfast: "🍳 Breakfast Menu",
    lunch: "🍛 Lunch Menu",
    snacks: "☕ Snacks Menu",
    dinner: "🍽 Dinner Menu"
  };

  const body = "• " + items.join("\n• ");

  // -------------------------------
  // SEND NOTIFICATION
  // -------------------------------
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

  // -------------------------------
  // MARK AS SENT (NEW)
  // -------------------------------
  await docRef.set({
    meal,
    date: todayKey,
    sentAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log("✅ Notification sent:", docId);

  return res.json({ sent: true, meal });
}
