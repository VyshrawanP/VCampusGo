import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    )
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { title, message, link } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: "title and message required" });
  }

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

  res.json({ sent: true });
}
