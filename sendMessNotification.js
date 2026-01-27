import fs from "fs";
import admin from "firebase-admin";

const meal = process.argv[2]; // breakfast | lunch | snacks | dinner

if (!meal) {
  console.log("❌ Meal not provided");
  process.exit(0);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    )
  });
}

const data = JSON.parse(fs.readFileSync("public/data/mess_menue.json", "utf8"));

const istDate = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
);
const today = istDate.getDate().toString();

const items = data[today]?.[meal];

if (!items || items.length === 0) {
  console.log("⏭ No menu today");
  process.exit(0);
}

const body = "• " + items.join("\n• ");

await admin.messaging().send({
  topic: "mess-alerts",
  notification: {
    title: `🍽 ${meal.toUpperCase()} in 1 hour`,
    body
  },
  webpush: {
    fcmOptions: {
      link: "https://vcampusgo.vercel.app/"  // 👈 ADD YOUR WEBSITE URL HERE
    }
  }
});

console.log(`✅ ${meal} notification sent`);
