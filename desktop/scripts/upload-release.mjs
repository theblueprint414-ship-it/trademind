import { put } from "@vercel/blob";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const releaseDir = join(__dirname, "../release");

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!TOKEN) { console.error("Missing BLOB_READ_WRITE_TOKEN"); process.exit(1); }

const files = [
  "EdgeBridge-1.0.0-arm64.dmg",
  "EdgeBridge-1.0.0.dmg",
];

for (const name of files) {
  const path = join(releaseDir, name);
  console.log(`Uploading ${name}...`);
  const buf = readFileSync(path);
  const blob = await put(`edgebridge/${name}`, buf, {
    access: "public",
    token: TOKEN,
    addRandomSuffix: false,
  });
  console.log(`✓ ${name}`);
  console.log(`  URL: ${blob.url}`);
}