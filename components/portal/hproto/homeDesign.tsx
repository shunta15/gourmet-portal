/**
 * 総合トップ(/)の見た目の切り替え(ここ 1 か所)。app/portal-home の layout.tsx と page.tsx が、ここから枠と中身を読む。
 *   - 見本4・下半分を変えた版(p4-lower) : export { HomeShell, HomePage } from "./p4lower/entry";  ← 2026-10-29 〜(オーナー確定「色付きで決定」)
 *   - 見本4(丸い切り抜き)  : export { HomeShell, HomePage } from "./p4/entry";      ← 同日朝の本番。戻すときはこちらに 1 行替える
 *   - 「まち」改(machi2)   : export { HomeShell, HomePage } from "./machi2/entry";   ← それまでの本番。戻すときはこちらに 1 行替える
 * 使わない側の部品は消していない(import しないので、その JS・CSS は総合トップに載らない)。
 */
export { HomeShell, HomePage } from "./p4lower/entry";
