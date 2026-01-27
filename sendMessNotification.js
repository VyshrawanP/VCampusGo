import admin from "firebase-admin";
import fs from "fs";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    )
  });
}

export default async function handler(req, res) {
  // ✅ SECURITY CHECK: Verify Authorization Header
  const authHeader = req.headers.authorization;
  const expectedToken = `Bearer ${process.env.MESS_API_SECRET}`;
  
  if (!authHeader || authHeader !== expectedToken) {
    console.log("❌ Unauthorized access attempt");
    return res.status(401).json({ 
      error: "Unauthorized",
      message: "Invalid or missing API token" 
    });
  }

  // ✅ Support both GET (for GitHub Actions) and POST (for manual use)
  const meal = req.method === "GET" ? req.query.meal : req.body.meal;

  // If it's a manual POST with title/message (your original functionality)
  if (req.method === "POST" && req.body.title && req.body.message) {
    const { title, message, link } = req.body;

    await admin.messaging().send({
      topic: "mess-alerts",
      notification: {
        title,
        body: message
      },
      webpush: {
        fcmOptions: {
          link: link || "https://vcampusgo.vercel.app"
        }
      }
    });

    return res.json({ sent: true, type: "custom" });
  }

  // ✅ Handle meal-based notifications (for GitHub Actions)
  if (!meal || !['breakfast', 'lunch', 'snacks', 'dinner'].includes(meal)) {
    return res.status(400).json({ 
      error: "Invalid meal type",
      message: "Meal must be: breakfast, lunch, snacks, or dinner" 
    });
  }

  try {
    // Read menu data
    const data = JSON.parse(
      fs.readFileSync("public/data/mess_menue.json", "utf8")
    );

    const istDate = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const today = istDate.getDate().toString();

    const items = data[today]?.[meal];

    if (!items || items.length === 0) {
      console.log("⏭ No menu today for", meal);
      return res.status(200).json({ 
        success: false,
        message: "No menu available for today" 
      });
    }

    const body = "• " + items.join("\n• ");

    // Send notification
    await admin.messaging().send({
      topic: "mess-alerts",
      notification: {
        title: `🍽 ${meal.toUpperCase()} in 1 hour`,
        body
      },
      webpush: {
        fcmOptions: {
          link: "https://vcampusgo.vercel.app"
        }
      }
    });

    console.log(`✅ ${meal} notification sent`);

    // Optional: Log to Firestore
    const db = admin.firestore();
    await db.collection("notification_logs").add({
      meal: meal,
      title: `🍽 ${meal.toUpperCase()} in 1 hour`,
      body: body,
      items: items,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      date: istDate.toISOString().split('T')[0],
      status: "sent"
    });

    return res.status(200).json({ 
      success: true,
      meal: meal,
      itemsSent: items.length,
      message: "Notification sent successfully",
      type: "meal"
    });

  } catch (error) {
    console.error("❌ Error sending notification:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
}