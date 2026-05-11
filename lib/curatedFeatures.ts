import type { Feature, FeatureArticle, RankItem } from "./data";

const date = "2026-05-11";
const author = "マチノワ編集部";

function stop(
  rankNum: number,
  item: Omit<RankItem, "rank" | "rankNum">
): RankItem {
  return {
    rank: `STOP ${String(rankNum).padStart(2, "0")}`,
    rankNum,
    ...item,
  };
}

function pick(
  rankNum: number,
  item: Omit<RankItem, "rank" | "rankNum">
): RankItem {
  return {
    rank: `PICK ${String(rankNum).padStart(2, "0")}`,
    rankNum,
    ...item,
  };
}

export const CURATED_FEATURES: Feature[] = [
  {
    id: "scene-osaka-fukushima-date",
    no: "S01",
    tag: "デート",
    kicker: "OSAKA FUKUSHIMA DATE",
    title: "大阪・福島でデートするなら。昼から夜まで使える3軒",
    sub: "ランチ、夕方の中華、夜の小料理まで。距離感で選ぶ福島デート",
    image: "/restaurants/r21/r21-image-1.jpg",
  },
  {
    id: "scene-kyoto-fushimi-tour",
    no: "S02",
    tag: "観光",
    kicker: "KYOTO FUSHIMI TOUR",
    title: "京都・伏見観光のあとに寄りたい店",
    sub: "カレー、バール、日本酒。歩いた日の胃にちょうどいい伏見の3軒",
    image: "/restaurants/r148/r148-01.jpg",
  },
  {
    id: "scene-nagoya-anniversary",
    no: "S03",
    tag: "記念日",
    kicker: "NAGOYA ANNIVERSARY",
    title: "名古屋で記念日ディナー。ワインと個室で選ぶ夜",
    sub: "錦、名駅南、南久宝寺町。重すぎず、でも外さない大人の食事",
    image: "/restaurants/r53/r53-01.jpg",
  },
  {
    id: "scene-kobe-sannomiya-date",
    no: "S04",
    tag: "デート",
    kicker: "KOBE SANNOMIYA DATE",
    title: "神戸三宮デート。昼カフェから夜ごはんまで",
    sub: "焼肉、スペイン料理、薬膳粥。港町らしい夜の流れを作る",
    image: "/restaurants/r76/r76-01.png",
  },
  {
    id: "scene-kamata-afterwork",
    no: "S05",
    tag: "仕事帰り",
    kicker: "KAMATA AFTER WORK",
    title: "蒲田で仕事帰りに飲むなら。焼鳥、鮨、ビストロまで",
    sub: "早い時間の一杯から深夜のワインまで、蒲田らしい夜の選択肢",
    image: "/restaurants/r95/r95-01.jpg",
  },
  {
    id: "scene-osaka-solo-counter",
    no: "S06",
    tag: "一人飲み",
    kicker: "OSAKA SOLO COUNTER",
    title: "大阪で一人飲み。カウンターで落ち着ける店",
    sub: "天六、関目、九条。ひとりで入って、ちゃんと満たされる店",
    image: "/restaurants/r38/r38-image-1.jpg",
  },
  {
    id: "scene-nakazakicho-weekend",
    no: "S07",
    tag: "休日",
    kicker: "NAKAZAKICHO WEEKEND",
    title: "中崎町で休日カフェ巡り。昼から夜まで使える店",
    sub: "お茶、カフェ、バー。予定を詰めすぎない休日の歩き方",
    image: "/restaurants/r28/r28-image-1.jpg",
  },
  {
    id: "scene-osaka-private-dinner",
    no: "S08",
    tag: "会食",
    kicker: "OSAKA PRIVATE DINNER",
    title: "大阪で個室・会食に使いやすい店",
    sub: "北浜、上新庄、関目高殿。静かに話せる夜のための候補",
    image: "/restaurants/r25/r25-image-1.jpg",
  },
  {
    id: "scene-first-date-italian",
    no: "S09",
    tag: "初デート",
    kicker: "FIRST DATE ITALIAN",
    title: "初デートで重すぎないイタリアン3選",
    sub: "ワイン、ピザ、パスタ。気取らず会話が続く店を選ぶ",
    image: "/restaurants/r35/r35-image-1.png",
  },
  {
    id: "scene-osaka-retro-cafe",
    no: "S10",
    tag: "喫茶",
    kicker: "OSAKA RETRO CAFE",
    title: "大阪のレトロ喫茶。朝から夕方まで座っていたい店",
    sub: "モーニング、焙煎、駄菓子。大阪の日常に残る喫茶文化",
    image: "/restaurants/r17/r17-01.jpg",
  },
];

export const CURATED_FEATURE_ARTICLES: Record<string, FeatureArticle> = {
  "scene-osaka-fukushima-date": {
    id: "scene-osaka-fukushima-date",
    no: "S01",
    articleType: "course",
    kicker: "OSAKA FUKUSHIMA DATE",
    title: "大阪・福島でデートするなら。昼から夜まで使える3軒",
    titleHTML: "大阪・福島でデートするなら。<br>昼から夜まで使える3軒",
    subtitle: "ランチ、夕方の中華、夜の小料理。会話の距離で選ぶ福島デート",
    lede:
      "福島は、梅田から近いのに少し落ち着いて話せる店が多い街。初回のデートなら軽いランチ、二度目以降なら夕方から小料理や自然派ワインへ。この記事では「長く話せるか」「予約しやすいか」「重すぎないか」を基準に3軒を選ぶ。",
    date,
    reading: "約5分",
    author,
    heroImage: "/restaurants/r21/r21-image-1.jpg",
    ranking: [
      stop(1, {
        name: "バランス食堂 七源 福島店",
        cuisine: "居酒屋・自然派ワイン",
        area: "大阪・新福島",
        time: "12:00",
        purpose: "ランチデート：自然派ワインもある、気負わない昼",
        transit: "徒歩圏で福島の路地へ",
        href: "/restaurant/r62",
        desc:
          "昼から使えて、夜は自然派ワインと純米酒も楽しめる。重すぎるレストランではなく、でもチェーンではない店を選びたい時にちょうどいい。初デートなら、ランチで食の好みを探る入口に向く。",
        images: ["/restaurants/r62/r62-01.jpg"],
        specs: [
          { k: "向いている相手", v: "まだ距離を探っている初回デート" },
          { k: "使う時間", v: "ランチから早めの夕方" },
          { k: "決め手", v: "自然派ワイン、個室、ランチ対応" },
        ],
      }),
      stop(2, {
        name: "路地裏チャイニーズ 有馬",
        cuisine: "中華料理",
        area: "大阪・福島",
        time: "17:30",
        purpose: "夕方デート：少しくだけた中華で会話をほどく",
        transit: "徒歩で二軒目へ",
        href: "/restaurant/r61",
        desc:
          "路地裏の中華は、肩肘張らずに料理を分け合えるのが強い。よだれ鶏や炒め物を挟むと会話の間も自然に作れる。おしゃれすぎる店が苦手な相手にも使いやすい。",
        images: ["/restaurants/r61/r61-01.jpg"],
        specs: [
          { k: "向いている相手", v: "気取らない食事が好きな人" },
          { k: "使う時間", v: "夕方から夜の一軒目" },
          { k: "決め手", v: "シェアしやすい中華、路地裏感" },
        ],
      }),
      stop(3, {
        name: "月と桜",
        cuisine: "居酒屋・小料理",
        area: "大阪・福島",
        time: "19:30",
        purpose: "夜デート：静かに話したい小料理の締め",
        href: "/restaurant/r21",
        desc:
          "福島駅近くの和モダンな小料理屋。日本酒と前菜盛りを軸に、夜を少しきれいに締められる。関係性が少し進んだデートや、記念日前の下見にも向く。",
        images: ["/restaurants/r21/r21-image-1.jpg"],
        specs: [
          { k: "向いている相手", v: "静かに食事したい相手" },
          { k: "使う時間", v: "夜のメイン" },
          { k: "決め手", v: "駅近、小料理、日本酒" },
        ],
      }),
    ],
    sideArticles: [
      { t: "大阪で一人飲み。カウンターで落ち着ける店", h: "/feature/scene-osaka-solo-counter", img: "/restaurants/r38/r38-image-1.jpg" },
      { t: "大阪で個室・会食に使いやすい店", h: "/feature/scene-osaka-private-dinner", img: "/restaurants/r25/r25-image-1.jpg" },
    ],
    quote: "福島のデートは、派手さより会話の続きやすさで選びたい。",
    quoteCite: "マチノワ編集部",
    closing:
      "デートの店選びで大事なのは、料理の強さだけではない。待ち合わせから入店までの距離、料理を分け合えるか、声の大きさが気にならないか。福島なら、その細かい条件を満たす店を時間帯ごとに選べる。",
  },
  "scene-kyoto-fushimi-tour": {
    id: "scene-kyoto-fushimi-tour",
    no: "S02",
    articleType: "course",
    kicker: "KYOTO FUSHIMI TOUR",
    title: "京都・伏見観光のあとに寄りたい店",
    titleHTML: "京都・伏見観光のあとに<br>寄りたい店",
    subtitle: "歩いた日の胃にちょうどいい、伏見の昼と夜",
    lede:
      "伏見稲荷や酒蔵めぐりのあと、観光地の近くで無理に探すより、少し腰を落ち着けられる店を知っておくと旅は楽になる。昼はスパイス、夜はバールや日本酒。観光の疲れを受け止める3軒を選ぶ。",
    date,
    reading: "約4分",
    author,
    heroImage: "/restaurants/r148/r148-01.jpg",
    ranking: [
      stop(1, {
        name: "南国電波",
        cuisine: "インド料理・ネパール料理",
        area: "京都・伏見",
        time: "13:00",
        purpose: "観光ランチ：歩いた後のカレー",
        transit: "伏見エリアを散策",
        href: "/restaurant/r148",
        desc:
          "観光で歩いた後は、重いコースよりスパイスの効いたカレーがちょうどいい。伏見で昼を外したくない時の実用的な選択肢。ひとり旅でも入りやすい。",
        images: ["/restaurants/r148/r148-01.jpg"],
        specs: [
          { k: "向いている人", v: "伏見観光のランチ難民" },
          { k: "使う時間", v: "昼" },
          { k: "決め手", v: "カレー、ランチ、ひとり旅" },
        ],
      }),
      stop(2, {
        name: "Bar Arietta",
        cuisine: "イタリアン・カフェ・バール",
        area: "京都・伏見桃山",
        time: "17:00",
        purpose: "夕方：軽く飲んで夜へつなぐ",
        transit: "徒歩または電車で移動",
        href: "/restaurant/r158",
        desc:
          "夕方に少し座り、バール感覚で一杯飲める店は旅先でありがたい。夜ごはんまでの中継地点として使える。食べすぎず、旅の後半に余白を残せるのがいい。",
        images: ["/restaurants/r158/r158-01.jpg"],
        specs: [
          { k: "向いている人", v: "早めに飲み始めたい旅行者" },
          { k: "使う時間", v: "夕方から夜" },
          { k: "決め手", v: "バール、カフェ、軽い食事" },
        ],
      }),
      stop(3, {
        name: "お出汁と日本酒 せつ",
        cuisine: "和食・日本酒",
        area: "京都・烏丸",
        time: "19:30",
        purpose: "夜：京都らしく出汁と日本酒で締める",
        href: "/restaurant/r146",
        desc:
          "観光の最後は、派手な名物より出汁と日本酒で落ち着きたい。伏見から市内へ戻る夜に、京都らしい余韻を作れる。大人の旅行や二人旅に向く締めの一軒。",
        images: ["/restaurants/r146/r146-01.jpg"],
        specs: [
          { k: "向いている人", v: "落ち着いた京都の夜を過ごしたい人" },
          { k: "使う時間", v: "夜のメイン" },
          { k: "決め手", v: "出汁、日本酒、和食" },
        ],
      }),
    ],
    sideArticles: [
      { t: "京都で深夜まで使える店。二軒目にも強い酒場案内", h: "/feature/feature-kyoto-bar", img: "/restaurants/r158/r158-01.jpg" },
      { t: "初デートで重すぎないイタリアン3選", h: "/feature/scene-first-date-italian", img: "/restaurants/r35/r35-image-1.png" },
    ],
    quote: "観光の後の店は、名物よりも疲れ方に合っているかで選ぶ。",
    quoteCite: "マチノワ編集部",
    closing:
      "伏見観光のあとに必要なのは、派手な看板ではなく、すっと座れて旅の続きを話せる店。昼、夕方、夜の使い分けを持っておくと、京都の一日がずっと楽になる。",
  },
  "scene-nagoya-anniversary": {
    id: "scene-nagoya-anniversary",
    no: "S03",
    articleType: "ranking",
    kicker: "NAGOYA ANNIVERSARY",
    title: "名古屋で記念日ディナー。ワインと個室で選ぶ夜",
    titleHTML: "名古屋で記念日ディナー。<br>ワインと個室で選ぶ夜",
    subtitle: "錦、名駅南、南区。大人の夜に使いやすい3軒",
    lede:
      "記念日の店選びは、豪華さだけでは足りない。会話のしやすさ、ワインの相談しやすさ、帰りやすい立地。名古屋で特別感を作りつつ、重すぎない夜にできる店を選んだ。",
    date,
    reading: "約4分",
    author,
    heroImage: "/restaurants/r53/r53-01.jpg",
    ranking: [
      pick(1, {
        name: "Wine & Italian l'ORTO",
        cuisine: "イタリアン・ワインバー",
        area: "名古屋・錦/栄",
        href: "/restaurant/r53",
        desc:
          "錦三丁目のビル奥にある隠れ家イタリアン。ソムリエにワインを相談でき、半個室もある。華やかすぎず静かすぎない、記念日の夜にちょうどいい温度感。",
        images: ["/restaurants/r53/r53-01.jpg"],
        specs: [
          { k: "向いている用途", v: "記念日、デート、ワイン好き" },
          { k: "予算目安", v: "夜 ¥10,000〜" },
          { k: "決め手", v: "半個室、ソムリエ、栄徒歩圏" },
        ],
      }),
      pick(2, {
        name: "タヴェルナ グイダ",
        cuisine: "イタリアン",
        area: "名古屋・名駅南",
        href: "/restaurant/r69",
        desc:
          "名駅南でワインとイタリアンを楽しむなら候補に入る一軒。駅前のにぎやかさから少し離れているため、食事に集中しやすい。名古屋駅集合の記念日に向く。",
        images: ["/restaurants/r69/r69-image_01.jpg"],
        specs: [
          { k: "向いている用途", v: "名駅集合のディナー" },
          { k: "予算目安", v: "夜の食事向き" },
          { k: "決め手", v: "名駅南、ワイン、落ち着き" },
        ],
      }),
      pick(3, {
        name: "お喜楽イタリア創作料理 Basta Basta",
        cuisine: "イタリアン",
        area: "名古屋・南区",
        href: "/restaurant/r04",
        desc:
          "フォーマルすぎる店が苦手な二人なら、町場のイタリアンがいい。お箸で食べられる気軽さがあり、家族や長く付き合った相手との記念日にも使いやすい。",
        images: ["/restaurants/r04/r04-info-4.webp"],
        specs: [
          { k: "向いている用途", v: "気取らない記念日、家族祝い" },
          { k: "予算目安", v: "夜 ¥3,000〜" },
          { k: "決め手", v: "貸切、駐車場、日常感" },
        ],
      }),
    ],
    sideArticles: [
      { t: "初デートで重すぎないイタリアン3選", h: "/feature/scene-first-date-italian", img: "/restaurants/r35/r35-image-1.png" },
      { t: "名古屋でワインを楽しめる店", h: "/feature/feature-wine-bar", img: "/restaurants/r53/r53-01.jpg" },
    ],
    quote: "記念日は、料理だけでなく沈黙の居心地まで予約したい。",
    quoteCite: "マチノワ編集部",
    closing:
      "名古屋の記念日ディナーは、都心の華やかさと町場の気軽さを使い分けられる。相手との関係性に合わせて、半個室、ワイン、駅距離を選ぶのが外さない近道だ。",
  },
  "scene-kobe-sannomiya-date": {
    id: "scene-kobe-sannomiya-date",
    no: "S04",
    articleType: "course",
    kicker: "KOBE SANNOMIYA DATE",
    title: "神戸三宮デート。昼カフェから夜ごはんまで",
    titleHTML: "神戸三宮デート。<br>昼カフェから夜ごはんまで",
    subtitle: "港町らしいジャンルの幅を、歩ける距離で楽しむ",
    lede:
      "神戸デートは、景色だけで終わらせるともったいない。昼は軽く、夜は肉かスペイン料理、最後は小さく締める。三宮周辺で、会話のテンポを変えながら過ごせる3軒を選んだ。",
    date,
    reading: "約4分",
    author,
    heroImage: "/restaurants/r76/r76-01.png",
    ranking: [
      stop(1, {
        name: "New York Garden Place hug",
        cuisine: "カフェ・パスタ",
        area: "神戸・六甲道",
        time: "13:00",
        purpose: "昼：軽く食べて会話を始める",
        transit: "三宮方面へ移動",
        href: "/restaurant/r77",
        desc:
          "昼の集合なら、いきなり重い食事よりカフェとパスタがちょうどいい。ランチからスイーツまで対応し、初めてのデートでも入りやすい。",
        images: ["/restaurants/r77/r77-01.jpg"],
        specs: [
          { k: "向いている用途", v: "昼デート、カフェランチ" },
          { k: "使う時間", v: "昼から午後" },
          { k: "決め手", v: "パスタ、スイーツ、ランチ" },
        ],
      }),
      stop(2, {
        name: "神戸ミートバンク",
        cuisine: "焼肉",
        area: "神戸・三宮",
        time: "18:30",
        purpose: "夜：肉でちゃんと盛り上げる",
        transit: "徒歩圏で二軒目へ",
        href: "/restaurant/r76",
        desc:
          "夜にもう一段テンションを上げるなら焼肉。A5和牛を軸にした店は、会話が止まっても焼く作業があるので気まずくなりにくい。二度目以降のデートに向く。",
        images: ["/restaurants/r76/r76-01.png"],
        specs: [
          { k: "向いている用途", v: "二度目以降のデート、肉好き" },
          { k: "使う時間", v: "夜のメイン" },
          { k: "決め手", v: "和牛、三宮、ディナー" },
        ],
      }),
      stop(3, {
        name: "カルメン",
        cuisine: "スペイン料理",
        area: "神戸・三宮",
        time: "20:30",
        purpose: "二軒目：タパスとワインで余韻を作る",
        href: "/restaurant/r110",
        desc:
          "もう少し話したい時、タパスとワインの店は二軒目に使いやすい。食事量を調整でき、時間を引き伸ばしすぎない。港町らしい異国感もある。",
        images: ["/restaurants/r110/r110-01.jpg"],
        specs: [
          { k: "向いている用途", v: "二軒目、ワイン、軽い食事" },
          { k: "使う時間", v: "夜の後半" },
          { k: "決め手", v: "スペイン料理、タパス、三宮" },
        ],
      }),
    ],
    sideArticles: [
      { t: "初デートで重すぎないイタリアン3選", h: "/feature/scene-first-date-italian", img: "/restaurants/r35/r35-image-1.png" },
      { t: "大阪・福島でデートするなら", h: "/feature/scene-osaka-fukushima-date", img: "/restaurants/r21/r21-image-1.jpg" },
    ],
    quote: "神戸デートは、一軒で決めきらず、夜の流れで作る。",
    quoteCite: "マチノワ編集部",
    closing:
      "神戸は、ジャンルの幅を歩ける距離で楽しめる街。昼、夜、二軒目の温度を変えながら選ぶと、ただ食べるだけではない一日になる。",
  },
  "scene-kamata-afterwork": {
    id: "scene-kamata-afterwork",
    no: "S05",
    articleType: "ranking",
    kicker: "KAMATA AFTER WORK",
    title: "蒲田で仕事帰りに飲むなら。焼鳥、鮨、ビストロまで",
    titleHTML: "蒲田で仕事帰りに飲むなら。<br>焼鳥、鮨、ビストロまで",
    subtitle: "早い時間の一杯から、深夜のワインまで",
    lede:
      "蒲田の夜は、きれいに整いすぎていないのがいい。仕事帰りの一杯、ちゃんと魚を食べたい夜、深夜にワインで締めたい夜。気分別に3軒を選ぶ。",
    date,
    reading: "約4分",
    author,
    heroImage: "/restaurants/r95/r95-01.jpg",
    ranking: [
      pick(1, {
        name: "えど屋",
        cuisine: "焼き鳥",
        area: "東京・西蒲田",
        href: "/restaurant/r71",
        desc:
          "夕方から気軽に入れる焼き鳥店。まず一杯飲んで帰るか、もう一軒行くかを決めたい夜に向く。蒲田らしい肩の力の抜けた始まり方ができる。",
        images: ["/restaurants/r71/r71-01.jpg"],
        specs: [
          { k: "向いている用途", v: "早い時間の一杯、せんべろ" },
          { k: "予算目安", v: "¥1,500〜" },
          { k: "決め手", v: "焼き鳥、夕方、一人飲み" },
        ],
      }),
      pick(2, {
        name: "魚菜屋 なかむら",
        cuisine: "海鮮・日本料理",
        area: "東京・新蒲田",
        href: "/restaurant/r95",
        desc:
          "仕事終わりに『今日はちゃんと食べたい』と思った時の海鮮。日本酒と季節の魚で、平日の夜を少し整えられる。ひとりでも会食でも使いやすい。",
        images: ["/restaurants/r95/r95-01.jpg"],
        specs: [
          { k: "向いている用途", v: "海鮮、日本酒、少人数" },
          { k: "予算目安", v: "¥4,000〜" },
          { k: "決め手", v: "魚、カウンター、ランチあり" },
        ],
      }),
      pick(3, {
        name: "nouaison ヌエゾン",
        cuisine: "ビストロ・フレンチ",
        area: "東京・西蒲田",
        href: "/restaurant/r106",
        desc:
          "深夜1時まで開く大人のビストロ。蒲田の最後にナチュラルワインを一杯、という使い方ができる。仕事が長引いた日にも間に合うのが強い。",
        images: ["/restaurants/r106/r106-01.png"],
        specs: [
          { k: "向いている用途", v: "深夜、ワイン、二軒目" },
          { k: "予算目安", v: "¥4,000〜" },
          { k: "決め手", v: "深夜営業、ビストロ、ワイン" },
        ],
      }),
    ],
    sideArticles: [
      { t: "大阪で一人飲み。カウンターで落ち着ける店", h: "/feature/scene-osaka-solo-counter", img: "/restaurants/r38/r38-image-1.jpg" },
      { t: "大阪で個室・会食に使いやすい店", h: "/feature/scene-osaka-private-dinner", img: "/restaurants/r25/r25-image-1.jpg" },
    ],
    quote: "蒲田の夜は、予定を決めすぎない方がうまくいく。",
    quoteCite: "マチノワ編集部",
    closing:
      "焼き鳥で早く始める夜も、魚で整える夜も、ビストロで締める夜もある。蒲田はその振れ幅を受け止める街だ。",
  },
  "scene-osaka-solo-counter": {
    id: "scene-osaka-solo-counter",
    no: "S06",
    articleType: "ranking",
    kicker: "OSAKA SOLO COUNTER",
    title: "大阪で一人飲み。カウンターで落ち着ける店",
    titleHTML: "大阪で一人飲み。<br>カウンターで落ち着ける店",
    subtitle: "天六、関目、九条。ひとりで入れる夜の止まり木",
    lede:
      "一人飲みで大事なのは、料理より先に空気だ。入りやすいか、長居しすぎなくていいか、注文しやすいか。大阪でひとりの夜に使いやすい店を選んだ。",
    date,
    reading: "約4分",
    author,
    heroImage: "/restaurants/r38/r38-image-1.jpg",
    ranking: [
      pick(1, {
        name: "鶏居酒屋pao福",
        cuisine: "鶏居酒屋",
        area: "大阪・天神橋筋六丁目",
        href: "/restaurant/r03",
        desc:
          "鶏料理を軸に、カウンターでもグループでも使える。チキン南蛮や鶏刺しを少しずつ頼み、ビールで始める一人飲みにちょうどいい。",
        images: ["/restaurants/paofuku-interior-wide.jpg"],
        specs: [
          { k: "向いている用途", v: "仕事帰り、一人飲み、鶏料理" },
          { k: "予算目安", v: "¥3,000〜" },
          { k: "決め手", v: "鶏料理、個室、貸切も可" },
        ],
      }),
      pick(2, {
        name: "stand 酒場 マコチとピーナッツ",
        cuisine: "立ち飲み居酒屋",
        area: "大阪・関目",
        href: "/restaurant/r38",
        desc:
          "駅近のスタンド酒場は、ひとりで入りやすい。短時間でも満足でき、二軒目にも使える。深夜まで開くのも心強い。",
        images: ["/restaurants/r38/r38-image-1.jpg"],
        specs: [
          { k: "向いている用途", v: "立ち飲み、二軒目、深夜" },
          { k: "予算目安", v: "¥2,000〜" },
          { k: "決め手", v: "関目駅近、手作り料理" },
        ],
      }),
      pick(3, {
        name: "炭焼屋サンペイ",
        cuisine: "焼鳥・炭火",
        area: "大阪・九条",
        href: "/restaurant/r63",
        desc:
          "炭火焼きの香りがある店は、一人でも時間を持て余しにくい。焼けるのを待つ時間も含めて夜になる。九条で静かに飲みたい時の候補。",
        images: ["/restaurants/r63/r63-01.jpg"],
        specs: [
          { k: "向いている用途", v: "焼鳥、炭火、一人飲み" },
          { k: "予算目安", v: "¥3,000〜" },
          { k: "決め手", v: "個室、一人飲み、九条" },
        ],
      }),
    ],
    sideArticles: [
      { t: "蒲田で仕事帰りに飲むなら", h: "/feature/scene-kamata-afterwork", img: "/restaurants/r95/r95-01.jpg" },
      { t: "大阪・福島でデートするなら", h: "/feature/scene-osaka-fukushima-date", img: "/restaurants/r21/r21-image-1.jpg" },
    ],
    quote: "一人飲みの名店は、放っておいてくれる優しさがある。",
    quoteCite: "マチノワ編集部",
    closing:
      "大阪の一人飲みは、店の派手さより席の居心地で決まる。カウンター、立ち飲み、炭火。ひとりの時間を邪魔しない店を持っておくと、街が少し味方になる。",
  },
  "scene-nakazakicho-weekend": {
    id: "scene-nakazakicho-weekend",
    no: "S07",
    articleType: "course",
    kicker: "NAKAZAKICHO WEEKEND",
    title: "中崎町で休日カフェ巡り。昼から夜まで使える店",
    titleHTML: "中崎町で休日カフェ巡り。<br>昼から夜まで使える店",
    subtitle: "中国茶、カフェ、バー。予定を詰めすぎない休日",
    lede:
      "中崎町の休日は、目的を一つに絞らない方が楽しい。お茶を飲み、路地を歩き、夜に一杯飲む。ゆるい時間を作るための3軒を選んだ。",
    date,
    reading: "約4分",
    author,
    heroImage: "/restaurants/r28/r28-image-1.jpg",
    ranking: [
      stop(1, {
        name: "World Tree Tea＆Coffee -世界樹のお茶-",
        cuisine: "中国茶・アジアコーヒー",
        area: "大阪・中崎町",
        time: "13:00",
        purpose: "昼：お茶で休日を始める",
        transit: "中崎町を散歩",
        href: "/restaurant/r28",
        desc:
          "中国茶や野草茶を扱うティースタンド。コーヒーだけではない飲み物から休日を始めると、その日の歩幅がゆっくりになる。ひとりでも二人でも使える。",
        images: ["/restaurants/r28/r28-image-1.jpg"],
        specs: [
          { k: "向いている用途", v: "休日の昼、ひとり時間" },
          { k: "予算目安", v: "¥1,000〜" },
          { k: "決め手", v: "中国茶、ワークショップ、茶葉" },
        ],
      }),
      stop(2, {
        name: "CAFE＆BAR ててりあ",
        cuisine: "カフェ・バー",
        area: "大阪・中崎町",
        time: "17:00",
        purpose: "夕方：カフェからバーへ切り替える",
        href: "/restaurant/r66",
        desc:
          "昼酒や深夜にも対応するカフェバー。中崎町で時間を決めずに過ごすなら、こういう店が一つあると強い。夕方から夜へ自然に移れる。",
        images: ["/restaurants/r66/r66-01.jpg"],
        specs: [
          { k: "向いている用途", v: "昼酒、夜カフェ、一人飲み" },
          { k: "予算目安", v: "¥1,500〜" },
          { k: "決め手", v: "カフェ、バー、中崎町" },
        ],
      }),
    ],
    sideArticles: [
      { t: "大阪のレトロ喫茶。朝から夕方まで座っていたい店", h: "/feature/scene-osaka-retro-cafe", img: "/restaurants/r17/r17-01.jpg" },
      { t: "大阪で一人飲み。カウンターで落ち着ける店", h: "/feature/scene-osaka-solo-counter", img: "/restaurants/r38/r38-image-1.jpg" },
    ],
    quote: "休日は、店を詰め込むより余白を予約したい。",
    quoteCite: "マチノワ編集部",
    closing:
      "中崎町は、歩く時間そのものが目的になる街。お茶、散歩、夜の一杯をゆっくり繋げるだけで、十分に休日らしい一日になる。",
  },
  "scene-osaka-private-dinner": {
    id: "scene-osaka-private-dinner",
    no: "S08",
    articleType: "ranking",
    kicker: "OSAKA PRIVATE DINNER",
    title: "大阪で個室・会食に使いやすい店",
    titleHTML: "大阪で個室・会食に<br>使いやすい店",
    subtitle: "静かに話せる夜のために、席と料理で選ぶ",
    lede:
      "会食の店選びで見るべきは、料理の派手さより席の安心感。駅距離、個室、料理の分けやすさ、予算の読みやすさ。大阪で少人数の会食に使いやすい店を選ぶ。",
    date,
    reading: "約4分",
    author,
    heroImage: "/restaurants/r25/r25-image-1.jpg",
    ranking: [
      pick(1, {
        name: "居酒屋 和 NAGOSHI（なごし）",
        cuisine: "居酒屋・海鮮・和食",
        area: "大阪・北浜",
        href: "/restaurant/r25",
        desc:
          "北浜駅から近く、海鮮と日本酒を軸にした会食向きの一軒。個室や掘りごたつがあり、ビジネス街の食事会に使いやすい。",
        images: ["/restaurants/r25/r25-image-1.jpg"],
        specs: [
          { k: "向いている用途", v: "会食、接待、宴会" },
          { k: "決め手", v: "個室、海鮮、日本酒、北浜駅近" },
          { k: "予算目安", v: "¥3,000〜¥5,500" },
        ],
      }),
      pick(2, {
        name: "焼肉ホルモン 肉ぶくろ",
        cuisine: "焼肉・ホルモン",
        area: "大阪・上新庄",
        href: "/restaurant/r14",
        desc:
          "掘りごたつ個室を備えた小規模焼肉店。少人数で話しながら焼肉を囲む会食に向く。貸切相談もしやすい規模感。",
        images: ["/restaurants/r14/r14-image-1.jpg"],
        specs: [
          { k: "向いている用途", v: "少人数会食、家族利用" },
          { k: "決め手", v: "掘りごたつ個室、貸切、焼肉" },
          { k: "予算目安", v: "¥3,000〜" },
        ],
      }),
      pick(3, {
        name: "ビストロ リアン",
        cuisine: "ビストロ・フレンチ",
        area: "大阪・関目高殿",
        href: "/restaurant/r57",
        desc:
          "フレンチ寄りの会食なら、落ち着いたビストロが選択肢になる。記念日にも使えるため、仕事とプライベートの中間のような会食にも合う。",
        images: ["/restaurants/r57/r57-01.jpg"],
        specs: [
          { k: "向いている用途", v: "記念日、少人数会食" },
          { k: "決め手", v: "ビストロ、個室、ランチ" },
          { k: "予算目安", v: "¥4,000〜" },
        ],
      }),
    ],
    sideArticles: [
      { t: "大阪・福島でデートするなら", h: "/feature/scene-osaka-fukushima-date", img: "/restaurants/r21/r21-image-1.jpg" },
      { t: "名古屋で記念日ディナー", h: "/feature/scene-nagoya-anniversary", img: "/restaurants/r53/r53-01.jpg" },
    ],
    quote: "会食は、料理より先に席で失敗しないこと。",
    quoteCite: "マチノワ編集部",
    closing:
      "会食向きの店は、情報量が多いほど選びやすい。個室、駅距離、予算、料理ジャンル。条件を先に決めておくと、当日の安心感が変わる。",
  },
  "scene-first-date-italian": {
    id: "scene-first-date-italian",
    no: "S09",
    articleType: "ranking",
    kicker: "FIRST DATE ITALIAN",
    title: "初デートで重すぎないイタリアン3選",
    titleHTML: "初デートで重すぎない<br>イタリアン3選",
    subtitle: "ワイン、ピザ、パスタ。会話が続く店を選ぶ",
    lede:
      "初デートのイタリアンは、雰囲気が良すぎても緊張する。料理を分けやすく、滞在時間を調整でき、ワインを一杯だけでも成立する店が強い。重すぎない3軒を選んだ。",
    date,
    reading: "約4分",
    author,
    heroImage: "/restaurants/r35/r35-image-1.png",
    ranking: [
      pick(1, {
        name: "トラットリア デッラ ノンナ",
        cuisine: "イタリアン",
        area: "大阪・高麗橋",
        href: "/restaurant/r35",
        desc:
          "郷土料理の温かさがあるイタリアン。きれいすぎる店より、料理の話題で会話を作りたい初デートに向く。ワインも自然に合わせやすい。",
        images: ["/restaurants/r35/r35-image-1.png"],
        specs: [
          { k: "向いている用途", v: "初デート、ワイン、食事メイン" },
          { k: "予算目安", v: "¥5,000〜" },
          { k: "決め手", v: "郷土料理、隠れ家、ワイン" },
        ],
      }),
      pick(2, {
        name: "Comfort Zone 8 京いたりあん",
        cuisine: "京野菜イタリアン",
        area: "大阪・十三",
        href: "/restaurant/r40",
        desc:
          "京野菜やロングピザなど、会話のきっかけになるメニューがある。十三という少し外した立地も、気取りすぎないデートにちょうどいい。",
        images: ["/restaurants/r40/r40-image-1.jpg"],
        specs: [
          { k: "向いている用途", v: "女子会、初デート、記念日手前" },
          { k: "予算目安", v: "¥4,000〜" },
          { k: "決め手", v: "京野菜、ロングピザ、十三" },
        ],
      }),
      pick(3, {
        name: "イル・クアドリフォーリオ",
        cuisine: "イタリアン",
        area: "大阪・肥後橋",
        href: "/restaurant/r56",
        desc:
          "少しきちんとしたランチやディナーに使えるイタリアン。初デートでも、食事を軸にしたい二人なら候補に入る。肥後橋の落ち着きもある。",
        images: ["/restaurants/r56/r56-mv_1.jpg"],
        specs: [
          { k: "向いている用途", v: "ランチデート、落ち着いた食事" },
          { k: "予算目安", v: "昼/夜ともに食事向き" },
          { k: "決め手", v: "百名店、肥後橋、パスタ" },
        ],
      }),
    ],
    sideArticles: [
      { t: "大阪・福島でデートするなら", h: "/feature/scene-osaka-fukushima-date", img: "/restaurants/r21/r21-image-1.jpg" },
      { t: "名古屋で記念日ディナー", h: "/feature/scene-nagoya-anniversary", img: "/restaurants/r53/r53-01.jpg" },
    ],
    quote: "初デートの店は、背伸びより会話のしやすさ。",
    quoteCite: "マチノワ編集部",
    closing:
      "イタリアンは初デートに強い。ただし選び方を間違えると重くなる。ピザ、パスタ、ワインを自然に分けられる店を選ぶと、食事そのものが会話の助けになる。",
  },
  "scene-osaka-retro-cafe": {
    id: "scene-osaka-retro-cafe",
    no: "S10",
    articleType: "ranking",
    kicker: "OSAKA RETRO CAFE",
    title: "大阪のレトロ喫茶。朝から夕方まで座っていたい店",
    titleHTML: "大阪のレトロ喫茶。<br>朝から夕方まで座っていたい店",
    subtitle: "モーニング、焙煎、駄菓子。大阪の日常に残る喫茶文化",
    lede:
      "レトロ喫茶は、懐かしさだけで選ぶと浅くなる。朝に使えるか、豆の話ができるか、地元の日常に残っているか。大阪で時間を置きに行きたい喫茶を選んだ。",
    date,
    reading: "約4分",
    author,
    heroImage: "/restaurants/r17/r17-01.jpg",
    ranking: [
      pick(1, {
        name: "白泉堂",
        cuisine: "昭和レトロ喫茶・駄菓子",
        area: "大阪・今福西",
        href: "/restaurant/r17",
        desc:
          "駄菓子と喫茶が同居する、街の記憶のような一軒。いか焼きやソフトクリームまであり、ただコーヒーを飲む以上の体験がある。",
        images: ["/restaurants/r17/r17-01.jpg"],
        specs: [
          { k: "向いている用途", v: "昭和レトロ、散歩、甘味" },
          { k: "予算目安", v: "〜¥999" },
          { k: "決め手", v: "駄菓子、いか焼き、老舗" },
        ],
      }),
      pick(2, {
        name: "風車",
        cuisine: "喫茶店・カフェ",
        area: "大阪・淡路",
        href: "/restaurant/r51",
        desc:
          "朝9時から夜まで開く、駅前の老舗喫茶。モーニングから午後の長居まで、日常の時間を受け止める。観光ではなく生活に近い喫茶だ。",
        images: ["/restaurants/r51/r51-image-1.jpg"],
        specs: [
          { k: "向いている用途", v: "モーニング、長居、駅前喫茶" },
          { k: "予算目安", v: "¥1,000〜" },
          { k: "決め手", v: "淡路駅近、長時間営業" },
        ],
      }),
      pick(3, {
        name: "上町珈琲",
        cuisine: "珈琲・紅茶専門店",
        area: "大阪・上本町",
        href: "/restaurant/r23",
        desc:
          "1943年創業の焙煎専門店。喫茶だけでなく、豆を買う楽しみがある。コーヒー好きの休日に、目的地として成立する店。",
        images: ["/restaurants/r23/r23-image-1.jpg"],
        specs: [
          { k: "向いている用途", v: "豆選び、手土産、喫茶" },
          { k: "予算目安", v: "豆購入 ¥500〜" },
          { k: "決め手", v: "老舗、焙煎、ギフト" },
        ],
      }),
    ],
    sideArticles: [
      { t: "中崎町で休日カフェ巡り", h: "/feature/scene-nakazakicho-weekend", img: "/restaurants/r28/r28-image-1.jpg" },
      { t: "大阪で一人飲み。カウンターで落ち着ける店", h: "/feature/scene-osaka-solo-counter", img: "/restaurants/r38/r38-image-1.jpg" },
    ],
    quote: "いい喫茶店には、急がなくていい理由がある。",
    quoteCite: "マチノワ編集部",
    closing:
      "大阪のレトロ喫茶は、写真映えだけでは語れない。朝の客、昼の常連、夕方の静けさ。時間帯ごとに違う顔を見せる店こそ、何度も行きたくなる。",
  },
};
