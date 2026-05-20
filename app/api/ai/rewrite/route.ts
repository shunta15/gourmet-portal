/**
 * AI Rewrite API
 *
 * 既存の文章を編集トーンガイド準拠 / 短縮 / 拡張 / トーン調整 などに書き直す。
 *
 * POST /api/ai/rewrite
 * body: { text, mode: "tone-editorial" | "shorter" | "expand" | "casual" | "formal", context? }
 */
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODE_INSTRUCTIONS: Record<string, string> = {
  "tone-editorial":
    "マチノワ編集トーン（ですます調ベース + 要所で「〜だろう」「〜が最適解」等の断言・体言止め）に書き直して。「あなた」「みなさま」「日本一」「絶対」は禁止。",
  shorter: "意味は保ったまま、3〜4割短くまとめて。冗長な表現を削る。",
  expand: "情報を保ったまま、編集部視点（「あるある」「地味に効く」等）を加えて 5〜7割長く展開して。",
  casual: "より口語的・親しみのある表現に書き直して。「〜なんですよね」「〜あるあるだ」等。",
  formal: "丁寧で落ち着いた書き味に統一。断言は避け、敬語ベース。",
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY が未設定" }, { status: 503 });
  }

  let text: string, mode: string, context: string | undefined;
  try {
    const body = await req.json();
    text = body.text;
    mode = body.mode || "tone-editorial";
    context = body.context;
    if (typeof text !== "string" || text.trim().length < 3) throw new Error();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const instruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS["tone-editorial"];

  const client = new Anthropic({ apiKey });

  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-7",
      max_tokens: 2000,
      system: `あなたはマチノワ（machinowa.tokyo）の編集ライター。マチノワの編集トーンガイドを熟知。`,
      messages: [
        {
          role: "user",
          content: `${instruction}${context ? `\n\n[文脈]: ${context}` : ""}\n\n[元の文章]\n${text}\n\n書き直した文章のみを返してください（前置きや説明は不要、本文のみ）。`,
        },
      ],
    });

    const out = msg.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n")
      .trim();

    return NextResponse.json({ text: out, usage: msg.usage });
  } catch (e: any) {
    return NextResponse.json(
      { error: `AI 呼び出し失敗: ${e?.message ?? "unknown"}` },
      { status: 500 }
    );
  }
}
