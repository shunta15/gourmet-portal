import { notFound } from "next/navigation";

// 存在しない URL(/sports/zzz など)の 404 を、sports の枠(app/sports/(sub)/not-found.tsx)で出すための受け皿。
// 旧い種類・県・エリア・利用シーンのページ 728 本を消した(2026-10-27)ので、これが無いと共通の 404 になる。
// 実在のルート(search・shop・article・special・feature など)と next.config.ts の 308 転送のほうが先に当たるので、ここに来るのは本当に無い URL だけ。
export default function Page(): never {
  notFound();
}
