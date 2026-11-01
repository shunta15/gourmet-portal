import Shell from "@/components/portal/gnoren3/common/Shell";
import TopPage from "@/components/portal/gnoren3/top/TopPage";

// 暖簾 3 トップ(見本 1_最初.png の 1:1 再現)。中身は components/portal/gnoren3/top/。
export default function Page() {
  return (
    <Shell page="top">
      <TopPage />
    </Shell>
  );
}
