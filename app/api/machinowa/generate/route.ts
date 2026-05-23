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

// ─── Google Maps URL から GBP（Google Business Profile）情報を取得 ─
// 短縮URL/cid URL を解決し、店舗名・住所・座標・ジャンル等を抽出する。
// 取得できなければ null。Claude のハルシネーション防止のため必須。
async function fetchPlaceInfo(mapsUrl: string): Promise<{
  name: string;
  address: string;
  lat: string;
  lng: string;
  category: string;
  description: string;
  url: string;
} | null> {
  if (!mapsUrl) return null;
  try {
    // リダイレクト追跡（短縮URL / cid URL 両対応）
    const res = await fetch(mapsUrl, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MachinowaBot/1.0)" },
    });
    const finalUrl = res.url;
    const html = await res.text();

    // URL から店舗名と座標を抽出
    let name = "";
    let lat = "";
    let lng = "";
    const placeMatch = finalUrl.match(/\/maps\/place\/([^/@]+)/);
    if (placeMatch) {
      name = decodeURIComponent(placeMatch[1]).replace(/\+/g, " ");
    }
    const coordMatch = finalUrl.match(/@([-\d.]+),([-\d.]+)/);
    if (coordMatch) {
      lat = coordMatch[1];
      lng = coordMatch[2];
    }

    // cid URL の場合は URL に lat/lng が無い → HTML から抽出を試みる
    // Maps の HTML には APP_INITIALIZATION_STATE 等に座標が埋め込まれている
    if (!lat || !lng) {
      // パターン: ;,LAT,LNG] / [null,null,LAT,LNG / "LAT,LNG" 等
      const htmlCoord =
        html.match(/\\?"latLng\\?":\s*\{?\\?"latitude\\?":\s*([-\d.]+),\s*\\?"longitude\\?":\s*([-\d.]+)/) ??
        html.match(/null,\s*null,\s*([-\d.]+),\s*([-\d.]+)\]/) ??
        html.match(/center=([-\d.]+)%2C([-\d.]+)/);
      if (htmlCoord) {
        lat = htmlCoord[1];
        lng = htmlCoord[2];
      }
    }

    // HTML の og:title / og:description / その他から情報抽出
    const ogTitle =
      html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/)?.[1] ??
      html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:title"/)?.[1] ?? "";
    const ogDesc =
      html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/)?.[1] ??
      html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:description"/)?.[1] ?? "";

    // og:title 例: "ルーラル - Google マップ"
    if (!name && ogTitle) name = ogTitle.replace(/\s*-\s*Google\s*マップ.*$/i, "").trim();

    // og:description は住所や評価が入る
    let address = "";
    let category = "";
    if (ogDesc) {
      // 「★4.5・カフェ・〒596-0845 大阪府岸和田市…」のような構造
      const addrMatch = ogDesc.match(/〒?\d{3}-?\d{4}\s*[^・\n]+/);
      if (addrMatch) address = addrMatch[0].trim();
      const catMatch = ogDesc.match(/・([^・〒\d★]+?)・/);
      if (catMatch) category = catMatch[1].trim();
    }

    // HTML本文から住所を補完（〒xxx-xxxx 形式）
    if (!address) {
      const addrInBody = html.match(/〒\d{3}-?\d{4}\s*[^"<>\n]{5,80}/);
      if (addrInBody) address = addrInBody[0].trim();
    }

    // 住所がまだ取れない＆座標がある → Nominatim (OSM) で reverse geocoding
    if (!address && lat && lng) {
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ja&zoom=18`,
          { headers: { "User-Agent": "MachinowaBot/1.0 (linkateinc315@link8.info)" } }
        );
        if (geoRes.ok) {
          const geo = await geoRes.json();
          if (geo.display_name) {
            // display_name 例: "1643, 阿間河滝町, 岸和田市, 大阪府, 596-0845, 日本"
            // 日本語表記なのでそのまま使う
            address = geo.display_name.replace(/, 日本$/, "").trim();
            if (geo.address) {
              const parts = [
                geo.address.state || geo.address.province || "",
                geo.address.city || geo.address.town || geo.address.county || "",
                geo.address.suburb || geo.address.neighbourhood || "",
                geo.address.road || "",
              ].filter(Boolean);
              if (parts.length > 0) address = parts.join("");
            }
          }
        }
      } catch (e) {
        console.warn("[Nominatim] failed:", e);
      }
    }

    return { name, address, lat, lng, category, description: ogDesc, url: finalUrl };
  } catch (e) {
    console.warn("[fetchPlaceInfo] failed:", e);
    return null;
  }
}

// ─── 特集記事の生成プロンプト ───────────────────────────────
// 既存の高品質特集記事 (feature-qualia-meinohama / feature-kinosha-nachikatsuura /
// feature-nishida-yao) のフォーマットを踏襲する。
function buildFeaturePrompt(
  storeName: string,
  mapsUrl: string,
  gbp: Awaited<ReturnType<typeof fetchPlaceInfo>>
): string {
  // GBP（Google Business Profile）情報がない場合はエリア推測禁止を強く伝える
  const gbpBlock = gbp
    ? `【Google Business Profile（GBP）から取得した一次情報 — これを必ず根拠にする】
店舗名: ${gbp.name || storeName}
住所: ${gbp.address || "（取得失敗：座標から推定すること）"}
緯度経度: ${gbp.lat}, ${gbp.lng}
業種カテゴリ: ${gbp.category || "（取得失敗）"}
Google詳細: ${gbp.description || "（取得失敗）"}
最終URL: ${gbp.url}`
    : `【⚠️ GBP取得失敗】Maps URLが解決できなかった。エリア・住所・業種を推測で書くことは禁止。
記事には具体的エリア名・最寄り駅・観光情報を入れず、抽象的な記述に留めること。`;

  return `あなたはマチノワ編集部のライターです。以下の店舗情報をもとに、マチノワの「単店舗特集記事」を生成してください。

店舗名: ${storeName}
Google Maps URL: ${mapsUrl}

${gbpBlock}

# ⚠️ 最重要：場所・業種の推測は絶対禁止
GBP情報が示す住所・緯度経度・カテゴリのみを根拠にしてください。
店舗名から「○○なら××エリア」と推測することは絶対禁止です（例：「ルーラル」→「ルーラル＝rural＝郊外」→「福岡の郊外」のような連想は虚偽の温床）。
緯度経度から実際の都道府県・市区町村・最寄り駅を割り出し、そのエリアの文脈で書くこと。
GBPが取れていない場合は、エリア固有の情報を含めず抽象的に書くこと。


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
9. **lede は 250〜400 字**、POINT の desc は **各 350〜500 字**、closing は **400〜600 字**。quote は **80〜140 字に厳守**（長く語らない）。subtitle は **20〜35 字に厳守**。
10. **画像は固定 placeholder のみ使用**（Claude が独自に画像URLを選ぶことは絶対禁止）。配置パターン:
    - heroImage: \`/restaurants/_placeholder/feature-hero.jpg\`（必ず）
    - ogImage: \`/restaurants/_placeholder/feature-og.jpg\`（必ず）
    - POINT 1, 2 の images: \`["/restaurants/_placeholder/feature-point.jpg"]\`（placeholder入れる）
    - POINT 3, 4, 5 の images: \`[]\`（空配列にする。画像なしレイアウトで OK）
11. **【絶対厳守】文中で何かを引用・強調するときは半角ダブルクォート \`"\` を絶対に使わない**。TypeScript 構文エラーになる。代わりに日本語の \`「」\` を使うこと。例: \`「サードウェーブ系」\` ○ / \`"サードウェーブ系"\` ✗

# 出力形式

idは "${storeName}" 固定（店舗名そのまま。teleapo-feat- プレフィックスは付けない）。
必ず以下の TypeScript オブジェクトをコードブロックのみで出力してください:

\`\`\`typescript
{
  id: "${storeName}",
  no: "",
  articleType: "guide" as const,
  kicker: "（店舗名のローマ字大文字。例: QUALIA MEINOHAMA）",
  title: "（エリア＋シーン＋店舗名＋短いキャッチ。30〜60字）",
  titleHTML: "（2行構成。店舗名と短いフレーズを <em></em> で強調。例: Qualia、<br>姪浜の<em>夜。</em>）",
  subtitle: "（30〜45字。**店舗固有の具体的特徴**を入れる。\"バー｜博多｜デート\" のような業種カテゴリ列挙テンプレートは禁止。例: \"昼はスペシャルティコーヒー、夜はクラフトビール。志免の住宅街にある二面性の店\" のように、その店だけの個性が伝わる短いキャッチ。末尾の \"。\" は付けない）",
  lede: "（周辺エリアからのアクセス・街の文脈→店のポジショニング→5点案内、で250〜400字。AIっぽくならず編集部目線で）",
  date: "${new Date().toISOString().slice(0, 10)}",
  reading: "",
  author: "マチノワ編集部",
  heroImage: "/restaurants/_placeholder/feature-hero.jpg",
  ogImage: "/restaurants/_placeholder/feature-og.jpg",
  ranking: [
    {
      rank: "POINT 01", rankNum: 1,
      name: "（業態・コンセプトの核心。30字以内）",
      cuisine: "（業態タグ。例: 創作イタリアン・バー）",
      area: "（エリア名。例: 姪の浜）",
      purpose: "（POINT のサブキャッチ・1〜2行）",
      desc: "（350〜500字。利用シーン文脈込み）",
      images: ["/restaurants/_placeholder/feature-point.jpg"],
      specs: [{ k: "（キー）", v: "（値）" }, { k: "（キー）", v: "（値）" }]
    },
    // POINT 02: 看板料理・商品の魅力
    // POINT 03: もう1つの強み（ドリンク・空間・接客 等）
    // POINT 04: 内装・雰囲気・店内空間
    // POINT 05: 必ず「利用シーンと周辺との組み合わせ方」（周辺観光や1日プラン込み）
  ],
  sideArticles: [],
  quote: "（編集部視点の総括コメント。80〜140字に厳守。短く印象的に）",
  quoteCite: "マチノワ編集部",
  closing: "（編集部が考える「黄金動線」を時刻付きで具体的に。所要時間・予算・予約のアドバイスも。400〜600字）",
}
\`\`\``;
}

// ─── 店舗紹介記事の生成プロンプト ──────────────────────────
function buildRestaurantPrompt(
  storeName: string,
  mapsUrl: string,
  nextId: string,
  gbp: Awaited<ReturnType<typeof fetchPlaceInfo>>
): string {
  const gbpBlock = gbp
    ? `【GBP情報】
名前: ${gbp.name || storeName}
住所: ${gbp.address}
緯度経度: ${gbp.lat}, ${gbp.lng}
業種: ${gbp.category}
詳細: ${gbp.description}`
    : `【⚠️ GBP取得失敗】エリア・住所・業種を推測しないこと`;

  return `
あなたはマチノワ編集部のライターです。以下の店舗情報をもとに、マチノワの店舗紹介データを生成してください。

店舗名: ${storeName}
Google Maps URL: ${mapsUrl}
割り当てID: ${nextId}

${gbpBlock}

# ⚠️ 最重要
GBP の住所・緯度経度から実際の都道府県・市区町村を割り出し、それを root にデータを書くこと。
店舗名から場所を推測することは絶対禁止。


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

  let body: {
    storeName: string;
    mapsUrl: string;
    type: string;
    rowNum: number;
    secret: string;
    gbpOverride?: {
      name?: string;
      address?: string;
      lat?: string;
      lng?: string;
      category?: string;
      description?: string;
      url?: string;
    };
  };
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

  // GBP（Google Business Profile）情報を取得（必須・ハルシネーション防止）
  // body.gbpOverride が指定された場合は API 取得をスキップして手動値を使う
  let gbp: Awaited<ReturnType<typeof fetchPlaceInfo>>;
  if (body.gbpOverride) {
    gbp = {
      name: body.gbpOverride.name || storeName,
      address: body.gbpOverride.address || "",
      lat: body.gbpOverride.lat || "",
      lng: body.gbpOverride.lng || "",
      category: body.gbpOverride.category || "",
      description: body.gbpOverride.description || "",
      url: body.gbpOverride.url || mapsUrl,
    };
    console.log(`[generate] GBP override: ${gbp.name} / ${gbp.address}`);
  } else {
    gbp = await fetchPlaceInfo(mapsUrl);
    if (!gbp) {
      console.warn(`[generate] GBP取得失敗: ${storeName} (${mapsUrl})`);
    } else {
      console.log(`[generate] GBP: ${gbp.name} / ${gbp.address} / ${gbp.lat},${gbp.lng}`);
    }
  }

  try {
    if (type === "feature") {
      // ── 特集記事生成 ──
      const prompt = buildFeaturePrompt(storeName, mapsUrl, gbp);
      const generated = await generateWithClaude(prompt);
      if (!generated) throw new Error("Claude returned empty content");

      const id = storeName;

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
      const prompt  = buildRestaurantPrompt(storeName, mapsUrl, nextId, gbp);
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
