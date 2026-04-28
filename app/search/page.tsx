import { Suspense } from "react";
import SearchClient from "@/components/SearchClient";

export const metadata = {
  title: "店舗を探す — マチノワ",
  description:
    "全国の飲食店を、地域・業種・キーワードで探す。編集部おすすめ店から、隠れ家まで。",
};

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchClient />
    </Suspense>
  );
}
