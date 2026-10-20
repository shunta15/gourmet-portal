/**
 * ボディケア案4(グリーン)の部品に渡す、店の「小さな形」。何も import しない(クライアントの部品からも `import type` で読める)。
 * 作るのは lib/portal/vert/bodygreen/shops.ts(サーバー専用)。サーバーで読んで、クライアントには必要なものだけを渡す。
 */
export type GreenPhoto = { src: string; alt: string; w: number; h: number };

export type GreenShop = {
  id: string; // bo0030 など
  name: string; // 最長 31 字
  kind: string; // 種類 slug(seitai・sekkotsu・shinkyu・massage・relaxation)
  kindName: string; // 整体・整骨院・接骨院 など
  kindColor: string; // 種類の色(写真が無い店の面)
  kindDark: boolean; // 色が濃い(面の上の字を白にする)
  pref: string; // 都道府県 slug(chiba など)。探すの ?pref= に使う
  prefName: string; // 千葉県
  prefShort: string; // 千葉
  city: string; // 市区町村(無ければ "")
  area: string; // 「千葉県 松戸市」(2 行目に出す形)
  address: string; // 住所(探すのキーワード検索に使う)
  photo: GreenPhoto | null; // 店の写真 1 枚(無い 7 店は null)
  tags: string[]; // こだわり(駅近・土日営業 など。データにある物だけ 0〜3。ShopCard は先頭 3 つを出す)
  hours: string; // 営業時間の 1 行目(無ければ "")
  hoursMore: boolean; // 営業時間が 2 行以上ある
  holidays: string; // 定休日(無ければ "")
  blurb: string; // 紹介記事の最初の 1 文(本番の点検を通った物。無ければ "")
};

/** 種類・都道府県・こだわりの件数(0 件は入れない)。最初のページ・探すの左の条件に使う */
export type GreenFacets = {
  total: number;
  kinds: Array<{ slug: string; name: string; count: number; color: string }>;
  /** 件数の多い順(同数は都道府県コード順) */
  prefs: Array<{ slug: string; name: string; short: string; count: number }>;
  /** 件数の多い順 */
  tags: Array<{ name: string; count: number }>;
};
