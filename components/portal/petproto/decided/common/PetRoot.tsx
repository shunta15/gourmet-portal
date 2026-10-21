import { assertPortalLive } from "@/lib/portal/launch";
import { jp, min, hand, en } from "./fonts";
import "./base.css";

/** 本番(/pet 以下)用の外枠。試作の layout と同じ文字・下地で、見本の帯は出さない */
export default function PetRoot({ children }: { children: React.ReactNode }) {
  assertPortalLive(); // 公開スイッチ OFF のあいだは 404(lib/portal/launch.ts。ほかの新業種の外枠と同じ)
  return <div className={`pt-root ${jp.variable} ${min.variable} ${hand.variable} ${en.variable}`}>{children}</div>;
}
