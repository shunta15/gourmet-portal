import Fx from "./Fx";
import Petals from "./Petals";
import Motion from "./Motion";
import { maru, mplus, yusei, kure, script, pop } from "./fonts";
import "./base.css";

/** 共通の枠。いちばん上に細い帯(見本であることの表示)を 1 本だけ付ける。 */
export default function MachiShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Petals />
      <div className="h2-progress" aria-hidden="true" />
      <div className={`h2-root ${maru.variable} ${mplus.variable} ${yusei.variable} ${kure.variable} ${script.variable} ${pop.variable}`}>
        <p className="h2-notice">見本(デザイン確認用。お知らせ・日付・記事名は仮の内容です)</p>
        <Fx />
        <Motion />
        <div className="h2-page">{children}</div>
      </div>
    </>
  );
}
