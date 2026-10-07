import NigiwaiPage from "@/components/portal/hubs/nigiwai/NigiwaiPage";

/**
 * 総合トップの中身（サーバーコンポーネント）。app/portal-home/page.tsx が出す（公開スイッチ ON のとき `/` として出る）。
 * 「にぎわいの輪」。配色は 2 色（sometsuke 白磁と藍・akagane 濃紺と銅）を、開くたびにランダムで出す（抽選は NigiwaiPage の script と RandomTheme）。
 * theme は「スクリプトなしのときの色」。ページ自体は、どちらの色でも同じ HTML（静的に配信できる）。
 * 言葉は proto-portal/hub-concepts/COPY-FINAL.md。フッターと CSS（portal.css）は app/portal-home/layout.tsx（PortalLayout）が付ける。
 * 色を固定して見るルート（/proto-hub/nigiwai/<色>）は、プレビューとローカルだけ（app/proto-hub）。
 */
export default function PortalHome() {
  return <NigiwaiPage theme="sometsuke" random />;
}
