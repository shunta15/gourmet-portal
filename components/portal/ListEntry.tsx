"use client";
/**
 * 画面の隅の「候補リスト ◯店」（保存が 1 店以上のときだけ）と、保存・外したときのお知らせ（読み上げも兼ねる）。
 * 公開スイッチ ON のときだけ、components/portal/PortalShell が React.lazy で読み込む（OFF のあいだはこの部品の JS は読まれない）。
 * 位置は左下。ほかの固定要素（店ページの「ボタン案」切替＝右下、案3のスマホ下の固定バー）と重ならないよう、
 * バーが出ている間は上に逃げ、ボタン案の切替が開いている間は隠す（saveListCss.ts）。
 * /list の上と管理画面などには入口を出さない（お知らせの枠だけは出す。/list の共有されたリストの 1 店ずつの保存でも使う）。
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSavedList, useToast, useToastSeq } from "@/lib/portal/savedList";
import { CSS_BASE } from "./saveListCss";
import { SaveIcon } from "./SaveIcon";

/** 何も出さないパス（管理画面・内部のページ） */
const INTERNAL = /^\/(admin|owner|progress|nazatu|proto-sns)(\/|$)/;
/** 入口（隅のボタン）だけ出さないパス（リスト自身。案内の枠は出す） */
const LIST_PAGE = /^\/list(\/|$)/;

export default function ListEntry() {
  const pathname = usePathname();
  const list = useSavedList();
  const toast = useToast();
  const seq = useToastSeq();
  const n = list.length;
  // 保存・解除の操作があったときだけ数字をはずませる（読み込み直後の表示では動かさない）
  const [bump, setBump] = useState(false);
  useEffect(() => {
    if (seq === 0) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 600);
    return () => clearTimeout(t);
  }, [seq]);

  if (!pathname || INTERNAL.test(pathname)) return null;
  return (
    <>
      <style href="sv-base" precedence="sv">
        {CSS_BASE}
      </style>
      <div className="sv-toast" role="status" aria-live="polite" data-on={toast ? "1" : "0"}>
        {toast}
      </div>
      {n > 0 && !LIST_PAGE.test(pathname) && (
        <Link href="/list" prefetch={false} className="sv-fab" data-cursor="LIST" data-sv-fab="">
          <SaveIcon size={20} />
          <span>候補リスト</span>
          <b data-bump={bump ? "1" : "0"}>{n}店</b>
        </Link>
      )}
    </>
  );
}
