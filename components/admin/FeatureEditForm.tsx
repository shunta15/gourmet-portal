"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type FeatureArticle = {
  id: string;
  no: string;
  tag: string;
  kicker: string;
  title: string;
  title_html: string;
  subtitle: string;
  lede: string;
  date: string;
  reading: string;
  author: string;
  hero_image: string;
  published: boolean;
};

const inputStyle: React.CSSProperties = { padding: "8px 12px", background: "#0f0f0f", border: "1px solid #333", borderRadius: 4, color: "#fff", fontSize: 13, width: "100%", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, color: "#888", marginBottom: 6 };

export default function FeatureEditForm({ article }: { article: FeatureArticle | null }) {
  const isNew = !article;
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<FeatureArticle>({
    id: article?.id ?? "",
    no: article?.no ?? "",
    tag: article?.tag ?? "",
    kicker: article?.kicker ?? "",
    title: article?.title ?? "",
    title_html: article?.title_html ?? "",
    subtitle: article?.subtitle ?? "",
    lede: article?.lede ?? "",
    date: article?.date ?? "",
    reading: article?.reading ?? "約3分",
    author: article?.author ?? "マチノワ編集部",
    hero_image: article?.hero_image ?? "",
    published: article?.published ?? true,
  });

  function set(key: keyof FeatureArticle, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = createClient();
    const { error: err } = isNew
      ? await supabase.from("feature_articles").insert(form)
      : await supabase.from("feature_articles").update(form).eq("id", form.id);

    if (err) {
      setError(err.message);
      setSaving(false);
    } else {
      router.push("/admin/features");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* 左カラム */}
        <div>
          <h2 style={{ fontSize: 14, color: "#aaa", marginBottom: 20, fontWeight: 500 }}>基本情報</h2>

          {isNew && (
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>ID（例: feature-osaka-bistro-5）</label>
              <input value={form.id} onChange={e => set("id", e.target.value)} required style={inputStyle} />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>No.</label>
              <input value={form.no} onChange={e => set("no", e.target.value)} style={inputStyle} placeholder="No.1" />
            </div>
            <div>
              <label style={labelStyle}>タグ</label>
              <input value={form.tag} onChange={e => set("tag", e.target.value)} style={inputStyle} placeholder="大阪ランチ" />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>キッカー</label>
            <input value={form.kicker} onChange={e => set("kicker", e.target.value)} style={inputStyle} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>タイトル *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} required style={inputStyle} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>タイトル（HTML）</label>
            <textarea value={form.title_html} onChange={e => set("title_html", e.target.value)} rows={3}
              style={{ ...inputStyle, resize: "vertical" }} placeholder="<br>タグ等使用可" />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>サブタイトル</label>
            <input value={form.subtitle} onChange={e => set("subtitle", e.target.value)} style={inputStyle} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>リード文</label>
            <textarea value={form.lede} onChange={e => set("lede", e.target.value)} rows={4}
              style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>日付</label>
              <input value={form.date} onChange={e => set("date", e.target.value)} style={inputStyle} placeholder="2025.01.01" />
            </div>
            <div>
              <label style={labelStyle}>読了時間</label>
              <input value={form.reading} onChange={e => set("reading", e.target.value)} style={inputStyle} placeholder="約3分" />
            </div>
            <div>
              <label style={labelStyle}>著者</label>
              <input value={form.author} onChange={e => set("author", e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={form.published} onChange={e => set("published", e.target.checked)} />
              公開する
            </label>
          </div>
        </div>

        {/* 右カラム */}
        <div>
          <h2 style={{ fontSize: 14, color: "#aaa", marginBottom: 20, fontWeight: 500 }}>ヒーロー画像</h2>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>ヒーロー画像URL</label>
            <input value={form.hero_image} onChange={e => set("hero_image", e.target.value)} style={inputStyle} />
            {form.hero_image && (
              <img src={form.hero_image} alt="" style={{ marginTop: 8, width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 4, opacity: 0.8 }} />
            )}
          </div>

          <div style={{ marginTop: 32, padding: 16, background: "#111", border: "1px solid #222", borderRadius: 6 }}>
            <p style={{ fontSize: 12, color: "#666", margin: 0 }}>
              ランキングアイテム・サイド記事・引用文・締めの文章は<br />
              現在 data.ts で管理しています。<br />
              今後のアップデートでSupabase移行予定です。
            </p>
          </div>
        </div>
      </div>

      {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 16 }}>{error}</p>}

      <div style={{ display: "flex", gap: 12, paddingTop: 24, borderTop: "1px solid #2a2a2a", marginTop: 24 }}>
        <button type="submit" disabled={saving}
          style={{ padding: "10px 32px", background: "#fff", color: "#000", border: "none", borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
          {saving ? "保存中..." : isNew ? "追加する" : "変更を保存"}
        </button>
        <a href="/admin/features" style={{ padding: "10px 20px", background: "transparent", border: "1px solid #333", borderRadius: 4, color: "#888", textDecoration: "none", fontSize: 14 }}>
          キャンセル
        </a>
      </div>
    </form>
  );
}
