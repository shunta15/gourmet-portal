/**
 * グルメのトップ /gourmet の最初の画面（リアル版の暖簾。WebGL の布・赤提灯。components/portal/noren-real/）の設定。軽いファイル（サーバー専用の import は足さない）。
 *
 * - 最初の画面より下（章・のぼり・特集・掲載方針・フッター）と、メタ情報（title・description・canonical）は、リアル版の暖簾でも変わらない。
 * - /gourmet が見えるのは公開スイッチ（PORTAL_LAUNCHED）が ON のときだけ（lib/portal/launch.ts）。OFF のあいだは 404 のまま。
 * - 本番では URL の ?dye= ?wrinkle= は効かず、色は NOREN_REAL_DYE に固定される。
 * - 店ページ・特集記事の布・提灯は、最初の画面とは別。揃えるスイッチは下の NOREN_REAL_INNER。
 */
import { RELEASE_REST } from "./release";

export type NorenRealDye = "ai" | "kon" | "sumi" | "kakishibu" | "enji";

/** 本番で使う布の色: ai（藍）・kon（濃紺）・sumi（墨）・kakishibu（柿渋）・enji（臙脂） */
export const NOREN_REAL_DYE: NorenRealDye = "ai";

/**
 * 店ページ・特集記事・特集のトップの、布と提灯をリアル版にするスイッチ（入口の暖簾とは別。色は上の NOREN_REAL_DYE）。
 * - true: 店ページの屋号の暖簾（ShopHero）・特集記事の巻頭の暖簾（FeatureHero）の布が、入口と同じ見た目・同じ色になる。
 *   店ページ・特集記事の提灯は WebGL の赤提灯になる。CSS で描いた布（特集のカード・目次の札・フッターの暖簾など）の色も選んだ色に揃う。
 *   動き・大きさ・字の割り方・タイミングは変わらない（変わるのは見た目だけ）。
 * - false: 今までどおり（本番の暖簾。出力は変わらない）。元に戻すときは false にして再デプロイ。
 * - 実装: components/portal/noren-real/（clothInner.ts・lanternInner.ts・dye.css）。本番の暖簾の部品（cloth.ts・Lantern.tsx）は書き換えていない。
 */
export const NOREN_REAL_INNER = RELEASE_REST;

/**
 * 布・竿・奥の写真の明るさの段階（1〜5）。段階を見比べて決めた値（URL の ?bright=1〜5。時刻は ?t=12:30 / ?t=21:30）。
 * - 1 は今までと同じ（倍率 1.0。見た目は 1 画素も変わらない）。大きいほど明るい。
 * - 本番では URL で変えられない。ここの値で固定（決まったら書き替えて再デプロイ）。
 * - 効く所: 入口の布・竿・奥の写真（clothReal.ts / real.css）、店ページ・特集記事の WebGL の布・竿（clothInner.ts）。染め抜きの字は 1.1 倍まで。
 *   夜（灯りが強い時刻）は元から明るいので、上げ幅は約 1/3（シェーダーの中で自動で抑える）。
 */
export type NorenRealBright = 1 | 2 | 3 | 4 | 5;
export const NOREN_REAL_BRIGHT: NorenRealBright = 5;

/** 段階 → 倍率（昼の灯りが弱い時刻での倍率。夜は 1 に寄せて掛かる） */
export const BRIGHT_MUL: Record<NorenRealBright, number> = { 1: 1.0, 2: 1.4, 3: 1.9, 4: 2.5, 5: 3.2 };

/** 明るさを切り替える口。window に CustomEvent(BRIGHT_EVENT, { detail: 1〜5 }) を送ると、読み込み直しなしで替わる */
export const BRIGHT_EVENT = "noren-real:bright";

/** ?bright= の文字列を段階に直す。合わなければ null */
export function parseBright(q: string | null | undefined): NorenRealBright | null {
  const n = Number(q);
  return n === 1 || n === 2 || n === 3 || n === 4 || n === 5 ? n : null;
}

/** 写真（CSS）に掛ける倍率。布のシェーダーと同じ式で、夜（lamp が大きい）ほど上げ幅を 1/3 に抑える */
export function effBright(mul: number, lamp: number): number {
  const t = Math.min(1, Math.max(0, (lamp - 0.18) / (1 - 0.18)));
  const k = t * t * (3 - 2 * t);
  return mul + (1 + (mul - 1) * 0.35 - mul) * k;
}

/**
 * 暖簾のページの地（背景）の色。sumi（墨・今のまま）・haizumi（灰墨）。
 * - sumi 以外にすると、NorenFrame が枠（.vN）に data-ground を付け、components/portal/noren-real/ground.css が --sumi・--sumi-2・--sumi-3・--sumi-4・--sumi-rgb を上書きする。
 *   sumi のときは何も付けない＝出力は今までと同じ。本番はこの値だけを使う（URL では変えられない）。
 */
export type NorenRealGround = "sumi" | "haizumi";
export const NOREN_REAL_GROUND: NorenRealGround = "haizumi";

/**
 * スマホ幅（700px 未満）だけの、暖簾の丈（裾の位置）。PC（700px 以上）は変わらない。
 * - "long": 今まで（裾が画面の下近く。1 枚が細長い帯になる）
 * - "half": 半分の丈（裾が画面の高さの約 50%。裾の下に、店の中の灯り・サイト名・一言・「店をさがす」への案内）
 * - "short": 短い丈（裾が約 30%。横に渡した短い暖簾。そのすぐ下に「店を、さがす。」の見出しと業種 7 個）
 * - "mid": 6 割の丈（裾が約 62%。字を少し上寄せ。裾の下はサイト名と一言だけ）
 * 既定は NOREN_REAL_SP_SHAPE（2026-10-11 オーナー決定で "long"＝今まで。half・short・mid のコードと ?sp= は残してある）。URL の ?sp=long|half|short|mid で上書きできるのは、本番（VERCEL_ENV が production）以外だけ
 * （サーバー側で判定して allowSpUrl として渡す。app/gourmet/page.tsx）。元に戻すなら "long"。
 */
export type NorenRealSpShape = "long" | "half" | "short" | "mid";
export const NOREN_REAL_SP_SHAPE: NorenRealSpShape = "long";
export const SP_SHAPE_LIST: readonly NorenRealSpShape[] = ["long", "half", "short", "mid"];
/** スマホ幅の暖簾の丈の、裾の位置（画面の高さに対する割合）。"long" は割合でなく今までの位置（画面の下から 50px） */
export const SP_HEM_FRAC: Record<Exclude<NorenRealSpShape, "long">, number> = { half: 0.5, short: 0.3, mid: 0.62 };
/** この幅（px）未満を「スマホ幅」とする */
export const SP_MAX_WIDTH = 700;
/** ?sp= の文字列を丈の案に直す。合わなければ null */
export function parseSpShape(q: string | null | undefined): NorenRealSpShape | null {
  return SP_SHAPE_LIST.find((k) => k === q) ?? null;
}
