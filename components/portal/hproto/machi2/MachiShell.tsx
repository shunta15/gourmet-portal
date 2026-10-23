import Fx from "./Fx";
import Petals from "./Petals";
import Motion from "./Motion";
import { maru, mplus, yusei, kure, script, pop } from "./fonts";
import "./base.css";

/** 共通の枠(総合トップ app/portal-home の layout が使う)。 */
/** airy = 圧迫感を減らす版(airy.css が .h2-airy を指す) */
/** simple = 文字色をシンプルに(simple.css が .h2-simple を指す) */
export default function MachiShell({ children, airy = false, simple = false }: { children: React.ReactNode; airy?: boolean; simple?: boolean }) {
  return (
    <>
      <Petals airy={airy} />
      <div className="h2-progress" aria-hidden="true" />
      <div className={`h2-root${airy ? " h2-airy" : ""}${simple ? " h2-simple" : ""} ${maru.variable} ${mplus.variable} ${yusei.variable} ${kure.variable} ${script.variable} ${pop.variable}`}>
        <Fx />
        <Motion />
        <div className="h2-page">{children}</div>
      </div>
    </>
  );
}
