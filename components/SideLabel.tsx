import { yearLabel } from "@/lib/issueLabel";

// 年だけ(号は付けない)。年は日本時間の今の年。年をまたぐ瞬間にサーバーとブラウザの表示がずれても、警告を出さない
export default function SideLabel() {
  return (
    <div className="side-label" suppressHydrationWarning>
      マチノワ · {yearLabel()}
    </div>
  );
}
