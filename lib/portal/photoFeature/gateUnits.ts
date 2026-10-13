/**
 * 入口の暖簾の「染め抜く字」を、布の枚数に割る（Gate.tsx が使う。import のない小さなファイル = クライアントに入れても軽い）。
 * panelPlan（lib/portal/noren/shop.ts）と同じ割り方: 5 字以下（スマホは 3 字以下）は 1 枚に 1 字、それより多ければ 2 字ずつ。
 */
export function distribute(units: string[], mobile: boolean): string[][] {
  const solo = mobile ? 3 : 5;
  const T = units.length;
  const n = T <= solo ? T : Math.ceil(T / 2);
  const per: number[] = Array(n).fill(Math.floor(T / n));
  const rest = T - per.reduce((a, b) => a + b, 0); // 余りは先頭の枚から 1 字ずつ足す（余りは最初に 1 度だけ数える）
  for (let i = 0; i < rest; i++) per[i] += 1;
  const out: string[][] = [];
  let k = 0;
  for (const c of per) {
    out.push(units.slice(k, k + c));
    k += c;
  }
  return out;
}

/**
 * スマホの暖簾用: 英数字を 1 字ずつに分けてある並び（"P","A","L","L","O"）を、1 つの語（"PALLO"）にまとめる。
 * 欧文の語は、語の途中で布が割れないよう、1 つの単位にする（panelPlan の「欧文の語は 1 つ」と同じ）。
 * PC は今までどおり（1 字ずつを 1 枚に）。1 字の英数字が 2 つ以上続くところだけが対象で、「Pu」「a」「Pu」のように語が別なものや、日本語の単位は変えない。
 */
export function joinLatinRuns(units: string[]): string[] {
  const out: string[] = [];
  let run = "";
  let runN = 0;
  const flush = () => {
    if (runN > 0) out.push(run);
    run = "";
    runN = 0;
  };
  for (const u of units) {
    if (/^[A-Za-z0-9]$/.test(u)) {
      run += u;
      runN++;
    } else {
      flush();
      out.push(u);
    }
  }
  flush();
  return out;
}
