/**
 * 利用シーンへの行き先（軽い定数と純関数だけ。サーバー・クライアントのどちらからも使える）。
 *
 * 2026-10-12 オーナー決定「利用シーンのページを、地域と同じように『さがす』へ統合」:
 * RELEASE_SEARCH が true（見本が基準）のあいだ、/scene・/scene/<slug> のページは無く、next.config.ts が /search へ恒久転送する
 * （/scene → /search、/scene/<slug> → /search?scene=<slug>）。サイト内のリンクは転送を踏まないよう、リンクを作る所でこの関数を通して、
 * はじめから /search の URL にする。RELEASE_SEARCH が false のときは今までの /scene 系の URL のまま（今の本番と同じ）。
 * ※ 他の業種のシーン（/beauty/scene/<slug> など）は別のページ。ここでは扱わない。
 */
import { RELEASE_SEARCH } from "./release";

/** 利用シーンのページを「さがす」へ統合するか（next.config.ts の転送と、サイト内リンクの両方がこれを見る） */
export const SCENE_TO_SEARCH = RELEASE_SEARCH;

/** シーン一覧（/scene）の行き先 */
export const sceneIndexHref = (): string => (SCENE_TO_SEARCH ? "/search" : "/scene");

/** シーン（/scene/<slug>）の行き先。slug は lib/scenes.ts の SCENES[].slug（ASCII） */
export const sceneHref = (slug: string): string => (SCENE_TO_SEARCH ? `/search?scene=${encodeURIComponent(slug)}` : `/scene/${slug}`);

/** 既存の /scene 系のパス（記事の中のリンクなど、すでに文字列になっているもの）を、SCENE_TO_SEARCH のとき /search の URL に直す。それ以外の文字列はそのまま返す */
export function scenePathToSearch(href: string): string {
  if (!SCENE_TO_SEARCH) return href;
  const m = href.match(/^\/scene(?:\/([^/?#]+))?\/?$/);
  if (!m) return href;
  return m[1] ? sceneHref(decodeURIComponentSafe(m[1])) : "/search";
}

function decodeURIComponentSafe(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** sideArticles の h が /scene 系か */
export const isScenePath = (h: string): boolean => /^\/scene(\/|$)/.test(h);
