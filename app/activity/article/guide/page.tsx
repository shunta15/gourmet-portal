import { ActivityEditorialPage, activityEditorialMetadata } from "@/components/portal/activity/pages";

// はじめての方へのガイド(/activity/article/guide)。中身は lib/activity/editorial.json の guide。店の ID は ac+数字なので、店の記事 /activity/article/[id] とはぶつからない(静的な名前が優先される)。
export const revalidate = 3600;

export async function generateMetadata() {
  return activityEditorialMetadata("guide");
}

export default async function Page() {
  return <ActivityEditorialPage kind="guide" />;
}
