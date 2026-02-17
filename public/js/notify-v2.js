import admin from "firebase-admin";
import fs from "fs";

const lhApp = admin.apps.find(app => app.name === "lh") || 
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_LH_SERVICE_ACCOUNT)
    )
  }, "lh");

const messaging = admin.messaging(lhApp);

export default async function handler(req, res) {
  // Security check
  const authHeader = req.headers.authorization;
  const expectedToken = `Bearer ${process.env.MESS_API_SECRET_LH}`; // Can be same or different
  
  if (!authHeader || authHeader !== expectedToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const meal = req.method === "GET" ? req.query.meal : req.body.meal;

  if (!meal || !["breakfast", "lunch", "snacks", "dinner"].includes(meal)) {
    return res.status(400).json({ error: "Invalid meal" });
  }

  try {
    // Read LH-specific menu (or same file, different key)
    const data = JSON.parse(
      fs.readFileSync("public/data/mess_menu_lh.json", "utf8") // Separate menu file
    );

    const istDate = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const today = istDate.getDate().toString();

    const items = data[today]?.[meal];

    if (!items || items.length === 0) {
      return res.status(200).json({ 
        success: false, 
        message: "No LH menu today" 
      });
    }

    const body = "• " + items.join("\n• ");

    // Send to LH only
    await messaging.send({
      topic: "mess-alerts",
      notification: {
        title: `🍽 ${meal.toUpperCase()} in 1 hour (LH)`,
        body
      },
      webpush: {
        fcmOptions: {
          link: "https://vcampusgo.vercel.app"
        }
      }
    });

    console.log(`✅ LH ${meal} notification sent`);

    return res.status(200).json({
      success: true,
      hostel: "LH",
      meal,
      items: items.length
    });

  } catch (error) {
    console.error("❌ LH Notify error:", error);
    return res.status(500).json({ error: error.message });
  }
}