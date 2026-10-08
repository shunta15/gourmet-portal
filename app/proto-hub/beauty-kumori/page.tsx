import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPreviewOrLocal } from "@/lib/portal/launch";
import KumoriHero from "@/components/portal/vert/kumori/KumoriHero";
import { KUMORI_ENTRIES, KUMORI_LEAD } from "@/lib/portal/vert/kumori/data";
import { kuren, mincho } from "@/lib/portal/vert/kumori/fonts";

// ビューティー入口の試作「曇り鏡(KUMORI)」。湯気で曇った鏡を、手で拭く。プレビュー・ローカル専用（門は layout.tsx と、ここの isPreviewOrLocal）。
export const metadata: Metadata = {
  title: "マチノワ ビューティー",
  robots: { index: false, follow: false },
};

export default function Page() {
  if (!isPreviewOrLocal()) notFound();
  return (
    <div className={`${mincho.variable} ${kuren.variable}`}>
      <KumoriHero entries={KUMORI_ENTRIES} lead={KUMORI_LEAD} />
    </div>
  );
}
