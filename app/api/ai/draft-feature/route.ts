/**
 * AI Draft Feature Article API
 *
 * 店舗の URL から特集記事ドラフト（titleHTML / lede / subtitle / kicker /
 * POINT 5つ / quote / closing）を Claude に生成させる。
 *
 * Qualia / 汽ノ舎 / にし田 スタイルの編集トーンを system prompt で固定。
 *
 * POST /api/ai/draft-feature
 * body: { url: string, axis?: string }
 */
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 90;

const SYSTEM_PROMPT = `あなたはマチノワ（machinowa.tokyo）の編集ライター。日本の単店舗特集記事を書く役割。

【編集トーンガイド】
- ベースは「ですます調」
- 要所で「〜だろう」「〜が最適解」「〜の一択」「〜と思う」など断言・体言止めを混ぜる
- 「〜なんですよね」「〜あるある」など口語表現も適度に
- 「日本一」「最強」「絶対」「必ず」など根拠なき断定は禁止
- 「あなた」「みなさま」「お客様」は使わない
- 客観的な紀行文・ガイドブック調は避ける（編集部の体温を出す）

【記事構成】
- titleHTML: ヒーロー大見出し。2行構成。<br>と<em>のみ使用可。短く印象的に
  例: 「Qualia、<br>姪浜の<em>夜。</em>」
  例: 「汽ノ舎、<br>紀南の<em>新拠点。</em>」
- subtitle: 業態キーワードを並べた短い説明（30〜50字）
- lede: 180〜250字。地域文脈→店舗紹介→記事の5つのポイント宣言、で締める
- POINT 1〜5: 各 POINT は
  - name: 30字以内の見出し
  - purpose: 1行のキャッチ
  - desc: 250〜350字の本文（編集部目線で「あるある」「地味に効く」「正解だろう」等）
  - specs: { k, v } の配列（2〜3件、k は「最寄り駅」「料理」「価格」等）
- quote: 「まさに、編集部イチオシのお店です」「編集部イチオシのお店として届けたい」等で締める、2〜3文の編集部のひとこと
- closing: 「黄金動線」「編集部の結論です」等を含む、所要・予算・予約注意点まで触れた 280〜400字の編集後記`;

const TOOL_SCHEMA = {
  name: "draft_feature_article",
  description: "店舗 URL から特集記事のフルドラフトを生成",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { type: "string", description: "記事タイトル（SEO用、60〜80字）" },
      titleHTML: { type: "string", description: "ヒーロー大見出し HTML（<br>と<em>のみ）" },
      subtitle: { type: "string", description: "副題（30〜50字）" },
      kicker: { type: "string", description: "ローマ字キッカー（例: QUALIA MEINOHAMA）" },
      lede: { type: "string", description: "リード文（180〜250字）" },
      points: {
        type: "array",
        minItems: 5,
        maxItems: 5,
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "POINT 見出し（30字以内）" },
            purpose: { type: "string", description: "1行のキャッチ" },
            cuisine: { type: "string", description: "カテゴリ（例: 創作イタリアン）" },
            area: { type: "string", description: "エリア名" },
            desc: { type: "string", description: "本文 250〜350字" },
            specs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  k: { type: "string" },
                  v: { type: "string" },
                },
                required: ["k", "v"],
              },
            },
          },
          required: ["name", "purpose", "desc", "specs"],
        },
      },
      quote: { type: "string", description: "編集部のひとこと（2〜3文）" },
      closing: { type: "string", description: "編集後記（280〜400字）" },
    },
    required: ["title", "titleHTML", "subtitle", "kicker", "lede", "points", "quote", "closing"],
  },
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY が未設定です" },
      { status: 503 }
    );
  }

  let url: string;
  let axis: string | undefined;
  try {
    const body = await req.json();
    url = body.url;
    axis = body.axis;
    if (typeof url !== "string" || !url.startsWith("http")) throw new Error();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  let html = "";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MachinowaBot/1.0)",
        "Accept-Language": "ja,en;q=0.8",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `URL の取得に失敗 (HTTP ${res.status})` },
        { status: 400 }
      );
    }
    html = await res.text();
  } catch (e: any) {
    return NextResponse.json(
      { error: `URL 取得エラー: ${e?.message ?? "unknown"}` },
      { status: 400 }
    );
  }

  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 25000);

  const client = new Anthropic({ apiKey });

  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-7",
      max_tokens: 8000,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [TOOL_SCHEMA],
      tool_choice: { type: "tool", name: "draft_feature_article" },
      messages: [
        {
          role: "user",
          content: `以下のページから店舗を読み取り、特集記事フルドラフトを生成してください。${
            axis ? `\n軸: ${axis}（このシーン/利用に焦点）` : ""
          }\n出典 URL: ${url}\n\n--- ページ本文 ---\n${cleaned}`,
        },
      ],
    });

    const toolBlock = msg.content.find((b: any) => b.type === "tool_use") as any;
    if (!toolBlock) {
      return NextResponse.json({ error: "AI 抽出に失敗" }, { status: 500 });
    }

    return NextResponse.json({ data: toolBlock.input, usage: msg.usage });
  } catch (e: any) {
    console.error("[ai-draft-feature]", e);
    return NextResponse.json(
      { error: `AI 呼び出し失敗: ${e?.message ?? "unknown"}` },
      { status: 500 }
    );
  }
}
