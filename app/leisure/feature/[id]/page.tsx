/**
 * 特集ページ
 * 外枠の段階ではデータ0なので全て notFound()
 */

import { notFound } from "next/navigation";

export const dynamicParams = true;

export default async function Page() {
  // 外枠の段階ではデータなしなので全て 404
  notFound();
}
