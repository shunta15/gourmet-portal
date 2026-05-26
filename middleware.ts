import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { DELETED_FEATURE_IDS } from "@/lib/deletedFeatureIds";

// 旧 teleapo-feat-* ID → 新 ID（店舗名のみ）リダイレクトマップ。
// URL 命名規約変更（2026-05-24）に伴い、過去に公開した URL を 301 で新 URL に救済する。
const TELEAPO_FEAT_REDIRECTS: Record<string, string> = {
  "teleapo-feat-ルラル": "ルーラル",
  "teleapo-feat-あんばい-食楽厨房": "あんばい食楽厨房",
  "teleapo-feat-炭やよつ葉": "炭やよつ葉",
  "teleapo-feat-owl営業時間状況で変わります": "OWL",
  "teleapo-feat-久留米-和洋創作酒場-晩餐-bansun-": "晩餐-Bansun",
  "teleapo-feat-炭火家本舗-なんばや": "炭火家本舗なんばや",
};

// スペース含む旧 ID → 新 ID（スペース除去）リダイレクトマップ。
// 2026-05-27: URL にスペース（%20）を含むとクリック時に途中で切れて
// 500 になる事例があったため、ID 自体からスペースを除去した。
const SPACE_ID_REDIRECTS: Record<string, string> = {
  "あそび割烹 賢太朗": "あそび割烹賢太朗",
  "小梟 シャオシャオ": "小梟シャオシャオ",
  "焼肉ホルモン 牛に恋したブタ野郎": "焼肉ホルモン牛に恋したブタ野郎",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 旧 teleapo-feat-* URL → 新 URL に 301 リダイレクト
  const teleapoMatch = pathname.match(/^\/feature\/(teleapo-feat-[^/]+)\/?$/);
  if (teleapoMatch) {
    const oldId = decodeURIComponent(teleapoMatch[1]);
    const newId = TELEAPO_FEAT_REDIRECTS[oldId];
    if (newId) {
      const url = request.nextUrl.clone();
      url.pathname = `/feature/${encodeURIComponent(newId)}`;
      return NextResponse.redirect(url, 301);
    }
  }

  // スペース含む旧 ID → 新 ID（スペース除去）に 301 リダイレクト
  const featureGenericMatch = pathname.match(/^\/feature\/([^/]+)\/?$/);
  if (featureGenericMatch) {
    const decoded = decodeURIComponent(featureGenericMatch[1]);
    const newId = SPACE_ID_REDIRECTS[decoded];
    if (newId) {
      const url = request.nextUrl.clone();
      url.pathname = `/feature/${encodeURIComponent(newId)}`;
      return NextResponse.redirect(url, 301);
    }
  }

  // 削除済み特集記事 (294件) → /feature にリダイレクト (301 Permanent)
  // 404 を返すと Google から「死に URL」扱いされ、関連性のあった
  // 検索流入を失う。301 で /feature に集約することで、リンクジュースを
  // 保ちつつ、ユーザーを類似コンテンツに誘導する。
  const featureMatch = pathname.match(/^\/feature\/([a-z0-9-]+)\/?$/);
  if (featureMatch && DELETED_FEATURE_IDS.has(featureMatch[1])) {
    const url = request.nextUrl.clone();
    url.pathname = "/feature";
    return NextResponse.redirect(url, 301);
  }

  // /admin/* のみ Supabase セッション更新
  if (pathname.startsWith("/admin")) {
    return await updateSession(request);
  }

  return NextResponse.next();
}

export const config = {
  // 削除済み特集 URL のチェックと /admin のセッション更新を同時にカバー
  matcher: [
    "/feature/:path*",
    "/admin/:path*",
  ],
};
