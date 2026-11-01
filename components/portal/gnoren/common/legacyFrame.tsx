import NorenFrame from "@/components/portal/noren/NorenFrame";
import { GOURMET_TOP } from "@/lib/portal/noren/nav";

/**
 * 【暫定】旧い暖簾の枠(NorenFrame)を、layout ではなく各 page.tsx の側で付けるための道具。
 * 暖簾 2 の本番化(components/portal/gnoren/REAL_PLAN.md)の途中、まだ旧部品を描いているページだけが使う。
 * ページ担当が新しい部品(gnoren の Shell)に差し替えるとき、その page.tsx から withLegacyFrame を外す(= このファイルの利用をやめる)。
 * 6 ページすべてが外れたら、このファイルを消してよい(統合担当)。
 */
export function withLegacyFrame<P>(Page: (props: P) => Promise<React.ReactNode> | React.ReactNode) {
  return async function FramedPage(props: P) {
    const body = await Page(props);
    return <NorenFrame top={GOURMET_TOP}>{body}</NorenFrame>;
  };
}
