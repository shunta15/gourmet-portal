import { REGIONS, type Restaurant, type FeatureArticle } from "./data";

const BASE = "https://gourmet-portal.vercel.app";

/* 営業時間文字列を OpeningHoursSpecification の配列に変換 */
function parseOpeningHours(
  hours: string,
  closed: string
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

export function buildRestaurantJsonLd(r: Restaurant): Record<string, unknown> {
  const region = REGIONS[r.region];
  const url = `${BASE}/restaurant/${r.id}`;
  const images = [r.image, ...(r.gallery || []).slice(0, 5)]
    .filter(Boolean)
    .map((p) => (p.startsWith("http") ? p : `${BASE}${p}`));
  const cuisine = r.cuisine.split(" / ").pop() || r.cuisine;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": url,
    name: r.name,
    url,
    image: images,
    description: r.desc,
    servesCuisine: cuisine,
    address: {
      "@type": "PostalAddress",
      streetAddress: r.address,
      addressLocality: region?.name,
      addressCountry: "JP",
    },
  };

  const hours = parseOpeningHours(r.hours, r.closed);
  if (hours) jsonLd.openingHoursSpecification = hours;

  if (r.reservationUrl) {
    jsonLd.acceptsReservations = "True";
    jsonLd.potentialAction = {
      "@type": "ReserveAction",
      target: r.reservationUrl,
    };
  }

  if (r.rating) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: r.rating,
      bestRating: "5",
      ratingCount: "1",
    };
  }

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
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": url,
    headline: a.title,
    description: a.lede,
    image: a.heroImage,
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
