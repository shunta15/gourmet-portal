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

function spot(
  rankNum: number,
  item: Omit<RankItem, "rank" | "rankNum">
): RankItem {
  return {
    rank: `SPOT ${String(rankNum).padStart(2, "0")}`,
    rankNum,
    ...item,
  };
}

export const CURATED_FEATURES: Feature[] = [
  {
    id: "guide-kyoto-sightseeing-spots",
    no: "G01",
    tag: "観光",
    kicker: "KYOTO CITY GUIDE",
    title: "京都市観光スポット5選。初めての京都で外さない場所",
    sub: "清水寺、伏見稲荷、二条城。王道をただ並べず、歩き方で選ぶ京都案内",
    image: "/guide-assets/guide-editorial.svg",
  },
  {
    id: "guide-osaka-sightseeing-spots",
    no: "G02",
    tag: "観光",
    kicker: "OSAKA CITY GUIDE",
    title: "大阪市観光スポット5選。半日でも回りやすい王道ルート",
    sub: "大阪城、中之島、道頓堀、新世界、梅田。街の表情が変わる5スポット",
    image: "/guide-assets/guide-editorial.svg",
  },
  {
    id: "guide-kobe-date-spots",
    no: "G03",
    tag: "デート",
    kicker: "KOBE DATE GUIDE",
    title: "神戸市でデート行くなら5選。昼から夜景までつながる場所",
    sub: "港、異人館、ハーブ園、六甲山。会話が続く神戸デートの行き先",
    image: "/guide-assets/guide-editorial.svg",
  },
  {
    id: "guide-nagoya-date-spots",
    no: "G04",
    tag: "デート",
    kicker: "NAGOYA DATE GUIDE",
    title: "名古屋市でデート行くなら5選。雨の日でも使いやすい街歩き",
    sub: "城、庭園、商店街、夜景。名古屋の距離感で選ぶデートスポット",
    image: "/guide-assets/guide-editorial.svg",
  },
  {
    id: "guide-nara-sightseeing-spots",
    no: "G05",
    tag: "観光",
    kicker: "NARA CITY GUIDE",
    title: "奈良市観光スポット5選。半日で古都を深く歩く",
    sub: "奈良公園、東大寺、春日大社、ならまち。徒歩でつながる古都の入口",
    image: "/guide-assets/guide-editorial.svg",
  },
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
  "guide-kyoto-sightseeing-spots": {
    id: "guide-kyoto-sightseeing-spots",
    no: "G01",
    articleType: "guide",
    kicker: "KYOTO CITY GUIDE",
    title: "京都市観光スポット5選。初めての京都で外さない場所",
    titleHTML: "京都市観光スポット5選。<br>初めての京都で外さない場所",
    subtitle: "清水寺、伏見稲荷、二条城。王道をただ並べず、歩き方で選ぶ京都案内",
    lede:
      "京都観光は、行きたい場所を全部詰め込むより、エリアごとの余白を残した方が満足度が上がる。この記事では初めての京都でも外しにくく、午前・午後・夕方の予定に組み込みやすい5スポットを選ぶ。",
    date,
    reading: "約6分",
    author,
    heroImage: "/guide-assets/guide-editorial.svg",
    ranking: [
      spot(1, {
        name: "清水寺",
        cuisine: "寺院・世界遺産",
        area: "京都・東山",
        purpose: "初めての京都：街並みと眺望を一度に味わう",
        desc:
          "京都らしい坂道、門前町、舞台からの眺めがまとまって体験できる王道スポット。午前中に行くと人の流れが比較的読みやすく、産寧坂・二年坂まで含めて歩くと京都観光の入口として強い。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "午前から昼前" },
          { k: "滞在目安", v: "60〜90分" },
          { k: "組み合わせ", v: "産寧坂、八坂の塔、祇園方面" },
        ],
      }),
      spot(2, {
        name: "伏見稲荷大社",
        cuisine: "神社・千本鳥居",
        area: "京都・伏見",
        purpose: "写真と散策：赤い鳥居を抜けて歩く",
        desc:
          "千本鳥居の印象が強いが、奥へ進むほど観光地から山歩きに空気が変わる。時間が限られる日は入口周辺だけでも満足しやすく、体力がある日は途中まで登ると旅の記憶に残りやすい。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "朝または夕方前" },
          { k: "滞在目安", v: "45〜120分" },
          { k: "注意点", v: "山道を歩くなら靴を優先" },
        ],
      }),
      spot(3, {
        name: "二条城",
        cuisine: "城・歴史建築",
        area: "京都・二条",
        purpose: "歴史散策：中心部で落ち着いて見られる名所",
        desc:
          "寺社だけでなく、京都の政治史を感じたい日に入れたい場所。敷地が広く、庭園まで含めて歩けるため、混雑した繁華街から少し離れて過ごしたい午後にも向いている。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "午後" },
          { k: "滞在目安", v: "60〜90分" },
          { k: "組み合わせ", v: "烏丸御池、御所周辺、三条散策" },
        ],
      }),
      spot(4, {
        name: "嵐山",
        cuisine: "自然・川辺散策",
        area: "京都・嵯峨嵐山",
        purpose: "半日観光：竹林、渡月橋、川沿いを歩く",
        desc:
          "市街地とは違う開けた景色を見たいなら嵐山。渡月橋、竹林、川沿いの散策を一つの流れで楽しめる。移動時間を考えると、午前か午後のどちらかをしっかり使う計画が合う。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "午前から午後" },
          { k: "滞在目安", v: "120〜180分" },
          { k: "向いている人", v: "自然も街歩きも楽しみたい人" },
        ],
      }),
      spot(5, {
        name: "錦市場",
        cuisine: "市場・街歩き",
        area: "京都・四条",
        purpose: "雨の日にも：短時間で京都の食文化に触れる",
        desc:
          "観光の合間に立ち寄りやすく、天気が崩れた日にも使いやすいアーケード型の市場。食べ歩きだけでなく、京都の日常の食材や土産を見られるのが魅力。混雑する時間帯は歩く目的を絞ると疲れにくい。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "昼前後" },
          { k: "滞在目安", v: "30〜60分" },
          { k: "組み合わせ", v: "四条河原町、烏丸、先斗町" },
        ],
      }),
    ],
    sideArticles: [
      { t: "大阪市観光スポット5選。半日でも回りやすい王道ルート", h: "/feature/guide-osaka-sightseeing-spots", img: "/guide-assets/guide-editorial.svg" },
      { t: "奈良市観光スポット5選。半日で古都を深く歩く", h: "/feature/guide-nara-sightseeing-spots", img: "/guide-assets/guide-editorial.svg" },
    ],
    quote: "観光記事は、店に送客する前に、街を好きになってもらう入口になる。",
    quoteCite: author,
    closing:
      "京都は名所が多いからこそ、移動時間を軽く見ないことが大切。清水寺と伏見稲荷を同じ日に詰めるなら朝から動き、嵐山を入れる日は半日を確保する。街歩き記事としては、次に雨の日コース、紅葉コース、親子向けコースへ広げやすい。",
  },
  "guide-osaka-sightseeing-spots": {
    id: "guide-osaka-sightseeing-spots",
    no: "G02",
    articleType: "guide",
    kicker: "OSAKA CITY GUIDE",
    title: "大阪市観光スポット5選。半日でも回りやすい王道ルート",
    titleHTML: "大阪市観光スポット5選。<br>半日でも回りやすい王道ルート",
    subtitle: "大阪城、中之島、道頓堀、新世界、梅田。街の表情が変わる5スポット",
    lede:
      "大阪観光は、歴史、川辺、繁華街、下町、夜景の切り替わりが面白い。この記事では、初めての人にも説明しやすく、半日から一日で組み合わせやすい大阪市内のスポットを選ぶ。",
    date,
    reading: "約6分",
    author,
    heroImage: "/guide-assets/guide-editorial.svg",
    ranking: [
      spot(1, {
        name: "大阪城公園",
        cuisine: "城・公園",
        area: "大阪・中央区",
        purpose: "午前観光：広い公園で大阪の歴史に触れる",
        desc:
          "大阪市内で歴史と開放感を同時に味わえる代表的なスポット。天守閣だけでなく、公園として歩きやすいのが強み。春の花見や秋の散歩など、季節ごとの記事展開にもつなげやすい。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "午前" },
          { k: "滞在目安", v: "60〜120分" },
          { k: "組み合わせ", v: "森ノ宮、京橋、中之島方面" },
        ],
      }),
      spot(2, {
        name: "中之島",
        cuisine: "水辺・建築散策",
        area: "大阪・北区",
        purpose: "大人の街歩き：川沿いと近代建築を楽しむ",
        desc:
          "賑やかな大阪だけでなく、落ち着いた都市景観を見せられる場所。中央公会堂や川沿いの遊歩道を含めると、短時間でも満足感が出る。デートや一人散歩の記事にも転用しやすい。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "昼から夕方" },
          { k: "滞在目安", v: "45〜90分" },
          { k: "向いている人", v: "落ち着いた大阪を歩きたい人" },
        ],
      }),
      spot(3, {
        name: "道頓堀",
        cuisine: "繁華街・写真スポット",
        area: "大阪・なんば",
        purpose: "初大阪：看板と川沿いで大阪らしさを感じる",
        desc:
          "初めての大阪なら一度は入れたい定番。写真を撮る、川沿いを歩く、なんばへ抜けるという短い行程でも成立する。夜は光の量が増えるため、旅の締めにも使いやすい。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "夕方から夜" },
          { k: "滞在目安", v: "30〜60分" },
          { k: "注意点", v: "混雑時は目的地を決めて歩く" },
        ],
      }),
      spot(4, {
        name: "新世界・通天閣",
        cuisine: "下町・展望",
        area: "大阪・浪速区",
        purpose: "大阪らしい下町感：昼飲みや散策にも",
        desc:
          "レトロな看板、通天閣、ジャンジャン横丁まで、街の密度が高いエリア。観光スポットとしての分かりやすさがあり、写真映えだけでなく大阪の庶民的な空気も伝わる。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "昼から夕方" },
          { k: "滞在目安", v: "45〜90分" },
          { k: "組み合わせ", v: "天王寺、動物園前、なんば" },
        ],
      }),
      spot(5, {
        name: "梅田スカイビル・空中庭園展望台",
        cuisine: "展望・夜景",
        area: "大阪・梅田",
        purpose: "夜景デート：旅の最後に街を見下ろす",
        desc:
          "大阪駅周辺で夜に組み込みやすい展望スポット。昼の観光後、最後に夜景を見る流れが作りやすい。カップル向け、記念日向け、雨の日向けの記事にも発展させやすい。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "日没前後から夜" },
          { k: "滞在目安", v: "45〜75分" },
          { k: "向いている人", v: "大阪の夜景を見たい人" },
        ],
      }),
    ],
    sideArticles: [
      { t: "京都市観光スポット5選。初めての京都で外さない場所", h: "/feature/guide-kyoto-sightseeing-spots", img: "/guide-assets/guide-editorial.svg" },
      { t: "神戸市でデート行くなら5選。昼から夜景までつながる場所", h: "/feature/guide-kobe-date-spots", img: "/guide-assets/guide-editorial.svg" },
    ],
    quote: "大阪は、派手な看板だけでなく、水辺と建築と夜景まで入れると奥行きが出る。",
    quoteCite: author,
    closing:
      "大阪の記事は、道頓堀だけに寄せると競合が強くなる。大阪城、中之島、新世界、梅田を組み合わせることで、半日観光、一日観光、デート、雨の日といった派生記事を作りやすくなる。",
  },
  "guide-kobe-date-spots": {
    id: "guide-kobe-date-spots",
    no: "G03",
    articleType: "guide",
    kicker: "KOBE DATE GUIDE",
    title: "神戸市でデート行くなら5選。昼から夜景までつながる場所",
    titleHTML: "神戸市でデート行くなら5選。<br>昼から夜景までつながる場所",
    subtitle: "港、異人館、ハーブ園、六甲山。会話が続く神戸デートの行き先",
    lede:
      "神戸デートは、海側と山側の切り替えがしやすいのが強み。昼は街歩き、夕方は港、夜は展望という流れを作ると、食事以外の時間も自然につながる。",
    date,
    reading: "約5分",
    author,
    heroImage: "/guide-assets/guide-editorial.svg",
    ranking: [
      spot(1, {
        name: "神戸ハーバーランド",
        cuisine: "港・ショッピング",
        area: "神戸・中央区",
        purpose: "夕方デート：海沿いを歩いて夜景へ",
        desc:
          "海、買い物、夜景をまとめて使える神戸デートの定番。予定を細かく決めなくても成立しやすく、初デートでも沈黙が気になりにくい。夕方から夜にかけての時間が特に使いやすい。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "夕方から夜" },
          { k: "滞在目安", v: "60〜120分" },
          { k: "向いている関係", v: "初回から記念日まで" },
        ],
      }),
      spot(2, {
        name: "メリケンパーク",
        cuisine: "公園・港町散策",
        area: "神戸・元町",
        purpose: "写真と散歩：港町らしい開放感を楽しむ",
        desc:
          "神戸ポートタワー周辺の景色を含め、歩くだけで港町らしい空気が伝わる場所。ベンチで話す、写真を撮る、ハーバーランドへ抜けるなど、デートの余白を作りやすい。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "午後から夕方" },
          { k: "滞在目安", v: "30〜60分" },
          { k: "組み合わせ", v: "南京町、旧居留地、ハーバーランド" },
        ],
      }),
      spot(3, {
        name: "北野異人館街",
        cuisine: "街歩き・洋館",
        area: "神戸・北野",
        purpose: "昼デート：坂道と洋館をゆっくり歩く",
        desc:
          "神戸らしい異国情緒を感じられる山側の街歩き。坂が多いので靴選びは大事だが、会話しながら歩くにはちょうどいい距離感。カフェや三宮方面への移動も組みやすい。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "昼から午後" },
          { k: "滞在目安", v: "60〜120分" },
          { k: "注意点", v: "坂道が多いので歩きやすい靴で" },
        ],
      }),
      spot(4, {
        name: "神戸布引ハーブ園",
        cuisine: "ロープウェイ・庭園",
        area: "神戸・新神戸",
        purpose: "非日常デート：街からすぐ山上へ上がる",
        desc:
          "ロープウェイで上がる移動そのものがイベントになるスポット。季節の花や眺望があり、会話のきっかけが多い。三宮からのアクセスも比較的よく、昼デートの主役にしやすい。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "昼から夕方" },
          { k: "滞在目安", v: "120〜180分" },
          { k: "向いている日", v: "天気がよく、外で過ごしたい日" },
        ],
      }),
      spot(5, {
        name: "六甲山・六甲ガーデンテラス",
        cuisine: "山上・夜景",
        area: "神戸・六甲",
        purpose: "夜景デート：特別感を出したい日の締め",
        desc:
          "神戸の夜景をしっかり見せたいなら候補に入る山上スポット。移動は少し計画が必要だが、そのぶん特別感が出る。記念日や一日デートの終盤に向いている。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "夕方から夜" },
          { k: "滞在目安", v: "90〜150分" },
          { k: "注意点", v: "交通手段と帰り時間を先に確認" },
        ],
      }),
    ],
    sideArticles: [
      { t: "名古屋市でデート行くなら5選。雨の日でも使いやすい街歩き", h: "/feature/guide-nagoya-date-spots", img: "/guide-assets/guide-editorial.svg" },
      { t: "大阪市観光スポット5選。半日でも回りやすい王道ルート", h: "/feature/guide-osaka-sightseeing-spots", img: "/guide-assets/guide-editorial.svg" },
    ],
    quote: "神戸デートは、海から山へ移るだけで一日の物語が作れる。",
    quoteCite: author,
    closing:
      "神戸は食事記事だけでも魅力が出るが、デートスポット記事を挟むと回遊導線が強くなる。昼の北野、夕方の港、夜の六甲という流れを作れば、後からランチ記事やディナー記事を自然に差し込める。",
  },
  "guide-nagoya-date-spots": {
    id: "guide-nagoya-date-spots",
    no: "G04",
    articleType: "guide",
    kicker: "NAGOYA DATE GUIDE",
    title: "名古屋市でデート行くなら5選。雨の日でも使いやすい街歩き",
    titleHTML: "名古屋市でデート行くなら5選。<br>雨の日でも使いやすい街歩き",
    subtitle: "城、庭園、商店街、夜景。名古屋の距離感で選ぶデートスポット",
    lede:
      "名古屋デートは、移動のしやすさと屋内・屋外の切り替えが鍵になる。この記事では、栄・名駅から組みやすく、天気や時間帯に合わせて選べる5スポットをまとめる。",
    date,
    reading: "約5分",
    author,
    heroImage: "/guide-assets/guide-editorial.svg",
    ranking: [
      spot(1, {
        name: "名古屋城",
        cuisine: "城・歴史",
        area: "名古屋・中区",
        purpose: "王道デート：名古屋らしさを最初に押さえる",
        desc:
          "名古屋を初めて一緒に歩くなら、分かりやすい目的地になるスポット。城の周辺散策まで含めると会話のきっかけが作りやすく、観光デートとしても成立しやすい。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "午前から昼" },
          { k: "滞在目安", v: "60〜120分" },
          { k: "組み合わせ", v: "丸の内、栄、久屋大通" },
        ],
      }),
      spot(2, {
        name: "久屋大通公園・オアシス21",
        cuisine: "公園・都市景観",
        area: "名古屋・栄",
        purpose: "栄デート：待ち合わせから夜景まで使える",
        desc:
          "栄周辺で予定を組むなら使いやすい都市型スポット。昼は公園として、夜はライトアップや水の宇宙船周辺の景色を楽しめる。食事前後の短い時間にも差し込みやすい。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "夕方から夜" },
          { k: "滞在目安", v: "30〜60分" },
          { k: "向いている日", v: "栄で食事予定がある日" },
        ],
      }),
      spot(3, {
        name: "徳川園",
        cuisine: "日本庭園",
        area: "名古屋・東区",
        purpose: "落ち着いたデート：静かに歩ける庭園",
        desc:
          "にぎやかな場所より、少し落ち着いて話したい日に向く庭園。季節感が出やすく、写真や散策の目的も作りやすい。大人っぽい昼デートの候補になる。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "昼から午後" },
          { k: "滞在目安", v: "45〜90分" },
          { k: "向いている関係", v: "静かに話したい二人" },
        ],
      }),
      spot(4, {
        name: "大須商店街",
        cuisine: "商店街・街歩き",
        area: "名古屋・大須",
        purpose: "気軽なデート：雑貨、古着、食べ歩きを楽しむ",
        desc:
          "予定を作り込みすぎずに歩けるのが魅力。古着、雑貨、食べ歩きなど話題が自然に出るため、初回やカジュアルなデートにも使いやすい。雨の日でも比較的予定を組み直しやすい。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "昼から夕方" },
          { k: "滞在目安", v: "60〜120分" },
          { k: "向いている人", v: "気取らない街歩きが好きな人" },
        ],
      }),
      spot(5, {
        name: "ノリタケの森",
        cuisine: "ミュージアム・庭園",
        area: "名古屋・西区",
        purpose: "雨の日にも：屋内展示と緑を組み合わせる",
        desc:
          "名駅から比較的近く、屋内展示と屋外散策を切り替えられるスポット。天気が読みにくい日でも予定を組みやすく、落ち着いたデートに向いている。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "昼から午後" },
          { k: "滞在目安", v: "60〜120分" },
          { k: "組み合わせ", v: "名駅、円頓寺、栄方面" },
        ],
      }),
    ],
    sideArticles: [
      { t: "神戸市でデート行くなら5選。昼から夜景までつながる場所", h: "/feature/guide-kobe-date-spots", img: "/guide-assets/guide-editorial.svg" },
      { t: "京都市観光スポット5選。初めての京都で外さない場所", h: "/feature/guide-kyoto-sightseeing-spots", img: "/guide-assets/guide-editorial.svg" },
    ],
    quote: "名古屋デートは、栄と名駅の間に“歩く理由”を置くと組みやすい。",
    quoteCite: author,
    closing:
      "名古屋は店舗記事だけだと名駅・栄の飲食導線に偏りやすい。名古屋城、徳川園、大須、ノリタケの森を入れることで、観光、雨の日、初デート、家族向けといった非飲食キーワードを取りにいける。",
  },
  "guide-nara-sightseeing-spots": {
    id: "guide-nara-sightseeing-spots",
    no: "G05",
    articleType: "guide",
    kicker: "NARA CITY GUIDE",
    title: "奈良市観光スポット5選。半日で古都を深く歩く",
    titleHTML: "奈良市観光スポット5選。<br>半日で古都を深く歩く",
    subtitle: "奈良公園、東大寺、春日大社、ならまち。徒歩でつながる古都の入口",
    lede:
      "奈良市内の観光は、距離の近さを活かすと半日でも濃く歩ける。この記事では、初めての奈良で外しにくく、徒歩移動でつなげやすい5スポットを選ぶ。",
    date,
    reading: "約5分",
    author,
    heroImage: "/guide-assets/guide-editorial.svg",
    ranking: [
      spot(1, {
        name: "奈良公園",
        cuisine: "公園・自然",
        area: "奈良・登大路",
        purpose: "初奈良：鹿と古都の空気を感じる入口",
        desc:
          "奈良観光の中心になる広い公園。東大寺や春日大社へ歩いてつなげやすく、短時間でも奈良らしい景色に触れられる。朝の時間帯は比較的落ち着いて歩きやすい。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "朝から午前" },
          { k: "滞在目安", v: "45〜90分" },
          { k: "組み合わせ", v: "東大寺、春日大社、興福寺" },
        ],
      }),
      spot(2, {
        name: "東大寺",
        cuisine: "寺院・大仏",
        area: "奈良・雑司町",
        purpose: "王道観光：大仏殿でスケールを感じる",
        desc:
          "初めての奈良で外しにくい代表的な名所。奈良公園から歩いて行きやすく、大仏殿の存在感は短時間の観光でも強く残る。歴史に詳しくない人にも伝わりやすいスポット。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "午前から昼" },
          { k: "滞在目安", v: "60〜90分" },
          { k: "向いている人", v: "奈良が初めての旅行者" },
        ],
      }),
      spot(3, {
        name: "春日大社",
        cuisine: "神社・参道",
        area: "奈良・春日野町",
        purpose: "静かな参拝：森の参道を歩く",
        desc:
          "奈良公園のにぎわいから少し空気が変わり、森の中を歩く感覚がある。灯籠や参道の雰囲気が印象的で、落ち着いた古都の時間を感じたい人に向いている。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "昼から午後" },
          { k: "滞在目安", v: "45〜90分" },
          { k: "注意点", v: "奈良公園から歩くなら時間に余裕を" },
        ],
      }),
      spot(4, {
        name: "興福寺",
        cuisine: "寺院・五重塔",
        area: "奈良・登大路",
        purpose: "短時間観光：駅から近く組み込みやすい",
        desc:
          "近鉄奈良駅からもアクセスしやすく、旅の最初か最後に入れやすいスポット。奈良公園やならまち方面へ抜ける導線上にあり、半日観光の中継地点として使いやすい。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "午前または夕方前" },
          { k: "滞在目安", v: "30〜60分" },
          { k: "組み合わせ", v: "近鉄奈良駅、奈良公園、ならまち" },
        ],
      }),
      spot(5, {
        name: "ならまち",
        cuisine: "町家・街歩き",
        area: "奈良・元興寺周辺",
        purpose: "午後散策：町家と小道をゆっくり歩く",
        desc:
          "寺社巡りの後に、少し街の生活感へ降りていけるエリア。町家、雑貨、カフェなどが点在し、予定を詰めすぎずに歩くのが合う。観光記事からカフェ記事へつなげやすい場所でもある。",
        images: ["/guide-assets/guide-editorial.svg"],
        specs: [
          { k: "おすすめ時間", v: "午後" },
          { k: "滞在目安", v: "60〜120分" },
          { k: "向いている人", v: "ゆっくり街歩きしたい人" },
        ],
      }),
    ],
    sideArticles: [
      { t: "京都市観光スポット5選。初めての京都で外さない場所", h: "/feature/guide-kyoto-sightseeing-spots", img: "/guide-assets/guide-editorial.svg" },
      { t: "大阪市観光スポット5選。半日でも回りやすい王道ルート", h: "/feature/guide-osaka-sightseeing-spots", img: "/guide-assets/guide-editorial.svg" },
    ],
    quote: "奈良は、移動距離の短さを活かすと半日でも濃い観光記事になる。",
    quoteCite: author,
    closing:
      "奈良市の記事は、東大寺だけで終わらせず、奈良公園、春日大社、興福寺、ならまちを徒歩導線でつなぐと実用性が出る。食事記事に寄せない街ガイドとして、親子観光、雨の日、修学旅行後の大人旅などに広げやすい。",
  },
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
