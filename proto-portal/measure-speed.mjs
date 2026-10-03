/**
 * 総合サイトの表示速度の計測（モバイル 390px・CPU 4倍遅延・Lighthouse モバイル相当のネットワーク制限）。
 *
 *   npx next start -p 3242   # 本番ビルドを起動してから
 *   node proto-portal/measure-speed.mjs [--runs 3] [--out result.json] [--pages "/,/beauty"]
 *
 * 測るもの: LCP / FCP / CLS / TBT / Long Task の合計 / 転送量（CDP の encodedDataLength の合計）。
 * - ネットワーク: 下り 1.6Mbps・上り 750Kbps・RTT 150ms（Lighthouse のモバイル既定。旧称 "Fast 3G"、現称 "Slow 4G"）
 * - CPU: 4倍遅延（CDP Emulation.setCPUThrottlingRate）
 * - 毎回まっさらなコンテキスト（キャッシュなし）。ロード後 5 秒そのまま待つ（スクロールしない）
 * - TBT は FCP 以降の Long Task の (所要時間 − 50ms) の合計（Lighthouse と同じ定義。ただし TTI では打ち切らず計測終了まで）
 * 外部のフォント・画像（Google Fonts・Wikimedia など）は本物のネットワークから取るので、回ごとに多少ぶれる。複数回の中央値を出す。
 */
import { chromium } from "playwright";
import fs from "node:fs";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i >= 0 ? process.argv[i + 1] : d;
};
const BASE = arg("base", "http://localhost:3242");
const RUNS = Number(arg("runs", "3"));
const OUT = arg("out", "");
const PAGES = arg("pages", "/,/station/kyoto/祇園四条,/beauty").split(",");

const NET = { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 };
const UA =
  "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";

const INIT = `(() => {
  window.__m = { lcp: null, lcpInfo: null, cls: 0, clsEntries: [], tasks: [], fcp: null };
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__m.lcp = e.startTime; window.__m.lcpInfo = { tag: e.element ? e.element.tagName : null, cls: e.element ? String(e.element.className).slice(0, 60) : null, url: e.url || null, size: e.size }; } }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch {}
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) { if (!e.hadRecentInput) { window.__m.cls += e.value; window.__m.clsEntries.push({ v: +e.value.toFixed(4), t: Math.round(e.startTime), src: (e.sources || []).slice(0, 2).map((s) => s.node && (s.node.nodeName + '.' + String(s.node.className).slice(0, 40))) }); } } }).observe({ type: 'layout-shift', buffered: true }); } catch {}
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.tasks.push({ s: e.startTime, d: e.duration }); }).observe({ type: 'longtask', buffered: true }); } catch {}
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') window.__m.fcp = e.startTime; }).observe({ type: 'paint', buffered: true }); } catch {}
})();`;

const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

async function once(browser, path) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA });
  const page = await ctx.newPage();
  await page.addInitScript(INIT);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", NET);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  let bytes = 0;
  let reqs = 0;
  const byType = {};
  const types = new Map();
  cdp.on("Network.responseReceived", (e) => types.set(e.requestId, e.type));
  cdp.on("Network.loadingFinished", (e) => {
    bytes += e.encodedDataLength;
    reqs++;
    const t = types.get(e.requestId) || "Other";
    byType[t] = (byType[t] || 0) + e.encodedDataLength;
  });
  const url = BASE + encodeURI(path);
  await page.goto(url, { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(5000);
  const m = await page.evaluate(() => window.__m);
  await ctx.close();
  const fcp = m.fcp ?? 0;
  const tbt = m.tasks.filter((t) => t.s + t.d > fcp).reduce((a, t) => a + Math.max(0, t.d - 50), 0);
  return {
    lcp: m.lcp,
    fcp: m.fcp,
    cls: +m.cls.toFixed(4),
    tbt: Math.round(tbt),
    longTaskTotal: Math.round(m.tasks.reduce((a, t) => a + t.d, 0)),
    longTasks: m.tasks.length,
    kb: Math.round(bytes / 1024),
    reqs,
    byTypeKb: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, Math.round(v / 1024)])),
    lcpInfo: m.lcpInfo,
    clsEntries: m.clsEntries,
  };
}

const browser = await chromium.launch();
const result = {};
for (const p of PAGES) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) runs.push(await once(browser, p));
  const g = (k) => median(runs.map((r) => r[k] ?? 0));
  result[p] = {
    lcp: Math.round(g("lcp")),
    fcp: Math.round(g("fcp")),
    cls: +g("cls").toFixed(4),
    tbt: Math.round(g("tbt")),
    longTaskTotal: Math.round(g("longTaskTotal")),
    kb: Math.round(g("kb")),
    reqs: Math.round(g("reqs")),
    runs,
  };
  const r = result[p];
  console.log(
    `${p.padEnd(28)} LCP ${(r.lcp / 1000).toFixed(2)}s  FCP ${(r.fcp / 1000).toFixed(2)}s  CLS ${r.cls}  TBT ${r.tbt}ms  LongTask計 ${r.longTaskTotal}ms  転送 ${r.kb}KB (${r.reqs}req)`,
  );
  console.log(`   LCP要素(各回): ${runs.map((x) => `${x.lcpInfo?.tag}${x.lcpInfo?.url ? "[" + x.lcpInfo.url.slice(-40) + "]" : ""}${x.lcpInfo?.cls ? "." + x.lcpInfo.cls : ""}`).join(" | ")}`);
  console.log(`   LCP(各回): ${runs.map((x) => (x.lcp / 1000).toFixed(2)).join(", ")}s   CLS(各回): ${runs.map((x) => x.cls).join(", ")}   TBT(各回): ${runs.map((x) => x.tbt).join(", ")}ms`);
}
await browser.close();
if (OUT) fs.writeFileSync(OUT, JSON.stringify(result, null, 1));
