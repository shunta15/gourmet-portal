/**
 * Vercel Cron で毎日 sitemap.xml の更新を Google / Bing に通知
 *
 * vercel.json の crons で /api/cron/ping-search を毎日呼ぶ設定。
 * Vercel Cron からのリクエストは CRON_SECRET で認証する。
 */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SITEMAP_URL = "https://machinowa.tokyo/sitemap.xml";

const PING_TARGETS = [
  `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
  `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
];

export async function GET(req: NextRequest) {
  // Vercel Cron は Authorization: Bearer <CRON_SECRET> を付ける
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const results: { url: string; status: number | string }[] = [];
  for (const url of PING_TARGETS) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
      results.push({ url, status: r.status });
    } catch (e: any) {
      results.push({ url, status: e?.message ?? "error" });
    }
  }

  return NextResponse.json({ pingedAt: new Date().toISOString(), results });
}
