import type { Metadata } from "next";
import GuideClient from "./GuideClient";
import { VERTICAL_KEYS, type VerticalKey } from "./guideData";

/**
 * 撮影シーン詳細(LINE 公式アカウントから案内する店舗オーナー向けページ)。
 * 検索に出さず、サイトのナビ・サイトマップ・トップからはリンクしない(LINE のボタンからだけ来る)。
 * ?v=gourmet|beauty|bodycare|pet|stay|activity|sports|life で最初に開く業種を決める(無ければグルメ)。
 */
export const metadata: Metadata = {
  title: "撮影シーン詳細 | マチノワ",
  description: "業種ごとの撮影シーンと撮り方のご案内です。",
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
