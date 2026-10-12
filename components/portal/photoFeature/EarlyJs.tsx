"use client";
import { useSyncExternalStore } from "react";

/**
 * 動きを入れる印（.pf-js）を、描画の前に付ける（付かなければ全部見える。「動きを減らす」設定では付けない）。Motion が同じ印を付け直す。
 * サーバーが出す HTML にだけ script を入れる（クライアントだけで描画するとき = ページを移って来たときは、何も出さない。
 * React は「クライアントで描画した script は実行されない」と警告するため）。ハイドレーションのあとは、この script の要素は取り除かれる（実行は済んでいる）。
 */
const subscribe = () => () => undefined;
export default function EarlyJs() {
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);
  if (isClient) return null;
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: "(function(){try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){var r=document.querySelector('.pf-root');if(r)r.classList.add('pf-js')}}catch(e){}})()",
      }}
    />
  );
}
