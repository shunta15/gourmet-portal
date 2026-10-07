import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MitsuwaPage from "@/components/portal/hubs/mitsuwa/MitsuwaPage";
import { liveStaticParams } from "@/lib/portal/launch";
import { THEME_KEYS, isThemeKey, themeLabel } from "@/lib/portal/hubs/mitsuwa/themes";

// 「三つの輪」の色ちがい（試作・非公開）。/proto-hub/mitsuwa/<名前>。名前は themes.ts にあるもの（ki 以外。ki は /proto-hub/mitsuwa）だけ。それ以外は 404。
// 公開スイッチ OFF のあいだは、枠（app/proto-hub/layout.tsx）が 404 にする。検索エンジンには載せない。
export const dynamicParams = false;
export const generateStaticParams = liveStaticParams(() => THEME_KEYS.filter((k) => k !== "ki").map((theme) => ({ theme })));

type Props = { params: Promise<{ theme: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { theme } = await params;
  const label = isThemeKey(theme) ? themeLabel(theme) : "";
  return {
    title: `三つの輪（${label}）— 総合トップ案（試作）`,
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: Props) {
  const { theme } = await params;
  if (!isThemeKey(theme) || theme === "ki") notFound();
  return <MitsuwaPage theme={theme} />;
}
