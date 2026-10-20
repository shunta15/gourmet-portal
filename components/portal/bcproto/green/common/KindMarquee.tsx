/**
 * 施術の種類の名前が流れる帯(1 本)。名前は店のデータの種類名だけ。装飾なので読み上げからは外す(aria-hidden)。
 * 動きは motion-plus.css の mp-marquee(左へ流れる・触ると止まる・画面外では MotionPlus が止める・動きを減らす設定では静止)。
 */
export default function KindMarquee({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  // 画面の幅(最大 2560px)を埋めるために同じ並びを繰り返し、同じ列を 2 つ並べて -50% まで流すとつなぎ目が出ない
  const seq = Array.from({ length: 4 }, () => names).flat();
  const row = (k: string) => (
    <ul key={k}>
      {seq.map((n, i) => (
        <li key={`${n}-${i}`} className={i % 2 ? "is-o" : undefined}>
          <span>{n}</span>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M12 2.5C17.500 6 19.500 12.500 12 21.500 4.500 12.500 6.500 6 12 2.500Z" fill="currentColor" />
            <path d="M12 6v14" stroke="#fff" strokeWidth="1" strokeLinecap="round" fill="none" opacity=".7" />
          </svg>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="mp-marquee" aria-hidden="true" data-mp-marquee>
      <div className="mp-marquee-track">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}
