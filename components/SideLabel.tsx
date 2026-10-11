import { yearLabel } from "@/lib/issueLabel";
import { RELEASE_REST } from "@/lib/portal/noren/release";

// 年だけ(号は付けない)。年は日本時間の今の年。年をまたぐ瞬間にサーバーとブラウザの表示がずれても、警告を出さない
export default function SideLabel() {
  return (
    <div className="side-label" suppressHydrationWarning>
      マチノワ · {RELEASE_REST ? yearLabel() : "2026年 春号"}
    </div>
  );
}
