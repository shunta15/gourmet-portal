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
// 既存の高品質特集記事 (feature-qualia-meinohama / feature-kinosha-nachikatsuura /
// feature-nishida-yao) のフォーマットを踏襲する。
function buildFeaturePrompt(storeName: string, mapsUrl: string): string {
  return `あなたはマチノワ編集部のライターです。以下の店舗情報をもとに、マチノワの「単店舗特集記事」を生成してください。

店舗名: ${storeName}
Google Maps URL: ${mapsUrl}

# 重要：マチノワの特集記事とは何か

単に店の特徴を列挙する「店舗紹介」ではありません。
「**特定のエリア・利用シーンの中に、その店を位置づけて語る**」記事です。

良い例（参考）:
- タイトル: 「姪浜デートのディナーにはKitchen&Bar Qualia。創作イタリアンと本格カクテルで過ごす、大人のための一軒をご紹介」
- lede の冒頭: 「天神や博多から地下鉄空港線でわずか15分。福岡市西区の姪浜（めいのはま）は、海と住宅街がふしぎと同居する、肩肘張らない街だ。」
- POINT 5 は必ず「利用シーンと組み合わせ方」（周辺観光・アクセス動線込み）
- closing は「黄金動線」具体タイムライン（17:30 待ち合わせ→18:30 散歩→19:00 店→21:00 バー...）

# 必須事項

1. **エリア知識を必ず使う**: Google Maps URL に含まれる地名・店舗名から場所を特定し、その街・最寄り駅・周辺観光・近隣エリアとの関係を文中に織り込むこと。例えば「天神から地下鉄で15分」「観光客が少ない地元エリア」「世界遺産○○から車で15分」など。
2. **利用シーン文脈を必ず入れる**: デート/接待/記念日/二軒目/観光/家族/ひとり、など想定される利用シーンを具体的に書く。
3. **POINT 5 は固定で「利用シーンと周辺の組み合わせ方」**: 周辺観光スポットや 1日プランへの組み込み方を書く。
4. **closing は「編集部の考える黄金動線」を時刻付きで**: 例「9:00 ○○→10:30 ××→12:30 当店→14:00 △△」のように具体的なタイムライン。
5. **タイトルは「エリア＋シーン＋店舗名＋短いキャッチ」**: 単なる店舗名+キャッチではダメ。
6. **titleHTML は 2行構成・em タグで店舗名強調**: 例「Qualia、<br>姪浜の<em>夜。</em>」
7. **編集部目線の主観・人称（編集部・私）を使い、口語的なトーン**: 「〜だ。」「〜と思う。」「〜が嬉しい。」など、AIっぽい優等生文体ではなく編集者の体温が乗った文章にする。
8. **誇張・推測は避け、わからない数値は「公式情報を確認」と書く**: 営業時間・価格・席数などの具体的事実が確定できない場合は「変動するので公式情報をご確認ください」等で逃げる。
9. **lede は 250〜400 字**、POINT の desc は **各 350〜500 字**、closing は **400〜600 字**。中身の濃い文章を書くこと。
10. **画像はすべて Unsplash の placeholder で OK**: 後で人間が差し替える前提。

# 出力形式

idは "teleapo-feat-${slugify(storeName)}" 固定。
必ず以下の TypeScript オブジェクトをコードブロックのみで出力してください:

\`\`\`typescript
{
  id: "teleapo-feat-${slugify(storeName)}",
  no: "",
  articleType: "guide" as const,
  kicker: "（店舗名のローマ字大文字。例: QUALIA MEINOHAMA）",
  title: "（エリア＋シーン＋店舗名＋短いキャッチ。30〜60字）",
  titleHTML: "（2行構成。店舗名と短いフレーズを <em></em> で強調。例: Qualia、<br>姪浜の<em>夜。</em>）",
  subtitle: "（業態 + エリア + 利用シーン示唆。40〜70字）",
  lede: "（周辺エリアからのアクセス・街の文脈→店のポジショニング→5点案内、で250〜400字。AIっぽくならず編集部目線で）",
  date: "${new Date().toISOString().slice(0, 10)}",
  reading: "",
  author: "マチノワ編集部",
  heroImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&q=80",
  ogImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80",
  ranking: [
    {
      rank: "POINT 01", rankNum: 1,
      name: "（業態・コンセプトの核心。30字以内）",
      cuisine: "（業態タグ。例: 創作イタリアン・バー）",
      area: "（エリア名。例: 姪の浜）",
      purpose: "（POINT のサブキャッチ・1〜2行）",
      desc: "（350〜500字。利用シーン文脈込み）",
      images: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80"],
      specs: [{ k: "（キー）", v: "（値）" }, { k: "（キー）", v: "（値）" }]
    },
    // POINT 02: 看板料理・商品の魅力
    // POINT 03: もう1つの強み（ドリンク・空間・接客 等）
    // POINT 04: 内装・雰囲気・店内空間
    // POINT 05: 必ず「利用シーンと周辺との組み合わせ方」（周辺観光や1日プラン込み）
  ],
  sideArticles: [],
  quote: "（編集部視点の総括コメント。150〜250字）",
  quoteCite: "マチノワ編集部",
  closing: "（編集部が考える「黄金動線」を時刻付きで具体的に。所要時間・予算・予約のアドバイスも。400〜600字）",
}
\`\`\``;
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
    max_tokens: 12000,
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
