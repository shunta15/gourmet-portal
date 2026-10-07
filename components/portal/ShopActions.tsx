"use client";
/**
 * 店ページの「行動ボタン」（予約・電話・地図・SNS・ほかの店・共有）。公開スイッチ ON のときだけ RestaurantDetail が React.lazy で読み込む。
 * 見た目は「玉」（丸みのあるカプセル）の 1 種類だけ。発注者が 6 案（罫・印・箱・玉・駒・帯）から選んだ（2026-10-07）。
 * 仕様と設計: proto-portal/SNS-BUTTONS-BRIEF-2.md
 */
import { useMemo } from "react";
import { buildActionModel, type ShopFacts } from "@/lib/portal/shopActions";
import { CSS_BASE, CSS_TAMA } from "./shopActionsCss";
import { useEnter, useShare } from "./ShopActionsParts";
import ShopActionsTama from "./ShopActionsTama";

export interface ShopActionsProps {
  shop: ShopFacts;
  storeId: string;
  /** 計測用のページのパス */
  page: string;
  /** 共有する絶対URL（lib/portal/share.ts の shareTarget） */
  shareUrl: string;
  shareText: string;
}

export default function ShopActions({ shop, storeId, page, shareUrl, shareText }: ShopActionsProps) {
  const model = useMemo(() => buildActionModel(shop), [shop]);
  const share = useShare({ url: shareUrl, text: shareText, storeId, page });
  const rootRef = useEnter();

  return (
    <>
      <style href="sa-base" precedence="sa-1">
        {CSS_BASE}
      </style>
      <style href="sa-tama" precedence="sa-2">
        {CSS_TAMA}
      </style>
      <div ref={rootRef} className="sa">
        <ShopActionsTama model={model} storeId={storeId} page={page} share={share} />
      </div>
    </>
  );
}
