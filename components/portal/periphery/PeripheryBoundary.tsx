"use client";

/**
 * ルートの見つからないページ（app/not-found.tsx）・エラーのページ（app/error.tsx）の新しい見た目の入口（クライアント）。
 * この 2 つのファイルは全ページの入口に含まれるので、静的に import すると、新しい見た目の CSS・JS が全ページに混ざる（Next.js の仕様。確認済み）。
 * そこで、ここは next/dynamic で本体（NotFoundView・ErrorView）を読むだけにして、本体の CSS・JS は 404・エラーを描画するときだけ読み込む。
 * （app/error.tsx と app/not-found.tsx が同じこのモジュールを使うので、全ページが読む JS の数は増えない。）
 */
import dynamic from "next/dynamic";

const NotFoundView = dynamic(() => import("./NotFoundView"));
const ErrorView = dynamic(() => import("./ErrorView"));

export function PeripheryNotFound() {
  return <NotFoundView />;
}

export function PeripheryError({ reset }: { reset: () => void }) {
  return <ErrorView reset={reset} />;
}
