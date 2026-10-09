"use client";
import { useState } from "react";

/** 今のフッターのニュースレター（同じ API）。暖簾の見た目にしただけで、送り先・文言は今のとおり */
export default function NorenNewsletter() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
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

  if (done) return <p className="vN-nl-done" role="status">登録ありがとうございます。次回金曜の配信からお届けします。</p>;
  return (
    <form className="vN-nl" onSubmit={onSubmit} noValidate>
      <label className="vN-vh" htmlFor="vN-nl-mail">メールアドレス</label>
      <input
        id="vN-nl-mail"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        aria-describedby={error ? "vN-nl-err" : undefined}
      />
      <button type="submit" disabled={submitting} data-cursor="JOIN">
        {submitting ? "登録中…" : "購読する"}
      </button>
      {error && (
        <p id="vN-nl-err" className="vN-nl-err" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
