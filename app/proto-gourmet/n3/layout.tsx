import type { Metadata } from "next";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import { mincho, gothic, script } from "@/components/portal/gnoren3/common/fonts";
import "@/components/portal/gnoren3/common/base.css";

// グルメの新デザイン試作「暖簾 3」(見本 5 枚 2026-11-01 の 1:1 再現)。プレビュー・ローカル専用(本番は 404)。検索エンジンに載せない。
// 構成と使い方は components/portal/gnoren3/README.md。
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return <div className={`${mincho.variable} ${gothic.variable} ${script.variable}`}>{children}</div>;
}
