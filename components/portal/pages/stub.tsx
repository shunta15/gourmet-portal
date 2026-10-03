/**
 * まだデータが無いルート（店・特集・市区町村）。ルートだけ用意し、常に 404 を返す。
 * 外枠の段階では新業種の掲載が 0 件で、市区町村 slug のデータも無いため。
 * データが入ったら、各ルートの実体をこの場所から差し替える。
 */
import { notFound } from "next/navigation";

export default function NotFoundStub(): never {
  notFound();
}
