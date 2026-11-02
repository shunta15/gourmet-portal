import type { Metadata } from "next";
import GuideClient from "./GuideClient";
import { VERTICAL_KEYS, type VerticalKey } from "./guideData";

/**
 * 動画用撮影素材のお願い(業種別。LINE 公式アカウントから案内する店舗オーナー向けページ)。
 * 検索に出さず、サイトのナビ・サイトマップ・トップからはリンクしない(LINE のボタンからだけ来る)。
 * ?v=gourmet|beauty|bodycare|pet|stay|activity|sports|life で最初に開く業種を決める(無ければグルメ)。
 */
export const metadata: Metadata = {
  title: "動画用撮影素材のお願い（業種別）｜マチノワ",
  description: "業種別の、動画用撮影素材のお願いです。",
  robots: { index: false, follow: false },
};

export default async function LineGuidePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.v) ? sp.v[0] : sp.v;
  const initial: VerticalKey = VERTICAL_KEYS.includes(raw as VerticalKey) ? (raw as VerticalKey) : "gourmet";
  return <GuideClient initial={initial} />;
}
