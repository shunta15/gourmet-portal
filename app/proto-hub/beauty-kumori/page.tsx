import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPreviewOrLocal } from "@/lib/portal/launch";
import KumoriPage from "@/components/portal/vert/kumori/KumoriPage";

// ビューティー入口の試作「曇り鏡(KUMORI)」の見本。湯気で曇った鏡を、手で拭く。プレビュー・ローカル専用（門は layout.tsx と、ここの isPreviewOrLocal）。
// 中身は本物の /beauty（app/beauty/(top)/page.tsx）と同じ components/portal/vert/kumori/KumoriPage.tsx。見本は noindex。
export const metadata: Metadata = {
  title: "マチノワ ビューティー",
  robots: { index: false, follow: false },
};

export default function Page() {
  if (!isPreviewOrLocal()) notFound();
  return <KumoriPage />;
}
