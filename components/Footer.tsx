"use client";
import { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("メールアドレスの形式が正しくありません");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "登録に失敗しました");
        return;
      }
      setDone(true);
      setEmail("");
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer>
      <div className="footer-top">
        <div>
          <h5>ニュースレター</h5>
          <div className="big">
            毎週金曜、<em>日本の味</em>。
          </div>
          <p style={{ marginTop: 20, opacity: 0.6, fontSize: 13 }}>
            編集部厳選の一軒を、週に一度お届け。
          </p>
          {!done ? (
            <form onSubmit={handleSubscribe} style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  flex: "1 1 200px",
                  minWidth: 0,
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 0,
                  color: "#f4efe3",
                  fontSize: 13,
                  outline: "none",
                }}
                required
              />
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "10px 20px",
                  background: "var(--accent)",
                  color: "#fff",
                  border: 0,
                  fontSize: 12,
                  letterSpacing: ".15em",
                  fontWeight: 500,
                  cursor: submitting ? "wait" : "pointer",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? "登録中…" : "購読する"}
              </button>
            </form>
          ) : (
            <p style={{ marginTop: 20, fontSize: 13, color: "var(--accent)" }}>
              登録ありがとうございます。次回金曜の配信からお届けします。
            </p>
          )}
          {error && (
            <p style={{ marginTop: 12, fontSize: 12, color: "#f87171" }}>{error}</p>
          )}
        </div>
        <div>
          <h5>ナビゲーション</h5>
          <ul>
            <li><Link href="/">トップ</Link></li>
            <li><Link href="/feature">特集</Link></li>
            <li><Link href="/region">エリア</Link></li>
            <li><Link href="/scene">シーン</Link></li>
            <li><Link href="/search">検索</Link></li>
          </ul>
        </div>
        <div>
          <h5>地域</h5>
          <ul>
            <li><Link href="/region/tokyo">東京・下町</Link></li>
            <li><Link href="/region/kyoto">京都</Link></li>
            <li><Link href="/region/osaka">大阪・ミナミ</Link></li>
            <li><Link href="/region/fukuoka">博多</Link></li>
            <li><Link href="/region/hokkaido">札幌</Link></li>
          </ul>
        </div>
        <div>
          <h5>サイト情報</h5>
          <ul>
            <li><Link href="/about">編集部</Link></li>
            <li><Link href="/editorial/guidelines">掲載基準</Link></li>
            <li><Link href="/contact">お問い合わせ</Link></li>
            <li><Link href="/owner">店舗登録</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bot">
        <span>© 2026 マチノワ / 街の輪 · 無断転載禁止</span>
        <span>日本 全国 — 2026年</span>
      </div>
    </footer>
  );
}
