import P4Home from "./P4Home";
import { min, minb, yomo, scr } from "./fonts";
import "./p4.css";

/**
 * 総合トップ(/)を「見本4(丸い切り抜き)」で出す入口(components/portal/hproto/homeDesign.tsx が選ぶ)。
 * HomeShell = app/portal-home/layout.tsx の枠(書体の変数と CSS)・HomePage = app/portal-home/page.tsx の中身。
 */
export function HomeShell({ children }: { children: React.ReactNode }) {
  return <div className={`${min.variable} ${minb.variable} ${yomo.variable} ${scr.variable}`}>{children}</div>;
}

export async function HomePage() {
  return <P4Home />;
}
