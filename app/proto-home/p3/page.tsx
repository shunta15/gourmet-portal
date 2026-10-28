import type { Metadata } from "next";
import P3Home from "@/components/portal/hproto/p3/P3Home";

// 総合トップの試作「p3」。中身はオーナーが持ってきた見本(写真コラージュ)の仮の文言のまま(置き換えは案が決まってから)。
export const metadata: Metadata = {
  title: "マチノワ | 街の“好き”が見つかる、つながる。",
  robots: { index: false, follow: false },
};

export default function Route() {
  return <P3Home />;
}
