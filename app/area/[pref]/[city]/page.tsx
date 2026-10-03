/**
 * 業種横断の街ページ（市区町村）
 * /area/{pref}/{city} - 市区町村の6業種概覧
 * 外枠の段階では市区町村データなしなので全て notFound()
 */

import { notFound } from "next/navigation";

export const dynamicParams = true;

export default async function Page() {
  // 外枠の段階では市区町村データなしなので全て 404
  notFound();
}
