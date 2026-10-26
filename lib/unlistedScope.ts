/**
 * 限定公開の店(lib/unlisted.ts)を、「その店自身のページを描いているあいだだけ」データの入口に通すための印。
 *
 * 一覧・件数・検索・地図・sitemap などは getPlaces / getGeneratedPlaces / getGeneratedFeatures を通るが、これらは限定公開の店を外す。
 * 店のページ・店の記事のページ(/<業種>/shop/<ID>・/<業種>/article/<ID>)は、自分の ID で allowUnlisted(ID) を呼ぶ。
 * すると、その 1 回の表示(リクエスト)のあいだだけ、その ID の店が入口を通る(ほかの限定公開の店は通らない)。
 * 印は React の cache(リクエストごとに別の入れ物)に置く。リクエストをまたいで残らない。サーバー専用。
 */
import { cache } from "react";
import { isUnlistedPlace, isUnlistedPlaceFeature } from "./unlisted";

const scope = cache(() => ({ allowed: new Set<string>() }));

function decode(id: string): string {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

/** この表示のあいだ、この ID の限定公開の店を通す。限定公開でない ID には何もしない */
export function allowUnlisted(id: string): void {
  const v = decode(id);
  if (isUnlistedPlace(v) || isUnlistedPlaceFeature(v)) scope().allowed.add(v);
}

export function isUnlistedAllowed(id: string): boolean {
  return scope().allowed.has(id);
}

/** 店の配列から、限定公開の店(この表示で通す ID を除く)を外す */
export function dropUnlistedPlaces<T extends { id: string }>(list: readonly T[]): T[] {
  return list.filter((p) => !isUnlistedPlace(p.id) || isUnlistedAllowed(p.id));
}

/**
 * ページの関数(params に id を持つもの)を包み、呼ばれた最初に allowUnlisted(id) を呼ぶ。
 * generateMetadata・ページ本体のどちらにも使う。
 */
export function withUnlisted<A extends { params: Promise<{ id: string }> }, R>(fn: (arg: A) => R): (arg: A) => Promise<Awaited<R>> {
  return async (arg: A): Promise<Awaited<R>> => {
    allowUnlisted((await arg.params).id);
    return (await fn(arg)) as Awaited<R>;
  };
}
