/**
 * Creates a clipboard+pen icon as .ico and .png using only Node.js built-ins.
 * Run: node scripts/create-icon.js
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// ─── CRC32 for PNG chunks ────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf, start, end) {
  let c = 0xffffffff;
  for (let i = start; i < end; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.allocUnsafe(4);
  len.writeUInt32BE(data.length);
  const payload = Buffer.concat([t, data]);
  const crc = Buffer.allocUnsafe(4);
  crc.writeUInt32BE(crc32(payload, 0, payload.length));
  return Buffer.concat([len, payload, crc]);
}

// ─── PNG encoder ─────────────────────────────────────────────────────────────
function buildPNG(pixels, w, h) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = ihdr[11] = ihdr[12] = 0;

  // Scanlines with filter-none byte
  const raw = Buffer.allocUnsafe(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0;
    for (let x = 0; x < w; x++) {
      const s = (y * w + x) * 4;
      const d = y * (1 + w * 4) + 1 + x * 4;
      raw[d] = pixels[s]; raw[d+1] = pixels[s+1];
      raw[d+2] = pixels[s+2]; raw[d+3] = pixels[s+3];
    }
  }

  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, pngChunk('IHDR', ihdr), pngChunk('IDAT', idat), pngChunk('IEND', Buffer.alloc(0))]);
}

// ─── Wrap PNG in ICO ─────────────────────────────────────────────────────────
function buildICO(pngBuf) {
  const header = Buffer.allocUnsafe(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = icon
  header.writeUInt16LE(1, 4); // count = 1

  const entry = Buffer.allocUnsafe(16);
  entry[0] = 0; entry[1] = 0; // width/height 0 = 256
  entry[2] = 0; entry[3] = 0; // colorCount, reserved
  entry.writeUInt16LE(1, 4);  // planes
  entry.writeUInt16LE(32, 6); // bitCount
  entry.writeUInt32LE(pngBuf.length, 8);
  entry.writeUInt32LE(22, 12); // image data offset (6 + 16)

  return Buffer.concat([header, entry, pngBuf]);
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────
const SIZE = 256;
const pix = new Uint8Array(SIZE * SIZE * 4); // RGBA, all transparent

function setP(x, y, r, g, b, a = 255) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
  const i = (y * SIZE + x) * 4;
  const fa = a / 255, ia = 1 - fa;
  pix[i]   = Math.round(r * fa + pix[i]   * ia);
  pix[i+1] = Math.round(g * fa + pix[i+1] * ia);
  pix[i+2] = Math.round(b * fa + pix[i+2] * ia);
  pix[i+3] = Math.min(255, pix[i+3] + a);
}

function fillRect(x1, y1, x2, y2, r, g, b, a = 255) {
  for (let y = Math.ceil(y1); y <= Math.floor(y2); y++)
    for (let x = Math.ceil(x1); x <= Math.floor(x2); x++)
      setP(x, y, r, g, b, a);
}

function fillCircle(cx, cy, rad, r, g, b, a = 255) {
  for (let y = cy - rad; y <= cy + rad; y++)
    for (let x = cx - rad; x <= cx + rad; x++)
      if ((x-cx)**2 + (y-cy)**2 <= rad**2) setP(x, y, r, g, b, a);
}

function fillRoundRect(x1, y1, x2, y2, rad, r, g, b, a = 255) {
  fillRect(x1 + rad, y1, x2 - rad, y2, r, g, b, a);
  fillRect(x1, y1 + rad, x2, y2 - rad, r, g, b, a);
  fillCircle(x1 + rad, y1 + rad, rad, r, g, b, a);
  fillCircle(x2 - rad, y1 + rad, rad, r, g, b, a);
  fillCircle(x1 + rad, y2 - rad, rad, r, g, b, a);
  fillCircle(x2 - rad, y2 - rad, rad, r, g, b, a);
}

function strokeRoundRect(x1, y1, x2, y2, rad, sw, r, g, b) {
  for (let t = 0; t < sw; t++)
    fillRoundRect(x1+t, y1+t, x2-t, y2-t, Math.max(1, rad-t), r, g, b, t === 0 ? 255 : 120);
}

function line(x1, y1, x2, y2, r, g, b, thick = 1) {
  const dx = x2 - x1, dy = y2 - y1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let i = 0; i <= steps; i++) {
    const x = x1 + dx * i / steps, y = y1 + dy * i / steps;
    for (let ty = -Math.floor(thick/2); ty <= Math.floor(thick/2); ty++)
      for (let tx = -Math.floor(thick/2); tx <= Math.floor(thick/2); tx++)
        setP(x + tx, y + ty, r, g, b);
  }
}

// ─── Draw the icon ────────────────────────────────────────────────────────────
const S = SIZE;

// Background: teal rounded square
fillRoundRect(0, 0, S-1, S-1, 36, 32, 140, 160);

// Clipboard shadow
fillRoundRect(38, 52, S-28, S-18, 10, 0, 0, 0, 40);

// Clipboard body (white)
fillRoundRect(32, 46, S-34, S-24, 10, 255, 255, 255);

// Clip housing (darker teal bar at top)
fillRoundRect(S/2 - 30, 26, S/2 + 30, 66, 8, 20, 110, 130);

// Clip opening (hole in clip housing)
fillRoundRect(S/2 - 16, 20, S/2 + 16, 48, 6, 32, 140, 160);

// Border on clipboard
strokeRoundRect(32, 46, S-34, S-24, 10, 3, 20, 80, 90);

// Horizontal lines (text placeholders)
const lx1 = 50, lx2 = S - 50;
fillRect(lx1, 88,  lx2,      94,  180, 210, 215);
fillRect(lx1, 108, lx2,      114, 180, 210, 215);
fillRect(lx1, 128, lx2 - 30, 134, 180, 210, 215);

// ── Pencil / pen in bottom-right ──────────────────────────────────────────────
// Pencil runs diagonally from bottom-right toward upper-left
// We draw in segments: tip → wood → body → ferrule → eraser

const PX1 = S - 38, PY1 = S - 38;  // tip end
const PX2 = PX1 - 72, PY2 = PY1 - 72; // eraser end
const PW = 10; // half-width of pencil

// perpendicular direction (for width)
const len = Math.sqrt((PX2-PX1)**2 + (PY2-PY1)**2);
const nx = -(PY2 - PY1) / len; // normal x
const ny =  (PX2 - PX1) / len; // normal y

function pencilSegment(t0, t1, r, g, b) {
  for (let t = t0; t <= t1; t += 0.5) {
    const ratio = t / len;
    const cx = PX1 + (PX2 - PX1) * ratio;
    const cy = PY1 + (PY2 - PY1) * ratio;
    const hw = t < 12 ? (t / 12) * PW : PW; // taper at tip
    for (let w = -hw; w <= hw; w++) {
      setP(cx + nx * w, cy + ny * w, r, g, b);
    }
  }
}

pencilSegment(0,  10, 100, 100, 100); // graphite tip (dark)
pencilSegment(10, 22, 210, 175, 120); // wood sharpened section
pencilSegment(22, 85, 240, 190,  50); // yellow body
pencilSegment(85, 92, 160, 160, 165); // silver ferrule
pencilSegment(92, len, 230,  80,  80); // pink eraser

// Pencil outline
line(PX1, PY1, PX2, PY2, 40, 40, 40, 1);

// ─── Output ───────────────────────────────────────────────────────────────────
const png = buildPNG(pix, SIZE, SIZE);
const ico = buildICO(png);

const publicDir = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(publicDir, 'icon.ico'), ico);
fs.writeFileSync(path.join(publicDir, 'icon.png'), png);
console.log('Icon written to public/icon.ico and public/icon.png');
