"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SCENES } from "@/lib/scenes";

export default function Nav() {
  const [today, setToday] = useState("");
  const [sceneOpen, setSceneOpen] = useState(false);
  useEffect(() => {
    setToday(new Date().toLocaleDateString("ja-JP"));
  }, []);

  return (
    <nav className="nav">
      <Link href="/" className="brand" data-cursor="HOME">
        マチノワ
        <small>街の輪</small>
      </Link>
      <ul>
        <li>
          <Link href="/" data-cursor="HOME">
            トップ
          </Link>
        </li>
        <li>
          <Link href="/feature" data-cursor="READ">
            特集
          </Link>
        </li>
        <li>
          <Link href="/region/tokyo" data-cursor="ENTER">
            エリア
          </Link>
        </li>
        <li
          className="scene-menu"
          onMouseEnter={() => setSceneOpen(true)}
          onMouseLeave={() => setSceneOpen(false)}
        >
          <Link
            href={`/scene/${SCENES[0].slug}`}
            data-cursor="PICK"
            onClick={() => setSceneOpen(false)}
          >
            シーン
          </Link>
          {sceneOpen && (
            <div className="scene-dropdown">
              {SCENES.map((s) => (
                <Link
                  key={s.slug}
                  href={`/scene/${s.slug}`}
                  className="scene-link"
                  data-cursor="ENTER"
                  onClick={() => setSceneOpen(false)}
                >
                  <span className="name">{s.name}</span>
                  <span className="tagline">{s.tagline}</span>
                </Link>
              ))}
            </div>
          )}
        </li>
        <li>
          <Link href="/search" data-cursor="SEARCH">
            さがす
          </Link>
        </li>
      </ul>
      <div className="right">
        <span>
          <span className="dot"></span>LIVE · {today}
        </span>
      </div>
    </nav>
  );
}
