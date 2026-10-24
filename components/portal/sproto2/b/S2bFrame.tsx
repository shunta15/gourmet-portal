import type { ReactNode } from "react";
import { jp, sf, en } from "./fonts";
import "./base.css";

/** スポーツ試作 B 案(見本2)の外枠。幅は見本の画像の幅を基準に --u(= ページ幅 ÷ 見本の幅)で拡大し、1920 を超えたら中央寄せ。 */
export default function S2bFrame({ children }: { children: ReactNode }) {
  return (
    <div className={`s2b-root ${jp.variable} ${sf.variable} ${en.variable}`}>
      <div className="s2b-box">{children}</div>
    </div>
  );
}
