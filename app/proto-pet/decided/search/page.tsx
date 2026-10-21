import Shell from "@/components/portal/petproto/decided/common/Shell";
import { Hero, FilterRow, Crumb, ResultHead, Cards, Side, SearchFooter, Trail } from "@/components/portal/petproto/decided/search/SearchPage";
import { Pager } from "@/components/portal/petproto/decided/search/Controls";
import "@/components/portal/petproto/decided/search/search.css";

// ③探すページ(ペット決定案の見本「探す」の完全再現)。ヘッダーは Shell(page="search")。フッターは見本の青空の帯のものを自前で出す。
export default function Page() {
  return (
    <Shell page="search" footer={false}>
      <div className="sr">
        <Hero />
        <FilterRow />
        <Crumb />
        <ResultHead />
        <Cards />
        <Pager />
        <Trail />
        <Side />
      </div>
      <SearchFooter />
    </Shell>
  );
}
