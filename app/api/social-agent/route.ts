/**
 * Social Agent — Discord + Twitter/X automation
 *
 * No external packages required. Uses Node built-in `crypto` for both
 * Discord Ed25519 signature verification and Twitter OAuth 1.0a signing.
 *
 * REQUIRED ENV VARS (add to Vercel environment):
 *
 *   Discord:
 *     DISCORD_BOT_TOKEN       — Bot token from discord.com/developers/applications
 *     DISCORD_APPLICATION_ID  — Application ID (same page as bot token)
 *     DISCORD_PUBLIC_KEY      — Public key (General Information tab)
 *     DISCORD_GUILD_ID        — (optional) Your server ID for guild-specific commands
 *     DISCORD_TIP_CHANNEL_ID  — Channel ID for daily tips (right-click channel → Copy ID)
 *
 *   Twitter/X:
 *     TWITTER_API_KEY             — From developer.twitter.com → project → app keys
 *     TWITTER_API_SECRET          — Same location
 *     TWITTER_ACCESS_TOKEN        — Generated via OAuth 1.0a (read+write app)
 *     TWITTER_ACCESS_TOKEN_SECRET — Same location
 *
 *   Shared:
 *     CRON_SECRET — any secret string; add to Authorization header on cron calls
 *
 * SETUP STEPS:
 *
 *   Discord:
 *     1. discord.com/developers/applications → New Application → Bot → Add Bot → copy token
 *     2. Copy Application ID and Public Key from General Information
 *     3. Register slash commands once: GET /api/social-agent?action=register-commands
 *        (pass Authorization: Bearer CRON_SECRET header)
 *     4. Set Interactions Endpoint URL in developer portal:
 *        https://trademindedge.com/api/social-agent?type=discord
 *     5. Invite bot: OAuth2 → URL Generator → scopes: bot + applications.commands
 *        → bot permissions: Send Messages, Use Slash Commands
 *
 *   Twitter/X:
 *     1. Apply at developer.twitter.com → create project + app
 *     2. Enable OAuth 1.0a with Read and Write permissions
 *     3. Generate access token and secret under "Keys and Tokens"
 *     4. Add all 4 TWITTER_* env vars to Vercel
 *
 *   Vercel Cron (vercel.json):
 *     { "crons": [
 *       { "path": "/api/social-agent?action=daily-post",  "schedule": "0 9 * * 1-5" },
 *       { "path": "/api/social-agent?action=discord-tip", "schedule": "0 10 * * 1-5" }
 *     ]}
 */

import { NextRequest } from "next/server";
import { createVerify, createHmac, randomBytes } from "crypto";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Discord Ed25519 Signature Verification ────────────────────────────────────

function verifyDiscordSignature(body: string, signature: string, timestamp: string, publicKey: string): boolean {
  try {
    const verifier = createVerify("ed25519");
    verifier.update(timestamp + body);
    return verifier.verify(Buffer.from(publicKey, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}

// ─── Discord Interaction Handler ──────────────────────────────────────────────

async function handleDiscordInteraction(req: NextRequest): Promise<Response> {
  const signature = req.headers.get("x-signature-ed25519") ?? "";
  const timestamp = req.headers.get("x-signature-timestamp") ?? "";
  const body = await req.text();

  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey) return new Response("DISCORD_PUBLIC_KEY not set", { status: 503 });

  if (!verifyDiscordSignature(body, signature, timestamp, publicKey)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const interaction = JSON.parse(body);

  // ACK ping
  if (interaction.type === 1) return Response.json({ type: 1 });

  // Slash commands
  if (interaction.type === 2) {
    const commandName: string = interaction.data?.name ?? "";

    if (commandName === "checkin") {
      return Response.json({
        type: 4,
        data: {
          content: "🧠 **Ready to check in?**\nTrack your mental state before trading and get your GO / CAUTION / NO-TRADE verdict.\n\n→ https://trademindedge.com/checkin",
          flags: 64,
        },
      });
    }

    if (commandName === "coach") {
      const question: string = interaction.data?.options?.[0]?.value ?? "";
      const aiResponse = await generateCoachResponse(question);
      return Response.json({
        type: 4,
        data: {
          content: `**Alex (TradeMind AI Coach):**\n${aiResponse}\n\n*Get personalized coaching with your own data → https://trademindedge.com*`,
        },
      });
    }

    if (commandName === "tip") {
      const tip = await generateDailyTip();
      return Response.json({
        type: 4,
        data: { content: `📊 **Trading Psychology Tip:**\n${tip}` },
      });
    }

    return Response.json({ type: 4, data: { content: "Unknown command.", flags: 64 } });
  }

  return new Response("Unknown interaction type", { status: 400 });
}

// ─── AI Response Generators ───────────────────────────────────────────────────

async function generateCoachResponse(question: string): Promise<string> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    system: `You are Alex, TradeMind's AI trading psychology coach. Give short, direct answers to trader psychology questions. 2-4 sentences max. Never mention being AI. Ground answers in data and behavior, not motivation.`,
    messages: [{ role: "user", content: question }],
  });
  return msg.content[0].type === "text" ? msg.content[0].text : "I couldn't process that question right now.";
}

async function generateDailyTip(): Promise<string> {
  const TOPICS = [
    "overtrading and decision fatigue",
    "managing losses without revenge trading",
    "the role of sleep in trading performance",
    "why consistency beats high returns",
    "how FOMO affects entries",
    "position sizing and emotional tolerance",
    "the value of a pre-session mental check-in",
    "cutting losses and loss aversion neuroscience",
    "the neuroscience of trading under stress",
    "how to recover from a drawdown without making it worse",
  ];
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    system: "You are a trading psychology expert. Write a single, specific, data-grounded insight. 2-3 sentences. No fluff. Include a specific number or research finding if possible.",
    messages: [{ role: "user", content: `Write a trading psychology insight about: ${topic}` }],
  });
  return msg.content[0].type === "text" ? msg.content[0].text : "";
}

async function generateTwitterPost(): Promise<string> {
  const ANGLES = [
    "a counterintuitive insight about trading psychology with a specific statistic",
    "a specific behavioral pattern that costs traders money, with the dollar amount or percentage",
    "the neuroscience behind a common trading mistake, in plain language",
    "why most trading advice is wrong, with the correct alternative",
    "a specific pre-session habit that improves trading performance with data to back it up",
    "what professional prop firm traders do differently from retail traders",
    "the relationship between sleep quality and trading P&L",
  ];
  const angle = ANGLES[Math.floor(Math.random() * ANGLES.length)];
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 280,
    system: `You write tweets for TradeMind, a trading psychology app. Tweets: (1) lead with a specific surprising insight or number, (2) are direct and data-grounded, (3) end with a natural question or CTA. Max 240 characters. No hashtags unless they add value. Sound like a knowledgeable peer, not a brand.`,
    messages: [{ role: "user", content: `Write a tweet about: ${angle}` }],
  });
  return msg.content[0].type === "text" ? msg.content[0].text : "";
}

// ─── Twitter OAuth 1.0a Signing ───────────────────────────────────────────────

function buildOAuthHeader(method: string, url: string, apiKey: string, apiSecret: string, token: string, tokenSecret: string): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: apiKey,
    oauth_nonce: randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: token,
    oauth_version: "1.0",
  };

  const allParams = { ...oauthParams };
  const sortedParams = Object.keys(allParams).sort().map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`).join("&");
  const baseString = [method.toUpperCase(), encodeURIComponent(url), encodeURIComponent(sortedParams)].join("&");
  const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(tokenSecret)}`;
  oauthParams.oauth_signature = createHmac("sha1", signingKey).update(baseString).digest("base64");

  const headerValue = Object.keys(oauthParams).sort().map((k) => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`).join(", ");
  return `OAuth ${headerValue}`;
}

async function postTweet(text: string): Promise<{ id: string } | null> {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    console.error("Twitter credentials not configured");
    return null;
  }

  const url = "https://api.twitter.com/2/tweets";
  const authHeader = buildOAuthHeader("POST", url, apiKey, apiSecret, accessToken, accessTokenSecret);

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    console.error("Twitter post failed:", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  return data.data;
}

// ─── Discord Slash Command Registration ──────────────────────────────────────

async function registerDiscordCommands(): Promise<Response> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const appId = process.env.DISCORD_APPLICATION_ID;
  if (!token || !appId) return Response.json({ error: "DISCORD_BOT_TOKEN or DISCORD_APPLICATION_ID not set" }, { status: 503 });

  const commands = [
    { name: "checkin", description: "Get your TradeMind check-in link — track mental state before trading" },
    { name: "coach", description: "Ask TradeMind's AI coach a trading psychology question", options: [{ name: "question", description: "Your question", type: 3, required: true }] },
    { name: "tip", description: "Get a trading psychology insight from TradeMind" },
  ];

  const url = process.env.DISCORD_GUILD_ID
    ? `https://discord.com/api/v10/applications/${appId}/guilds/${process.env.DISCORD_GUILD_ID}/commands`
    : `https://discord.com/api/v10/applications/${appId}/commands`;

  const res = await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });

  return Response.json({ ok: res.ok, commands: await res.json() });
}

// ─── Main Route Handler ───────────────────────────────────────────────────────

function requireCron(req: NextRequest): boolean {
  return req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: NextRequest): Promise<Response> {
  const action = new URL(request.url).searchParams.get("action");

  if (action === "register-commands") {
    if (!requireCron(request)) return new Response("Unauthorized", { status: 401 });
    return registerDiscordCommands();
  }

  if (action === "daily-post") {
    if (!requireCron(request)) return new Response("Unauthorized", { status: 401 });
    const text = await generateTwitterPost();
    const result = await postTweet(text);
    return Response.json({ ok: !!result, text, tweetId: result?.id });
  }

  if (action === "discord-tip") {
    if (!requireCron(request)) return new Response("Unauthorized", { status: 401 });
    const token = process.env.DISCORD_BOT_TOKEN;
    const channelId = process.env.DISCORD_TIP_CHANNEL_ID;
    if (!token || !channelId) return Response.json({ error: "DISCORD_BOT_TOKEN or DISCORD_TIP_CHANNEL_ID not set" }, { status: 503 });

    const tip = await generateDailyTip();
    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ content: `📊 **Daily Trading Psychology Tip:**\n\n${tip}\n\n*Track your mental state daily → https://trademindedge.com*` }),
    });
    return Response.json({ ok: res.ok });
  }

  return Response.json({ status: "social-agent running. Use ?action=register-commands|daily-post|discord-tip or POST ?type=discord for interactions." });
}

export async function POST(request: NextRequest): Promise<Response> {
  const type = new URL(request.url).searchParams.get("type");
  if (type === "discord") return handleDiscordInteraction(request);
  return new Response("Unknown type", { status: 400 });
}