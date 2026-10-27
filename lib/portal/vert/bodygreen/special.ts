/**
 * ボディケア「業種の特集記事」(/bodycare/special 一覧と /bodycare/special/[slug] 3 本)の題・説明・出典の台帳。何も import しない(サーバー・クライアントのどちらからも読める)。
 * 本文の組み立て・店のデータからの件数は components/portal/bcproto/green/article/SpecialArticles.tsx(サーバー)と lib/portal/vert/bodygreen/specialData.ts(サーバー専用)。
 *
 * 決まり: 書くのは「出典で確かめた事実」と「店のデータにある事実」だけ。施術や店の結果を約束する文・順位・評価・料金は書かない。
 * 受診の目安(しびれ・強い痛みが続くときは医療機関へ)を、どの記事にも入れる。
 */

export type SpecialSlug = "difference" | "choose" | "weekend";

/** 出典の台帳。確かめた日と、何を確かめたか(記事の中の文の根拠)を残す。url は curl で実在を確かめた物 */
export type SpecialSource = {
  id: string;
  label: string;
  url: string;
  /** 記事のどの文の根拠か(確かめた内容) */
  confirmed: string;
};

/** 出典を確かめた日(url の実在・本文の該当箇所を確かめた日) */
export const SOURCES_CHECKED_AT = "2026-10-20";
export const SOURCES_CHECKED_AT_DOT = "2026.10.20";

export const SOURCES: Record<string, SpecialSource> = {
  ahaki: {
    id: "ahaki",
    label: "あん摩マツサージ指圧師、はり師、きゆう師等に関する法律(e-Gov 法令検索)",
    url: "https://laws.e-gov.go.jp/law/322AC0000000217",
    confirmed: "第1条: 医師以外の者があん摩・マッサージ・指圧・はり・きゅうを業としようとするときは、それぞれの免許を受けなければならない。",
  },
  judo: {
    id: "judo",
    label: "柔道整復師法(e-Gov 法令検索)",
    url: "https://laws.e-gov.go.jp/law/345AC1000000019",
    confirmed: "第2条: 柔道整復師は、厚生労働大臣の免許を受けて柔道整復を業とする者。第15条: 医師である場合を除き、柔道整復師でなければ、業として柔道整復を行なつてはならない(e-Gov 法令API で条文を確認)。第17条: 医師の同意を得た場合のほか、脱臼または骨折の患部に施術をしてはならない(応急手当を除く)。",
  },
  ryoyohi: {
    id: "ryoyohi",
    label: "厚生労働省「柔道整復師等の施術にかかる療養費の取扱いについて」",
    url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/jyuudou/index.html",
    confirmed: "柔道整復・はり・きゅう・マッサージで健康保険(療養費)が使える場合と、対象にならない場合。医師の同意書または診断書が要るのは、はり・きゅうとマッサージ。柔道整復で医師の同意が要るのは骨折と脱臼(緊急の場合を除く)。「施術所などにお尋ねください」の案内は、はり・きゅうとマッサージの節にある。",
  },
  kokusen: {
    id: "kokusen",
    label: "国民生活センター報道発表資料「手技による医業類似行為の危害」(平成24年8月2日。厚生労働省の会議資料に掲載)",
    url: "https://www.mhlw.go.jp/stf/shingi/2r9852000002lamn-att/2r9852000002latt.pdf",
    confirmed: "整体やカイロプラクティックなどには法的資格制度がないこと。免許の有無は広告を見ただけでは判断が難しい場合があること。病気やからだの不調があるときは、施術を受ける前に医師のアドバイスを受けること。",
  },
  hanbetsu: {
    id: "hanbetsu",
    label: "厚生労働省「あん摩マッサージ指圧師、はり師及びきゅう師と無資格者との判別について」",
    url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000118517.html",
    confirmed: "手技による施術で、あん摩マッサージ指圧師・はり師・きゅう師の免許のある人とない人の判別が困難であることが指摘されている、と国が述べていること。",
  },
};

export type SpecialPoint = { id: string; no: string; title: string; tab: string };

export type SpecialMeta = {
  slug: SpecialSlug;
  /** 一覧・パンくず・メタの題 */
  title: string;
  /** ヒーローの大見出し(1 行ずつ) */
  titleLines: string[];
  /** 一覧の札に出す 1 文 */
  summary: string;
  /** meta description(120 字前後) */
  description: string;
  points: SpecialPoint[];
  /** 出典の台帳の id(記事の終わりに出す) */
  sourceIds: string[];
};

export const SPECIALS: SpecialMeta[] = [
  {
    slug: "difference",
    title: "整体・整骨院・鍼灸院・マッサージ・リラクゼーションのちがい",
    titleLines: ["整体・整骨院・鍼灸院・", "マッサージ・", "リラクゼーションのちがい"],
    summary: "名前によって、関わる法律の決まりがちがいます。ただし名前だけでは、施術する人の免許は分かりません。法律で決まっていることを中心に整理しました。",
    description: "整体・整骨院(接骨院)・鍼灸院・マッサージ・リラクゼーションのちがいを、免許(国家資格)と健康保険が使える場合を中心に、法律の決まりを中心に整理しました。",
    points: [
      { id: "license", no: "01", title: "法律で免許が決められている業", tab: "免許" },
      { id: "words", no: "02", title: "五つの呼び名と、法律のうえでの決まり", tab: "呼び名" },
      { id: "insurance", no: "03", title: "健康保険が使える場合", tab: "健康保険" },
      { id: "listed", no: "04", title: "掲載している店の種類", tab: "掲載店" },
      { id: "doctor", no: "05", title: "医療機関に相談する目安", tab: "相談の目安" },
    ],
    sourceIds: ["ahaki", "judo", "ryoyohi", "kokusen", "hanbetsu"],
  },
  {
    slug: "choose",
    title: "ボディケアの店を選ぶときに見るところ",
    titleLines: ["ボディケアの店を", "選ぶときに見るところ"],
    summary: "場所・営業時間・定休日・予約のしかた・免許の表示。店のページで確かめられる見かたをまとめました。",
    description: "ボディケアの店を選ぶときに、店のページで確かめられる見かたを整理しました。場所、営業時間と定休日、予約のしかた、施術する人の免許の表示、情報の確認日。医療機関に相談する目安も添えています。",
    points: [
      { id: "place", no: "01", title: "場所と営業時間・定休日", tab: "場所と時間" },
      { id: "reserve", no: "02", title: "予約のしかた", tab: "予約" },
      { id: "qualify", no: "03", title: "施術する人の免許の表示", tab: "免許の表示" },
      { id: "source", no: "04", title: "情報の出どころと確認日", tab: "確認日" },
      { id: "doctor", no: "05", title: "医療機関に相談する目安", tab: "相談の目安" },
    ],
    sourceIds: ["kokusen", "hanbetsu"],
  },
  {
    slug: "weekend",
    title: "土日も開いているボディケアの店",
    titleLines: ["土日も開いている", "ボディケアの店"],
    summary: "営業時間に土曜と日曜の両方がある店を、店のデータにある営業時間と定休日のとおりに並べました。",
    description: "営業時間に土曜と日曜の両方があるボディケアの店を、店のデータにある土曜・日曜の営業時間と定休日のとおりに並べました。並びは順位ではありません。各店のページへのリンク付き。",
    points: [
      { id: "list", no: "01", title: "土曜・日曜の営業時間", tab: "営業時間" },
      { id: "before", no: "02", title: "出かける前に", tab: "出かける前に" },
      { id: "doctor", no: "03", title: "医療機関に相談する目安", tab: "相談の目安" },
      { id: "more", no: "04", title: "ほかの条件で探す", tab: "さらに探す" },
    ],
    sourceIds: [],
  },
];

export const specialBySlug = (slug: string): SpecialMeta | undefined => SPECIALS.find((s) => s.slug === slug);
