#!/usr/bin/env node
/**
 * LemonSqueezy one-time setup script.
 * Usage: LEMONSQUEEZY_API_KEY=your_key node scripts/setup-lemonsqueezy.mjs
 *
 * What it does:
 *  1. Reads your store ID automatically
 *  2. Lists all products/variants so you can find your price variant ID
 *  3. Creates the webhook automatically (events: subscription_created/updated/cancelled/paused/resumed)
 *  4. Prints the exact env vars to copy into Vercel
 */

const API_KEY = process.env.LEMONSQUEEZY_API_KEY;
if (!API_KEY) {
  console.error("❌  Set LEMONSQUEEZY_API_KEY before running this script.");
  process.exit(1);
}

const BASE = "https://api.lemonsqueezy.com/v1";
const headers = {
  Authorization: `Bearer ${API_KEY}`,
  Accept: "application/vnd.api+json",
  "Content-Type": "application/vnd.api+json",
};

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GET ${path} → ${res.status}: ${err}`);
  }
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`POST ${path} → ${res.status}: ${err}`);
  }
  return res.json();
}

async function main() {
  console.log("\n🍋  LemonSqueezy Setup\n");

  // ── 1. Get store ──────────────────────────────────────────────────────────
  const storesRes = await get("/stores");
  const store = storesRes.data?.[0];
  if (!store) { console.error("❌  No store found. Create a store first at app.lemonsqueezy.com"); process.exit(1); }
  const storeId = store.id;
  const storeName = store.attributes.name;
  console.log(`✅  Store: "${storeName}" (ID: ${storeId})`);

  // ── 2. List products & variants ───────────────────────────────────────────
  const productsRes = await get(`/products?filter[store_id]=${storeId}&include=variants`);
  const products = productsRes.data ?? [];

  if (products.length === 0) {
    console.log("\n⚠️   No products found.");
    console.log("    → Go to app.lemonsqueezy.com → Products → Add product");
    console.log("      Name: TradeMind | Price: $39/month | 7-day free trial\n");
  } else {
    console.log("\n📦  Products & Variants:\n");
    const variants = productsRes.included?.filter(i => i.type === "variants") ?? [];
    for (const p of products) {
      console.log(`  Product: "${p.attributes.name}" (ID: ${p.id})`);
      const pVariants = variants.filter(v => v.relationships?.product?.data?.id === p.id);
      for (const v of pVariants) {
        const price = (v.attributes.price / 100).toFixed(2);
        const interval = v.attributes.interval ?? "one-time";
        const trial = v.attributes.trial_ends_at ? ` · ${v.attributes.trial_period_days}-day trial` : "";
        console.log(`    Variant ID: ${v.id}  →  $${price}/${interval}${trial}  [${v.attributes.name}]`);
      }
    }
  }

  // ── 3. Create or reuse webhook ────────────────────────────────────────────
  console.log("\n🔗  Checking existing webhooks…");
  const webhooksRes = await get(`/webhooks?filter[store_id]=${storeId}`);
  const existingWebhooks = webhooksRes.data ?? [];
  const webhookUrl = "https://trademindedge.com/api/lemonsqueezy/webhook";
  const existing = existingWebhooks.find(w => w.attributes.url === webhookUrl);

  let webhookSecret;
  if (existing) {
    console.log(`✅  Webhook already exists (ID: ${existing.id})`);
    console.log("    ⚠️  Signing secret was shown only once at creation — check your records or delete & recreate.");
    webhookSecret = "<check your existing LEMONSQUEEZY_WEBHOOK_SECRET>";
  } else {
    // Generate a random secret
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    const webhookBody = {
      data: {
        type: "webhooks",
        attributes: {
          url: webhookUrl,
          events: [
            "subscription_created",
            "subscription_updated",
            "subscription_cancelled",
            "subscription_paused",
            "subscription_unpaused",
            "subscription_resumed",
            "subscription_expired",
          ],
          secret,
        },
        relationships: {
          store: { data: { type: "stores", id: String(storeId) } },
        },
      },
    };

    const webhookRes = await post("/webhooks", webhookBody);
    const webhookId = webhookRes.data?.id;
    webhookSecret = secret;
    console.log(`✅  Webhook created (ID: ${webhookId})`);
    console.log(`    URL: ${webhookUrl}`);
  }

  // ── 4. Print env vars ─────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(60));
  console.log("📋  Add these to Vercel Environment Variables:\n");
  console.log(`LEMONSQUEEZY_API_KEY=${API_KEY}`);
  console.log(`LEMONSQUEEZY_STORE_ID=${storeId}`);
  console.log(`LEMONSQUEEZY_VARIANT_ID=<paste Variant ID from above>`);
  console.log(`LEMONSQUEEZY_WEBHOOK_SECRET=${webhookSecret}`);
  console.log("─".repeat(60) + "\n");
}

main().catch(err => { console.error("\n❌ ", err.message); process.exit(1); });