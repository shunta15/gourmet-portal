/**
 * 限定公開(unlisted)のしるし。2026-10-26 オーナー指示「トリニティの記事はまだ本番に出さない。URL を知っていれば誰でも開けるようにする」。
 *
 * ここに載せた店・記事は、URL を直接開けば普通に見える(ログイン不要・200)。ただし:
 *   - サイトのどこにも出さない(店舗一覧・探す・検索・地図・業種トップ・地域/街・特集の一覧・関連記事・おすすめ・件数・sitemap・RSS ほか)
 *   - Google に出さない(各ページに robots noindex・canonical は自分の URL)
 * 仕組み: lib/data.ts の RESTAURANTS / FEATURE_ARTICLES と lib/places/ の一覧用の関数が、このファイルの ID を外す。
 *         ID を指定して 1 件を引く関数(getRestaurantById・getFeatureArticleById・getPlace ほか)だけが、このファイルの店も返す。
 * 正式公開するとき: 公開する店・記事の ID をここから消す(全部なら各配列を空にする)。noindex も同時に外れる。
 *   消したあと、build-stores.mjs が地域の定義を再計算するので node automation/stores500/build-stores.mjs を 1 回実行し、
 *   lib/articleRegions.ts を作り直す。
 * 軽い定数と純関数だけ(クライアントの部品から import しない)。照合は ID の完全一致。
 */

/** グルメの店 ID(lib/articleStores.ts・r671〜) */
export const UNLISTED_STORE_IDS: readonly string[] = ["r671","r672","r673","r674","r675","r676","r677","r678","r679","r680","r681","r682","r683","r684","r685","r686","r687","r688","r689","r690","r691","r692","r693","r694","r695","r696","r697","r698","r699","r700","r701","r702","r703","r704","r705","r706","r707","r708","r709","r710","r711","r712","r713","r714","r715","r716","r717","r718","r719","r720","r721","r722","r723","r724","r725","r726","r727","r728","r729","r730","r731","r732"];

/** グルメの特集記事 ID(lib/teleapo-features.ts。/feature/<記事ID> は /restaurant/<店ID> へ 308) */
export const UNLISTED_FEATURE_IDS: readonly string[] = ["季節料理はせ部","洋菓子素材工房ぴゅあハウス","伊酒家VERDE","むぎぞう","GATEAUORANGE（ガトーオランジュ）","TiBURONCAFE","居酒屋宝泉北区王子駅前店","満天や","DiningBarCURIOUSキュリアス","鉄板居酒屋縁-en-","鉄板焼輝","DiningBarMarib四条烏丸","cafe温−on−","ボードゲームカフェCARIVAN","ツバメ珈琲-swallowcoffee-","カナデアンコーヒーハウスメイプル","そば処ひふみ","HITSUJItoBEER（ヒツジとビール）","焼き鳥居酒屋さつき","炭火串焼きとおばんざい鶏ぴん","日本料理蓮Ren(れん)","たこ焼き酒場TARVO","和食処つきやま","キッチンカーKAMUI（カムイ）","BARLyric","食パン本舗","西荻ペッコリーノ","おもちびより","くろしお弁当","aqui","FOGcoffee","炭火焼内灘市場","我が家おてちき屋","璃夢Rim","おにCafe","KiKi","天ぷらえび福","ダモンデ","焼肉なが井","シャトークワナ","BarNEWYORKMIDTOWN44STREET","マル信緑香園","BarDOPENESS","BarDiningJammin","BoulangerieReve想","おうち酒場BoNono","BeachbarCalypso","Cafe＆Shop粋sui","お福ちゃん","MOSH宮古島","NANNAICYA","ティース","居酒屋いっき豊洲店","高山お好み焼きあんと","食堂cafeまんざいらく","てんぷら天英","ジンギスカン日光","焼焼きんぐ","音羽寿司","割烹天野","麺sBLAND文蔵BLACK","創作鉄板一Hajime"];

/** グルメ以外の業種の店 ID(lib/places/generated/<業種>.json。店の紹介記事 /<業種>/article/<ID> も同じ ID) */
export const UNLISTED_PLACE_IDS: Readonly<Record<string, readonly string[]>> = {
  "stay": [
    "st0009",
    "st0010",
    "st0011",
    "st0012",
    "st0013",
    "st0014",
    "st0015"
  ],
  "beauty": [
    "be0106",
    "be0107"
  ],
  "pet": [
    "pe0021",
    "pe0022"
  ],
  "activity": [
    "ac0013",
    "ac0014",
    "ac0015",
    "ac0016",
    "ac0017",
    "ac0018",
    "ac0019",
    "ac0020"
  ],
  "sports": [
    "sp0004"
  ],
  "bodycare": [
    "bo0114",
    "bo0115"
  ],
  "life": [
    "li0005",
    "li0006",
    "li0007",
    "li0008",
    "li0009",
    "li0010",
    "li0011",
    "li0012",
    "li0013",
    "li0014",
    "li0015",
    "li0016",
    "li0017",
    "li0018",
    "li0019",
    "li0020",
    "li0021",
    "li0022",
    "li0023",
    "li0024",
    "li0025",
    "li0026",
    "li0027",
    "li0028",
    "li0029",
    "li0030",
    "li0031",
    "li0032",
    "li0033",
    "li0034",
    "li0035",
    "li0036",
    "li0037",
    "li0038",
    "li0039",
    "li0040",
    "li0041",
    "li0042",
    "li0043",
    "li0044",
    "li0045"
  ]
};

/** グルメ以外の業種の特集記事 ID(lib/places/generated/features-<業種>.json の feature の記事 ID。体験・スポーツだけ) */
export const UNLISTED_PLACE_FEATURE_IDS: Readonly<Record<string, readonly string[]>> = {
  "activity": [
    "遊漁船美羽",
    "AriHanaKyoto",
    "Rakuoli（ＳＵＰスクール）",
    "ダイブ＆ハウス富戸",
    "スキューバプロショップ富戸",
    "海の音色",
    "高山スカイセーリングクラブ"
  ]
};

const STORE_SET: ReadonlySet<string> = new Set(UNLISTED_STORE_IDS);
const FEATURE_SET: ReadonlySet<string> = new Set(UNLISTED_FEATURE_IDS.map((s) => s.normalize("NFC")));
const PLACE_SET: ReadonlySet<string> = new Set(Object.values(UNLISTED_PLACE_IDS).flat());
const PLACE_FEATURE_SET: ReadonlySet<string> = new Set(Object.values(UNLISTED_PLACE_FEATURE_IDS).flat().map((s) => s.normalize("NFC")));

export const isUnlistedStore = (id: string): boolean => STORE_SET.has(id);
export const isUnlistedFeature = (id: string): boolean => FEATURE_SET.has(id.normalize("NFC"));
export const isUnlistedPlace = (id: string): boolean => PLACE_SET.has(id);
export const isUnlistedPlaceFeature = (id: string): boolean => PLACE_FEATURE_SET.has(id.normalize("NFC"));

/** 配列から限定公開の店を外す(グルメ) */
export const listedStores = <T extends { id: string }>(list: readonly T[]): T[] => list.filter((x) => !STORE_SET.has(x.id));
