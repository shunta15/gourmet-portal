import { stayLine, stayLineOk, type LiveShop } from "../common/live";

/**
 * 宿の記事の一覧(/stay/article)の各カードの文言(見本「3_探す」の 見出し 2 行・3 行の文・アイコンつきの特徴)。
 *
 * 決まり: 全部、その宿の紹介記事(lib/places/generated/stay.json の article。lede・sections)に書いてある事実だけから作る。
 * 料金・金額・星・口コミ・「おすすめ」「人気」「〇選」・癒し・効き目・泊まったような書き方・順位づけは書かない。
 * どの文も画面に出す前に stayLineOk(common/live.ts の文の点検)に通す。通らない文は、その文だけ自動の文に差し替える。
 *
 * 見出し 2 行 = 1 行目「その宿の事実を短く言う句(「、」で終わる)」+ 2 行目「宿の名前」。1 行目は 12 字ほどまで(見本の見出しの幅)。
 * 文 = 記事の導入(lede)の言い換えでなく、記事に書いてある 2 文を短くつないだもの(60 字ほどまで)。
 * 特徴 = アイコンつきの札。所在地と宿の種類は自動(下の cardCopyOf)で、ここには宿ごとの事実を 2 つ(8 字ほどまで)。
 * 写真の切り抜き位置(focus)= 写真の枠が横長(2.3:1)なので、被写体が切れないよう縦の位置だけ宿ごとに決める。
 *
 * 宿が増えて、ここに無い宿の記事が出たときは、自動で作る(1 行目「〇〇県の旅館、」+ 2 行目 宿名+記事の見出し+タグ)。
 * 出典の根拠(記事のどの文か)は、各宿の行末のコメントに書いた。
 */

type Override = {
  l1: string;
  /** 2 行目に出す名前(長い宿名を短くしたいとき。無ければ宿名) */
  short?: string;
  text: string;
  feats: [string, string];
  /** object-position の縦(%)。無ければ 50 */
  focusY?: number;
};

const COPY: Record<string, Override> = {
  // lede「築百年以上の古民家を改装した一棟貸しの宿で、MAGOICHI・MAGONI・MAGOSANの3つの宿」「宿のキッチンで自炊でき」
  st0001: {
    l1: "古民家を改装した宿、",
    text: "築百年以上の古民家を改装した一棟貸しの宿。MAGOICHI・MAGONI・MAGOSANの3つの宿があります。",
    feats: ["一棟貸し", "キッチンで自炊"],
    focusY: 36,
  },
  // lede「新富士ICから約10分」「区画サイトとフリーサイトの2種類」「露天風呂付きのコテージ…の2棟」/ キャンプサイトはペットと一緒に泊まれる
  st0002: {
    l1: "新富士ICから約10分、",
    text: "区画サイトとフリーサイトのほか、露天風呂付きのコテージが2棟あります。",
    feats: ["コテージあり", "ペット同伴"],
    focusY: 50,
  },
  // lede「1棟を貸し切る貸別荘」「大型ログハウスが6棟、…ログハウスが1棟、…ロッジ」「標高1,100mの浅間高原」/ 全天候型のテニスコート1面
  st0003: {
    l1: "浅間高原の貸別荘、",
    text: "1棟を貸し切る貸別荘です。大型ログハウス・ログハウス・ロッジの3種類の宿泊棟があります。",
    feats: ["ログハウス", "テニスコート"],
    focusY: 42,
  },
  // lede「一棟貸しの天然温泉付き離れ客室が5棟と、旧館の民宿の客室」「ペットと泊まれる宿と案内」
  st0004: {
    l1: "天然温泉付きの離れ、",
    text: "一棟貸しの天然温泉付き離れ客室が5棟と、旧館の民宿の客室があります。ペットと泊まれる宿です。",
    feats: ["天然温泉", "ペット同伴"],
    focusY: 50,
  },
  // lede「長坂ゴンドラリフト乗り場の目の前に建つ、…小さなホテル」「喫茶・レストランの案内があり」/ 宿泊プランに素泊りがある
  st0005: {
    l1: "ゴンドラ乗り場の目の前、",
    text: "野沢温泉スキー場の長坂ゴンドラ乗り場の目の前にある小さなホテル。喫茶・レストランもあります。",
    feats: ["レストランあり", "素泊まりも可"],
    focusY: 36,
  },
  // lede「サイトは、オートサイト、プライベートドッグランのフリーDogサイト、車中泊専用のRVサイト」「柏インターから15分」
  st0006: {
    l1: "柏インターから15分、",
    short: "ワンダフルガーデン柏",
    text: "オートサイト、プライベートドッグランのフリーDogサイト、車中泊専用のRVサイトがあります。",
    feats: ["ドッグランあり", "車中泊できる"],
    focusY: 50,
  },
  // lede「1日1組限定の一棟貸しコテージ」「九十九里浜から通りを一本挟んだ路地」「部屋の中やベッドルームまで犬と一緒に過ごせます」「キッチンでの調理や屋外でのバーベキュー」
  st0007: {
    l1: "1日1組限定の一棟貸し、",
    text: "九十九里浜から通りを一本挟んだ路地にある、一棟貸しのコテージです。部屋の中まで犬と過ごせます。",
    feats: ["ペット同伴", "キッチン・BBQ"],
    focusY: 46,
  },
  // lede「須賀川市西部の山あいにある一軒宿」「お風呂は自然に湧き出る水を薪で沸かす沸かし湯」「地産地消にこだわって出す」
  st0008: {
    l1: "山あいにある一軒宿、",
    text: "須賀川市西部の山あいにある一軒宿です。お風呂は、自然に湧き出る水を薪で沸かした沸かし湯です。",
    feats: ["薪で沸かすお風呂", "地産地消の料理"],
    focusY: 10,
  },
};

export type CardCopy = {
  /** 見出しの 1 行目・2 行目 */
  l1: string;
  l2: string;
  text: string;
  /** アイコンつきの特徴(所在地・宿の種類・宿ごとの事実 2 つ。2〜4 個) */
  feats: Array<{ key: string; label: string; kind: "pin" | "type" | "tag" }>;
  /** 写真の object-position(縦 %) */
  focusY: number;
};

/** 宿名の()の中(読みがな・別名)を落とした名前。落とすと空になるなら、そのまま */
function shortName(name: string): string {
  const x = name.replace(/[（(][^）)]*[）)]/g, "").trim();
  return x || name;
}

/** 1 つ目の「、」「。」までの短い句に */
function clip(t: string, max: number): string {
  const x = t.trim();
  if (x.length <= max) return x;
  const cut = x.slice(0, max);
  const i = Math.max(cut.lastIndexOf("、"), cut.lastIndexOf("。"));
  return i > 8 ? cut.slice(0, i + 1) : `${cut}…`;
}

/** 1 つの宿のカードの文言。上の COPY(点検に通ったものだけ)→ 無い・通らないところは記事の事実から自動で作る */
export function cardCopyOf(s: LiveShop): CardCopy {
  const o = COPY[s.id];
  const ok = (t: string | undefined) => (t && stayLineOk(t) ? t : "");
  const autoL1 = `${s.prefName || s.area}の${s.kindName || "宿"}、`;
  const autoText = clip(stayLine(s.article?.headline) || s.article?.lede || "", 64);
  const l1 = ok(o?.l1) || autoL1;
  const l2 = ok(o?.short) || shortName(s.name);
  const text = ok(o?.text) || autoText;
  const own = (o?.feats ?? []).filter((f) => ok(f));
  const extra = own.length > 0 ? own : s.tags.slice(0, 2);
  const feats: CardCopy["feats"] = [
    ...(s.area ? [{ key: "area", label: s.area, kind: "pin" as const }] : []),
    ...(s.kindName ? [{ key: "kind", label: s.kindName, kind: "type" as const }] : []),
    ...extra.slice(0, 2).map((t) => ({ key: `t-${t}`, label: t, kind: "tag" as const })),
  ];
  return { l1, l2, text, feats, focusY: o?.focusY ?? 50 };
}

/** キーワード検索の対象にする、カードに出る文言(見出し・文・特徴) */
export function cardCopyText(s: LiveShop): string {
  const c = cardCopyOf(s);
  return [c.l1, c.l2, c.text, ...c.feats.map((f) => f.label)].join(" ");
}
