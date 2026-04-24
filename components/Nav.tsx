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
        味処 日本
        <small>AJIDOKORO&nbsp;·&nbsp;NIPPON</small>
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
          <a data-cursor="SOON">エリア</a>
        </li>
        <li>
          <a data-cursor="SOON">予約</a>
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
