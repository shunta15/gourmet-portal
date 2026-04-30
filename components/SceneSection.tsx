"use client";
import Link from "next/link";
import { SCENES } from "@/lib/scenes";

export default function SceneSection() {
  return (
    <section className="scene-section">
      <div className="section-head">
        <div className="no">
          <b>05</b> SCENE
        </div>
        <h2>
          気分で、<em>選ぶ。</em>
        </h2>
        <p className="lede">
          デート、接待、一人飲み——その夜の状況に合わせて、編集部が選んだ一軒へ。
        </p>
      </div>
      <div className="scene-section-list">
        {SCENES.map((s, i) => (
          <Link
            key={s.slug}
            href={`/scene/${s.slug}`}
            className="scene-section-card"
            data-cursor="ENTER"
          >
            <div className="no">No.{String(i + 1).padStart(2, "0")}</div>
            <div className="body">
              <h3>{s.name}</h3>
              <p>{s.tagline}</p>
            </div>
            <div className="arrow">→</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
