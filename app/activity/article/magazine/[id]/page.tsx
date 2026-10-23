import { ActivityEditorialPage, activityEditorialMetadata, editorialPaths } from "@/components/portal/activity/pages";
import { liveStaticParams } from "@/lib/portal/launch";

// 読みもの(/activity/article/magazine/{id})。中身は lib/activity/editorial.json の magazine。店の記事 /activity/article/{店 ID} とは URL がぶつからない(階層が 1 つ深い)。
type Props = { params: Promise<{ id: string }> };

export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = liveStaticParams(async () => (await editorialPaths()).filter((p) => p.kind === "magazine").map((p) => ({ id: p.id })));

export async function generateMetadata({ params }: Props) {
  return activityEditorialMetadata("magazine", (await params).id);
}

export default async function Page({ params }: Props) {
  return <ActivityEditorialPage kind="magazine" id={(await params).id} />;
}
