"use client";

import { useState } from "react";
import { trackTap } from "@/lib/portal/track";
import { IconShare } from "../search/StayIcons";

/**
 * 「この宿をシェア」。スマホなどで共有シートが使えるときはそれ、使えないときはリンクのコピー(コピーできなければ何もしない)。
 * 外部のウィジェットは読み込まない。タップは lib/portal/track.ts で数える。
 */
export function ShareButton({ url, title, storeId, page }: { url: string; title: string; storeId: string; page: string }) {
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
    <button type="button" className="sh-act" onClick={onClick}>
      <IconShare />
      <span>この宿をシェア</span>
      <span className="sh-act-msg" role="status" aria-live="polite">
        {msg}
      </span>
    </button>
  );
}
