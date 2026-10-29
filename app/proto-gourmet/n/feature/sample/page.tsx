import Shell from "@/components/portal/gnoren/common/Shell";
import FeatureArticle from "@/components/portal/gnoren/feature/FeatureArticle";

// 店の特集記事(見本 4)。中身と CSS は components/portal/gnoren/feature/
export default function Page() {
  return (
    <Shell page="feature">
      <FeatureArticle />
    </Shell>
  );
}
