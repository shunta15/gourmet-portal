/**
 * 新業種（ビューティー・ボディケア・ペット・ステイ）の実在の店。lib/places/generated/*.json を読む。
 * JSON は automation/vertical-stores/build-places.mjs の自動生成（手で編集しない）。
 * 全店を出すと大きくなるので、使うときに動的 import で読む（サーバー専用。クライアントから import しない）。
 */
import type { Place } from './types';

export type GeneratedVertical = 'beauty' | 'bodycare' | 'pet' | 'stay';

export async function getGeneratedPlaces(vertical: GeneratedVertical): Promise<Place[]> {
  const mod =
    vertical === 'beauty'
      ? await import('./generated/beauty.json')
      : vertical === 'bodycare'
        ? await import('./generated/bodycare.json')
        : vertical === 'pet'
          ? await import('./generated/pet.json')
          : await import('./generated/stay.json');
  return (mod.default as unknown as { places: Place[] }).places;
}
