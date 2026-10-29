import Shell from "@/components/portal/gnoren/common/Shell";
import FeatureList from "@/components/portal/gnoren/featurelist/FeatureList";

// 特集一覧(見本 5「特集から読む」)。見本 1:1 再現。
export default function Page() {
  return (
    <Shell page="feature">
      <FeatureList />
    </Shell>
  );
}
