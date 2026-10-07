import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NigiwaiPage from "@/components/portal/hubs/nigiwai/NigiwaiPage";
import { isPreviewOrLocal, liveStaticParams } from "@/lib/portal/launch";
import { THEME_KEYS, isThemeKey, themeLabel } from "@/lib/portal/hubs/nigiwai/themes";

// 「にぎわいの輪」を、色を固定して見るページ（プレビュー・ローカル専用）。/proto-hub/nigiwai/<名前>。名前は themes.ts の 2 つ（sometsuke・akagane）だけ。それ以外は 404。
// 公開スイッチ OFF のあいだ、および本番（公開スイッチ ON でも）は、枠（app/proto-hub/layout.tsx）が 404 にする。検索エンジンには載せない。
export const dynamicParams = false;
export const generateStaticParams = liveStaticParams(() => (isPreviewOrLocal() ? THEME_KEYS.map((theme) => ({ theme })) : []));

type Props = { params: Promise<{ theme: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { theme } = await params;
  const label = isThemeKey(theme) ? themeLabel(theme) : "";
  return {
    title: `にぎわいの輪（${label}）— 色の固定（プレビュー）`,
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: Props) {
  const { theme } = await params;
  if (!isThemeKey(theme)) notFound();
  return <NigiwaiPage theme={theme} />;
}
