import Fx from "./Fx";
import Petals from "./Petals";
import Motion from "./Motion";
import { maru, mplus, yusei, kure, script, pop } from "./fonts";
import "./base.css";

/** 共通の枠(総合トップ app/portal-home の layout が使う)。 */
/** .h2-airy = 圧迫感を減らす版(airy.css)・.h2-simple = 文字色をシンプルに(simple.css)。どちらも常に付ける */
export default function MachiShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Petals />
      <div className="h2-progress" aria-hidden="true" />
      <div className={`h2-root h2-airy h2-simple ${maru.variable} ${mplus.variable} ${yusei.variable} ${kure.variable} ${script.variable} ${pop.variable}`}>
        <Fx />
        <Motion />
        <div className="h2-page">{children}</div>
      </div>
    </>
  );
}
