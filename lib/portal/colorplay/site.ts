/**
 * COLOR PLAY(本番のビューティー・ボディケア)の業種ごとの設定。純粋な定数(サーバー・クライアントのどちらからも読める)。
 * 色・言葉・種類の定義を業種ごとにここへ置き、部品(components/portal/colorplay/)は設定だけを見る。
 */
import type { CpVerticalKey } from "@/lib/portal/verticalDesign";

export type CpKind = { slug: string; name: string };

export type CpSite = {
  key: CpVerticalKey;
  /** URL の頭(/beauty) */
  base: string;
  /** 業種名(パンくず・メタデータ) */
  verticalName: string;
  /** ロゴ(「マチノワ·Beauty」) */
  logoA: string;
  logoB: string;
  /** 配色。play=赤・ピンク・水色 / calm=深い緑・生成り・紺 */
  theme: "play" | "calm";
  /** 店の呼び方(カード・見出し) */
  noun: string;
  /** 種類(データの category)。多い順。件数 0 の種類は画面に出さない */
  kinds: CpKind[];
  /** 検索の帯の一言 */
  searchLead: string;
  /** 検索の箱の薄い字 */
  placeholder: string;
  /** 効き目を思わせる文を落とす正規表現(店の紹介文から。データそのものは変えない) */
  strict: boolean;
  /** 英字の飾り(スクリプト体) */
  scriptSearch: string;
  scriptShop: string;
  scriptAbout: string;
};

export const BEAUTY_SITE: CpSite = {
  key: "beauty",
  base: "/beauty",
  verticalName: "ビューティー",
  logoA: "マチノワ",
  logoB: "Beauty",
  theme: "play",
  noun: "サロン",
  kinds: [
    { slug: "hair", name: "ヘアサロン" },
    { slug: "esthetic", name: "エステ" },
    { slug: "hair-removal", name: "脱毛" },
    { slug: "nail", name: "ネイル" },
    { slug: "eyelash", name: "まつげ・眉" },
  ],
  searchLead: "好きが見つかる、近くのビューティーサロン",
  placeholder: "エリア・サロン名で検索",
  strict: false,
  scriptSearch: "Find\nYour Beauty\nin Your Town.",
  scriptShop: "Find Your Beauty\nin Your Town.",
  scriptAbout: "Good Days,\n   Good Beauty.",
};

export const CP_SITES = { beauty: BEAUTY_SITE } as const;
