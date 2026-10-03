/**
 * グルメ業種の Place データ取得・変換
 * 既存の Restaurant データを Place 型に変換
 */

import { getAllRestaurants } from '@/lib/db/restaurants';
import type { Restaurant } from '@/lib/data';
import type { Place } from './types';

/**
 * Restaurant → Place の変換
 */
export function restaurantToPlace(r: Restaurant): Place {
  return {
    id: r.id,
    vertical: 'gourmet',
    category: r.cuisine || '',
    name: r.name,
    pref: r.region, // Restaurant の region は都道府県のローマ字（またはグルメ既存地域キー）
    cityName: r.area,
    address: r.address,
    station: r.nearest || undefined, // 店の案内にある最寄り駅の書き方（そのまま）
    hours: r.hours,
    holidays: r.closed,
    phone: r.phone,
    url: r.reservationUrl,
    image: r.image,
    images: r.gallery || [],
    tags: r.tags || [],
    priceRange: r.budget,
    intro: r.desc,
    attributes: {
      cuisine: r.cuisine,
      budget: r.budget,
      seats: r.seats,
      reservation_url: r.reservationUrl,
    },
  };
}

/**
 * グルメの全店舗を Place として取得
 */
export async function getGourmetPlaces(): Promise<Place[]> {
  const restaurants = await getAllRestaurants();
  return restaurants.map(restaurantToPlace);
}
