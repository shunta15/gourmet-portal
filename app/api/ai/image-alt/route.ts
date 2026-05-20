/**
 * AI 画像 alt テキスト生成
 * Claude Vision で画像を見て、SEO/アクセシビリティ向けの alt 文を生成
 *
 * POST /api/ai/image-alt
 * body: { imageUrl: string, context?: string }
 */
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY が未設定" }, { status: 503 });
  }

  let imageUrl: string, context: string | undefined;
  try {
    const body = await req.json();
    imageUrl = body.imageUrl;
    context = body.context;
    if (typeof imageUrl !== "string" || !imageUrl.startsWith("http")) throw new Error();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // 画像取得 → base64
  let base64: string, mimeType: string;
  try {
    const r = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    mimeType = r.headers.get("content-type") || "image/jpeg";
    if (!mimeType.startsWith("image/")) {
      return NextResponse.json({ error: "画像ではない" }, { status: 400 });
    }
    const buf = await r.arrayBuffer();
    base64 = Buffer.from(buf).toString("base64");
  } catch (e: any) {
    return NextResponse.json(
      { error: `画像取得失敗: ${e?.message}` },
      { status: 400 }
    );
  }

  const client = new Anthropic({ apiKey });
  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-7",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType as any, data: base64 },
            },
            {
              type: "text",
              text: `この画像の alt 属性に入れる日本語のテキストを 30〜80 字で 1 行だけ返してください。装飾的な前置きは不要。${context ? `\n文脈: ${context}` : ""}`,
            },
          ],
        },
      ],
    });

    const alt = msg.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("")
      .trim()
      .replace(/^["「]/, "")
      .replace(/["」]$/, "");

    return NextResponse.json({ alt, usage: msg.usage });
  } catch (e: any) {
    return NextResponse.json(
      { error: `AI 失敗: ${e?.message}` },
      { status: 500 }
    );
  }
}
