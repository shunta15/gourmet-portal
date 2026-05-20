import { REGIONS, type Restaurant, type FeatureArticle } from "./data";

const BASE = "https://machinowa.tokyo";

/* 営業時間文字列を OpeningHoursSpecification の配列に変換 */
function parseOpeningHours(
  hours: string,
  _closed: string
): Array<Record<string, unknown>> | undefined {
  // 「月-土 16:30 - 23:00 / 日月 16:30 - 22:00」のようなケースを大まかにパース
  // 失敗したらフリーテキストで返す
  const result: Array<Record<string, unknown>> = [];
  const dayMap: Record<string, string> = {
    月: "Monday",
    火: "Tuesday",
    水: "Wednesday",
    木: "Thursday",
    金: "Friday",
    土: "Saturday",
    日: "Sunday",
  };

  // セグメント単位（"/" 区切り）で処理
  const segments = hours.split(/\s*\/\s*/);
  for (const seg of segments) {
    // 例: "月-土 16:30 - 23:00（L.O. 22:00）"
    const m = seg.match(
      /([月火水木金土日])(?:[-〜~]([月火水木金土日]))?\s*([0-9]{1,2}):([0-9]{2})\s*[-〜~]\s*([0-9]{1,2}):([0-9]{2})/
    );
    if (!m) continue;
    const [, d1, d2, oh, om, ch, cm] = m;
    const days: string[] = [];
    if (d2) {
      const order = ["月", "火", "水", "木", "金", "土", "日"];
      const i1 = order.indexOf(d1);
      const i2 = order.indexOf(d2);
      if (i1 >= 0 && i2 >= 0) {
        for (let i = i1; i <= (i2 < i1 ? i1 : i2); i++) days.push(order[i]);
      }
    } else {
      // "日月" のように連続漢字
      for (const c of d1) if (dayMap[c]) days.push(c);
    }
    if (days.length === 0) days.push(d1);
    const dayOfWeek = days.map((d) => dayMap[d]).filter(Boolean);
    const opens = `${oh.padStart(2, "0")}:${om}`;
    const closes = `${ch.padStart(2, "0")}:${cm}`;
    result.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek,
      opens,
      closes,
    });
  }
  return result.length > 0 ? result : undefined;
}

/* 住所文字列から postalCode / addressRegion / streetAddress を抽出 */
function parseAddress(
  raw: string,
  regionName: string | undefined
): {
  streetAddress: string;
  postalCode?: string;
  addressRegion?: string;
} {
  let s = (raw || "").trim();

  // 〒123-4567 抽出
  let postalCode: string | undefined;
  const postalMatch = s.match(/〒?\s*(\d{3}-\d{4})/);
  if (postalMatch) {
    postalCode = postalMatch[1];
    s = s.replace(postalMatch[0], "").trim();
  }

  // 都道府県抽出（東京都/大阪府/京都府/北海道/{XX}県）
  let addressRegion: string | undefined;
  const prefMatch = s.match(/^(東京都|大阪府|京都府|北海道|.{2,3}県)/);
  if (prefMatch) {
    addressRegion = prefMatch[1];
  } else if (regionName) {
    // フォールバックで region 名（例: "東京"）に都/府/県を補完
    if (regionName === "東京") addressRegion = "東京都";
    else if (regionName === "大阪") addressRegion = "大阪府";
    else if (regionName === "京都") addressRegion = "京都府";
    else if (regionName === "北海道") addressRegion = "北海道";
    else if (regionName) addressRegion = `${regionName}県`;
  }

  return {
    streetAddress: s,
    postalCode,
    addressRegion,
  };
}

/* 予算文字列 → priceRange (¥ / ¥¥ / ¥¥¥ / ¥¥¥¥) へ正規化
 * 1人あたりおおよその金額を schema.org の表現に合わせる。
 * - ~3000円       → ¥
 * - 3000-7000円   → ¥¥
 * - 7000-15000円  → ¥¥¥
 * - 15000円~      → ¥¥¥¥
 */
function normalizePriceRange(budget: string | undefined): string | undefined {
  if (!budget) return undefined;
  // 「3000-5000円」「¥4000」「3,500円〜」のような表記から数字を抽出
  const nums = budget
    .replace(/,/g, "")
    .match(/\d{3,6}/g);
  if (!nums || nums.length === 0) {
    // 既に ¥ 記号で書かれていればそのまま使う
    if (/^[¥$]+$/.test(budget.trim())) return budget.trim();
    return undefined;
  }
  const max = Math.max(...nums.map((n) => parseInt(n, 10)));
  if (max < 3000) return "¥";
  if (max < 7000) return "¥¥";
  if (max < 15000) return "¥¥¥";
  return "¥¥¥¥";
}

/* 電話番号を E.164 形式に近づけて整形（schema.org の telephone 推奨形式）
 * 「03-1234-5678」→「+81-3-1234-5678」
 * 「090-1234-5678」→「+81-90-1234-5678」
 * パースに失敗したら元の文字列を返す。
 */
function normalizePhone(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  const t = phone.trim();
  // 既に +81 で始まる
  if (/^\+81/.test(t)) return t;
  // 0X-... 形式
  const m = t.match(/^0(\d{1,4})-(.+)$/);
  if (m) return `+81-${m[1]}-${m[2]}`;
  return t;
}

export function buildRestaurantJsonLd(r: Restaurant): Record<string, unknown> {
  const region = REGIONS[r.region];
  const url = `${BASE}/restaurant/${r.id}`;
  const images = [r.image, ...(r.gallery || []).slice(0, 5)]
    .filter(Boolean)
    .map((p) => (p.startsWith("http") ? p : `${BASE}${p}`));
  const cuisine = r.cuisine.split(" / ").pop() || r.cuisine;

  const addr = parseAddress(r.address, region?.name);

  const postalAddress: Record<string, unknown> = {
    "@type": "PostalAddress",
    streetAddress: addr.streetAddress,
    addressLocality: region?.name,
    addressCountry: "JP",
  };
  if (addr.addressRegion) postalAddress.addressRegion = addr.addressRegion;
  if (addr.postalCode) postalAddress.postalCode = addr.postalCode;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": url,
    name: r.name,
    url,
    image: images,
    description: r.desc,
    servesCuisine: cuisine,
    address: postalAddress,
  };

  // 電話番号
  const tel = normalizePhone(r.phone);
  if (tel) jsonLd.telephone = tel;

  // 価格帯（schema.org の Restaurant では priceRange は推奨フィールド）
  const priceRange = normalizePriceRange(r.budget);
  if (priceRange) jsonLd.priceRange = priceRange;

  // 営業時間
  const hours = parseOpeningHours(r.hours, r.closed);
  if (hours) jsonLd.openingHoursSpecification = hours;

  // 予約
  if (r.reservationUrl) {
    jsonLd.acceptsReservations = "True";
    jsonLd.potentialAction = {
      "@type": "ReserveAction",
      target: r.reservationUrl,
    };
  }

  // Google レビューを Aggregate Rating として埋め込む
  // 注意: 出典が明確で信頼できる場合のみ。捏造禁止
  if (
    typeof r.googleRating === "number" &&
    typeof r.googleReviewCount === "number" &&
    r.googleReviewCount > 0 &&
    r.googleRating > 0 &&
    r.googleRating <= 5
  ) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: r.googleRating,
      reviewCount: r.googleReviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // SNS / 出典をエンティティの sameAs として補強
  const sameAs: string[] = [];
  if (r.instagram) sameAs.push(r.instagram);
  if (r.source?.url) sameAs.push(r.source.url);
  if (sameAs.length > 0) jsonLd.sameAs = sameAs;

  return jsonLd;
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function buildOrganizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "マチノワ",
    alternateName: "MACHINOWA / 街の輪",
    url: BASE,
    logo: `${BASE}/icon.png`,
  };
}

export function jsonLdScript(data: Record<string, unknown>) {
  return {
    type: "application/ld+json" as const,
    json: JSON.stringify(data),
  };
}

export function buildArticleJsonLd(a: FeatureArticle): Record<string, unknown> {
  const url = `${BASE}/feature/${a.id}`;
  const image = a.heroImage.startsWith("http") ? a.heroImage : `${BASE}${a.heroImage}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": url,
    headline: a.title,
    description: a.lede,
    image,
    datePublished: a.date,
    dateModified: a.date,
    author: {
      "@type": "Organization",
      name: a.author,
    },
    publisher: {
      "@type": "Organization",
      name: "マチノワ",
      url: BASE,
      logo: {
        "@type": "ImageObject",
        url: `${BASE}/icon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

export function buildFeatureBreadcrumbJsonLd(
  a: FeatureArticle
): Record<string, unknown> {
  return buildBreadcrumbJsonLd([
    { name: "ホーム", url: BASE },
    { name: "特集記事", url: `${BASE}/feature` },
    { name: a.title, url: `${BASE}/feature/${a.id}` },
  ]);
}

export function buildFeatureItemListJsonLd(
  a: FeatureArticle
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${BASE}/feature/${a.id}#itemlist`,
    name: a.title,
    itemListElement: a.ranking.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      description: item.desc,
      image: item.images?.[0]?.startsWith("http")
        ? item.images[0]
        : item.images?.[0]
          ? `${BASE}${item.images[0]}`
          : undefined,
      url: item.href ? `${BASE}${item.href}` : `${BASE}/feature/${a.id}#spot-${index + 1}`,
    })),
  };
}
