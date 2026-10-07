import "./nigiwai.css";
import "./themes.css";
import Nigiwai from "./Nigiwai";
import NigiwaiFonts from "./NigiwaiFonts";
import Statement from "./Statement";
import RandomTheme from "./RandomTheme";
import { getHubData } from "@/lib/portal/hub";
import { getNigiwaiPhotos } from "@/lib/portal/hubs/nigiwai/photos";
import { RANDOM_KEYS, type ThemeKey } from "@/lib/portal/hubs/nigiwai/themes";

/**
 * 最初の描画より前に、色（data-theme）を決める短い処理。文書を読み込んでいる最中（readyState が loading）にだけ動く。
 * 根（.ngp）の先頭に置くので、動く時点で、あとの内容はまだ描かれていない（既定の色が一瞬見えない）。
 *  - 履歴の項目に覚えた色（history.state.ngTheme）があれば、それを使う（ブラウザの戻る）。再読み込み（type=reload）のときは使わない。
 *  - 無ければ、2 色を半々で抽選して、履歴の項目に覚える。
 * 同じ処理を 2 か所から呼ぶ（先に動いたほうが決め、あとのほうは何もしない）。<img> を先に、<script> をあとに置く（<script> が止められると、解析もそこで止まるため）。
 *  1. <script>: 読み込み中の stylesheet が無ければ、HTML の解析がそこに届いた瞬間に動く（最初の描画より必ず前）。
 *  2. <img src="（1×1 の透明な GIF）" onload>: <script> は、head の stylesheet（遅い回線では外部の Google Fonts）が終わるまで動けない。
 *     そして、遅い端末では「stylesheet が終わった直後の最初の描画」が <script> より先に来ることがある（CPU 4 倍遅延で 6 回中 4 回、
 *     既定の色の根が 1 コマ描かれた）。<img> の load は、stylesheet を待たずに解析の直後に動くので（実測。壊れた画像にしないよう、読み込める 1×1 の GIF にした）、<script> が待たされている間に色を決める。
 *     （<svg onload> は文書の読み込みが終わるまで動かないので使えない。実測）
 * どちらも <div dangerouslySetInnerHTML> の中に置く（<script> 要素を React に作らせると、ブラウザの中での移動のとき、
 * React が「script は動かない」と console.error を出すため）。ブラウザの中での移動（<Link>・戻る）のときは、この処理は動かず（readyState が loading でない）、
 * RandomTheme が決める。スクリプトなしのときは、既定の色（RANDOM_KEYS の先頭）で描かれる。
 * 属性に入れるので、& < > " は attr() が実体参照にする（コードは単一引用符だけで書く）。
 */
const PICK_FN = `function(r){try{if(!r||document.readyState!=='loading'||r.getAttribute('data-ng-boot'))return;var K=${JSON.stringify([...RANDOM_KEYS]).replace(/"/g, "'")},h=history,st=h.state,t=st&&st.ngTheme,n=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];if(n&&n.type==='reload')t=null;if(K.indexOf(t)<0)t=K[Math.random()<.5?0:1];try{h.replaceState(Object.assign({},st,{ngTheme:t}),'')}catch(e){}r.setAttribute('data-theme',t);r.setAttribute('data-ng-boot','1')}catch(e){}}`;
const attr = (c: string) => c.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const PICK_HTML =
  `<img alt="" width="1" height="1" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" onload="(${attr(PICK_FN)})(this.closest('.ngp'))">` +
  `<script>(${PICK_FN})(document.currentScript.closest('.ngp'))</script>`;

/**
 * 「にぎわいの輪」の 1 ページぶん（サーバー）。総合トップ `/`（components/portal/pages/home.tsx）が出すもの。色の組（theme）だけが違う。
 * .ngp[data-theme] を最初から付けて描くので、別の色が一瞬見えてから変わることはない。
 *  - random: 総合トップの姿。theme は「スクリプトなしのときの色」で、実際の色は開くたびに抽選される（上の PICK_FN と RandomTheme）。
 *    ページ自体は、どの色でも同じ HTML なので、静的に配信できる（リクエストごとの描画にしない）。
 *  - 固定の色: theme をそのまま出す（プレビュー・ローカル専用の /proto-hub/nigiwai/<色>）。
 */
export default async function NigiwaiPage({ theme, random = false }: { theme: ThemeKey; random?: boolean }) {
  const [data, photos] = await Promise.all([getHubData(), getNigiwaiPhotos()]);
  return (
    <div className="ngp" data-theme={theme} suppressHydrationWarning={random}>
      {random && (
        <>
          <div hidden dangerouslySetInnerHTML={{ __html: PICK_HTML }} suppressHydrationWarning />
          <RandomTheme />
        </>
      )}
      <NigiwaiFonts />
      <Nigiwai items={data.items} gourmetTotal={data.gourmetTotal} featureTotal={data.featureTotal} open={data.open} photos={photos.ring} />
      <Statement ring={photos.ring} side={photos.side} />
    </div>
  );
}
