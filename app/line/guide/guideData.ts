/**
 * 動画用撮影素材のお願い(業種別)。LINE 公式アカウントから案内する店舗オーナー向けページの中身。
 * 元: オーナーが作った PDF(全 10 ページ)。文言・数字は PDF のまま。
 * PDF の文字化けしやすい字形(⽤ ⼈ ⼿ など)だけ、通常の字(用 人 手)に直してある。
 */
export type VerticalKey = "gourmet" | "beauty" | "bodycare" | "pet" | "stay" | "activity" | "sports" | "life";

export type Row = {
  /** 撮るもの */
  name: string;
  /** 最低限(本)。「—」の行がある */
  min: string;
  /** クオリティを上げるなら(本) */
  up: string;
  /** 撮り方のポイント(空の行がある) */
  tip: string;
};

export type Group = {
  /** 小分けの見出し(▶ の後ろ)。無ければ空 */
  title?: string;
  rows: Row[];
  totalMin: string;
  totalUp: string;
};

export type Block = {
  key: VerticalKey;
  /** タブに出す短い名前 */
  tab: string;
  /** ブロックの見出し(絵文字つき) */
  heading: string;
  /** 「対象：」の後ろ */
  target: string;
  groups: Group[];
  /** 「ポイント」「注意」の文 */
  note?: { label: string; text: string };
};

export const TITLE = "動画用撮影素材のお願い（業種別）";

export const INTRO: string[] = [
  "ショート動画・記事の制作にあたり、下記の素材のご用意をお願いいたします。",
  "撮影した動画は、LINEにてお送りください。",
  "※TikTokの店舗・施設紹介動画約250本（8業種×各3アカウント）を分析して決めた本数です。",
];

export const COMMON_TITLE = "撮り方のお願い（どの業種も共通）";
export const COMMON_RULES: string[] = [
  "スマホは縦向きで撮る",
  "1本の長さは20秒〜60秒でお願いします",
  "外観・内観は、横から横へゆっくり動かして撮る",
  "メニュー・料理・商品は、まず全体が映るように撮ってから、アップで撮る",
  "明るい場所で撮る（暗いと使えません）",
  "LINEで送るときは、トークに貼るのではなく「ファイル」として送ってください（画質が落ちにくくなります）",
];

export const PEOPLE = {
  title: "人が映るとき",
  text: "スタッフやお客さまが映る場合は、映ってよいか確認してから撮ってください。お顔を出したくない場合は、後ろ姿や手元で撮れば大丈夫です。",
};

export const ONE = {
  title: "「1本」とは",
  text: "20秒〜60秒の動画1つのことです。",
};

export const SUMMARY = {
  title: "一覧表（業種ごとの本数）",
  lead: "まずは「最低限」の本数を目安に、余裕があれば「クオリティを上げるなら」の本数を目指してください。",
  headers: { industry: "業種", min: "最低限（本数）", up: "クオリティを上げるなら（本数）", key: "いちばん大事な場面" },
  rows: [
    { industry: "グルメ", min: "6本", up: "15本", key: "料理（1品ずつ）" },
    { industry: "ビューティー", min: "6本", up: "13本", key: "施術の手元と仕上がり" },
    { industry: "ボディケア", min: "7本", up: "13本", key: "院内（店内）と施術" },
    { industry: "ペット（ペット可カフェ）", min: "7本", up: "13本", key: "店内・料理・ワンちゃん" },
    { industry: "ペット（トリミング）", min: "6本", up: "12本", key: "施術と仕上がった顔" },
    { industry: "ペット（ホテル・動物病院）", min: "7本", up: "12本", key: "お部屋とワンちゃん" },
    { industry: "ステイ（宿泊）", min: "6本", up: "12本", key: "客室・お風呂・料理" },
    { industry: "アクティビティ（体験）", min: "6本", up: "14本", key: "体験している最中" },
    { industry: "スポーツ", min: "7本", up: "15本", key: "トレーニング中の様子" },
    { industry: "くらし（雑貨・工芸のお店）", min: "7本", up: "18本", key: "商品" },
    { industry: "くらし（神社・寺）", min: "5本", up: "12本", key: "景色・御朱印などの授与品" },
  ],
  after: "次のページから、業種ごとの表があります。撮れたら左の□にチェックを入れてください。",
};

export const BLOCKS: Block[] = [
  {
    key: "gourmet",
    tab: "グルメ",
    heading: "🍽 ①グルメ",
    target: "和食・洋食・中華/アジア・ラーメン・焼肉/焼鳥・居酒屋/バー・カフェ/甘味",
    groups: [
      {
        rows: [
          { name: "外観（入口・看板・のれん）", min: "1", up: "2", tip: "横から横へゆっくり。正面から、看板が読めるように" },
          { name: "店内（席・カウンター）", min: "1", up: "2", tip: "横から横へゆっくり。席全体が見えるように" },
          { name: "料理（1品ずつ）", min: "3", up: "8", tip: "全体を撮ってから、アップで。1品につき真上と斜めから" },
          { name: "調理（焼く・盛り付けなど）", min: "—", up: "2", tip: "手元の動きがあるもの。お店にあれば" },
          { name: "提供（運ぶ・取り分ける）", min: "1", up: "1", tip: "湯気や焼ける様子もおすすめ" },
        ],
        totalMin: "6本",
        totalUp: "15本",
      },
    ],
    note: { label: "ポイント", text: "最低限の「提供」は調理でもOKです。" },
  },
  {
    key: "beauty",
    tab: "ビューティー",
    heading: "💇 ②ビューティー",
    target: "ヘアサロン・エステ・脱毛・ネイル・まつげ/眉",
    groups: [
      {
        rows: [
          { name: "外観（入口・看板）", min: "1", up: "1", tip: "横から横へゆっくり" },
          { name: "店内（セット面・施術ベッド・待合）", min: "1", up: "3", tip: "横から横へゆっくり" },
          { name: "施術の手元（カット・ネイル・施術）", min: "3", up: "7", tip: "工程ごとに分けて撮る" },
          { name: "仕上がり（後ろ姿・手元・アップ）", min: "1", up: "2", tip: "同じ明るさ・同じ角度で" },
        ],
        totalMin: "6本",
        totalUp: "13本",
      },
    ],
    note: { label: "注意", text: "お客さまのお顔は、許可がない限り映さない（後ろ姿・手元で撮る）。" },
  },
  {
    key: "bodycare",
    tab: "ボディケア",
    heading: "💆 ③ボディケア",
    target: "整体・整骨院/接骨院・鍼灸院・マッサージ・リラクゼーション",
    groups: [
      {
        rows: [
          { name: "外観（入口・看板）", min: "1", up: "2", tip: "横から横へゆっくり" },
          { name: "院内（受付・施術ベッド・個室）", min: "2", up: "4", tip: "横から横へゆっくり。いちばん大事。広さと清潔感が伝わるように" },
          { name: "施術の手元（肩・背中など）", min: "2", up: "4", tip: "" },
          { name: "設備・機器", min: "1", up: "1", tip: "" },
          { name: "スタッフ", min: "1", up: "2", tip: "受付やカウンセリングの様子など" },
        ],
        totalMin: "7本",
        totalUp: "13本",
      },
    ],
    note: { label: "注意", text: "患者さまのお顔は映さない。" },
  },
  {
    key: "pet",
    tab: "ペット",
    heading: "🐶 ④ペット",
    target: "ペット可カフェ・飲食店／トリミング／ペットホテル・動物病院",
    groups: [
      {
        title: "ペット可カフェ・飲食店",
        rows: [
          { name: "外観", min: "1", up: "1", tip: "横から横へゆっくり" },
          { name: "店内", min: "3", up: "5", tip: "横から横へゆっくり" },
          { name: "料理", min: "1", up: "4", tip: "全体を撮ってから、アップで" },
          { name: "ワンちゃん（くつろぐ様子）", min: "2", up: "3", tip: "" },
        ],
        totalMin: "7本",
        totalUp: "13本",
      },
      {
        title: "トリミング",
        rows: [
          { name: "外観", min: "1", up: "1", tip: "横から横へゆっくり" },
          { name: "店内", min: "1", up: "2", tip: "横から横へゆっくり" },
          { name: "施術（シャンプー・カット）", min: "2", up: "5", tip: "" },
          { name: "仕上がった顔", min: "2", up: "3", tip: "" },
          { name: "スタッフ", min: "—", up: "1", tip: "" },
        ],
        totalMin: "6本",
        totalUp: "12本",
      },
      {
        title: "ペットホテル・動物病院",
        rows: [
          { name: "外観", min: "1", up: "1", tip: "横から横へゆっくり" },
          { name: "店内（受付・全体）", min: "1", up: "2", tip: "横から横へゆっくり" },
          { name: "お部屋", min: "2", up: "4", tip: "" },
          { name: "ワンちゃん", min: "2", up: "3", tip: "" },
          { name: "スタッフ", min: "1", up: "2", tip: "" },
        ],
        totalMin: "7本",
        totalUp: "12本",
      },
    ],
    note: {
      label: "注意",
      text: "動物は動くのでブレやすいです。固定して長めに撮ってください。動物病院では、治療中の痛そうな場面や血が映る場面は撮らないでください。",
    },
  },
  {
    key: "stay",
    tab: "ステイ",
    heading: "🏨 ⑤ステイ",
    target: "ホテル・旅館・民宿/ペンション/ゲストハウス・グランピング/キャンプ・一棟貸し/貸別荘",
    groups: [
      {
        rows: [
          { name: "外観（建物・入口）", min: "1", up: "2", tip: "横から横へゆっくり" },
          { name: "館内（ロビー・廊下）", min: "1", up: "1", tip: "横から横へゆっくり。旅館は特におすすめ" },
          { name: "客室・お風呂・料理・テント", min: "3", up: "6", tip: "全体を撮ってから、アップで。いちばん大事。部屋ごと・設備ごとに1本" },
          { name: "景色・夕方〜夜の明かり・焚き火", min: "1", up: "2", tip: "" },
          { name: "準備の様子（布団・料理を出す）", min: "—", up: "1", tip: "" },
        ],
        totalMin: "6本",
        totalUp: "12本",
      },
    ],
  },
  {
    key: "activity",
    tab: "アクティビティ",
    heading: "🏄 ⑥アクティビティ",
    target: "海・川／山・空／ものづくり体験",
    groups: [
      {
        rows: [
          { name: "受付・外観・集合場所", min: "1", up: "1", tip: "横から横へゆっくり" },
          { name: "店内・工房", min: "1", up: "1", tip: "横から横へゆっくり" },
          { name: "体験している最中", min: "3", up: "8", tip: "いちばん大事。工程や場面ごとに" },
          { name: "場所・道具（海・森・コース／道具）", min: "1", up: "2", tip: "" },
          { name: "参加者の笑顔", min: "—", up: "1", tip: "許可をとってから" },
          { name: "完成品・ゴールの景色", min: "—", up: "1", tip: "" },
        ],
        totalMin: "6本",
        totalUp: "14本",
      },
    ],
    note: { label: "注意", text: "動きが激しい場面はブレるので、固定で撮った映像も混ぜてください。" },
  },
  {
    key: "sports",
    tab: "スポーツ",
    heading: "🏋 ⑦スポーツ",
    target: "ジム/フィットネス・格闘技/武道・ゴルフ",
    groups: [
      {
        rows: [
          { name: "外観（入口・看板）", min: "1", up: "2", tip: "横から横へゆっくり" },
          { name: "店内（フロア全体・更衣室）", min: "1", up: "3", tip: "横から横へゆっくり" },
          { name: "設備（マシン・リング・打席・道具）", min: "2", up: "3", tip: "" },
          { name: "トレーニング中（指導・ミット打ち・スイング）", min: "2", up: "5", tip: "いちばん大事。スタッフの実演でOK" },
          { name: "スタッフ", min: "1", up: "2", tip: "" },
        ],
        totalMin: "7本",
        totalUp: "15本",
      },
    ],
    note: { label: "注意", text: "会員さまが映る場合は許可をとってください。" },
  },
  {
    key: "life",
    tab: "くらし",
    heading: "🏡 ⑧くらし",
    target: "雑貨・工芸・服のお店／神社・寺",
    groups: [
      {
        title: "雑貨・工芸・服のお店",
        rows: [
          { name: "外観", min: "1", up: "2", tip: "横から横へゆっくり" },
          { name: "店内", min: "2", up: "6", tip: "横から横へゆっくり" },
          { name: "商品（1点ずつ・棚ごと）", min: "4", up: "10", tip: "全体を撮ってから、アップで" },
        ],
        totalMin: "7本",
        totalUp: "18本",
      },
      {
        title: "神社・寺",
        rows: [
          { name: "鳥居・門", min: "1", up: "2", tip: "横から横へゆっくり" },
          { name: "境内", min: "1", up: "3", tip: "横から横へゆっくり" },
          { name: "景色・御朱印・授与品・季節の飾り", min: "3", up: "7", tip: "全体を撮ってから、アップで" },
        ],
        totalMin: "5本",
        totalUp: "12本",
      },
    ],
    note: {
      label: "注意",
      text: "撮影してよい場所かを事前に確認してください。教室・写真館・クリーニングなどのお店は、「外観1・店内1〜3・作業の手元3〜5・完成品1」を目安にしてください。",
    },
  },
];

export const VERTICAL_KEYS: VerticalKey[] = BLOCKS.map((b) => b.key);

export const CLOSING = "ご不明な点がございましたら、お気軽にご相談ください。";
