/**
 * Vercel Cron で毎日 sitemap.xml を IndexNow で検索エンジンに通知
 *
 * Google/Bing の旧 /ping エンドポイントは2023年に廃止。
 * IndexNow API (https://api.indexnow.org) を使用して URL インデックス更新を通知。
 * vercel.json の crons で /api/cron/ping-search を毎日呼ぶ設定。
 * Vercel Cron からのリクエストは CRON_SECRET で認証する。
 */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SITEMAP_URL = "https://machinowa.tokyo/sitemap.xml";
const INDEXNOW_KEY = "162afc58bccd7cd84571c9e5637e3f74";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export async function GET(req: NextRequest) {
  // Vercel Cron は Authorization: Bearer <CRON_SECRET> を付ける
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Fetch sitemap
    const sitemapRes = await fetch(SITEMAP_URL, {
      signal: AbortSignal.timeout(10000),
    });
    if (!sitemapRes.ok) {
      return NextResponse.json(
        { error: `Failed to fetch sitemap: ${sitemapRes.status}` },
        { status: 500 }
      );
    }

    const sitemapText = await sitemapRes.text();

    // Extract all <loc> URLs
    const locPattern = /<loc>([^<]+)<\/loc>/g;
    const urls: string[] = [];
    let match: RegExpExecArray | null;
    // eslint-disable-next-line no-cond-assign
    while ((match = locPattern.exec(sitemapText)) !== null) {
      urls.push(match[1]);
    }

    if (urls.length === 0) {
      return NextResponse.json({ error: "No URLs found in sitemap" }, { status: 400 });
    }

    // Submit to IndexNow in batches (max 10,000 per request)
    const batchSize = 10000;
    const batches = [];
    for (let i = 0; i < urls.length; i += batchSize) {
      batches.push(urls.slice(i, i + batchSize));
    }

    const results = [];
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const payload = {
        host: "machinowa.tokyo",
        key: INDEXNOW_KEY,
        keyLocation: "https://machinowa.tokyo/162afc58bccd7cd84571c9e5637e3f74.txt",
        urlList: batch,
      };

      try {
        const indexRes = await fetch(INDEXNOW_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000),
        });

        results.push({
          batch: i + 1,
          urlCount: batch.length,
          status: indexRes.status,
        });
      } catch (e: any) {
        results.push({
          batch: i + 1,
          urlCount: batch.length,
          error: e?.message ?? "error",
        });
      }
    }

    return NextResponse.json({
      indexNowNotified: true,
      totalUrls: urls.length,
      batches: results,
      submittedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error("[ping-search] error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
