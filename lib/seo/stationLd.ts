/**
 * 駅ページの JSON-LD（ItemList）。lib/seo/jsonld.ts の itemList は /{v}/shop/{id} 前提で
 * グルメ（/restaurant/{id}）に合わないので、URL を呼び出し側から受け取る形で別に持つ。
 */
export function stationItemList(name: string, items: { name: string; url: string; image?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: it.url,
      ...(it.image ? { image: it.image } : {}),
    })),
  };
}
