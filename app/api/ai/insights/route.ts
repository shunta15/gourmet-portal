/**
 * AI ダッシュボードインサイト
 *
 * 最近の編集状況・公開ステータス・記事タイトル傾向から、
 * AI が次やるべきことを 3〜5 個提案する。
 *
 * GET /api/ai/insights
 */
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY が未設定" }, { status: 503 });
  }

  // データ収集
  const [{ count: restaurantCount }, { count: featureCount }, { count: drafts }, { data: recent }] = await Promise.all([
    supabase.from("restaurants").select("*", { count: "exact", head: true }),
    supabase.from("feature_articles").select("*", { count: "exact", head: true }),
    supabase.from("feature_articles").select("*", { count: "exact", head: true }).eq("published", false),
    supabase
      .from("restaurants")
      .select("name, region, updated_at, published")
      .order("updated_at", { ascending: false })
      .limit(10),
  ]);

  const regionCounts: Record<string, number> = {};
  for (const r of recent ?? []) {
    regionCounts[r.region] = (regionCounts[r.region] || 0) + 1;
  }

  const client = new Anthropic({ apiKey });

  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-7",
      max_tokens: 1200,
      system: "あなたはマチノワ（machinowa.tokyo）の編集チームのアシスタント。サイトの運用データを見て、編集者が次にやるべき具体的なアクション提案を簡潔に返す。",
      messages: [
        {
          role: "user",
          content: `現在のサイト状態:
- 掲載店舗: ${restaurantCount ?? 0} 件
- 特集記事合計: ${featureCount ?? 0} 件
- 下書き特集: ${drafts ?? 0} 件
- 直近編集 10 件のリージョン分布: ${JSON.stringify(regionCounts)}
- 直近編集された店舗: ${(recent ?? [])
            .slice(0, 5)
            .map((r: any) => `${r.name}(${r.region}, ${r.published ? "公開" : "非公開"})`)
            .join(", ")}

以下の JSON 形式で 3〜5 個のアクション提案を返してください（マークダウンや前置き不要、純粋な JSON のみ）:

{"insights": [{"title": "短い見出し", "body": "具体的に何をすべきか 60〜100 字", "action": "/admin/... へのリンクパス"}, ...]}`,
        },
      ],
    });

    const text = msg.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("")
      .trim();

    let parsed: any = null;
    try {
      const m = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(m ? m[0] : text);
    } catch {
      return NextResponse.json({ error: "AI 出力 parse 失敗", raw: text }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json(
      { error: `AI 失敗: ${e?.message}` },
      { status: 500 }
    );
  }
}
