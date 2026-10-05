/**
 * 候補リストのページ。/list（常に noindex, nofollow）
 * 店を保存した一覧（自分のリスト）と、共有 URL（/list?ids=r33,r16,…）で開いた「共有されたリスト」を出す。
 * 保存先は localStorage、店のデータは店ごとの小さな静的 JSON（/list-data/{ID}）。ページ自体は静的で、
 * 中身はクライアントが現在の URL（?ids=）と保存内容から組み立てる（components/portal/ListView.tsx）。
 * 公開スイッチ OFF のあいだは 404（app/list/layout.tsx の PortalLayout）。
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo/meta";
import ListView, { ListSkeleton } from "../ListView";
import { PageFrame, type Tone } from "./frame";

const TONE: Tone = { color: "#15110e", lightColor: "#e7dfd0", glyph: "候" };

export function generateMetadata(): Metadata {
  return {
    ...buildMetadata({
      vertical: "portal",
      title: "候補リスト｜マチノワ",
      description: "気になった店を、会員登録なしで保存して、リンク1つで友人や家族に送れます。",
      path: "/list",
      count: 0,
    }),
    // 人ごとに中身が違う（保存した店・共有された店）ページなので、検索エンジンには載せない
    robots: { index: false, follow: false },
  };
}

export default function Page() {
  return (
    <PageFrame
      tone={TONE}
      crumbs={[
        { name: "マチノワ", href: "/" },
        { name: "候補リスト", href: "/list" },
      ]}
      kicker="Machinowa — List"
      heading="候補リスト"
      lead="気になった店を、会員登録なしで保存できます。保存した店のリストは、リンク1つで友人や家族に送れます。"
    >
      <section className="mp-pg-sec sv-sec" aria-label="候補リスト">
        <div className="mp-wrap">
          <Suspense fallback={<ListSkeleton />}>
            <ListView />
          </Suspense>
        </div>
      </section>
    </PageFrame>
  );
}
