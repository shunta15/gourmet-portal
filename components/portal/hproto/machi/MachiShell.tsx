import Fx from "./Fx";
import Petals from "./Petals";
import { maru, mplus, yusei, kure, script, pop } from "./fonts";
import "./base.css";

/** 共通の枠。いちばん上に細い帯(見本であることの表示)を 1 本だけ付ける。 */
export default function MachiShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Petals />
      <div className={`hm-root ${maru.variable} ${mplus.variable} ${yusei.variable} ${kure.variable} ${script.variable} ${pop.variable}`}>
        <p className="hm-notice">見本(デザイン確認用。店名・数字・記事名は仮の内容です)</p>
        <Fx />
        <div className="hm-page">{children}</div>
      </div>
    </>
  );
}
