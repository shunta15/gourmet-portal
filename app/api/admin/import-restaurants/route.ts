/**
 * 店舗 CSV インポート API
 * POST /api/admin/import-restaurants
 * body: { csv: string, dryRun?: boolean }
 *
 * カラム: ID, 店舗名, ジャンル, リージョン, エリア, 住所, 電話, 営業時間,
 *         定休日, 最寄り駅, 席数, 予算, 評価, 予約URL, 出典名, 出典URL,
 *         タグ, ハイライト, 短文説明, 公開中
 *
 * 認証ユーザーのみ。dryRun=true で検証のみ（実際の DB 書き込みなし）
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Row = Record<string, string>;

function parseCSV(csv: string): Row[] {
  // 簡易 RFC4180 風パーサー（"…" でクォート、"" でエスケープ）
  const text = csv.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const rows: string[][] = [];
  let cur: string[] = [];
  let cell = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else inQ = false;
      } else {
        cell += c;
      }
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { cur.push(cell); cell = ""; }
      else if (c === "\n") { cur.push(cell); rows.push(cur); cur = []; cell = ""; }
      else cell += c;
    }
  }
  if (cell !== "" || cur.length > 0) { cur.push(cell); rows.push(cur); }

  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).filter((r) => r.some((c) => c.trim() !== "")).map((r) => {
    const obj: Row = {};
    for (let i = 0; i < headers.length; i++) obj[headers[i]] = (r[i] ?? "").trim();
    return obj;
  });
}

const COLMAP: Record<string, string> = {
  "ID": "id",
  "店舗名": "name",
  "ジャンル": "cuisine",
  "リージョン": "region",
  "エリア": "area",
  "住所": "address",
  "電話": "phone",
  "営業時間": "hours",
  "定休日": "closed",
  "最寄り駅": "nearest",
  "席数": "seats",
  "予算": "budget",
  "評価": "rating",
  "予約URL": "reservation_url",
  "出典名": "source_label",
  "出典URL": "source_url",
  "タグ": "tags",
  "ハイライト": "highlights",
  "短文説明": "desc",
  "公開中": "published",
};

function mapRow(row: Row): any {
  const out: any = {};
  for (const [jp, en] of Object.entries(COLMAP)) {
    const v = row[jp];
    if (v === undefined) continue;
    if (en === "tags" || en === "highlights") {
      out[en] = v ? v.split(/\s*\|\s*/).filter(Boolean) : [];
    } else if (en === "published") {
      out[en] = !["false", "0", "no", "非公開", ""].includes(v.toLowerCase());
    } else if (["phone", "budget", "rating", "reservation_url", "source_label", "source_url"].includes(en)) {
      out[en] = v || null;
    } else {
      out[en] = v;
    }
  }
  return out;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let csv: string;
  let dryRun = false;
  try {
    const body = await req.json();
    csv = body.csv;
    dryRun = !!body.dryRun;
    if (typeof csv !== "string" || csv.length < 10) throw new Error("invalid csv");
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const rows = parseCSV(csv);
  if (rows.length === 0) {
    return NextResponse.json({ error: "CSV に行が見つかりません" }, { status: 400 });
  }

  const issues: { line: number; id: string; msg: string }[] = [];
  const payload: any[] = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const m = mapRow(r);
    if (!m.id) {
      issues.push({ line: i + 2, id: "(空)", msg: "ID が空" });
      continue;
    }
    if (!m.name) {
      issues.push({ line: i + 2, id: m.id, msg: "店舗名が空" });
      continue;
    }
    if (!m.region) {
      issues.push({ line: i + 2, id: m.id, msg: "リージョンが空" });
      continue;
    }
    payload.push(m);
  }

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      ok: payload.length,
      issues,
      preview: payload.slice(0, 3),
    });
  }

  if (payload.length === 0) {
    return NextResponse.json({ error: "有効な行がありません", issues }, { status: 400 });
  }

  // 一括 upsert（50件ずつ）
  let upserted = 0;
  for (let i = 0; i < payload.length; i += 50) {
    const batch = payload.slice(i, i + 50);
    const { error } = await supabase
      .from("restaurants")
      .upsert(batch, { onConflict: "id" });
    if (error) {
      return NextResponse.json(
        { error: `バッチ ${i} で失敗: ${error.message}`, upserted, issues },
        { status: 500 }
      );
    }
    upserted += batch.length;
  }

  return NextResponse.json({ upserted, issues });
}
