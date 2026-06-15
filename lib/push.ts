import webpush from "web-push";
import { db } from "./db";

let vapidReady = false;

function ensureVapid() {
  if (vapidReady) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || "mailto:support@trademindedge.com",
    pub,
    priv
  );
  vapidReady = true;
  return true;
}

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string }
): Promise<number> {
  if (!ensureVapid()) return 0;
  const subs = await db.pushSubscription.findMany({ where: { userId } });
  if (!subs.length) return 0;

  let sent = 0;
  const dead: string[] = [];

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title: payload.title, body: payload.body, url: payload.url ?? "/checkin" })
      );
      sent++;
    } catch (err: unknown) {
      const status = (err as { statusCode?: number })?.statusCode;
      if (status === 410 || status === 404) dead.push(sub.id);
    }
  }

  // Clean up expired subscriptions
  if (dead.length) {
    await db.pushSubscription.deleteMany({ where: { id: { in: dead } } });
  }

  return sent;
}