export default async function handler(req, res) {
  const now = new Date().toISOString();

  console.log("✅ CRON TEST HIT AT:", now);

  return res.status(200).json({
    ok: true,
    message: "Cron test ran successfully",
    time: now
  });
}
