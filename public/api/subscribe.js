let subscriptions = [];

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  subscriptions.push(req.body);
  res.status(201).json({ success: true });
}

export { subscriptions };
