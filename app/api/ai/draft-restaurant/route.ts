/**
 * AI Draft Restaurant API
 *
 * 食べログ・ぐるなび・公式サイトなどの URL を受け取って、
 * Claude API でページを読み解き、店舗フォームに入れる構造化データを返す。
 *
 * 認証: Supabase Auth でログイン済みユーザーのみ
 * 環境変数: ANTHROPIC_API_KEY 必須（Vercel に設定）
 *
 * POST /api/ai/draft-restaurant
 * body: { url: string }
 * response: {
 *   name, cuisine, area, region, address, hours, closed, seats,
 *   nearest, phone, budget, rating, desc, highlights, tags,
 *   source_label, source_url
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const REGIONS = [
  "tokyo", "osaka", "kyoto", "nagoya", "fukuoka", "hyogo",
  "kanagawa", "saitama", "nara", "hiroshima", "shiga",
  "gunma", "kagoshima", "wakayama", "hokkaido", "shizuoka",
];

const SYSTEM_PROMPT = `あなたはマチノワ（machinowa.tokyo）の編集アシスタント。日本の飲食店情報を構造化データに抽出する役割。

ユーザーから渡された Web ページ（食べログ・ぐるなび・公式サイトなど）を読み、以下のルールで店舗データを返してください:
- 事実情報のみ抽出（誇張・推測禁止）
- 「日本一」「絶対」など根拠なき断定表現は使わない
- desc は 60〜140 字程度で店の特徴を客観的にまとめる
- highlights は 3 点、各 1 行で看板メニュー・特徴を箇条書き
- tags は「シーン」キーワード（例: デート / 一人ご飯 / 接待 / 記念日 / ランチ）から該当を選ぶ
- 不明な項目は空文字 "" を返す（推測しない）
- region は次のいずれか: ${REGIONS.join(", ")}`;

const TOOL_SCHEMA = {
  name: "extract_restaurant",
  description: "ページから飲食店の構造化データを抽出する",
  input_schema: {
    type: "object" as const,
    properties: {
      name: { type: "string", description: "店舗名" },
      cuisine: { type: "string", description: "料理ジャンル（例: 創作イタリアン・バー）" },
      area: { type: "string", description: "エリア名（例: 姪の浜・心斎橋）" },
      region: {
        type: "string",
        enum: REGIONS,
        description: "リージョン（都道府県的なくくり）",
      },
      address: { type: "string", description: "正式住所" },
      hours: { type: "string", description: "営業時間" },
      closed: { type: "string", description: "定休日" },
      seats: { type: "string", description: "席数" },
      nearest: { type: "string", description: "最寄り駅と徒歩時間" },
      phone: { type: "string", description: "電話番号（あれば）" },
      budget: { type: "string", description: "予算（例: ¥4,000〜¥8,000）" },
      rating: { type: "string", description: "評価スコア（食べログ等にあれば）" },
      desc: { type: "string", description: "60-140字の店の説明" },
      highlights: {
        type: "array",
        items: { type: "string" },
        description: "3点の看板メニュー・特徴（各1行）",
      },
      tags: {
        type: "array",
        items: { type: "string" },
        description: "利用シーンタグ（例: デート / 一人ご飯 / 接待）",
      },
      source_label: { type: "string", description: "出典ラベル（例: 公式サイト / 食べログ）" },
      source_url: { type: "string", description: "出典 URL（基本は入力 URL を入れる）" },
    },
    required: ["name", "region", "desc"],
  },
};

export async function POST(req: NextRequest) {
  // 認証チェック
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // API key チェック
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY が未設定です。Vercel の環境変数に追加してください。" },
      { status: 503 }
    );
  }

  // body parse
  let url: string;
  try {
    const body = await req.json();
    url = body?.url;
    if (typeof url !== "string" || !url.startsWith("http")) {
      throw new Error("invalid url");
    }
  } catch {
    return NextResponse.json({ error: "Invalid body. {url} required." }, { status: 400 });
  }

  // URL fetch
  let html = "";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MachinowaBot/1.0; +https://machinowa.tokyo)",
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

  // HTML を text-ish に絞り込み（script/style除去、空白圧縮）
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 25000); // Claude に送る上限

  // Claude API 呼び出し
  const client = new Anthropic({ apiKey });

  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-7",
      max_tokens: 2048,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [TOOL_SCHEMA],
      tool_choice: { type: "tool", name: "extract_restaurant" },
      messages: [
        {
          role: "user",
          content: `以下のページから店舗データを抽出してください。\n出典 URL: ${url}\n\n--- ページ本文（HTML タグ除去）---\n${cleaned}`,
        },
      ],
    });

    // tool_use ブロックから結果取り出し
    const toolBlock = msg.content.find((b: any) => b.type === "tool_use") as any;
    if (!toolBlock) {
      return NextResponse.json({ error: "AI 抽出に失敗しました" }, { status: 500 });
    }

    const data = toolBlock.input ?? {};
    // source_url が空ならフォールバック
    if (!data.source_url) data.source_url = url;

    return NextResponse.json({
      data,
      usage: msg.usage,
    });
  } catch (e: any) {
    console.error("[ai-draft] claude error:", e);
    return NextResponse.json(
      { error: `AI 呼び出し失敗: ${e?.message ?? "unknown"}` },
      { status: 500 }
    );
  }
}
