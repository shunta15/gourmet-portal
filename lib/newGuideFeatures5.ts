import type { Feature, FeatureArticle, RankItem } from "./data";

const date = "2026-05-15";
const author = "マチノワ編集部";

const IMG = {
  nakameguro:    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Meguro_River_cherry_blossom_2025_April.jpg/1280px-Meguro_River_cherry_blossom_2025_April.jpg",
  jiyugaoka:     "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Very_cool_shopping_street_in_jiyugaoka_%282460034101%29.jpg/1280px-Very_cool_shopping_street_in_jiyugaoka_%282460034101%29.jpg",
  kichijoji:     "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Inokashira_Park_%40_Kichijoji_%289431564095%29.jpg/1280px-Inokashira_Park_%40_Kichijoji_%289431564095%29.jpg",
  futako:        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Tama_river_at_Futako_Tamagawa_in_Tokyo_Setagaya.jpg/1280px-Tama_river_at_Futako_Tamagawa_in_Tokyo_Setagaya.jpg",
  shimokitazawa: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Shimokitazawa.jpg/1280px-Shimokitazawa.jpg",
  sangenjaya:    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Carrot_Tower_and_an_alley_in_Sangenjaya%2C_Setagaya%2C_Tokyo.jpg/1280px-Carrot_Tower_and_an_alley_in_Sangenjaya%2C_Setagaya%2C_Tokyo.jpg",
  nishi_ogikubo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/JR_Chuo-Main-Line_Nishi-Ogikubo_Station_Gates.jpg/1280px-JR_Chuo-Main-Line_Nishi-Ogikubo_Station_Gates.jpg",
  koenji:        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Koenji_Awa_Odori_Exciting_Love_Part_II._%2838077442%29.jpg/1280px-Koenji_Awa_Odori_Exciting_Love_Part_II._%2838077442%29.jpg",
  toyosu:        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Toyosu_Market_Tokyo_2.jpg/1280px-Toyosu_Market_Tokyo_2.jpg",
  tachikawa:     "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Showa_Memorial_Park_20210101.jpg/1280px-Showa_Memorial_Park_20210101.jpg",
  hachioji:      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Mount_Takao_hike_in_January.jpg/1280px-Mount_Takao_hike_in_January.jpg",
  musashino:     "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Inokashira_Park_%40_Kichijoji_%289431564095%29.jpg/1280px-Inokashira_Park_%40_Kichijoji_%289431564095%29.jpg",
};

function s(n: number, name: string, type: string, area: string, purpose: string, desc: string, imgs: string[], specs: { k: string; v: string }[]): RankItem {
  return { rank: `SPOT ${String(n).padStart(2, "0")}`, rankNum: n, name, cuisine: type, area, purpose, desc, images: imgs, specs };
}
function side(t: string, id: string, img: string) { return { t, h: `/feature/${id}`, img }; }

// NG-80, 81, 88, 90 → INDEXABLE（FEATURES + FEATURE_ARTICLES）
// NG-82〜87, 89, 91 → NOINDEX（FEATURE_ARTICLES のみ）
export const NEW_GUIDE_FEATURES_5: Feature[] = [
  { id: "new-nakameguro-morning",  no: "NG-80", tag: "カフェ・朝活", kicker: "NAKAMEGURO MORNING",  title: "中目黒モーニング5選。目黒川沿いで迎える週末の朝",    sub: "目黒川、中目黒高架下、スタバリザーブ。春は桜、年中おしゃれな朝の中目黒", image: IMG.nakameguro },
  { id: "new-jiyugaoka-patisserie",no: "NG-81", tag: "スイーツ",    kicker: "JIYUGAOKA SWEETS",    title: "自由が丘スイーツ5選。パティスリーの街を歩く",         sub: "モンブラン発祥の街・自由が丘の洋菓子店と隠れカフェ。週末の甘い午後", image: IMG.jiyugaoka },
  { id: "new-toyosu-lunch",        no: "NG-88", tag: "グルメ",      kicker: "TOYOSU GOURMET",       title: "豊洲グルメ5選。市場移転後の湾岸グルメを楽しむ",       sub: "豊洲市場場外、チームラボ豊洲、アーバンドック。移転後に進化した豊洲の食", image: IMG.toyosu },
  { id: "new-hachioji-gourmet",    no: "NG-90", tag: "グルメ",      kicker: "HACHIOJI GOURMET",     title: "八王子グルメ5選。東京西部の食の実力を歩く",           sub: "八王子ラーメン、多摩エリアの地ビール、八王子城跡。都心と異なる食文化圏", image: IMG.hachioji }];

export const NEW_GUIDE_FEATURE_ARTICLES_5: Record<string, FeatureArticle> = {

  // ─── NG-80 INDEXABLE ───────────────────────────────────────────────────────
  "new-nakameguro-morning": {
    id: "new-nakameguro-morning", no: "NG-80", articleType: "guide",
    kicker: "NAKAMEGURO MORNING",
    title: "中目黒モーニング5選。目黒川沿いで迎える週末の朝",
    titleHTML: "中目黒モーニング5選。<br>目黒川沿いの朝",
    subtitle: "目黒川、中目黒高架下、スタバリザーブ。春は桜、年中おしゃれな朝の中目黒",
    lede: "中目黒は目黒川沿いの桜並木と高架下のカフェで知られるエリア。春の桜シーズンは圧倒的だが、年間を通じて週末の朝は上質な時間が流れる。スタバリザーブ・高架下の個人カフェ・川沿い散歩の3点セットが、中目黒モーニングの骨格。渋谷や代官山とも近く、午後の行動とのつなぎがよい。",
    date, reading: "約5分", author,
    heroImage: IMG.nakameguro,
    ranking: [
      s(1, "目黒川沿い散歩（中目黒〜池尻大橋）", "散歩・桜並木", "中目黒", "春は桜のトンネル、年中おしゃれなコーヒー散歩コース",
        "中目黒駅から池尻大橋方向へ目黒川沿いに歩くルートは、春の桜シーズンには圧倒的な景観を見せる。春以外でも川沿いにカフェやベーカリーが点在し、コーヒー片手に歩く週末の朝の散歩コースとして通年人気。",
        [IMG.nakameguro], [{ k: "最寄り駅", v: "中目黒駅 徒歩3分" }, { k: "散歩距離", v: "中目黒〜池尻大橋 約2km" }]),
      s(2, "スターバックスリザーブロースタリー東京", "カフェ・コーヒー", "中目黒", "世界最大級のスタバ旗艦店。目黒川沿いの4階建て",
        "2019年に開業した世界最大級のスタバ旗艦店。豆の焙煎から抽出まで一括して体験できる「ロースタリー」。4階建ての建物は建築としても見応えがあり、ブランチと合わせて訪れる価値がある。週末は開店直後に行くと並ばずに入れることが多い。",
        [IMG.nakameguro], [{ k: "最寄り駅", v: "中目黒駅 徒歩7分" }, { k: "営業時間", v: "7:00〜23:00（変動あり）" }]),
      s(3, "中目黒高架下（東横線高架下）", "商業施設・カフェ", "中目黒", "高架下を活用した飲食店・ショップが並ぶ",
        "東急東横線の高架下を活用した商業スペース「中目黒高架下」には、個性的なカフェ・ダイニング・雑貨店が並ぶ。朝から開いているコーヒースタンドもあり、目黒川散歩の出発点として使いやすい。",
        [IMG.nakameguro], [{ k: "最寄り駅", v: "中目黒駅 徒歩2分" }]),
      s(4, "中目黒〜代官山の徒歩ルート", "散歩・移動", "中目黒〜代官山", "中目黒から代官山T-SITEまで歩いて10分",
        "中目黒駅から代官山駅方向に歩いて10分で代官山T-SITEに到達できる。朝の中目黒で目黒川を散歩した後、代官山でゆっくり本を選ぶという「朝の流れ」が週末の贅沢なルートとして定着している。",
        [IMG.nakameguro], [{ k: "移動時間", v: "中目黒→代官山T-SITE 徒歩約10分" }]),
      s(5, "池尻大橋〜三宿方向のカフェエリア", "カフェ・散歩", "池尻大橋", "中目黒から少し足を伸ばすと静かなカフェが点在",
        "中目黒から池尻大橋・三宿方向に歩くと急に人が減り静かになる。世田谷通り沿いやその路地に個人経営のカフェが点在。地元の人しか知らない穴場ブランチスポットが見つかる可能性が高い。",
        [IMG.nakameguro], [{ k: "最寄り駅", v: "池尻大橋駅 徒歩5分" }])],
    sideArticles: [
      side("中目黒散歩5選", "new-nakameguro-walk", IMG.nakameguro),
      side("恵比寿・代官山5選", "new-ebisu-daikanyama", IMG.nakameguro)],
    quote: "中目黒の朝は「目黒川→高架下→スタバリザーブ」の3点セット。この順番で回れば、東京で最も格のいいモーニングコースが完成する。",
    quoteCite: author,
    closing: "中目黒駅→目黒川散歩（池尻方向へ）→高架下カフェ→スタバリザーブ（10時開店前に並ぶか開店直後に入る）→代官山T-SITEへ。このルートが中目黒モーニングの王道。",
  },

  // ─── NG-81 INDEXABLE ───────────────────────────────────────────────────────
  "new-jiyugaoka-patisserie": {
    id: "new-jiyugaoka-patisserie", no: "NG-81", articleType: "guide",
    kicker: "JIYUGAOKA SWEETS",
    title: "自由が丘スイーツ5選。パティスリーの街を歩く",
    titleHTML: "自由が丘スイーツ5選。<br>パティスリーの街",
    subtitle: "モンブラン発祥の街・自由が丘の洋菓子店と隠れカフェ。週末の甘い午後",
    lede: "自由が丘は「モンブラン」の発祥の地として知られる洋菓子の街。駅を中心とした半径500m以内に複数のパティスリーが集まり、スイーツ目的での訪問にも買い物・散歩とのセットにも使いやすい。ただし「自由が丘」の名がつく有名店が他エリアにも存在するため、店の住所確認は必須。",
    date, reading: "約5分", author,
    heroImage: IMG.jiyugaoka,
    ranking: [
      s(1, "自由が丘 モンブラン（発祥の店）", "洋菓子・カフェ", "自由が丘", "日本のモンブラン文化発祥の老舗。1933年創業",
        "1933年創業、日本のモンブランを生み出したとされる老舗洋菓子店。自由が丘駅前に位置し、昔ながらのモンブランを今も提供している。落ち着いた店内はイートインも可能。",
        [IMG.jiyugaoka], [{ k: "最寄り駅", v: "自由が丘駅 徒歩2分" }, { k: "営業時間", v: "訪問前に公式サイトで確認" }]),
      s(2, "自由が丘スイーツフォレスト（閉業に注意）", "商業施設・スイーツ", "自由が丘", "エリア内のスイーツ複合施設は変わりやすい。最新情報を確認",
        "自由が丘にはスイーツ複合施設が複数あったが、閉業・業態変更が発生しているため、訪問前に最新の営業情報の確認を強く推奨する。名前だけで判断せず公式サイトや現地確認が必須。",
        [IMG.jiyugaoka], [{ k: "最寄り駅", v: "自由が丘駅 徒歩5分" }, { k: "注意", v: "訪問前に必ず最新営業情報を確認すること" }]),
      s(3, "自由が丘駅周辺の個人パティスリー", "洋菓子・パティスリー", "自由が丘", "駅周辺に複数の独立系パティスリーが集まる",
        "自由が丘駅北口・南口周辺の路地には個人経営のパティスリーが複数ある。特定の1軒を目的にするより、歩きながら気になった店に入るスタイルが自由が丘らしい楽しみ方。",
        [IMG.jiyugaoka], [{ k: "最寄り駅", v: "自由が丘駅 徒歩3分" }]),
      s(4, "自由が丘の路地散歩とカフェ", "散歩・カフェ", "自由が丘", "駅から1本路地に入るとカフェと住宅が混在する穏やかなエリア",
        "自由が丘は駅前の商業ゾーンから1本路地に入ると急に住宅地の雰囲気になる。その中にギャラリー兼カフェや隠れパン屋が点在。スイーツ巡りの合間の散歩コースとして組み込みやすい。",
        [IMG.jiyugaoka], [{ k: "最寄り駅", v: "自由が丘駅 徒歩5分" }]),
      s(5, "熊野神社と駒場公園方向", "神社・公園", "自由が丘〜駒場", "自由が丘から少し歩いた閑静な住宅地に公園と神社",
        "自由が丘から北方向に15分歩くと駒場公園・旧前田家本邸がある。スイーツ巡りの後に腹ごなしの散歩を兼ねて訪れるのに向いている。駒場東大前駅から戻ることもできる。",
        [IMG.jiyugaoka], [{ k: "最寄り駅", v: "駒場東大前駅 徒歩5分" }, { k: "入場", v: "駒場公園・旧前田家本邸は無料（一部要確認）" }])],
    sideArticles: [
      side("中目黒モーニング5選", "new-nakameguro-morning", IMG.nakameguro),
      side("恵比寿・代官山5選", "new-ebisu-daikanyama", IMG.nakameguro)],
    quote: "自由が丘は「1軒決めて、あとは歩く」が正解。目的のパティスリーを1軒決め、あとは路地を歩いて気になった店に入ればいい。",
    quoteCite: author,
    closing: "自由が丘駅→モンブラン（発祥の店）→駅周辺の個人パティスリー巡り→路地散歩→駒場方向へ消化散歩。スイーツ好きには半日では足りないエリア。",
  },

  // ─── NG-82 noindex ─────────────────────────────────────────────────────────

  // ─── NG-83 noindex ─────────────────────────────────────────────────────────

  // ─── NG-84 noindex ─────────────────────────────────────────────────────────

  // ─── NG-85 noindex ─────────────────────────────────────────────────────────

  // ─── NG-86 noindex ─────────────────────────────────────────────────────────

  // ─── NG-87 noindex ─────────────────────────────────────────────────────────

  // ─── NG-88 INDEXABLE ───────────────────────────────────────────────────────
  "new-toyosu-lunch": {
    id: "new-toyosu-lunch", no: "NG-88", articleType: "guide",
    kicker: "TOYOSU GOURMET",
    title: "豊洲グルメ5選。市場移転後の湾岸グルメを楽しむ",
    titleHTML: "豊洲グルメ5選。<br>湾岸の食と市場",
    subtitle: "豊洲市場場外、チームラボ豊洲、アーバンドック。移転後に進化した豊洲の食文化",
    lede: "豊洲は2018年に築地市場の機能を引き継いだ豊洲市場が開業し、湾岸エリアの食の拠点として新たな発展を続けている。市場内の飲食ゾーン・場外のグルメ施設・アーバンドックの商業施設が組み合わさった「豊洲グルメ」は、築地時代とは異なる現代的な食体験を提供する。豊洲駅から徒歩圏内でまとめて回れるのも利点。",
    date, reading: "約5分", author,
    heroImage: IMG.toyosu,
    ranking: [
      s(1, "豊洲市場 飲食棟（江戸前場外 千客万来）", "市場・海鮮", "豊洲", "2024年開業の場外グルメ施設。海鮮丼・寿司・天ぷら",
        "2024年2月に開業した「豊洲場外 千客万来」は豊洲市場に隣接する飲食・温浴施設。海鮮丼・すし・天ぷら・食べ歩きと築地場外に近い体験ができる。温浴施設「万葉倶楽部」も併設。開業間もなく人気が高いため、訪問前に混雑状況の確認を推奨。",
        [IMG.toyosu], [{ k: "最寄り駅", v: "市場前駅 直結" }, { k: "営業時間", v: "施設による。公式サイト確認" }]),
      s(2, "豊洲市場 見学ルート", "市場・見学", "豊洲", "水産・青果の世界最大級の市場を一般見学できる",
        "豊洲市場は一般向けの見学コースが設けられており、市場棟のガラス越しに競りや仕分け作業を観察できる。早朝から開いている見学ルートは事前に開放時間を公式サイトで確認すること。",
        [IMG.toyosu], [{ k: "最寄り駅", v: "市場前駅 徒歩5分" }, { k: "見学", v: "無料（時間帯要確認）" }]),
      s(3, "チームラボ プラネッツ TOKYO（豊洲）", "アート・体験", "豊洲", "水に浸かりながら体験する没入型デジタルアート",
        "豊洲エリアに位置するチームラボの常設展示施設。水の中を歩きながら体験するインスタレーションが特徴で、チームラボ作品の中でも独特の体験が得られる。事前予約が必須。",
        [IMG.toyosu], [{ k: "最寄り駅", v: "新豊洲駅 徒歩1分" }, { k: "入場料", v: "訪問前に公式サイトで確認" }, { k: "予約", v: "事前予約必須" }]),
      s(4, "アーバンドック ららぽーと豊洲", "ショッピング・グルメ", "豊洲", "豊洲の湾岸に面した大型ショッピングモール",
        "豊洲駅直結の大型商業施設。レストランフロアが充実しており、ランチ・ディナーともに選択肢が多い。屋外デッキから晴海・お台場方面の湾岸景色が楽しめる。",
        [IMG.toyosu], [{ k: "最寄り駅", v: "豊洲駅 直結" }, { k: "営業時間", v: "11:00〜21:00（変動あり）" }]),
      s(5, "豊洲ぐるり公園", "公園・湾岸散策", "豊洲", "豊洲半島を一周する約2.3kmの遊歩道。レインボーブリッジが見える",
        "豊洲半島の外周を一周できる遊歩道「豊洲ぐるり公園」。レインボーブリッジ・晴海・お台場の眺望が楽しめ、グルメの後の消化散歩コースとして最適。",
        [IMG.toyosu], [{ k: "最寄り駅", v: "豊洲駅 徒歩5分" }, { k: "入場", v: "無料" }])],
    sideArticles: [
    ],
    quote: "豊洲は「築地の代わり」として開業したが、今は独自のグルメゾーンとして進化している。市場見学・海鮮・アート・公園散歩を1日でまとめて体験できる。",
    quoteCite: author,
    closing: "市場前駅→豊洲市場見学→千客万来（海鮮ランチ）→チームラボ（要予約）→ぐるり公園（散歩）→ららぽーと豊洲（買い物）の順が最も効率的。",
  },

  // ─── NG-89 noindex ─────────────────────────────────────────────────────────

  // ─── NG-90 INDEXABLE ───────────────────────────────────────────────────────
  "new-hachioji-gourmet": {
    id: "new-hachioji-gourmet", no: "NG-90", articleType: "guide",
    kicker: "HACHIOJI GOURMET",
    title: "八王子グルメ5選。東京西部の食の実力を歩く",
    titleHTML: "八王子グルメ5選。<br>東京西部の食文化",
    subtitle: "八王子ラーメン、八王子城跡、多摩の地ビール。都心と異なる食文化圏を探索する",
    lede: "八王子は東京都内最大の市域を持つ都市で、独自の食文化が育まれてきた。「八王子ラーメン」はたまねぎの薬味が特徴の独自ジャンル。市内には八王子城跡・高尾山も近く、食事と観光を組み合わせた一日コースが作れる。",
    date, reading: "約5分", author,
    heroImage: IMG.hachioji,
    ranking: [
      s(1, "八王子ラーメン（八王子駅周辺）", "ラーメン", "八王子", "たまねぎの刻みが入る独自スタイルの醤油ラーメン",
        "「八王子ラーメン」は刻み玉ねぎを薬味として使う醤油ラーメンで、八王子市内の複数の専門店で食べられる独自のジャンル。あっさりした清湯スープとたまねぎの甘みが特徴。八王子駅周辺に複数の老舗店がある。",
        [IMG.hachioji], [{ k: "最寄り駅", v: "八王子駅 徒歩5〜15分" }, { k: "価格目安", v: "700〜900円（店舗により異なる）" }]),
      s(2, "八王子城跡（史跡）", "史跡・ハイキング", "八王子", "北条氏の山城跡。整備された遊歩道でハイキングも",
        "八王子城は1590年の豊臣秀吉による北条氏討伐で落城した山城の跡。国の指定史跡で、本丸跡への整備された遊歩道があり軽いハイキングが楽しめる。城主夫人の碑など歴史的な見どころも多い。",
        [IMG.hachioji], [{ k: "最寄り駅", v: "高尾駅からバスで15分" }, { k: "入場", v: "無料" }]),
      s(3, "高尾山（八王子市内）", "山岳・ハイキング", "高尾", "年間登山者数世界一のアクセス抜群の山",
        "八王子市内に位置する高尾山は標高599mで、東京都心から1時間のアクセス。ケーブルカー・ロープウェイでも山頂近くまで行ける。薬王院・山頂の眺望・紅葉が見どころ。",
        [IMG.hachioji], [{ k: "最寄り駅", v: "高尾山口駅 徒歩すぐ" }, { k: "ケーブルカー", v: "訪問前に公式サイトで確認" }]),
      s(4, "八王子駅周辺の地ビール・クラフトビール", "クラフトビール", "八王子", "多摩エリアのクラフトビール文化。都心より落ち着いた雰囲気",
        "八王子市内にはクラフトビールを提供するバー・ブルワリーが複数ある。都心の混雑したビアバーと違い落ち着いた雰囲気で飲めるのが八王子の魅力。ラーメンの後の〆ビールとして使いやすい。",
        [IMG.hachioji], [{ k: "最寄り駅", v: "八王子駅 徒歩10分以内" }]),
      s(5, "石川宿・八王子市内の宿場町跡", "歴史・散歩", "八王子", "甲州街道の宿場町として栄えた八王子の歴史を歩く",
        "八王子は甲州街道の宿場町として江戸時代に栄えた。市内には当時の街道沿いの建物の面影が残るエリアがあり、「八王子市郷土資料館」でその歴史を学べる。",
        [IMG.hachioji], [{ k: "最寄り駅", v: "八王子駅 徒歩15分" }, { k: "入場", v: "郷土資料館は無料（訪問前に確認）" }])],
    sideArticles: [
    ],
    quote: "八王子ラーメンは「なぜ玉ねぎ？」と思いながら食べると、食べ終わる頃には正解に感じてくる。都心と異なる食文化がちゃんとある街。",
    quoteCite: author,
    closing: "八王子駅→八王子ラーメンでランチ→八王子城跡（史跡見学）→高尾山（ハイキング）→山麓の蕎麦・クラフトビールで締め。アウトドアとグルメを組み合わせた八王子の鉄板コース。",
  },

  // ─── NG-91 noindex ─────────────────────────────────────────────────────────
};
