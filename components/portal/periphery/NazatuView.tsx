/**
 * ショート動画 /nazatu の新しい見た目（サーバー）。動画ファイル・題・字は app/nazatu/page.tsx の今の版と同じ（再生は <video controls playsInline> のまま）。
 */
import PeripheryFrame from "./PeripheryFrame";
import { Hero } from "./parts";

export default function NazatuView({ videos }: { videos: { src: string; label: string }[] }) {
  return (
    <PeripheryFrame>
      <Hero title="ナーザトゥ" compact />
      <section className="rp-shelf" aria-label="動画の一覧" style={{ paddingTop: "clamp(8px, 1.6vw, 24px)" }}>
        <ul className="pp-nz">
          {videos.map((v) => (
            <li key={v.src}>
              <video src={v.src} controls playsInline />
              <p>{v.label}</p>
            </li>
          ))}
        </ul>
      </section>
    </PeripheryFrame>
  );
}
