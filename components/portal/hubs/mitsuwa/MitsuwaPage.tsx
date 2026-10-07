import type { CSSProperties } from "react";
import { getHubData } from "@/lib/portal/hub";
import { themeStyle, type ThemeKey } from "@/lib/portal/hubs/mitsuwa/themes";
import "./mitsuwa.css";
import MitsuwaFonts from "./MitsuwaFonts";
import MitsuwaHub from "./MitsuwaHub";
import MitsuwaStatement from "./MitsuwaStatement";
import ThemeSwatch from "./ThemeSwatch";

/**
 * 「三つの輪 MITSUWA」のページ本体（サーバー）。色（theme）だけが違う。色の値は lib/portal/hubs/mitsuwa/themes.ts にだけある。
 * 外側の .mwp に CSS 変数（--mt-*）を付けるので、最初の HTML から、その色で出る（別の色が一瞬見えてから変わることはない）。
 */
export default async function MitsuwaPage({ theme }: { theme: ThemeKey }) {
  const data = await getHubData();
  return (
    <div className="mwp" data-theme={theme} style={themeStyle(theme) as CSSProperties}>
      <MitsuwaFonts />
      <MitsuwaHub
        theme={theme}
        swatch={<ThemeSwatch current={theme} />}
        items={data.items}
        gourmetTotal={data.gourmetTotal}
        featureTotal={data.featureTotal}
        open={data.open}
      />
      <MitsuwaStatement />
    </div>
  );
}
