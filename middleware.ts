import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { DELETED_FEATURE_IDS } from "@/lib/deletedFeatureIds";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
