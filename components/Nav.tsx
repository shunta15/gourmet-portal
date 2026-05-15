"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SCENES } from "@/lib/scenes";

/**
 * グローバルナビ。現在のページに応じて .active クラスを付与し、
 * 背景が明るい/暗いに関わらず読めるように、CSS 側でスクリム+text-shadow+
 * accent カラーのアクティブ表示で可読性を担保している。
 */
function isActive(pathname: string, target: string, exact = false): boolean {
  if (!pathname) return false;
  if (exact) return pathname === target;
  if (target === "/") return pathname === "/";
  return pathname === target || pathname.startsWith(target + "/");
}

export default function Nav() {
  const [today, setToday] = useState("");
  const [sceneOpen, setSceneOpen] = useState(false);
  const pathname = usePathname() ?? "";

  useEffect(() => {
    setToday(new Date().toLocaleDateString("ja-JP"));
  }, []);

  const activeTop     = isActive(pathname, "/", true);
  const activeFeature = isActive(pathname, "/feature");
  const activeRegion  = isActive(pathname, "/region");
  const activeScene   = isActive(pathname, "/scene");
  const activeSearch  = isActive(pathname, "/search");

  return (
    <nav className="nav">
      <Link href="/" className="brand" data-cursor="HOME">
        マチノワ
        <small>街の輪</small>
      </Link>
      <ul>
        <li>
          <Link
            href="/"
            data-cursor="HOME"
            className={activeTop ? "active" : ""}
            aria-current={activeTop ? "page" : undefined}
          >
            トップ
          </Link>
        </li>
        <li>
          <Link
            href="/feature"
            data-cursor="READ"
            className={activeFeature ? "active" : ""}
            aria-current={activeFeature ? "page" : undefined}
          >
            特集
          </Link>
        </li>
        <li>
          <Link
            href="/region/tokyo"
            data-cursor="ENTER"
            className={activeRegion ? "active" : ""}
            aria-current={activeRegion ? "page" : undefined}
          >
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
            className={activeScene ? "active" : ""}
            aria-current={activeScene ? "page" : undefined}
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
          <Link
            href="/search"
            data-cursor="SEARCH"
            className={activeSearch ? "active" : ""}
            aria-current={activeSearch ? "page" : undefined}
          >
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
