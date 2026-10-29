import P4LowerHome from "./P4LowerHome";
import { min, minb, yomo, scr } from "../p4/fonts";
import "../p4/p4.css";
import "./p4lower.css";

/**
 * 総合トップ(/)を「見本4の下半分を変えた版(p4-lower)」で出す入口(components/portal/hproto/homeDesign.tsx が選ぶ)。
 * /proto-home/p4-lower(app/proto-home/p4-lower の layout.tsx と page.tsx)と同じ組み合わせ: 書体の変数 + p4.css + p4lower.css + P4LowerHome。
 */
export function HomeShell({ children }: { children: React.ReactNode }) {
  return <div className={`${min.variable} ${minb.variable} ${yomo.variable} ${scr.variable}`}>{children}</div>;
}

export async function HomePage() {
  return <P4LowerHome />;
}
