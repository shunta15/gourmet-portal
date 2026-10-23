import { RELEASE_REST } from "./release";

/**
 * 「さがす」のページ（/search）の中の、「ほかの探し方」の入口（探し方のタブの下の小さな 1 行）。
 * 2026-10-23 オーナー決定「各業種 4 ページに収める」「おまかせ提案・写真から探す・ショート動画は、フッターから外して、探すのページの中に入口を移す」。
 * 以前はグルメのフッターのナビゲーションにあった 3 つ（リンク元はそこだけだったので、外すと孤立する）。ページそのものは消さない。
 * ショート動画の行き先は、RELEASE_REST が false のあいだは今までどおり /nazatu（true で総合サイトの動画のページ /videos）。
 * 軽い定数だけ（クライアントの NorenSearch から使う。サーバー専用の import を足さない）。
 */
export const SEARCH_OTHER_WAYS = [
  { href: "/omakase", ja: "おまかせ提案" },
  { href: "/photos", ja: "写真から探す" },
  { href: RELEASE_REST ? "/videos" : "/nazatu", ja: "ショート動画" },
] as const;
