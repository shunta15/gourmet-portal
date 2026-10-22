"use client";

import { useState } from "react";
import { trackTap } from "@/lib/portal/track";
import { IconHeart } from "../common/Icons";
import { IconShare } from "../search/VkIcons";

/** 「お気に入りに追加」(見た目だけの切り替え。保存はしない。ヘッダー・一覧のハートと同じ) */
export function FavButton({ name }: { name: string }) {
  const [on, setOn] = useState(false);
  return (
    <button type="button" className={`vs-act ${on ? "is-on" : ""}`} aria-pressed={on} aria-label={`${name}をお気に入りに追加`} onClick={() => setOn((v) => !v)}>
      <IconHeart />
      <span>お気に入りに追加</span>
    </button>
  );
}

/**
 * 「この〇〇をシェア」。スマホなどで共有シートが使えるときはそれ、使えないときはリンクのコピー(コピーできなければ何もしない)。
 * 外部のウィジェットは読み込まない。タップは lib/portal/track.ts で数える。
 */
export function ShareButton({ noun, url, title, storeId, page }: { noun: string; url: string; title: string; storeId: string; page: string }) {
  const [msg, setMsg] = useState("");
  const onClick = async () => {
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title, url });
        trackTap({ storeId, kind: "share-native", page });
        return;
      }
      await navigator.clipboard.writeText(url);
      trackTap({ storeId, kind: "share-copy", page });
      setMsg("リンクをコピーしました");
      window.setTimeout(() => setMsg(""), 2600);
    } catch {
      /* 共有をやめた・コピーできなかったときは何もしない */
    }
  };
  return (
    <button type="button" className="vs-act" onClick={onClick}>
      <IconShare />
      <span>この{noun}をシェア</span>
      <span className="vs-act-msg" role="status" aria-live="polite">
        {msg}
      </span>
    </button>
  );
}
