/**
 * 地域・街への行き先（軽い定数と純関数だけ。サーバー・クライアントのどちらからも使える）。
 *
 * 2026-10-12 オーナー決定「地域と街のページ（大阪、大阪市北区）は『さがす』のページへ統合」:
 * RELEASE_REST が true（見本が基準）のあいだ、/region・/region/<キー>・/region/<キー>/<街> のページは無く、next.config.ts が /search へ恒久転送する
 * （/region → /search、/region/<キー> → /search?region=<キー>、/region/<キー>/<街> → /search?region=<キー>&town=<街>）。
 * サイト内のリンクは転送を踏まないよう、リンクを作る所でこの関数を通して、はじめから /search の URL にする。
 * RELEASE_REST が false のときは今までの /region 系の URL のまま（今の本番と同じ）。
 */
import type { FeatureArticle } from "../../regions";
import { RELEASE_REST } from "./release";
import { isScenePath, scenePathToSearch } from "./sceneLinks";

/** 地域・街のページを「さがす」へ統合するか（next.config.ts の転送と、サイト内リンクの両方がこれを見る） */
export const AREA_TO_SEARCH = RELEASE_REST;

/** エリア一覧（/region）の行き先 */
export const areaIndexHref = (): string => (AREA_TO_SEARCH ? "/search" : "/region");

/** 地域（/region/<キー>）の行き先。キーは lib/regions.ts の RegionKey（ASCII） */
export const regionHref = (key: string): string => (AREA_TO_SEARCH ? `/search?region=${encodeURIComponent(key)}` : `/region/${key}`);

/** 街（/region/<キー>/<街>）の行き先。街名は日本語のまま入れて encodeURIComponent する（lib/towns.ts の townHref と同じ書き方） */
export const townLinkHref = (region: string, town: string): string =>
  AREA_TO_SEARCH ? `/search?region=${encodeURIComponent(region)}&town=${encodeURIComponent(town)}` : `/region/${region}/${encodeURIComponent(town)}`;

/**
 * 既存の /region 系のパス（記事の中のリンクなど、すでに文字列になっているもの）を、AREA_TO_SEARCH のとき /search の URL に直す。
 * /region・/region/<キー>・/region/<キー>/<街>（街は百分率エンコードのままでも日本語のままでも可）。それ以外の文字列はそのまま返す。
 */
export function areaPathToSearch(href: string): string {
  if (!AREA_TO_SEARCH) return href;
  const m = href.match(/^\/region(?:\/([^/?#]+)(?:\/([^/?#]+))?)?\/?$/);
  if (!m) return href;
  const [, key, rawTown] = m;
  if (!key) return "/search";
  if (!rawTown) return regionHref(key);
  let town = rawTown;
  try {
    town = decodeURIComponent(rawTown);
  } catch {
    /* 壊れたエンコードはそのまま */
  }
  return townLinkHref(key, town);
}

/**
 * 記事の「関連（sideArticles）」に入っている /region 系・/scene 系のリンク（利用シーン特集の「○○の店を探す」。lib/sceneFeatures.ts は自動生成なので手で直さない）を、
 * 記事を返すときに /search の URL へ直す（lib/db/features.ts の getFeatureArticleById が通す）。それぞれ AREA_TO_SEARCH / SCENE_TO_SEARCH が false のときは何もしない（同じ記事をそのまま返す）。
 * 直すのは sideArticles の h だけ。ほかのリンク・本文は変えない。
 */
export function rewriteAreaLinksInArticle(a: FeatureArticle): FeatureArticle {
  const isArea = (h: string) => AREA_TO_SEARCH && /^\/region(\/|$)/.test(h);
  const isScene = (h: string) => isScenePath(h) && scenePathToSearch(h) !== h;
  const side = a.sideArticles;
  if (!side || !side.some((x) => isArea(x.h) || isScene(x.h))) return a;
  return { ...a, sideArticles: side.map((x) => (isArea(x.h) ? { ...x, h: areaPathToSearch(x.h) } : isScene(x.h) ? { ...x, h: scenePathToSearch(x.h) } : x)) };
}
