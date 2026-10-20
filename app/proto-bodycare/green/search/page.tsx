import GreenSearch from "@/components/portal/bcproto/green/search/GreenSearch";

// 試作の探すページは、本番の GreenSearch(/bodycare/search と同じ部品・同じデータ)をそのまま出す。
type SP = Record<string, string | string[] | undefined>;

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  return <GreenSearch sp={await searchParams} />;
}
