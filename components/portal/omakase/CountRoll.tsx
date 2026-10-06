"use client";
/**
 * 数字がくるくる回って変わる（店数の表示）。桁ごとに 0〜9 を縦に並べて、桁の位置を動かすだけ（CSS の transition）。
 * 読み上げには使わない（aria-hidden）。数字そのものは呼び出し側が別に出す。動きを減らす設定では、すぐ切り替わる。
 */
export default function CountRoll({ value, className }: { value: number; className?: string }) {
  const digits = String(Math.max(0, Math.floor(value))).split("");
  return (
    <span className={className ? `om-roll ${className}` : "om-roll"} aria-hidden="true">
      {digits.map((d, i) => (
        <span key={digits.length - i} className="om-roll-col" style={{ ["--d" as string]: d }}>
          <span className="om-roll-strip">
            {Array.from({ length: 10 }, (_, n) => (
              <i key={n}>{n}</i>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}
