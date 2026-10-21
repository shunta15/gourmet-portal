import "@/components/portal/portal.css";
import GreenShell from "@/components/portal/bcproto/green/common/GreenShell";
import { assertPortalLive } from "@/lib/portal/launch";

// ボディケアのトップ（/bodycare）だけの枠。案4「グリーン」。自前のヘッダー・フッターを持つので、共通のヘッダー・フッター・PortalMotion は出さない（GreenShell）。
// その下のページ（探す・店・特集記事）は (cp)(shop)(sub) の layout が同じ枠を出す。URL に (top) (sub) は出ない。
// 公開スイッチ OFF のときは 404 になる（/bodycare は今までどおり 404）。
export default function Layout({ children }: { children: React.ReactNode }) {
  assertPortalLive();
  return <GreenShell>{children}</GreenShell>;
}
