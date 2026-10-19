/* Render the whole splash into dev/shots2/t*.png at 10 fps, ready for gif.py.
   Usage: node dev/make-gif.mjs */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dev = dirname(fileURLToPath(import.meta.url));
const FPS = 10;
const TOTAL = 7700;
const times = [];
for (let t = 0; t <= TOTAL; t += Math.round(1000 / FPS)) times.push(t);

const url = "file:///" + join(dev, "boot.html").replace(/\\/g, "/");
const res = spawnSync(process.execPath, [join(dev, "shot.mjs"), url, join(dev, "shots2"),
  times.join(","), "1280", "800"], { stdio: "inherit" });
process.exit(res.status ?? 1);
