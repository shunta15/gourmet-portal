/**
 * 候補リスト /list の新しい見た目（サーバー）。保存・共有・読み込みの仕組み（components/portal/ListView.tsx）と metadata は components/portal/pages/list.tsx のまま。
 * 枠は周りのページと同じ（PeripheryFrame）。リストの中身（今の部品）は、総合サイトの色の変数をまとった枠（.mp.pp-ph）の中に置き、周りのページの和紙の地の上に出す。字は今のページと同じ。
 */
import { Suspense } from "react";
import Breadcrumbs from "../Breadcrumbs";
import PortalFonts from "../PortalFonts";
import ListView, { ListSkeleton } from "../ListView";
import PeripheryFrame from "./PeripheryFrame";
import { Hero } from "./parts";

export default function ListPageView() {
  return (
    <PeripheryFrame>
      <PortalFonts />
      <Hero
        before={
          <Breadcrumbs
            className="pp-crumbs"
            items={[
              { name: "マチノワ", href: "/" },
              { name: "候補リスト", href: "/list" },
            ]}
          />
        }
        eyebrow="Machinowa — List"
        title="候補リスト"
        lead="気になった店を、会員登録なしで保存できます。保存した店のリストは、リンク1つで友人や家族に送れます。"
        compact
      />
      <section className="rp-shelf pp-ph-sec" aria-label="候補リスト">
        <div className="mp pp-ph pp-list">
          <Suspense fallback={<ListSkeleton />}>
            <ListView />
          </Suspense>
        </div>
      </section>
    </PeripheryFrame>
  );
}
