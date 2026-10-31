/**
 * 管理画面・取り込みで店・特集を書き換えたあと、公開ページの ISR キャッシュをどこまで作り直すか決める(サーバー専用)。
 *
 * 公開ページは「時間で作り直す」(export const revalidate)をやめて、書き換えたときだけ作り直す。
 * そのため、DB(Supabase の restaurants・feature_articles)の中身が出るページは、ここに全部入れておく必要がある。
 *
 * 大事な決まり(Next.js のドキュメント revalidatePath の「Using revalidatePath with rewrites」):
 *   rewrites で差し替えているページは、ブラウザの URL(source)ではなく、実体のパス(destination)で作り直す。
 *     /restaurant/<id> → 実体は /gourmet/restaurant/<id>
 *     /feature/<id>    → 実体は /gourmet/feature/<id>
 *     /                → 実体は /portal-home
 *   (next.config.ts の rewrites。公開スイッチ OFF のときは /restaurant/<id> が実体のままなので、元のパスも一緒に出す。)
 *
 * DB の店・特集が出るページ(lib/db/* を直接・間接に読むもの)は次のとおり。
 *   - /gourmet 配下すべて(店ページ・特集ページ・一覧・さがす・グルメのトップ)  → layout 単位で /gourmet
 *   - /portal-home(= `/`。新着・新しい店)
 *   - /photos 配下(写真の壁・sitemap)、/videos 配下(動画に出る店。lib/videos/stores.ts)
 *   - /sitemap.xml、/search-index.json、/list-data/<店 ID>
 * 8 業種の他のページ(ビューティー〜くらし)は lib/places/generated/*.json だけを読むので、デプロイで入れ替わる。DB の変更では動かない。
 * ただし駅エリアの件数(lib/stations/query.ts)・サイト内検索・候補リストは 8 業種ぶんをまとめるので、
 * 店の追加・削除・住所や公開の変更のときは scope: "all"(サイト全体の layout)で作り直す。
 */

export type RevalidateScope = "gourmet" | "all";

export type RevalidatePlan = {
  /** revalidatePath(path) — 1 ページ */
  pages: string[];
  /** revalidatePath(path, "layout") — その下すべて */
  layouts: string[];
};

/** 管理画面が送ってくる公開 URL のパス(/restaurant/<id>・/feature/<id>・/・/region/<key> など)を、実体のパスにも広げる */
export function planRevalidation(inputPaths: string[], scope: RevalidateScope = "gourmet"): RevalidatePlan {
  const pages = new Set<string>();
  const layouts = new Set<string>();

  for (const p of inputPaths) {
    pages.add(p); // 公開スイッチ OFF のときの実体、または意味のないパス(あっても害は無い)
    if (p === "/") {
      pages.add("/portal-home");
      continue;
    }
    const shop = /^\/restaurant\/([^/]+)$/.exec(p);
    if (shop) {
      const id = shop[1];
      pages.add(`/gourmet/restaurant/${id}`);
      pages.add(`/list-data/${id}`);
      // 百分率エンコードした形でも作り直す(日本語の ID でキャッシュの鍵がどちらになっても効くように)
      const enc = encodeURIComponent(id);
      if (enc !== id) {
        pages.add(`/gourmet/restaurant/${enc}`);
        pages.add(`/list-data/${enc}`);
      }
      continue;
    }
    const feat = /^\/feature\/([^/]+)$/.exec(p);
    if (feat) {
      const id = feat[1];
      pages.add(`/gourmet/feature/${id}`);
      const enc = encodeURIComponent(id);
      if (enc !== id) pages.add(`/gourmet/feature/${enc}`);
    }
  }

  // DB の店・特集が出る場所は、どの保存でも作り直す(店の編集は特集の「この店が載った特集」や新着にも、特集の編集は店ページや新着にも出る)
  layouts.add("/gourmet");
  layouts.add("/photos");
  layouts.add("/videos");
  pages.add("/portal-home");
  pages.add("/sitemap.xml");
  pages.add("/search-index.json");
  pages.add("/list");

  if (scope === "all") layouts.add("/");

  return { pages: [...pages], layouts: [...layouts] };
}
