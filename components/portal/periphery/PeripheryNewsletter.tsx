"use client";
import { useState } from "react";

/**
 * ニュースレターの申し込み（今のフッター components/Footer.tsx・components/portal/noren/NorenNewsletter.tsx と同じ API・同じ文言・同じ確認）。
 * 見た目だけ、周りのページの和紙の面に合わせた（.pp-nl）。入力欄・ボタンは 48px。形式が違うときは、送らずにその場で理由を出す。
 */
export default function PeripheryNewsletter() {
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

  if (done) return <p className="pp-nl__done" role="status">登録ありがとうございます。次回金曜の配信からお届けします。</p>;
  return (
    <form className="pp-nl" onSubmit={onSubmit} noValidate>
      <label className="pp-vh" htmlFor="pp-nl-mail">メールアドレス</label>
      <input
        id="pp-nl-mail"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        aria-describedby={error ? "pp-nl-err" : undefined}
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "登録中…" : "購読する"}
      </button>
      {error && (
        <p id="pp-nl-err" className="pp-nl__err" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
