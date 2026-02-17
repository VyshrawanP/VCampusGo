import admin from "firebase-admin";

// Initialize LH Firebase (separate from MH)
const lhApp = admin.apps.find(a => a.name === "lh") || 
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_LH_SERVICE_ACCOUNT)
    )
  }, "lh");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: "Token required" });
  }

  try {
    // Subscribe to LH topic
    await admin.messaging(lhApp).subscribeToTopic(token, "mess-alerts");
    
    console.log(`✅ LH Subscribed: ${token.slice(-20)}`);
    
    return res.json({ 
      success: true, 
      hostel: "LH",
      topic: "mess-alerts"
    });
  } catch (error) {
    console.error("❌ LH Subscribe error:", error);
    return res.status(500).json({ error: error.message });
  }
}