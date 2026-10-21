import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/portal/petproto/decided/common/Shell";
import credits from "@/components/portal/petproto/decided/common/credits.json";
import { BASE } from "@/components/portal/petproto/decided/common/site";

// 写真の出典(ペット決定案の試作で、店舗の写真以外に使った Wikimedia Commons のフリー素材の一覧)。
// 見本の帯・noindex・assertPreviewOrLocal は layout(親)が持つ。出典は common/credits.json(1 枚 1 件)を import で読む。
export const metadata: Metadata = { title: "写真の出典 — マチノワ Pet 決定案(見本)" };

const PAGE_LABEL: Record<string, string> = {
  common: "共通(フッター)",
  top: "最初のページ",
  search: "探す",
  shop: "店舗紹介",
  article: "記事",
};

type Credit = (typeof credits)[number];

export default function Page() {
  const rows = credits as Credit[];
  const byLicense = rows.reduce<Record<string, number>>((a, r) => ((a[r.license] = (a[r.license] || 0) + 1), a), {});
  return (
    <Shell page="article">
      <style>{CSS}</style>
      <div className="pt-cr pt-wrap">
        <nav className="pt-cr-bc" aria-label="パンくず">
          <Link href={BASE}>ホーム</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">写真の出典</span>
        </nav>
        <h1 className="pt-cr-h1 pt-min">写真の出典</h1>
        <p className="pt-cr-lead">
          この試作の写真のうち、店舗の写真と専門家の写真を除く {rows.length} 枚は、Wikimedia Commons で公開されているフリー素材(CC0・パブリックドメイン・CC BY)を切り抜いて使っています。題名を押すと Commons のページ、許諾を押すと許諾文書が開きます。
        </p>
        <p className="pt-cr-sum">
          {Object.entries(byLicense).map(([k, n]) => (
            <span key={k}>
              {k} {n} 枚
            </span>
          ))}
        </p>
        <div className="pt-cr-tw">
          <table className="pt-cr-t">
            <thead>
              <tr>
                <th scope="col">ページ</th>
                <th scope="col">場所</th>
                <th scope="col">題</th>
                <th scope="col">作者</th>
                <th scope="col">許諾</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.page}/${r.slot}`}>
                  <td data-l="ページ">{PAGE_LABEL[r.page] ?? r.page}</td>
                  <td data-l="場所">
                    <code>{r.slot}</code>
                  </td>
                  <td data-l="題">
                    <a href={r.pageUrl} target="_blank" rel="noopener noreferrer">
                      {r.commonsTitle.replace(/^File:/, "")}
                    </a>
                  </td>
                  <td data-l="作者">{r.author}</td>
                  <td data-l="許諾">
                    {r.licenseUrl ? (
                      <a href={r.licenseUrl} target="_blank" rel="noopener noreferrer">
                        {r.license}
                      </a>
                    ) : (
                      r.license
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="pt-cr-back">
          <Link href={BASE}>← 最初のページへ戻る</Link>
        </p>
      </div>
    </Shell>
  );
}

// このページだけの見た目(接頭辞 pt-cr-)。寸法は base.css と同じく、デスクトップは見本 948 幅の px × --u、スマホは px。
const CSS = `
.pt-cr { padding: calc(16 * var(--u)) calc(74 * var(--u)) calc(50 * var(--u)); }
.pt-cr-bc { display: flex; align-items: center; gap: calc(7 * var(--u)); font-size: calc(7.4 * var(--u)); letter-spacing: 0.08em; color: var(--pt-mut); }
.pt-cr-bc a:hover { color: var(--pt-brown); }
.pt-cr-bc [aria-current] { color: var(--pt-ink2); }
.pt-cr-h1 { margin: calc(22 * var(--u)) 0 0; font-weight: 600; font-size: calc(20 * var(--u)); line-height: 1.4; letter-spacing: 0.04em; color: #26221e; }
.pt-cr-lead { margin: calc(10 * var(--u)) 0 0; font-size: calc(8 * var(--u)); line-height: 1.9; letter-spacing: 0.04em; color: var(--pt-ink2); }
.pt-cr-sum { display: flex; flex-wrap: wrap; gap: calc(4 * var(--u)) calc(12 * var(--u)); margin: calc(8 * var(--u)) 0 0; font-size: calc(7.3 * var(--u)); letter-spacing: 0.06em; color: var(--pt-mut); }
.pt-cr-tw { margin-top: calc(18 * var(--u)); overflow-x: auto; }
.pt-cr-t { width: 100%; border-collapse: collapse; font-size: calc(7.3 * var(--u)); line-height: 1.6; letter-spacing: 0.03em; }
.pt-cr-t th, .pt-cr-t td { padding: calc(5 * var(--u)) calc(6 * var(--u)); border-bottom: 1px solid var(--pt-line); text-align: left; vertical-align: top; }
.pt-cr-t th { font-weight: 700; color: var(--pt-ink2); background: var(--pt-sec); white-space: nowrap; }
.pt-cr-t td code { font-family: ui-monospace, Menlo, monospace; font-size: 0.95em; color: var(--pt-ink2); }
.pt-cr-t td a { color: var(--pt-brown); text-decoration: underline; text-underline-offset: 0.15em; overflow-wrap: anywhere; }
.pt-cr-t td a:hover { color: var(--pt-brown-d); }
.pt-cr-t td:nth-child(5) a { white-space: nowrap; }
.pt-cr-back { margin: calc(20 * var(--u)) 0 0; font-size: calc(7.4 * var(--u)); letter-spacing: 0.06em; }
.pt-cr-back a { color: var(--pt-ink2); }
.pt-cr-back a:hover { color: var(--pt-brown); }
@media (max-width: 859px) {
  .pt-root .pt-cr { padding: 14px 16px 40px; }
  .pt-root .pt-cr-bc { gap: 6px; font-size: 12px; }
  .pt-root .pt-cr-h1 { margin-top: 18px; font-size: 22px; }
  .pt-root .pt-cr-lead { margin-top: 10px; font-size: 13px; }
  .pt-root .pt-cr-sum { gap: 4px 12px; margin-top: 8px; font-size: 12px; }
  .pt-root .pt-cr-tw { margin-top: 16px; overflow: visible; }
  /* スマホは表を縦に積む(1 枚 = 1 つの塊。各行の頭に項目名) */
  .pt-root .pt-cr-t { font-size: 13px; }
  .pt-root .pt-cr-t thead { display: none; }
  .pt-root .pt-cr-t, .pt-root .pt-cr-t tbody, .pt-root .pt-cr-t tr, .pt-root .pt-cr-t td { display: block; }
  .pt-root .pt-cr-t tr { padding: 10px 0 11px; border-bottom: 1px solid var(--pt-line); }
  .pt-root .pt-cr-t td { padding: 1px 0; border: 0; }
  .pt-root .pt-cr-t td::before { content: attr(data-l); display: inline-block; min-width: 3em; margin-right: 0.4em; font-size: 11px; letter-spacing: 0.08em; color: var(--pt-mut); }
  .pt-root .pt-cr-t td:nth-child(5) a { white-space: normal; }
  .pt-root .pt-cr-back { margin-top: 20px; font-size: 13px; }
}
`;
