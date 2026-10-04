/**
 * 候補リストのしおりのアイコン。押された状態（aria-pressed）は、親の CSS（.sv-b[aria-pressed="true"]）が塗りつぶしとチェックを出す。
 * 色は親の color（輪郭・塗り）と --sv-chk（チェック）で決める。装飾なので読み上げない。
 */
export function SaveIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg className={`sv-ic ${className}`.trim()} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path className="bm" d="M6.5 3.5h11a1 1 0 0 1 1 1V21l-6.5-4.4L5.5 21V4.5a1 1 0 0 1 1-1z" />
      <path className="ck" d="M9 9.8l2.2 2.2L15.2 8" />
    </svg>
  );
}
