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
export const UNLISTED_STORE_IDS: readonly string[] = ["r671","r672","r673","r674","r675","r676","r677","r678","r679","r680","r681","r682","r683","r684","r685","r686","r687","r688","r689","r690","r691","r692","r693","r694","r695","r696","r697","r698","r699","r700","r701","r702","r703","r704","r705","r706","r707","r708","r709","r710","r711","r712","r713","r714","r715","r716","r717","r718","r719","r720","r721","r722","r723","r724","r725","r726","r727","r728","r729","r730","r731","r732","r733","r734","r735","r736","r737","r738","r739","r740","r741","r742","r743","r744","r745","r746","r747","r748","r749","r750","r751","r752","r753","r754","r755","r756","r757","r758","r759","r760","r761","r762","r763","r764","r765","r766","r767","r768","r769","r770","r771","r772","r773","r774","r775","r776","r777","r778","r779","r780","r781","r782","r783","r784","r785","r786","r787","r788","r789"];

/** グルメの特集記事 ID(lib/teleapo-features.ts。/feature/<記事ID> は /restaurant/<店ID> へ 308) */
export const UNLISTED_FEATURE_IDS: readonly string[] = ["季節料理はせ部","洋菓子素材工房ぴゅあハウス","伊酒家VERDE","むぎぞう","GATEAUORANGE（ガトーオランジュ）","TiBURONCAFE","居酒屋宝泉北区王子駅前店","満天や","DiningBarCURIOUSキュリアス","鉄板居酒屋縁-en-","鉄板焼輝","DiningBarMarib四条烏丸","cafe温−on−","ボードゲームカフェCARIVAN","ツバメ珈琲-swallowcoffee-","カナデアンコーヒーハウスメイプル","そば処ひふみ","HITSUJItoBEER（ヒツジとビール）","焼き鳥居酒屋さつき","炭火串焼きとおばんざい鶏ぴん","日本料理蓮Ren(れん)","たこ焼き酒場TARVO","和食処つきやま","キッチンカーKAMUI（カムイ）","BARLyric","食パン本舗","西荻ペッコリーノ","おもちびより","くろしお弁当","aqui","FOGcoffee","炭火焼内灘市場","我が家おてちき屋","璃夢Rim","おにCafe","KiKi","天ぷらえび福","ダモンデ","焼肉なが井","シャトークワナ","BarNEWYORKMIDTOWN44STREET","マル信緑香園","BarDOPENESS","BarDiningJammin","BoulangerieReve想","おうち酒場BoNono","BeachbarCalypso","Cafe＆Shop粋sui","お福ちゃん","MOSH宮古島","NANNAICYA","ティース","居酒屋いっき豊洲店","高山お好み焼きあんと","食堂cafeまんざいらく","てんぷら天英","ジンギスカン日光","焼焼きんぐ","音羽寿司","割烹天野","麺sBLAND文蔵BLACK","創作鉄板一Hajime","やき鳥ツギノキタザワ","生","玉ゆら","知覧桜見亭","PetitParc","HINA-CAFE(ヒナカフェ)","居酒屋割烹新粋","ベーカリーミトロンド","焼肉炭処道楽","とんかつグラッソ","なんちゃってBAR・Dream","ヴァレルンガ","ななつ星","呑処喰処泉","保護猫かふぇまたたび庵","大玉ふわとろたこ焼き縁-en-","浜焼ノ栄友","和食みよし","台湾市場食堂美蘭","甘露肉汁","cafebarmiyami","和醸良酒〇たけ","MELUCAFE","雅珈",".tenn","鮮魚料理若鰤","から揚げドラゴンチキンハイボールキムにい","陽月kagezuki","コグマコーヒー","麺処清水","一汁おにぎり壱","ノーズ（noz）CAFE","菓子HotsuHotsu","竹田カフェ","DogCafeEightドッグカフェエイト","うどんbarもういっけん","餃子らーめん一丸本店","楽","洋食屋自然","うなぎ処高はし","海が見えるそば家","雲仙湯せんぺい遠江屋本舗","マルシェノグチ","カフェルンビータCafeRumbita","アーニーハウス","茶房金木犀","バーリフューエルハクバ","海の幸鯛や","ウォーレンフォード","居酒屋dining湊","美食居酒屋いろは本舗","からあげ鳥元","CafeBarMichill","retroG＆Bar","アルカード","月のうさぎ","HANA・AKARI善"];

/** グルメ以外の業種の店 ID(lib/places/generated/<業種>.json。店の紹介記事 /<業種>/article/<ID> も同じ ID) */
export const UNLISTED_PLACE_IDS: Readonly<Record<string, readonly string[]>> = {
  "stay": [
    "st0009",
    "st0010",
    "st0011",
    "st0012",
    "st0013",
    "st0014",
    "st0015",
    "st0016",
    "st0017",
    "st0018",
    "st0019",
    "st0020",
    "st0021",
    "st0022",
    "st0023"
  ],
  "beauty": [
    "be0106",
    "be0107",
    "be0109"
  ],
  "pet": [
    "pe0021",
    "pe0022",
    "pe0023"
  ],
  "activity": [
    "ac0013",
    "ac0014",
    "ac0015",
    "ac0016",
    "ac0017",
    "ac0018",
    "ac0019",
    "ac0020",
    "ac0021",
    "ac0022",
    "ac0023",
    "ac0024",
    "ac0025",
    "ac0026",
    "ac0027",
    "ac0028"
  ],
  "sports": [
    "sp0004",
    "sp0005"
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
    "li0045",
    "li0047",
    "li0048",
    "li0049",
    "li0050",
    "li0051",
    "li0052",
    "li0054",
    "li0055",
    "li0056",
    "li0057",
    "li0058",
    "li0059",
    "li0060",
    "li0061",
    "li0062",
    "li0063",
    "li0064",
    "li0065",
    "li0066",
    "li0067",
    "li0068",
    "li0069",
    "li0070",
    "li0071",
    "li0072",
    "li0073",
    "li0074",
    "li0075",
    "li0076",
    "li0077",
    "li0078",
    "li0079",
    "li0080",
    "li0081",
    "li0082",
    "li0083",
    "li0084",
    "li0085",
    "li0086",
    "li0087",
    "li0088",
    "li0089"
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
    "高山スカイセーリングクラブ",
    "サニーディッパークライミング玉城店",
    "ナシレラスター釣り船遊覧船クルージング",
    "(株)工房ヤマセン辻佛檀",
    "八ヶ岳アドベンチャーツアーズ",
    "丸和まくら工房枕づくり体験",
    "屋久島自然案内",
    "CHP仙台サーフショップ",
    "屋久島ダイビングガイド夢心地"
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
