import { notFound } from "next/navigation";

// 存在しない URL(/sports/zzz など)の 404 を、sports の枠(app/sports/(sub)/not-found.tsx)で出すための受け皿。
// 旧い種類・県・エリア・利用シーンのページ 728 本は消した(2026-10-27。オーナー「古い URL の存在も消す」)。転送も置かないので、旧 URL もここで 404 になる。
// 実在のルート(search・shop・article・special・feature など)のほうが先に当たるので、ここに来るのは無い URL だけ。
export default function Page(): never {
  notFound();
}
