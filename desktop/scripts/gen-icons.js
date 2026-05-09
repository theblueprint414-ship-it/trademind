#!/usr/bin/env node
/**
 * Generates TradeMind EdgeBridge icon assets:
 *   assets/icon-1024.png  → source
 *   assets/icon.icns      → macOS (via iconutil)
 *   assets/icon.ico       → Windows (via sips resize stack)
 *   assets/tray-icon.png  → 22x22 tray icon (macOS @1x)
 */
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ASSETS = path.resolve(__dirname, "../assets");
fs.mkdirSync(ASSETS, { recursive: true });

/* ── CRC32 ── */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
    t[i] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/* ── PNG writer ── */
function writePNG(file, width, height, getPixel) {
  // getPixel(x, y) → [r, g, b, a]
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const off = y * (1 + width * 4) + 1 + x * 4;
      raw[off] = r; raw[off + 1] = g; raw[off + 2] = b; raw[off + 3] = a;
    }
  }
  const idat = zlib.deflateSync(raw, { level: 6 });

  function chunk(type, data) {
    const tb = Buffer.from(type, "ascii");
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const crcb = Buffer.alloc(4); crcb.writeUInt32BE(crc32(Buffer.concat([tb, data])));
    return Buffer.concat([len, tb, data, crcb]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; // RGBA

  fs.writeFileSync(file, Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]));
  console.log(`  wrote ${path.basename(file)} (${width}×${height})`);
}

/* ── Design helpers ── */
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function dist(x1, y1, x2, y2) { return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); }

/* rounded-rect SDF */
function rrSDF(px, py, cx, cy, hw, hh, r) {
  const dx = Math.abs(px - cx) - hw + r;
  const dy = Math.abs(py - cy) - hh + r;
  return Math.min(Math.max(dx, dy), 0) + Math.sqrt(Math.max(dx, 0) ** 2 + Math.max(dy, 0) ** 2) - r;
}

/* ── Main icon 1024×1024 ── */
function makeMainIcon(size) {
  const cx = size / 2, cy = size / 2;
  const pad = size * 0.10;
  const rr = size * 0.22; // corner radius

  // Chart line waypoints (normalised 0→1)
  const pts = [
    [0.18, 0.72], [0.28, 0.62], [0.38, 0.68],
    [0.50, 0.42], [0.60, 0.52], [0.72, 0.32],
    [0.82, 0.38],
  ].map(([nx, ny]) => [nx * size, ny * size]);

  function polylineSDFNear(px, py, thickness) {
    let minD = Infinity;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      const dx = bx - ax, dy = by - ay;
      const len2 = dx * dx + dy * dy;
      const t = clamp(((px - ax) * dx + (py - ay) * dy) / len2, 0, 1);
      const nearX = ax + t * dx, nearY = ay + t * dy;
      const d = dist(px, py, nearX, nearY);
      if (d < minD) minD = d;
    }
    return minD - thickness;
  }

  // Glow dots at each waypoint
  function dotGlow(px, py) {
    let maxGlow = 0;
    for (const [wx, wy] of pts) {
      const d = dist(px, py, wx, wy);
      const g = Math.max(0, 1 - d / (size * 0.045));
      if (g > maxGlow) maxGlow = g;
    }
    return maxGlow;
  }

  return (x, y) => {
    // Background: deep dark #0F1117
    let r = 15, g = 17, b = 23, a = 255;

    // Rounded rect mask
    const sdf = rrSDF(x, y, cx, cy, cx - pad, cy - pad, rr);
    if (sdf > 2) return [0, 0, 0, 0]; // transparent outside

    // Subtle radial gradient on background (lighter at top-right)
    const gradT = clamp(((x / size) * 0.3 + (1 - y / size) * 0.7), 0, 1);
    r = Math.round(lerp(10, 28, gradT));
    g = Math.round(lerp(12, 24, gradT));
    b = Math.round(lerp(20, 42, gradT));

    // Line stroke (antialiased) — indigo #6366F1
    const lineT = size * 0.018;
    const lineD = polylineSDFNear(x, y, lineT);
    const lineAlpha = clamp(1 - lineD / 1.5, 0, 1);
    if (lineAlpha > 0) {
      // Color: gradient along X from #6366F1 → #818CF8
      const nx = clamp((x / size - 0.18) / 0.64, 0, 1);
      const lr = Math.round(lerp(99, 129, nx));
      const lg = Math.round(lerp(102, 140, nx));
      const lb = Math.round(lerp(241, 248, nx));
      r = Math.round(r * (1 - lineAlpha) + lr * lineAlpha);
      g = Math.round(g * (1 - lineAlpha) + lg * lineAlpha);
      b = Math.round(b * (1 - lineAlpha) + lb * lineAlpha);
    }

    // Dot glow
    const glow = dotGlow(x, y);
    if (glow > 0) {
      r = Math.round(clamp(r + 80 * glow, 0, 255));
      g = Math.round(clamp(g + 90 * glow, 0, 255));
      b = Math.round(clamp(b + 255 * glow * 0.8, 0, 255));
    }

    // Anti-alias the rounded rect edge
    const edgeAlpha = sdf < -1 ? 255 : Math.round(clamp(-sdf / 2, 0, 1) * 255);
    return [r, g, b, edgeAlpha];
  };
}

/* ── Tray icon 22×22 ── */
function makeTrayIcon(size) {
  return (x, y) => {
    const cx = size / 2;
    // Simple upward-trending line on transparent bg
    const pts2 = [[2, size - 4], [size * 0.35, size * 0.55], [size * 0.65, size * 0.38], [size - 2, size * 0.2]];
    let minD = Infinity;
    for (let i = 0; i < pts2.length - 1; i++) {
      const [ax, ay] = pts2[i], [bx, by] = pts2[i + 1];
      const dx = bx - ax, dy = by - ay;
      const len2 = dx * dx + dy * dy;
      const t = clamp(((x - ax) * dx + (y - ay) * dy) / len2, 0, 1);
      const d = dist(x, y, ax + t * dx, ay + t * dy);
      if (d < minD) minD = d;
    }
    const lineAlpha = clamp(1 - (minD - 1.2) / 1.2, 0, 1);
    if (lineAlpha <= 0) return [0, 0, 0, 0];
    const a = Math.round(lineAlpha * 220);
    return [255, 255, 255, a]; // white line for tray
  };
}

/* ── Generate ── */
console.log("Generating icons...");
const src = path.join(ASSETS, "icon-1024.png");
writePNG(src, 1024, 1024, makeMainIcon(1024));
writePNG(path.join(ASSETS, "tray-icon.png"), 22, 22, makeTrayIcon(22));
writePNG(path.join(ASSETS, "tray-icon@2x.png"), 44, 44, makeTrayIcon(44));

/* ── macOS icns (via iconutil) ── */
console.log("Building icon.icns...");
const iconset = path.join(ASSETS, "icon.iconset");
fs.mkdirSync(iconset, { recursive: true });
const sizes = [16, 32, 64, 128, 256, 512, 1024];
for (const s of sizes) {
  const out = path.join(iconset, `icon_${s}x${s}.png`);
  execSync(`sips -z ${s} ${s} "${src}" --out "${out}" 2>/dev/null`);
  if (s <= 512) {
    const out2x = path.join(iconset, `icon_${s}x${s}@2x.png`);
    const s2 = s * 2;
    execSync(`sips -z ${s2} ${s2} "${src}" --out "${out2x}" 2>/dev/null`);
  }
}
execSync(`iconutil -c icns "${iconset}" -o "${path.join(ASSETS, "icon.icns")}"`);
console.log("  wrote icon.icns");

/* ── Windows .ico ── */
// Build a minimal multi-resolution ICO: 256, 48, 32, 16
console.log("Building icon.ico...");
function pngToICO(pngFile, sizes) {
  const images = sizes.map((s) => {
    const tmp = path.join(ASSETS, `_tmp_${s}.png`);
    execSync(`sips -z ${s} ${s} "${src}" --out "${tmp}" 2>/dev/null`);
    const data = fs.readFileSync(tmp);
    fs.unlinkSync(tmp);
    return { size: s, data };
  });

  // ICO header
  const count = images.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: ICO
  header.writeUInt16LE(count, 4);

  const dirs = images.map(({ size, data }) => {
    const dir = Buffer.alloc(16);
    dir[0] = size >= 256 ? 0 : size; // width (0 = 256)
    dir[1] = size >= 256 ? 0 : size; // height
    dir[2] = 0; // color count
    dir[3] = 0; // reserved
    dir.writeUInt16LE(1, 4); // planes
    dir.writeUInt16LE(32, 6); // bit count
    dir.writeUInt32LE(data.length, 8);
    dir.writeUInt32LE(offset, 12);
    offset += data.length;
    return dir;
  });

  fs.writeFileSync(
    path.join(ASSETS, "icon.ico"),
    Buffer.concat([header, ...dirs, ...images.map((i) => i.data)])
  );
  console.log("  wrote icon.ico");
}
pngToICO(src, [256, 48, 32, 16]);

console.log("Done! Assets:");
fs.readdirSync(ASSETS).filter(f => !f.endsWith('.iconset') && fs.statSync(path.join(ASSETS, f)).isFile()).forEach(f => {
  const size = fs.statSync(path.join(ASSETS, f)).size;
  console.log(`  ${f} (${(size/1024).toFixed(1)} KB)`);
});