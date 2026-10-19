// Extract brand vector paths from DeepSeek Harness shipped SVGs into a JS module.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..", "..");
const FAVICON = path.join(ROOT, ".dsh-tmp/boot3/dsh/node_modules/@deepseek-ai/dsh-web-frontend/dist/favicon.svg");
const BRAND = path.join(ROOT, ".dsh-tmp/boot2/renderer/assets/welcome-brand.svg");
const OUT = path.join(import.meta.dirname, "logo-data.js");

const fav = fs.readFileSync(FAVICON, "utf8");
const brand = fs.readFileSync(BRAND, "utf8");

const favPaths = [...fav.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
const brandPaths = [...brand.matchAll(/<path\s+d="([^"]+)"/g)].map((m) => m[1]);
const rect = brand.match(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" rx="([\d.]+)"/);

if (favPaths.length !== 1) throw new Error("favicon paths: " + favPaths.length);
if (brandPaths.length !== 17) throw new Error("brand paths: " + brandPaths.length);

// logo data ------------------------------------------------------------------
const whale = favPaths[0];                       // 50x50 app-icon whale (detailed)
const whaleWordmark = brandPaths[9];             // flat wordmark whale, coords x145-168
const deepseek = brandPaths.slice(0, 9);         // d e e p s e e l k (by absolute x)
const harness = brandPaths.slice(10, 17);        // H A R N E S S
const pill = { x: +rect[1], y: +rect[2], w: +rect[3], h: +rect[4], rx: +rect[5] };

const body = `// AUTO-GENERATED from DeepSeek Harness shipped brand artwork.
// favicon.svg (app icon whale) + renderer/assets/welcome-brand.svg (wordmark).
// Both files ship inside the DeepSeek Harness desktop application; vector data only.
window.__DSH_BOOT_LOGO__ = ${JSON.stringify({ whale, whaleWordmark, deepseek, harness, pill }, null, 0)};
`;
fs.writeFileSync(OUT, body);
console.log("wrote", OUT, "deepseek glyphs", deepseek.length, "harness glyphs", harness.length, "pill", JSON.stringify(pill));
