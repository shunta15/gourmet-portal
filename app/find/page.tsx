export { default, generateMetadata } from "@/components/portal/pages/find";

// 検索語（?q=）で内容が変わるので、リクエストごとにサーバーで描画する（noindex）
export const dynamic = "force-dynamic";
