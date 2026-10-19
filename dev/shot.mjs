/* Deterministic frame capture through the DevTools protocol.
   Usage: node shot.mjs <url-without-query> <dir> <t1,t2,...> [width] [height] */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const [base, outDir, times, W = "1280", H = "800"] = process.argv.slice(2);
const port = process.env.CDP_PORT || "9333";
mkdirSync(outDir, { recursive: true });

const versionUrl = `http://127.0.0.1:${port}/json/version`;
let info;
for (let i = 0; i < 60; i++) {
  try { info = await (await fetch(versionUrl)).json(); break; } catch { await new Promise(r => setTimeout(r, 250)); }
}
if (!info) throw new Error("cdp endpoint not reachable");
const ws = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let id = 0;
const pending = new Map();
const listeners = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { res, rej } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
  } else if (msg.method) {
    for (const cb of listeners.get(msg.method) || []) cb(msg.params);
  }
};
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const msgId = ++id;
  pending.set(msgId, { res, rej });
  ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
});
const once = (method) => new Promise((res) => {
  const arr = listeners.get(method) || [];
  const cb = (p) => { listeners.set(method, arr.filter(x => x !== cb)); res(p); };
  arr.push(cb); listeners.set(method, arr);
});

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);
await send("Emulation.setDeviceMetricsOverride",
  { width: Number(W), height: Number(H), deviceScaleFactor: 1, mobile: false }, sessionId);

for (const t of times.split(",").map(Number)) {
  const url = `${base}?t=${t}`;
  const loaded = once("Page.loadEventFired");
  await send("Page.navigate", { url }, sessionId);
  await loaded;
  await new Promise(r => setTimeout(r, Number(process.env.WAIT_MS || 350)));
  if (process.env.EVAL) {
    const ev = await send("Runtime.evaluate", { expression: process.env.EVAL, returnByValue: true }, sessionId);
    console.log("EVAL:", JSON.stringify(ev.result && ev.result.value));
  }
  const shot = await send("Page.captureScreenshot", { format: "png", fromSurface: true }, sessionId);
  const path = join(outDir, `t${t}.png`);
  writeFileSync(path, Buffer.from(shot.data, "base64"));
  console.log(path);
}
await send("Target.closeTarget", { targetId });
ws.close();
