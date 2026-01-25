import admin from "firebase-admin";
import menu from "../data/mess_menue.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export default async function handler(req, res) {
  const { token, time } = req.body;

  const message = {
    token,
    notification: {
      title: "Mess Menu Update",
      body: menu[time],
    },
  };

  await admin.messaging().send(message);
  res.status(200).json({ success: true });
}
