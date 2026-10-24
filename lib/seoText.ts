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
import { stripTabelogScore } from "@/lib/portal/noren/tabelogScore";


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

/**
 * 「JR高崎線 上尾駅 西口 徒歩9分」→「上尾駅」。
 * 駅名の手前の連なりは、字数で切らずに丸ごと取る（12 字までに切ると、長い路線名の付いた駅の先頭が欠けた:
 * 「東武スカイツリーライン草加駅」→「武スカイツリーライン草加駅」）。空白・句読点・括弧・「／」は駅名に含めない
 * （区切りをまたいで取ると、「…駐車場4台）／地下鉄大谷地駅」→「車場4台）／地下鉄大谷地駅」のようになった）。
 * 「栂・美木多駅」のように駅名に「・」を含むものがあるので、「・」は含める（路線名や事業者名とのつなぎの「・」は stripOperator が落とす）。
 * 「鉄道駅」「最寄り駅」のような、駅名でない語は採らない。
 */
const GENERIC_STATION = /^(鉄道|最寄り?|最寄|近隣|近く|周辺|各線|地下鉄|電車|JR|バス|最寄りの|最寄の)駅$/;
function stationOf(nearest: string | undefined): string | null {
  // 「伊丹(阪急)駅」のように、駅名の直後の括弧が事業者名のもの → 「伊丹駅」
  const s = (nearest || "").replace(/([^\s　（）()]+)[（(][^）)]{1,8}[）)]駅/g, "$1駅");
  const q = s.match(/「([^」]{1,10})」駅/); // 京阪「祇園四条」駅
  if (q) return `${q[1]}駅`;
  for (const m of s.matchAll(/([^\s　、，,。．･／/（）()「」『』【】[\]<>:：;；＆&]+?駅)/g)) {
    let c = m[1];
    // 「道の駅」は鉄道の駅ではない（「道の駅「今治市営いきいき館」から車で約10分」→ 場所が「道の」になっていた）
    if (/道の駅$/.test(c)) continue;
    // 「・」でつながった語の前側が施設名・道路・距離の表現のとき（「県道17号線沿い・新鳥栖駅」「小松空港・小松駅」「飯田合同庁舎から徒歩1分・鼎駅」）は、最後の語だけを駅名にする。
    // 「栂・美木多駅」のように駅名そのものに「・」を含むものは、前側が駅名の一部なのでそのまま
    if (c.includes("・")) {
      const segs = c.split("・");
      const last = segs.pop()!;
      if (segs.some((x) => /空港|ＩＣ|IC|インター|港|沿い|付近|周辺|近く|庁舎|公園|バス停|ターミナル|から|徒歩|車|\d/.test(x))) c = last;
    }
    if (!GENERIC_STATION.test(c)) return c;
  }
  return null;
}

/**
 * 駅名から事業者名・路線名の接頭辞を落とす（「JR垂水駅」→「垂水駅」「東武スカイツリーライン草加駅」→「草加駅」「南海高野線河内長野駅」→「河内長野駅」
 * 「山陽電鉄伊保駅」→「伊保駅」「叡山電鉄元田中駅」→「元田中駅」「広島電鉄袋町駅」→「袋町駅」「伊勢鉄道五十鈴ケ丘駅」→「五十鈴ケ丘駅」「京都市営地下鉄四条駅」→「四条駅」）。
 * 紹介文との重複判定に使うほか、タイトルの表示も短く自然になる（「地下鉄大通」→「大通」）。落とすと 1 文字以下になる場合は元のまま返す。
 */
const OPERATOR_RE =
  /^(JR東日本|JR西日本|JR東海|JR九州|JR北海道|JR|東京メトロ|都営地下鉄|都営|地下鉄|市営地下鉄|市営|大阪メトロ|阪急|阪神|近鉄|京阪|南海|名鉄|西鉄|東急|京急|京成|小田急|西武|東武|相鉄)/;
function stripOperator(station: string): string {
  let cur = station;
  for (let i = 0; i < 3; i++) {
    let next = cur.replace(OPERATOR_RE, "");
    if (next.replace(/駅$/, "").length < 2) next = cur;
    // 路線名（…線 / …ライン / …ライナー）が付いているときは落とす。駅名が 2 字以上残るときだけ
    next = next.replace(/^.*(?:線|ライン|ライナー)(?=.{2,}駅$)/, "");
    // 事業者名（「山陽電鉄」「叡山電鉄」「広島電鉄」「伊勢鉄道」「京都市営地下鉄」など、…電鉄 / …鉄道 / …地下鉄 / …モノレール / …市電）。
    // 先頭が「電鉄」「鉄道」の駅名（「電鉄富山駅」）は事業者名でなく駅名なので、手前に 1 字以上あるときだけ。駅名が 2 字以上残るときだけ
    next = next.replace(/^[^\s・･]{1,6}?(?:電気鉄道|電鉄|鉄道|市営地下鉄|地下鉄|モノレール|市電)(?=.{2,}駅$)/, "");
    // 事業者名・路線名とのつなぎの「・」（「近鉄・京阪伏見桃山駅」「尾西線・森上駅」）
    next = next.replace(/^[・･]+(?=.{2,}駅$)/, "");
    if (next === cur) break;
    cur = next;
  }
  return cur;
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
  if (/^[—-]+$/.test(s)) return null; // 「—（訪問前に公式確認）」は未取得の印。定休日として載せない
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
  ];
  for (const c of candidates) if (visualWidth(c) <= 34) return c;
  // 入りきらないときも、末尾の「マチノワ」は外さない（以前は「マチノワ」の無い head を返していた）。
  // head が 34 字に収まるなら業種を残して付ける（34 字は目安）。収まらないなら業種を落として場所だけにする
  if (visualWidth(head) <= 34) return `${head}｜マチノワ`;
  return `${r.name}｜${place}｜マチノワ`;
}

/** 店舗ページの meta description */
export function restaurantDescription(r: SeoRestaurant): string {
  const st = stationOf(r.nearest);
  const wk = walkOf(r.nearest);
  const hs = hoursShort(r.hours);
  const cl = closedShort(r.closed);
  // 画面に出す文と同じ除去（他サイトの評価 + 中身の無い文。lib/thinSentences.ts）を、meta description の元の文にも通す
  const descText = stripTabelogScore(String(r.desc || "")).trim();

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
