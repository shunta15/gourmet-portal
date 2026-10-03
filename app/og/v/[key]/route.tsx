import { VerticalCard, renderOg } from "@/components/portal/og/cards";
import { NEW_VERTICAL_KEYS } from "@/lib/verticals";
import { countPlaces } from "@/lib/places";
import type { VerticalKey } from "@/lib/verticals/types";

// 業種トップの共有画像（/og/v/{beauty|bodycare|pet|leisure|stay}）。件数は実データ
export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!NEW_VERTICAL_KEYS.includes(key as VerticalKey)) return new Response("Not found", { status: 404 });
  const count = await countPlaces(key as VerticalKey);
  return renderOg(<VerticalCard vertical={key as VerticalKey} count={count} />);
}
