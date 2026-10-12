/**
 * 写真が主役の形（components/portal/photoFeature/）で出す、店 1 軒の特集記事 20 本の、手で選んだ字の表。軽いファイル（fs・process は使わない）。
 * 20 本の ID は lib/portal/noren/featureSingle.ts の FEATURED_SINGLE_IDS（ID の完全一致。店名・題の部分一致は使わない）。
 *
 * 1. NR_WORDS: 視点（見どころ）の頭に掛ける小さな暖簾の語（2〜5 字）。記事 ID → 視点 1〜5 の語。
 *    その視点の見出し（記事の ranking[i].name）の中にある語だけ。見出しにない語・作った語は入れない。見出しの核になる語を選んだ。
 *    表にない記事・視点は、build.ts の nrChars（見出しの最初の節の、漢字・カタカナの連なり 2〜4 字）に落ちる。
 *    紅梅庵・カフェレガーロは、オーナーが見た版で出ていた語のまま（自動の取り方と同じ結果。表に固定して、取り方が変わっても変わらないようにした）。
 * 2. GATE_UNITS: 入口の暖簾（WebGL の布）に染め抜く字。店ページの店名（store.name）の中にある字・語だけ。
 *    規則: ① 店名のうち、屋号の核を取る（空白で分かれた「業態・料理名」「支店名」「読みがな・説明」は外す。外すと 1 字になるときは、業態を残す）。
 *    ② 漢字・かなは 1 字ずつ。欧文の屋号は、5 字以下なら 1 字ずつ（PALLO → P・A・L・L・O）、それより長ければ語ごと（MOON・CAFE）。
 *    ③ 6 字まで（PC は 5 字以下なら 1 枚に 1 字、6 字は 1 枚に 2 字。スマホは 3 枚まで）。7 字の「カフェレガーロ」だけは、全部の字が出るよう 4 枚（スマホも）。
 */
import { FEATURED_SINGLE_IDS } from "@/lib/portal/noren/featureSingle";

const NFC = (s: string) => s.normalize("NFC");
const FEATURED_SET: ReadonlySet<string> = new Set(FEATURED_SINGLE_IDS.map(NFC));
/** この記事 ID は、写真が主役の形で出す 20 本のひとつか（ID の完全一致） */
export const isFeaturedPhotoId = (id: string): boolean => FEATURED_SET.has(NFC(id));

export const NR_WORDS: Readonly<Record<string, readonly [string, string, string, string, string]>> = {
  スペインバルPALLO: ["タパス", "ワイン", "空間設計", "時間帯", "中央通"],
  日本料理利喜笑店八王子: ["黒板", "割烹", "おまかせ", "畳席", "八王子駅"],
  ぺんぎん食堂: ["惣菜", "働くママ", "瓶ビール", "昼過ぎ", "姉妹店"],
  凜喜桜変: ["神経締め", "食材", "一品料理", "個室", "磐田"],
  近江牛日本料理ひょうたんや: ["近江牛", "創業", "会席料理", "和室", "駐車場"],
  "taracafe.": ["自家焙煎", "テラス", "マフィン", "大型犬", "景色"],
  "SteakHouseG-Base": ["群馬県産", "風味", "空間設計", "銀座通り", "営業時間"],
  寿司割烹粋里: ["九品寿司", "蓮根饅頭", "小鉢", "主人", "北見駅"],
  MOONCAFE: ["三河湾", "コンテナ", "ドライブ", "吉良町", "ビーチ"],
  個室焼肉華牛KAGYU: ["個室焼肉", "家族", "記念日", "防府市", "事前確認"],
  すし大: ["江戸前", "価格設計", "創作料理", "座敷", "下館駅"],
  蒲生第一酒場: ["みそだれ", "煮込み", "レトロ", "蒲生駅", "夜中"],
  海カフェプルメリア: ["八丁味噌", "看板犬", "時間帯", "三河湾", "ドライブ"],
  二福亭: ["手打ち", "カツ丼", "ディナー", "禁煙", "長浜駅"],
  カフェレガーロ: ["有機珈琲", "地元", "平日限定", "レトロ", "鼓滝駅"],
  貝焼酒場樹: ["浜焼き", "体験", "サザエ", "宴会", "小路"],
  グルテンフリーREZAN: ["米粉パン", "完成度", "スイーツ", "少人数", "三日市駅"],
  紅梅庵: ["歴史", "庭園", "春夏秋冬", "人数", "最寄り"],
  "旬菜笑食屋裕-ひろ-": ["市場直送", "小上がり", "日本酒", "一献", "主税町"],
  お好み焼き千富: ["肉玉そば", "算命学", "価格設計", "堤防", "地御前"],
};

export const GATE_UNITS: Readonly<Record<string, readonly string[]>> = {
  スペインバルPALLO: ["P", "A", "L", "L", "O"],
  日本料理利喜笑店八王子: ["利", "喜", "笑", "店"],
  ぺんぎん食堂: ["ぺ", "ん", "ぎ", "ん", "食", "堂"],
  凜喜桜変: ["凜", "喜", "桜", "変"],
  近江牛日本料理ひょうたんや: ["ひ", "ょ", "う", "た", "ん", "や"],
  "taracafe.": ["tara", "cafe."],
  "SteakHouseG-Base": ["Steak", "House", "G-Base"],
  寿司割烹粋里: ["粋", "里"],
  MOONCAFE: ["MOON", "CAFE"],
  個室焼肉華牛KAGYU: ["華", "牛", "KAGYU"],
  すし大: ["す", "し", "大"],
  蒲生第一酒場: ["蒲", "生", "第", "一", "酒", "場"],
  海カフェプルメリア: ["プ", "ル", "メ", "リ", "ア"],
  二福亭: ["二", "福", "亭"],
  カフェレガーロ: ["カ", "フ", "ェ", "レ", "ガ", "ー", "ロ"],
  貝焼酒場樹: ["貝", "焼", "酒", "場", "樹"],
  グルテンフリーREZAN: ["R", "E", "Z", "A", "N"],
  紅梅庵: ["紅", "梅", "庵"],
  "旬菜笑食屋裕-ひろ-": ["旬", "菜", "笑", "食", "屋", "裕"],
  お好み焼き千富: ["千", "富"],
};

/** 表の語を引く（NFC にそろえて、ID の完全一致だけ）。無ければ null */
export function nrWordsOf(articleId: string): readonly string[] | null {
  const k = Object.keys(NR_WORDS).find((x) => NFC(x) === NFC(articleId));
  return k ? NR_WORDS[k] : null;
}
export function gateUnitsOf(articleId: string): readonly string[] | null {
  const k = Object.keys(GATE_UNITS).find((x) => NFC(x) === NFC(articleId));
  return k ? GATE_UNITS[k] : null;
}
