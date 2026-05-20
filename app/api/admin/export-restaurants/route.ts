/**
 * 店舗データを CSV としてエクスポート
 * 認証ユーザーのみ
 *
 * GET /api/admin/export-restaurants?region=tokyo  (filter optional)
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function csvEscape(v: any): string {
  if (v == null) return "";
  const s = Array.isArray(v) ? v.join(" | ") : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const COLUMNS: { key: string; label: string }[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "店舗名" },
  { key: "cuisine", label: "ジャンル" },
  { key: "region", label: "リージョン" },
  { key: "area", label: "エリア" },
  { key: "address", label: "住所" },
  { key: "phone", label: "電話" },
  { key: "hours", label: "営業時間" },
  { key: "closed", label: "定休日" },
  { key: "nearest", label: "最寄り駅" },
  { key: "seats", label: "席数" },
  { key: "budget", label: "予算" },
  { key: "rating", label: "評価" },
  { key: "reservation_url", label: "予約URL" },
  { key: "source_label", label: "出典名" },
  { key: "source_url", label: "出典URL" },
  { key: "tags", label: "タグ" },
  { key: "highlights", label: "ハイライト" },
  { key: "desc", label: "短文説明" },
  { key: "published", label: "公開中" },
  { key: "updated_at", label: "最終更新" },
];

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const region = url.searchParams.get("region") ?? "";

  let query = supabase
    .from("restaurants")
    .select("*")
    .order("id")
    .limit(10000);
  if (region) query = query.eq("region", region);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = COLUMNS.map((c) => csvEscape(c.label)).join(",");
  const rows = (data ?? []).map((r: any) =>
    COLUMNS.map((c) => csvEscape(r[c.key])).join(",")
  );
  // BOM + Excel が日本語を正しく開けるように
  const body = "﻿" + [header, ...rows].join("\r\n");

  const fname = `machinowa_restaurants${region ? `_${region}` : ""}_${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fname}"`,
    },
  });
}
