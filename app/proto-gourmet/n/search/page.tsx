import Shell from "@/components/portal/gnoren/common/Shell";
import SearchView from "@/components/portal/gnoren/search/SearchView";

// さがす(見本 2)。中身は components/portal/gnoren/search/
export default function Page() {
  return (
    <Shell page="search">
      <SearchView />
    </Shell>
  );
}
