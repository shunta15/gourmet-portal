"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Nav() {
  const [today, setToday] = useState("");
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
          <Link href="/region/shitamachi" data-cursor="ENTER">
            エリア
          </Link>
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
