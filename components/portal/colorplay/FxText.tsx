/**
 * 1 字ずつ動かせる文字(サーバー)。語ごとに折り返さない塊(.fxw)の中に、1 字ずつの span(.fxc)を並べる。
 * 動かすのは components/portal/colorplay/FxPhysics.tsx(クライアント)。JS なし・動きを減らす設定では、ただの文字として読める。
 *   drop … 見出し。見えたとき 1 字ずつ落ちてきて弾み、触ると逃げ・押すとへこみ、スクロールの速さで伸びる
 *   type … 住所・電話。見えたとき 1 字ずつ打たれるように出る(場所は最初から確保されるのでレイアウトは動かない)
 * 読み上げは、drop は呼び出し側が見出しに aria-label を付けて文字を隠す。type は文字がそのまま読まれる。
 */
export function FxText({ text, mode = "drop" }: { text: string; mode?: "drop" | "type" }) {
  // 英数字の続きは「語」として折り返さない塊にする。日本語は 1 字ずつ折り返せるようにそのまま並べる
  const parts = text.split(/(\s+|[^\u0000-\u024F\s])/).filter((x) => x !== "" && x !== undefined);
  return (
    <span className="fxt" data-fx-group={mode} aria-hidden={mode === "drop" ? "true" : undefined}>
      {parts.map((w, i) =>
        /^\s+$/.test(w) ? (
          " "
        ) : /^[^\u0000-\u024F]$/.test(w) ? (
          <span className="fxc" key={i}>{w}</span>
        ) : (
          <span className="fxw" key={i}>
            {[...w].map((c, j) => (<span className="fxc" key={j}>{c}</span>))}
          </span>
        ),
      )}
    </span>
  );
}
