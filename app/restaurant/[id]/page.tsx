import { notFound } from "next/navigation";
import RestaurantDetail from "@/components/RestaurantDetail";
import { RESTAURANTS } from "@/lib/data";

export function generateStaticParams() {
  return RESTAURANTS.map((r) => ({ id: r.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = RESTAURANTS.find((x) => x.id === id);
  if (!r) return { title: "店舗が見つかりません — 味処 日本" };
  return {
    title: `${r.name} — ${r.area} ${r.cuisine.split(" / ")[1] || r.cuisine}`,
    description: r.desc,
    openGraph: {
      title: r.name,
      description: r.desc,
      images: [r.image],
    },
  };
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = RESTAURANTS.find((x) => x.id === id);
  if (!r) notFound();
  return <RestaurantDetail r={r} />;
}
