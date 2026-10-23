import Link from "next/link";
import Shell from "./Shell";
import { vkLinks, type VkConfig } from "../config";
import "./notfound.css";

/** 決定デザインの 404(本番 /{業種} 以下の存在しないページ)。ヘッダー・フッターは決定デザインのまま、中身は短い案内だけ */
export default function VkNotFound({ cfg }: { cfg: VkConfig }) {
  const L = vkLinks(cfg);
  return (
    <Shell cfg={cfg} page="article">
      <section className="vk-nf" aria-labelledby="vk-nf-h">
        <p className="vk-nf-en">404</p>
        <h1 id="vk-nf-h" className="vk-nf-h">
          ページが見つかりません
        </h1>
        <p className="vk-nf-p">お探しのページは見つかりませんでした。まだ公開していないページかもしれません。下から探してみてください。</p>
        <p className="vk-nf-links">
          <Link href={L.home}>{cfg.brand}のトップへ</Link>
          <Link href={L.search}>{cfg.noun}を探す</Link>
          <Link href={L.shops}>店舗紹介</Link>
          <Link href={L.special}>特集</Link>
        </p>
      </section>
    </Shell>
  );
}
