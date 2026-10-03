/**
 * 都道府県 → グルメの既存地域（/region/{key}）の引き当て。サーバー専用（lib/regions を読む）。
 */
import { REGIONS } from '@/lib/regions';
import { GOURMET_REGION_BY_PREF } from './prefectures';

/**
 * 都道府県 slug に対応するグルメの region キー。
 * 対応表にあり、かつ REGIONS に実在するときだけ返す。無ければ null（リンクを張らない）。
 */
export function gourmetRegionKey(pref: string): string | null {
  const key = GOURMET_REGION_BY_PREF[pref];
  return key && key in REGIONS ? key : null;
}
