import Shell from "@/components/portal/gnoren3/common/Shell";
import SearchView from "@/components/portal/gnoren3/search/SearchView";

// 暖簾 3 さがす(見本 2_さがす.png の 1:1 再現)。
export default function Page() {
  return (
    <Shell page="search">
      <SearchView />
    </Shell>
  );
}
