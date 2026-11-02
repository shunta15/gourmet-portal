/**
 * 撮影シーン詳細(LINE 公式アカウントから案内するページ)の中身。
 * 元原稿: 素材撮影ガイド(8 業種の表: シーン / 撮り方のひと言 / 本数)。文言は原稿のまま。
 */
export type VerticalKey = "gourmet" | "beauty" | "bodycare" | "pet" | "stay" | "activity" | "sports" | "life";

export type Scene = {
  /** シーン名 */
  name: string;
  /** 撮り方のひと言 */
  tip: string;
  /** 本数(「1」「1〜2」のような文字列) */
  count: string;
  /** 分類別の例(あれば、このシーンの中に入れ子で出す。本数は付かない) */
  examples?: { name: string; tip: string }[];
};

export type Vertical = {
  key: VerticalKey;
  label: string;
  /** 対象の説明(あれば) */
  note?: string;
  /** 対象の分類(あれば) */
  kinds?: string[];
  scenes: Scene[];
  /** 合計本数の目安 */
  total: string;
};

export const COMMON_RULES: string[] = [
  "スマホは縦向きで撮る(横向きの動画は使えません)",
  "1 本 20〜60 秒。カメラはゆっくり動かし、できるだけ長めに",
  "人の顔が写る動画は、本人の了承がある場合だけ",
  "撮り直しは不要。長めに撮っていただければ、良い場面を選んで編集します",
];

export const VERTICALS: Vertical[] = [
  {
    key: "gourmet",
    label: "グルメ",
    note: "飲食店 全般(レストラン・カフェ・居酒屋・テイクアウト)",
    total: "8.5 本前後",
    scenes: [
      { name: "外観・入口", tip: "看板が読める距離から、入口まで近づく", count: "1" },
      { name: "店内", tip: "入口から奥へ、ゆっくり歩きながら", count: "1" },
      { name: "人気メニュー(調理)", tip: "火や手元に寄る", count: "1〜2" },
      { name: "人気メニュー(盛り付け・提供)", tip: "皿がテーブルに置かれる瞬間まで", count: "1〜2" },
      { name: "料理の寄り", tip: "湯気・断面・ソースをかける瞬間", count: "1〜2" },
      { name: "ドリンク・デザート", tip: "注ぐ・飾る手元", count: "1" },
      { name: "店主・スタッフ", tip: "ひとこと(顔出しできる方のみ)", count: "1" },
    ],
  },
  {
    key: "beauty",
    label: "ビューティー",
    kinds: ["美容室", "エステ", "脱毛", "ネイル", "まつげ"],
    total: "7 本前後",
    scenes: [
      { name: "外観・入口", tip: "看板と入口", count: "1" },
      { name: "店内", tip: "受付・セット面・個室・待合", count: "1" },
      {
        name: "施術の様子",
        tip: "手元を中心に。お客様の顔は写さない角度",
        count: "2",
        examples: [
          { name: "美容室", tip: "カット・カラー・ブローの手元" },
          { name: "ネイル", tip: "爪先のアップ、仕上がり" },
          { name: "まつげ", tip: "目元のみ・本人の了承がある場合" },
          { name: "エステ・脱毛", tip: "機器と手元。肌の露出は控えめに" },
        ],
      },
      { name: "仕上がり", tip: "了承がある場合のみ。後ろ姿・手元でも可", count: "1" },
      { name: "使う商品・道具", tip: "棚や手元に寄る", count: "1" },
      { name: "スタッフ", tip: "ひとこと(顔出しできる方のみ)", count: "1" },
    ],
  },
  {
    key: "bodycare",
    label: "ボディケア",
    kinds: ["接骨院", "整体", "鍼灸", "マッサージ・リラクゼーション"],
    total: "7 本前後",
    scenes: [
      { name: "外観・入口", tip: "看板と入口", count: "1" },
      { name: "院内", tip: "受付・待合・ベッド", count: "1" },
      {
        name: "施術の様子",
        tip: "手技の手元。お客様の顔は写さない",
        count: "2",
        examples: [
          { name: "鍼灸", tip: "鍼・お灸の準備と手元" },
          { name: "接骨院", tip: "電気・牽引などの機器を使う場面" },
        ],
      },
      { name: "機器・設備", tip: "置いてある機器を順に", count: "1" },
      { name: "衛生面", tip: "清掃・タオル交換の様子", count: "1" },
      { name: "先生", tip: "ひとこと(顔出しできる方のみ)", count: "1" },
    ],
  },
  {
    key: "pet",
    label: "ペット",
    kinds: ["ペットショップ", "トリミング", "ペットホテル", "ドッグカフェ", "動物病院"],
    total: "8.5 本前後",
    scenes: [
      { name: "外観・入口", tip: "看板と入口", count: "1" },
      { name: "店内", tip: "売場・待合・カフェ席", count: "1" },
      { name: "ケア中の様子", tip: "トリミングの手元・診察(飼い主の了承がある場合)", count: "2" },
      { name: "動物たちの様子", tip: "元気に動いている場面", count: "1〜2" },
      { name: "設備", tip: "ケージ・お預かり部屋・ドッグラン", count: "1" },
      { name: "商品棚(ショップ)", tip: "フード・用品の棚", count: "1" },
      { name: "スタッフ", tip: "ひとこと(顔出しできる方のみ)", count: "1" },
    ],
  },
  {
    key: "stay",
    label: "宿泊",
    kinds: ["旅館", "ホテル", "ペンション", "貸別荘", "グランピング"],
    total: "9.5 本前後",
    scenes: [
      { name: "外観・アプローチ", tip: "門や入口から建物へ近づく", count: "1" },
      { name: "客室", tip: "入口から窓へ、ゆっくり", count: "1〜2" },
      { name: "お風呂・温泉", tip: "人がいない時間に", count: "1" },
      { name: "食事", tip: "配膳と料理の寄り", count: "1〜2" },
      { name: "共用部", tip: "ロビー・ラウンジ・テラス", count: "1" },
      { name: "周りの景色・朝の様子", tip: "窓からの景色、朝の光", count: "1" },
      { name: "テント・建物の外と中(グランピング・貸別荘)", tip: "焚き火・BBQ など", count: "1〜2" },
      { name: "スタッフ", tip: "ひとこと(顔出しできる方のみ)", count: "1" },
    ],
  },
  {
    key: "activity",
    label: "アクティビティ",
    kinds: ["海・川", "山・空", "ものづくり体験"],
    total: "7 本前後",
    scenes: [
      { name: "受付・集合場所", tip: "看板と受付", count: "1" },
      { name: "道具・装備の準備", tip: "並べる・着ける手元", count: "1" },
      { name: "体験中", tip: "参加者の目線で。多少の手ぶれは可。顔は了承がある場合", count: "2" },
      { name: "景色・場所", tip: "海・山・工房の全体", count: "1" },
      { name: "達成の瞬間・完成品", tip: "ゴール、できあがった作品", count: "1" },
      { name: "ガイド・講師", tip: "説明やひとこと(顔出しできる方のみ)", count: "1" },
    ],
  },
  {
    key: "sports",
    label: "スポーツ",
    kinds: ["ジム", "武道・格闘技", "ゴルフ", "施設・用品"],
    total: "7 本前後",
    scenes: [
      { name: "外観・入口", tip: "看板と入口", count: "1" },
      { name: "施設", tip: "マシン・コート・練習場を順に", count: "1" },
      { name: "レッスン・トレーニングの様子", tip: "動きが分かる距離で。顔は了承がある場合", count: "2" },
      { name: "設備", tip: "更衣室・シャワー・駐車場", count: "1" },
      { name: "体験の流れ", tip: "受付→着替え→開始", count: "1" },
      { name: "トレーナー", tip: "ひとこと(顔出しできる方のみ)", count: "1" },
    ],
  },
  {
    key: "life",
    label: "くらし",
    note: "出かける(神社・寺・農園・占い) / 習う(教室) / 買う・借りる(服・雑貨・工芸) / 任せる(写真館・クリーニング・車の修理)",
    total: "7 本前後",
    scenes: [
      { name: "外観・入口", tip: "看板・門・入口", count: "1" },
      { name: "中の様子", tip: "境内・教室・売場・作業場", count: "1" },
      { name: "体験・作業の様子", tip: "参拝の流れ・レッスン・仕立て・修理の手元", count: "2" },
      { name: "商品・作品", tip: "棚や完成品に寄る", count: "1" },
      { name: "季節の見どころ(出かける)", tip: "花・紅葉・行事", count: "1" },
      { name: "店主・先生", tip: "ひとこと(顔出しできる方のみ)", count: "1" },
    ],
  },
];

export const VERTICAL_KEYS: VerticalKey[] = VERTICALS.map((v) => v.key);

export const PHOTOS = {
  note: "新しく撮らなくても、お手持ちの写真で構いません。横向きでも縦向きでも可。",
  rows: [
    { name: "外観", amount: "3〜5 枚" },
    { name: "内観", amount: "3〜5 枚" },
    { name: "人気メニュー・商品・サービス", amount: "3〜5 枚" },
    { name: "スタッフ(顔出しできる方のみ)", amount: "1〜2 枚" },
    { name: "ほか、掲載したいもの", amount: "何枚でも" },
  ],
};
