/**
 * POST /api/machinowa/generate
 *
 * GAS（machinowa-monitor.gs）から呼ばれる記事生成エンドポイント。
 * Claude API で記事コンテンツを生成し、GitHub にコミットして Vercel デプロイを走らせる。
 *
 * body: {
 *   storeName: string   // 店舗名
 *   mapsUrl:   string   // Google Maps URL
 *   type:      'feature' | 'restaurant'
 *   rowNum:    number   // スプシの行番号
 *   secret:    string   // MACHINOWA_SECRET
 * }
 *
 * returns: { url: string }  // 生成された記事の URL
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 300; // Vercel Pro: 最大 300秒

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s　]+/g, "-")
    .replace(/[^\w\-ぁ-んァ-ン一-龯]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

// ─── 特集記事の生成プロンプト ───────────────────────────────
function buildFeaturePrompt(storeName: string, mapsUrl: string): string {
  return `
あなたはマチノワ編集部のライターです。以下の店舗情報をもとに、マチノワの特集記事を生成してください。

店舗名: ${storeName}
Google Maps URL: ${mapsUrl}

以下の TypeScript オブジェクトを生成してください。型は FeatureArticle です。
idは "teleapo-feat-${slugify(storeName)}" としてください。
5つのポイント（POINT 01〜05）を含めてください。
画像は https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80 などの飲食店向け Unsplash URL を使用してください（実際の店舗画像ではなく）。

必ず以下の形式で出力してください（コードブロックのみ）:

\`\`\`typescript
{
  id: "teleapo-feat-${slugify(storeName)}",
  no: "",
  articleType: "guide" as const,
  kicker: "STORE FEATURE",
  title: "（タイトル）",
  titleHTML: "（HTMLタイトル・emタグ使用）",
  subtitle: "（サブタイトル）",
  lede: "（リード文 200字程度）",
  date: "${new Date().toISOString().slice(0, 10)}",
  reading: "",
  author: "マチノワ編集部",
  heroImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&q=80",
  ogImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80",
  ranking: [
    {
      rank: "POINT 01", rankNum: 1,
      name: "ポイント1のタイトル",
      cuisine: "ジャンル",
      area: "エリア",
      purpose: "一行説明",
      desc: "説明文（200字程度）",
      images: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80"],
      specs: [{ k: "キー", v: "バリュー" }]
    },
    // POINT 02〜05 も同様に
  ],
  sideArticles: [],
  quote: "（締めのコメント 100字程度）",
  quoteCite: "マチノワ編集部",
  closing: "（まとめ 200字程度）",
}
\`\`\`
`;
}

// ─── 店舗紹介記事の生成プロンプト ──────────────────────────
function buildRestaurantPrompt(storeName: string, mapsUrl: string, nextId: string): string {
  return `
あなたはマチノワ編集部のライターです。以下の店舗情報をもとに、マチノワの店舗紹介データを生成してください。

店舗名: ${storeName}
Google Maps URL: ${mapsUrl}
割り当てID: ${nextId}

以下の TypeScript オブジェクトを生成してください。型は Restaurant です。

必ず以下の形式で出力してください（コードブロックのみ）:

\`\`\`typescript
{
  id: "${nextId}",
  name: "${storeName}",
  cuisine: "（業種・ジャンル）",
  region: "（tokyo/osaka/nagoya/fukuoka/kyoto/kanagawa/saitama/shizuoka/nara/hyogo/hiroshima/gunma/shiga/kagoshima/wakayama/hokkaido のいずれか）",
  area: "（市区町村）",
  address: "（住所）",
  nearestStation: "（最寄り駅）",
  walkingMinutes: 5,
  heroImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&q=80",
  images: ["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80"],
  tags: ["（タグ1）", "（タグ2）"],
  scenes: ["（シーン1）"],
  priceRange: "（¥〜¥¥¥¥）",
  hours: "（営業時間）",
  closed: "（定休日）",
  tel: "（電話番号）",
  url: "（公式URL or 空文字）",
  description: "（店舗説明 150字程度）",
  body: ["（本文1段落目）", "（本文2段落目）"],
  features: ["（特徴1）", "（特徴2）"],
  lat: 0,
  lng: 0,
}
\`\`\`
`;
}

// ─── Claude API 呼び出し ──────────────────────────────────
async function generateWithClaude(prompt: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content.find((c) => c.type === "text")?.text ?? "";
  const match = text.match(/```typescript\n([\s\S]+?)```/);
  return match?.[1]?.trim() ?? "";
}

// ─── GitHub コミット ──────────────────────────────────────
async function commitToGitHub(
  filename: string,
  content: string,
  message: string
): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const repo  = "shunta15/gourmet-portal";
  const path  = `lib/${filename}`;

  // 現在のファイル内容を取得（SHA取得のため）
  const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json" },
  });
  const getJson = await getRes.json();
  const sha = getJson.sha;

  // ファイルを更新
  await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf-8").toString("base64"),
      sha,
    }),
  });
}

// ─── 現在の最終 restaurant ID を取得 ────────────────────────
async function getNextRestaurantId(): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  const repo  = "shunta15/gourmet-portal";

  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/lib/teleapo-restaurants.ts`,
    { headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json" } }
  );
  const json = await res.json();
  const fileContent = Buffer.from(json.content, "base64").toString("utf-8");

  // 既存の id を探して最大値を取得
  const ids = [...fileContent.matchAll(/id:\s*"r(\d+)"/g)].map((m) => parseInt(m[1]));

  // data.ts 側の最終IDも考慮（CLAUDE.md によると現在 r240）
  const baseMax = 240;
  const maxId = ids.length > 0 ? Math.max(baseMax, ...ids) : baseMax;
  return `r${maxId + 1}`;
}

// ─── メインハンドラー ─────────────────────────────────────
export async function POST(req: NextRequest) {
  // Secret 検証
  const secret = process.env.MACHINOWA_GENERATE_SECRET;
  if (!secret) return NextResponse.json({ error: "Secret not configured" }, { status: 500 });

  let body: { storeName: string; mapsUrl: string; type: string; rowNum: number; secret: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.secret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { storeName, mapsUrl, type } = body;

  if (!storeName || !type) {
    return NextResponse.json({ error: "storeName and type are required" }, { status: 400 });
  }

  try {
    if (type === "feature") {
      // ── 特集記事生成 ──
      const prompt = buildFeaturePrompt(storeName, mapsUrl);
      const generated = await generateWithClaude(prompt);
      if (!generated) throw new Error("Claude returned empty content");

      const id = `teleapo-feat-${slugify(storeName)}`;

      // 既存ファイルを取得して末尾に追記
      const token = process.env.GITHUB_TOKEN;
      const repo  = "shunta15/gourmet-portal";
      const path  = "lib/teleapo-features.ts";

      const getRes  = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
        headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json" },
      });
      const getJson = await getRes.json();
      const sha     = getJson.sha;
      const current = Buffer.from(getJson.content, "base64").toString("utf-8");

      // // ↓ エージェントが自動追記 ↓ の直前に挿入
      const updated = current.replace(
        "  // ↓ エージェントが自動追記 ↓",
        `  "${id}": ${generated},\n\n  // ↓ エージェントが自動追記 ↓`
      );

      await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `feat(teleapo): 特集記事を自動生成 – ${storeName}`,
          content: Buffer.from(updated, "utf-8").toString("base64"),
          sha,
        }),
      });

      const url = `https://machinowa.tokyo/feature/${id}`;
      return NextResponse.json({ ok: true, url, id });

    } else if (type === "restaurant") {
      // ── 店舗紹介生成 ──
      const nextId  = await getNextRestaurantId();
      const prompt  = buildRestaurantPrompt(storeName, mapsUrl, nextId);
      const generated = await generateWithClaude(prompt);
      if (!generated) throw new Error("Claude returned empty content");

      const token = process.env.GITHUB_TOKEN;
      const repo  = "shunta15/gourmet-portal";
      const path  = "lib/teleapo-restaurants.ts";

      const getRes  = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
        headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json" },
      });
      const getJson = await getRes.json();
      const sha     = getJson.sha;
      const current = Buffer.from(getJson.content, "base64").toString("utf-8");

      const updated = current.replace(
        "  // ↓ エージェントが自動追記 ↓",
        `  ${generated},\n\n  // ↓ エージェントが自動追記 ↓`
      );

      await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `feat(teleapo): 店舗紹介を自動生成 – ${storeName}（${nextId}）`,
          content: Buffer.from(updated, "utf-8").toString("base64"),
          sha,
        }),
      });

      const url = `https://machinowa.tokyo/restaurant/${nextId}`;
      return NextResponse.json({ ok: true, url, id: nextId });

    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[machinowa/generate] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
