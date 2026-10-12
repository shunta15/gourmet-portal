/**
 * 掲載基準 /editorial/guidelines の新しい見た目（サーバー）。字（節の題・箇条）は app/editorial/guidelines/page.tsx の SECTIONS をそのまま受け取る。
 * 小さな暖簾に染める字は、各節の題の中にある語だけ（MARKS）。
 */
import PeripheryFrame from "./PeripheryFrame";
import { Dash, Hero, Sec } from "./parts";

/** 節の題 → 小さな暖簾に染める字（題の中にある語） */
const MARKS = ["掲載", "事実情報", "禁止", "閉店", "依頼"];

export default function GuidelinesView({ sections }: { sections: { title: string; body: string[] }[] }) {
  return (
    <PeripheryFrame newsletter>
      <Hero eyebrow="掲載基準" title={<>編集の、<em>約束事。</em></>} />
      {sections.map((s, i) => (
        <Sec key={i} id={`pp-gl-${i}`} mark={MARKS[i] ?? s.title} title={s.title} k={i}>
          <Dash items={s.body} />
        </Sec>
      ))}
      <p className="pp-note" style={{ marginTop: "clamp(36px, 4vw, 56px)" }}>
        編集方針は読者・店舗からのフィードバックを受けて随時更新します。 最終更新: 2026 年 5 月
      </p>
    </PeripheryFrame>
  );
}
