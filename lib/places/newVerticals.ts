/**
 * 新業種（ビューティー・ボディケア・ペット・ステイ・体験・アクティビティ・スポーツ・くらし）の実在の店。lib/places/generated/*.json を読む。
 * JSON は automation/vertical-stores/build-places.mjs の自動生成（手で編集しない）。
 * 全店を出すと大きくなるので、使うときに動的 import で読む（サーバー専用。クライアントから import しない）。
 */
import type { Place } from './types';
import { dropUnlistedPlaces } from '../unlistedScope';

export type GeneratedVertical = 'beauty' | 'bodycare' | 'pet' | 'stay' | 'activity' | 'sports' | 'life';

/**
 * 保留の店 ID(オーナー確認待ちのため、サイトのどこにも出さない店)。この 1 行が唯一の入口で、ここに入れた店は
 * 店データ(getGeneratedPlaces)・店の特集記事(getGeneratedFeatures)から外れる。
 * = 一覧・店のページ(404)・サイトマップ・件数・総合トップの件数・記事・探すの絞り込みのどれにも出ない。リストから消せば全部戻る。
 * ac0012 = SeaChan石垣島(住所の確認がオーナー判断。2026-10-23 保留)
 * 保留のあいだ、ac0012 の写真ファイルは public/ に置かず automation/vertical-stores/held-photos/leisure-2759/ に退避している
 * (public/ に置くと、URL を知っていれば開けてしまうため)。戻すときは、この配列から消し、held-photos/leisure-2759 を public/_portal/vshops/ へ移す。
 */
export const HELD_PLACE_IDS: readonly string[] = ['ac0012'];

export async function getGeneratedPlaces(vertical: GeneratedVertical): Promise<Place[]> {
  // activity / sports / life の JSON は、店のデータがまだ無いあいだは places が空の入れ物(build-places.mjs が店ごと作り直す)。ファイルが無いと import が落ちるので、空でも置いておく
  const mod =
    vertical === 'beauty'
      ? await import('./generated/beauty.json')
      : vertical === 'bodycare'
        ? await import('./generated/bodycare.json')
        : vertical === 'pet'
          ? await import('./generated/pet.json')
          : vertical === 'activity'
            ? await import('./generated/activity.json')
            : vertical === 'sports'
              ? await import('./generated/sports.json')
              : vertical === 'life'
                ? await import('./generated/life.json')
                : await import('./generated/stay.json');
  // 限定公開の店(lib/unlisted.ts)も外す。店自身のページを描いているあいだだけ、その 1 店が通る(lib/unlistedScope.ts)
  return dropUnlistedPlaces((mod.default as unknown as { places: Place[] }).places.filter((p) => !HELD_PLACE_IDS.includes(p.id)));
}
