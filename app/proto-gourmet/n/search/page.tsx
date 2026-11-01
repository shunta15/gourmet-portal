import Shell from "@/components/portal/gnoren/common/Shell";
import { GN_PROTO_LINKS } from "@/components/portal/gnoren/common/nav";
import SearchView from "@/components/portal/gnoren/search/SearchView";

// さがす(見本 2)。中身は components/portal/gnoren/search/
export default function Page() {
  return (
    <Shell page="search" links={GN_PROTO_LINKS}>
      <SearchView />
    </Shell>
  );
}
