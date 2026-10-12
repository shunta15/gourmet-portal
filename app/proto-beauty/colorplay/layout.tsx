import type { Metadata } from "next";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import { cond, jp, latin, script } from "@/components/portal/bproto/colorplay/fonts";
import ScrollFx from "@/components/portal/bproto/colorplay/ScrollFx";
import "@/components/portal/bproto/colorplay/colorplay.css";

// ビューティーの試作「COLOR PLAY」。プレビュー・ローカル専用(本番は 404)。
export const metadata: Metadata = { title: "マチノワ Beauty — COLOR PLAY(見本)", robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return <div className={`cp-root ${jp.variable} ${cond.variable} ${script.variable} ${latin.variable}`}><ScrollFx />{children}</div>;
}
