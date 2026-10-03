/**
 * 都道府県 → グルメの既存地域（/region/{key}）の引き当て。サーバー専用（lib/regions を読む）。
 */
import { REGIONS } from '@/lib/regions';
import { GOURMET_REGION_BY_PREF } from './prefectures';

const PREF_BY_GOURMET_REGION: Record<string, string> = Object.fromEntries(
  Object.entries(GOURMET_REGION_BY_PREF).map(([pref, region]) => [region, pref]),
);

/**
 * 都道府県 slug に対応するグルメの region キー。
 * 対応表にあり、かつ REGIONS に実在するときだけ返す。無ければ null（リンクを張らない）。
 */
export function gourmetRegionKey(pref: string): string | null {
  const key = GOURMET_REGION_BY_PREF[pref];
  return key && key in REGIONS ? key : null;
}

/**
 * グルメの region キー → 都道府県 slug（gourmetRegionKey の逆引き。対応は1対1）。
 * Place.pref はグルメだと region キー（愛知＝nagoya など）なので、県で絞る・数えるときはこれで県に直す。
 */
export function prefOfGourmetRegion(region: string): string | null {
  return PREF_BY_GOURMET_REGION[region] ?? null;
}
