/**
 * 新業種（ビューティー・ボディケア・ペット・ステイ・体験・アクティビティ・スポーツ・くらし）の実在の店。lib/places/generated/*.json を読む。
 * JSON は automation/vertical-stores/build-places.mjs の自動生成（手で編集しない）。
 * 全店を出すと大きくなるので、使うときに動的 import で読む（サーバー専用。クライアントから import しない）。
 */
import type { Place } from './types';

export type GeneratedVertical = 'beauty' | 'bodycare' | 'pet' | 'stay' | 'activity' | 'sports' | 'life';

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
  return (mod.default as unknown as { places: Place[] }).places;
}
