/**
 * 限定公開の店(lib/unlisted.ts)の「1 店 1 ページ」の対応表(記事 ID → 店 ID)。サーバー専用(クライアントの部品から import しない)。
 *
 * lib/portal/noren/onePage.ts の表(ONE_PAGE_SHOP_OF_FEATURE)は nav.ts を通してクライアントのコードに入る。
 * ここにある行は店名(記事 ID)を含むので、限定公開のあいだは別のファイルに置いて、クライアントのコードに入れない。
 * 使う所: next.config.ts(/feature/<記事 ID> → /restaurant/<店 ID> の 308)・app/gourmet/restaurant/[id]/page.tsx・app/gourmet/feature/[id]/page.tsx。
 * 正式公開するとき: lib/unlisted.ts から ID を消すのと一緒に、この表の行を lib/portal/noren/onePage.ts の ONE_PAGE_SHOP_OF_FEATURE へ移す。
 */
import { NOREN_ONE_PAGE } from "./onePage";

export const ONE_PAGE_UNLISTED_SHOP_OF_FEATURE: Readonly<Record<string, string>> = {
  "季節料理はせ部": "r671", // 季節料理 はせ部
  "洋菓子素材工房ぴゅあハウス": "r672", // 洋菓子素材工房 ぴゅあハウス
  "伊酒家VERDE": "r673", // 伊酒家VERDE
  "居酒屋宝泉北区王子駅前店": "r674", // 居酒屋 宝泉 北区王子駅前店
  "DiningBarCURIOUSキュリアス": "r675", // Dining&Bar CURIOUS キュリアス
  "鉄板居酒屋縁-en-": "r676", // 鉄板居酒屋 縁-en-
  "鉄板焼輝": "r677", // 鉄板焼 輝
  "cafe温−on−": "r678", // cafe 温−on−
  "ツバメ珈琲-swallowcoffee-": "r679", // ツバメ珈琲 -swallow coffee-
  "そば処ひふみ": "r680", // そば処 ひふみ
  "HITSUJItoBEER（ヒツジとビール）": "r681", // HITSUJI to BEER（ヒツジとビール）
  "炭火串焼きとおばんざい鶏ぴん": "r682", // 炭火串焼きとおばんざい鶏ぴん
  "日本料理蓮Ren(れん)": "r683", // 日本料理 蓮 Ren (れん)
  "たこ焼き酒場TARVO": "r684", // たこ焼き酒場 TARVO
  "和食処つきやま": "r685", // 和食処つきやま
  "食パン本舗": "r687", // 食パン本舗
  "aqui": "r688", // aqui
  "炭火焼内灘市場": "r689", // 炭火焼 内灘市場
  "KiKi": "r690", // KiKi
  "焼肉なが井": "r691", // 焼肉なが井
  "マル信緑香園": "r692", // マル信 緑香園
  "むぎぞう": "r693", // むぎぞう
  "GATEAUORANGE（ガトーオランジュ）": "r694", // ＧＡＴＥＡＵ ＯＲＡＮＧＥ（ガトー オランジュ）
  "TiBURONCAFE": "r695", // TiBURON CAFE
  "満天や": "r696", // 満天や
  "DiningBarMarib四条烏丸": "r697", // Dining Bar Marib 四条烏丸
  "ボードゲームカフェCARIVAN": "r698", // ボードゲームカフェCARIVAN
  "カナデアンコーヒーハウスメイプル": "r699", // カナデアンコーヒーハウス メイプル
  "焼き鳥居酒屋さつき": "r700", // 焼き鳥居酒屋 さつき
  "キッチンカーKAMUI（カムイ）": "r701", // キッチンカーKAMUI（カムイ）
  "西荻ペッコリーノ": "r702", // 西荻ペッコリーノ
  "おもちびより": "r703", // おもちびより
  "くろしお弁当": "r704", // くろしお弁当
  "FOGcoffee": "r705", // FOGcoffee
  "我が家おてちき屋": "r706", // 我が家 おてちき屋
  "璃夢Rim": "r707", // 璃夢 Rim
  "おにCafe": "r708", // おにCafe
  "天ぷらえび福": "r709", // 天ぷら えび福
  "ダモンデ": "r710", // ダモンデ
  "シャトークワナ": "r711", // シャトークワナ
  "BarNEWYORKMIDTOWN44STREET": "r712", // Bar NEWYORK MIDTOWN 44 STREET
  "BarDOPENESS": "r713", // Bar DOPENESS
  "BarDiningJammin": "r714", // Bar & Dining Jammin
  "BoulangerieReve想": "r715", // Ｂｏｕｌａｎｇｅｒｉｅ Ｒｅｖｅ想
  "おうち酒場BoNono": "r716", // おうち酒場 BoNono
  "BeachbarCalypso": "r717", // Beach bar Calypso
  "Cafe＆Shop粋sui": "r718", // Cafe＆Shop粋 ｓｕｉ
  "お福ちゃん": "r719", // お福ちゃん
  "MOSH宮古島": "r722", // MOSH 宮古島
  "NANNAICYA": "r720", // NANNAICYA
  "ティース": "r721", // ティース
  "居酒屋いっき豊洲店": "r723", // 居酒屋いっき 豊洲店
  "高山お好み焼きあんと": "r724", // 高山お好み焼き あんと
  "食堂cafeまんざいらく": "r725", // 食堂cafeまんざいらく
  "てんぷら天英": "r726", // てんぷら天英
  "ジンギスカン日光": "r727", // ジンギスカン日光
  "焼焼きんぐ": "r728", // 焼焼 きんぐ
  "音羽寿司": "r729", // 音羽寿司
  "割烹天野": "r730", // 割烹天野
  "麺sBLAND文蔵BLACK": "r731", // 麺'sBLAND 文蔵BLACK
  "創作鉄板一Hajime": "r732", // 創作鉄板一 Hajime
  "ヴァレルンガ": "r749", // ヴァレルンガ(営業時間が無く自動では1ページ化されず、旧型の店ページで落ちていた・2026-10-27 手で追加)
  "やき鳥ツギノキタザワ": "r733", // やき鳥 ツギノキタザワ
  "生": "r734", // 生
  "知覧桜見亭": "r735", // 知覧桜見亭
  "PetitParc": "r748", // Petit Parc
  "HINA-CAFE(ヒナカフェ)": "r736", // HINA-CAFE(ヒナカフェ)
  "居酒屋割烹新粋": "r737", // 居酒屋割烹新粋
  "ベーカリーミトロンド": "r738", // ベーカリーミトロンド
  "焼肉炭処道楽": "r739", // 焼肉 炭処道楽
  "とんかつグラッソ": "r740", // とんかつグラッソ
  "なんちゃってBAR・Dream": "r741", // なんちゃってＢＡＲ・Ｄｒｅａｍ
  "ななつ星": "r742", // ななつ星
  "呑処喰処泉": "r750", // 呑処喰処 泉
  "保護猫かふぇまたたび庵": "r743", // 保護猫かふぇ またたび庵
  "大玉ふわとろたこ焼き縁-en-": "r744", // 大玉ふわとろたこ焼き 縁-en-
  "浜焼ノ栄友": "r745", // 浜焼ノ栄友
  "和食みよし": "r746", // 和食 みよし
  "台湾市場食堂美蘭": "r751", // 台湾市場食堂美蘭
  "甘露肉汁": "r752", // 甘露肉汁
  "cafebarmiyami": "r756", // cafebar miyami
  "和醸良酒〇たけ": "r753", // 和醸良酒 〇たけ
  "MELUCAFE": "r754", // MELU CAFE
  "雅珈": "r755", // 雅珈
  ".tenn": "r758", // .tenn
  "うどんbarもういっけん": "r762", // うどんbar もういっけん
  "楽": "r763", // 楽
  "竹田カフェ": "r761", // 竹田カフェ(営業時間が無く自動では1ページ化されず、旧型の店ページで 500・2026-10-28 手で追加)
  "陽月kagezuki": "r765", // 陽月 kagezuki(同上)
  "コグマコーヒー": "r770", // コグマコーヒー(同上)
};

const NFC = (s: string) => s.normalize("NFC");
const SHOP_OF = new Map(Object.entries(ONE_PAGE_UNLISTED_SHOP_OF_FEATURE).map(([f, s]) => [NFC(f), s]));
const FEATURE_OF = new Map(Object.entries(ONE_PAGE_UNLISTED_SHOP_OF_FEATURE).map(([f, s]) => [s, f]));

/** 記事 ID → 店 ID(限定公開の対応だけ。切り替え NOREN_ONE_PAGE が false なら null) */
export const onePageUnlistedShopOf = (featureId: string): string | null => (NOREN_ONE_PAGE ? SHOP_OF.get(NFC(featureId)) ?? null : null);

/** 店 ID → 記事 ID(限定公開の対応だけ) */
export const onePageUnlistedFeatureOf = (shopId: string): string | null => (NOREN_ONE_PAGE ? FEATURE_OF.get(shopId) ?? null : null);
