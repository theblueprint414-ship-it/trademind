import { put } from "@vercel/blob";
import { readFileSync } from "fs";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!TOKEN) { console.error("Missing BLOB_READ_WRITE_TOKEN"); process.exit(1); }

const exePath = "/tmp/edgebridge-win/EdgeBridge Setup 1.0.0.exe";
const buf = readFileSync(exePath);
console.log("Uploading EdgeBridge Setup 1.0.0.exe...");
const blob = await put("edgebridge/EdgeBridge-Setup-1.0.0.exe", buf, {
  access: "public",
  token: TOKEN,
  addRandomSuffix: false,
});
console.log("✓ EXE URL:", blob.url);

const yml = readFileSync("/tmp/edgebridge-win/latest.yml", "utf8");
console.log("\nlatest.yml content:");
console.log(yml);