/**
 * seoText.ts
 *
 * 店舗ページの <title> / meta description を組み立てる。
 *
 * 【なぜ機械生成か】
 * Search Console 実測（2026-08-10〜09-06）では、流入の大半が店舗名の指名検索で、
 * 店舗ページは表示 5,124 / クリック 102 / CTR 1.99%（平均掲載順位 9.3）。
 * 順位は取れているのにクリックされていない＝スニペットが検索意図に応えていない。
 * 指名検索の意図は「営業時間・定休日・場所」なので、その3点を必ず載せる。
 *
 * 【設計ルール】
 * - title は全角換算 34 文字以内（日本語 SERP の表示上限の目安）。
 *   超える場合は「営業時間・アクセス」→「営業時間」→ 無し、の順に削る。
 * - 店名に業種が含まれる場合は業種を重ねない（例「鶏居酒屋pao福」に「の鶏居酒屋」を足さない）。
 * - 場所は最寄り駅名を優先。駅が取れない店舗は area の末尾要素
 *   （「福岡・宮若」→「宮若」。先頭を取ると県名になり具体性が落ちる）。
 * - description は全角換算 120 文字以内。編集部が書いた desc を先頭に置き（文単位で切る）、
 *   末尾に営業時間・定休日を足す。desc に駅名が出ていない店舗だけ最寄り駅も足す。
 *
 * データが欠けている項目は黙って落とす（推測で埋めない）。
 */

/** 全角換算の見た目文字数（半角は 0.5 として数える） */
function visualWidth(s: string): number {
  return [...String(s)].reduce(
    (n, c) => n + (/[\x20-\x7E]/.test(c) ? 0.5 : 1),
    0
  );
}

/** 「居酒屋 / 焼鳥」→「焼鳥」。データ由来の括弧残りを除去する */
export function cuisineLabel(cuisine: string | undefined): string {
  return (cuisine || "")
    .split(/\s*[/・]\s*/)
    .pop()!
    .replace(/[（）()【】[\]]/g, "")
    .trim();
}

/** 「JR高崎線 上尾駅 西口 徒歩9分」→「上尾駅」 */
function stationOf(nearest: string | undefined): string | null {
  const m = (nearest || "").match(/([^\s　]{1,12}?駅)/);
  return m ? m[1] : null;
}

/**
 * 駅名から事業者名の接頭辞を落とす（「JR垂水駅」→「垂水駅」）。
 * 紹介文との重複判定に使うほか、タイトルの表示も短く自然になる
 * （「地下鉄大通」→「大通」）。落とすと 1 文字以下になる場合は元のまま返す。
 */
function stripOperator(station: string): string {
  const bare = station.replace(
    /^(JR東日本|JR西日本|JR東海|JR九州|JR北海道|JR|東京メトロ|都営地下鉄|都営|地下鉄|市営地下鉄|市営|大阪メトロ|阪急|阪神|近鉄|京阪|南海|名鉄|西鉄|東急|京急|京成|小田急|西武|東武|相鉄)/,
    ""
  );
  return bare.replace(/駅$/, "").length >= 2 ? bare : station;
}

/** 「… 徒歩9分」→「徒歩9分」 */
function walkOf(nearest: string | undefined): string | null {
  const m = (nearest || "").match(/徒歩\s*約?\s*(\d+)\s*分/);
  return m ? `徒歩${m[1]}分` : null;
}

/** 「月-日 17:00 - 23:00（L.O. 22:00）」→「17:00〜23:00」。取れなければ null */
function hoursShort(hours: string | undefined): string | null {
  const s = String(hours || "").replace(/[（(][^）)]*[）)]/g, "");
  const m = s.match(/(\d{1,2}[:：]\d{2})\s*[-〜~ー–]\s*(翌?\d{1,2}[:：]\d{2})/);
  return m ? `${m[1]}〜${m[2]}` : null;
}

/** 「不定休（事前確認推奨）」→「不定休」。長すぎるものは載せない */
function closedShort(closed: string | undefined): string | null {
  const s = String(closed || "")
    .replace(/[（(][^）)]*[）)]/g, "")
    .trim();
  return s && visualWidth(s) <= 8 ? s : null;
}

type SeoRestaurant = {
  name: string;
  cuisine?: string;
  area?: string;
  nearest?: string;
  hours?: string;
  closed?: string;
  desc?: string;
};

/** 場所を表す語。最寄り駅名 > area の末尾要素 */
function placeOf(r: SeoRestaurant): string {
  const st = stationOf(r.nearest);
  if (st) return stripOperator(st).replace(/駅$/, "");
  return String(r.area || "")
    .split(/[・／/]/)
    .pop()!
    .trim();
}

/** 店舗ページの <title> */
export function restaurantTitle(r: SeoRestaurant): string {
  const cu = cuisineLabel(r.cuisine);
  const place = placeOf(r);
  // 店名に業種が入っている場合は重複させない
  const kind = cu && !r.name.includes(cu) ? `の${cu}` : "";
  const head = `${r.name}｜${place}${kind}`;
  const candidates = [
    `${head} 営業時間・アクセス｜マチノワ`,
    `${head} 営業時間｜マチノワ`,
    `${head}｜マチノワ`,
    head,
  ];
  for (const c of candidates) if (visualWidth(c) <= 34) return c;
  return `${r.name}｜${place}｜マチノワ`;
}

/** 店舗ページの meta description */
export function restaurantDescription(r: SeoRestaurant): string {
  const st = stationOf(r.nearest);
  const wk = walkOf(r.nearest);
  const hs = hoursShort(r.hours);
  const cl = closedShort(r.closed);
  const descText = String(r.desc || "").trim();

  const facts = [
    hs && `営業時間${hs}`,
    cl && `定休日${cl}`,
    // 最寄り駅は本文に出ていない店舗だけ補う（同じ情報を二度書かない）
    st && !descText.includes(stripOperator(st).replace(/駅$/, ""))
      ? wk
        ? `${st}${wk}`
        : st
      : null,
  ]
    .filter(Boolean)
    .join("／");
  const tail = facts ? `${facts}。` : "";

  const room = 120 - visualWidth(tail);
  let lead = descText;
  if (visualWidth(lead) > room) {
    // まず文単位で削る。1 文目すら入らなければ文字数で切る
    const sentences = lead.split(/(?<=。)/);
    lead = "";
    for (const s of sentences) {
      if (visualWidth(lead + s) > room) break;
      lead += s;
    }
    if (!lead) {
      lead = [...descText].slice(0, Math.max(0, Math.floor(room) - 1)).join("") + "…";
    }
  }
  return `${lead}${tail}`;
}
