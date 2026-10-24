/**
 * automation/v2/lib/http.mjs — HTTP の取得(Node の fetch。回り込み・認証の突破はしない)
 */
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

async function get(url, { timeoutMs = 20_000, accept, referer } = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: ctl.signal,
      headers: { "User-Agent": UA, "Accept-Language": "ja,en;q=0.8", Accept: accept || "text/html,application/xhtml+xml,*/*;q=0.8", ...(referer ? { Referer: referer } : {}) },
    });
    return res;
  } finally {
    clearTimeout(t);
  }
}

/** HTML を文字で取る。文字コードは meta / ヘッダの charset を見て変換する */
export async function fetchText(url, opts = {}) {
  try {
    const res = await get(url, opts);
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const buf = Buffer.from(await res.arrayBuffer());
    const ct = res.headers.get("content-type") || "";
    if (ct && !/text|html|xml|json/i.test(ct)) return { ok: false, reason: `文字ではない(${ct})` };
    let cs = /charset=([\w-]+)/i.exec(ct)?.[1];
    if (!cs) cs = /<meta[^>]+charset=["']?([\w-]+)/i.exec(buf.subarray(0, 4096).toString("latin1"))?.[1];
    let body;
    try {
      body = new TextDecoder(cs || "utf-8", { fatal: false }).decode(buf);
    } catch {
      body = buf.toString("utf8");
    }
    return { ok: true, body, finalUrl: res.url };
  } catch (e) {
    return { ok: false, reason: e.name === "AbortError" ? "時間切れ" : String(e.message || e).slice(0, 80) };
  }
}

/** 画像などをバイトで取る */
export async function fetchBytes(url, opts = {}) {
  try {
    const res = await get(url, { accept: "image/jpeg,image/png,image/webp,image/*;q=0.8", ...opts });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const buf = Buffer.from(await res.arrayBuffer());
    return { ok: true, buf, contentType: res.headers.get("content-type") || "", finalUrl: res.url };
  } catch (e) {
    return { ok: false, reason: e.name === "AbortError" ? "時間切れ" : String(e.message || e).slice(0, 80) };
  }
}
