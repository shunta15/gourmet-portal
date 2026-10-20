import Fx from "./Fx";
import Petals from "./Petals";
import Motion from "./Motion";
import { maru, mplus, yusei, kure, script, pop } from "./fonts";
import "./base.css";

/** 共通の枠。試作では、いちばん上に細い帯(見本であることの表示)を 1 本だけ付ける。prod(本番の形)では帯を出さない。 */
/** airy = 試作 /proto-home/airy 用(圧迫感を減らす版。airy.css が .h2-airy を指す)。本番は渡さない=今のまま */
export default function MachiShell({ children, prod = false, airy = false }: { children: React.ReactNode; prod?: boolean; airy?: boolean }) {
  return (
    <>
      <Petals airy={airy} />
      <div className="h2-progress" aria-hidden="true" />
      <div className={`h2-root${airy ? " h2-airy" : ""} ${maru.variable} ${mplus.variable} ${yusei.variable} ${kure.variable} ${script.variable} ${pop.variable}`}>
        {!prod && <p className="h2-notice">見本(デザイン確認用。お知らせ・日付・記事名は仮の内容です)</p>}
        <Fx />
        <Motion />
        <div className="h2-page">{children}</div>
      </div>
    </>
  );
}
