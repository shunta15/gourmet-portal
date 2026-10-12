/** COLOR PLAY(本番)で、サーバーからクライアントへ渡す形 */
export type CpPhoto = { src: string; alt: string; w?: number; h?: number };

export type CpShop = {
  id: string;
  name: string;
  /** データの category(hair など) */
  kind: string;
  kindName: string;
  pref: string;
  prefName: string;
  city: string;
  address: string;
  /** 紹介文の最初の 1 文(無ければ空) */
  blurb: string;
  /** カードの大きな写真(無ければ null) */
  main: CpPhoto | null;
  /** 小さな写真(main と重ならない) */
  subs: CpPhoto[];
};

export type CpFeature = { id: string; title: string; store: string; href: string; photo: CpPhoto | null };

export type Filters = { kind?: string; pref?: string; q?: string; sort?: string; n?: number };
