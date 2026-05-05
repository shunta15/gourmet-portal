"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  area: string;
  region: string;
  shape: string;
  image: string;
  hero_images: string[];
  gallery: string[];
  desc: string;
  address: string;
  hours: string;
  closed: string;
  seats: string;
  nearest: string;
  phone: string | null;
  budget: string | null;
  rating: string | null;
  reservation_url: string | null;
  source_label: string | null;
  source_url: string | null;
  tags: string[];
  highlights: string[];
  body: string[];
  published: boolean;
};

const REGIONS = ["tokyo","osaka","kyoto","nagoya","fukuoka","hyogo","kanagawa","saitama","nara","hiroshima","shiga","gunma","kagoshima","wakayama","hokkaido"];

function ArrayField({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={labelStyle}>{label}</label>
      {value.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            value={item}
            onChange={(e) => { const n = [...value]; n[i] = e.target.value; onChange(n); }}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}
            style={{ ...btnSmall, background: "#3f1515", color: "#fca5a5" }}>✕</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, ""])} style={btnSmall}>+ 追加</button>
    </div>
  );
}

const inputStyle: React.CSSProperties = { padding: "8px 12px", background: "#0f0f0f", border: "1px solid #333", borderRadius: 4, color: "#fff", fontSize: 13, width: "100%", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, color: "#888", marginBottom: 6 };
const btnSmall: React.CSSProperties = { padding: "5px 10px", background: "#2a2a2a", border: "1px solid #333", borderRadius: 4, color: "#aaa", cursor: "pointer", fontSize: 12 };

export default function RestaurantEditForm({ restaurant }: { restaurant: Restaurant | null }) {
  const isNew = !restaurant;
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<Restaurant>({
    id: restaurant?.id ?? "",
    name: restaurant?.name ?? "",
    cuisine: restaurant?.cuisine ?? "",
    area: restaurant?.area ?? "",
    region: restaurant?.region ?? "osaka",
    shape: restaurant?.shape ?? "square",
    image: restaurant?.image ?? "",
    hero_images: restaurant?.hero_images ?? [],
    gallery: restaurant?.gallery ?? [],
    desc: restaurant?.desc ?? "",
    address: restaurant?.address ?? "",
    hours: restaurant?.hours ?? "",
    closed: restaurant?.closed ?? "",
    seats: restaurant?.seats ?? "",
    nearest: restaurant?.nearest ?? "",
    phone: restaurant?.phone ?? "",
    budget: restaurant?.budget ?? "",
    rating: restaurant?.rating ?? "",
    reservation_url: restaurant?.reservation_url ?? "",
    source_label: restaurant?.source_label ?? "",
    source_url: restaurant?.source_url ?? "",
    tags: restaurant?.tags ?? [],
    highlights: restaurant?.highlights ?? [],
    body: restaurant?.body ?? [],
    published: restaurant?.published ?? true,
  });

  function set(key: keyof Restaurant, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = createClient();
    const payload = {
      ...form,
      phone: form.phone || null,
      budget: form.budget || null,
      rating: form.rating || null,
      reservation_url: form.reservation_url || null,
      source_label: form.source_label || null,
      source_url: form.source_url || null,
    };

    const { error: err } = isNew
      ? await supabase.from("restaurants").insert(payload)
      : await supabase.from("restaurants").update(payload).eq("id", form.id);

    if (err) {
      setError(err.message);
      setSaving(false);
    } else {
      router.push("/admin/restaurants");
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
              <label style={labelStyle}>ID（例: r241）</label>
              <input value={form.id} onChange={e => set("id", e.target.value)} required style={inputStyle} placeholder="r241" />
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>店舗名 *</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>ジャンル</label>
            <input value={form.cuisine} onChange={e => set("cuisine", e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>エリア名</label>
              <input value={form.area} onChange={e => set("area", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>リージョン *</label>
              <select value={form.region} onChange={e => set("region", e.target.value)} style={inputStyle}>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>短い説明文</label>
            <textarea value={form.desc} onChange={e => set("desc", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>住所 *</label>
            <input value={form.address} onChange={e => set("address", e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>営業時間</label>
              <input value={form.hours} onChange={e => set("hours", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>定休日</label>
              <input value={form.closed} onChange={e => set("closed", e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>席数</label>
              <input value={form.seats} onChange={e => set("seats", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>最寄り駅</label>
              <input value={form.nearest} onChange={e => set("nearest", e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>電話番号</label>
              <input value={form.phone ?? ""} onChange={e => set("phone", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>予算</label>
              <input value={form.budget ?? ""} onChange={e => set("budget", e.target.value)} style={inputStyle} placeholder="¥2,000〜¥4,000" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>評価スコア</label>
              <input value={form.rating ?? ""} onChange={e => set("rating", e.target.value)} style={inputStyle} placeholder="3.45" />
            </div>
            <div>
              <label style={labelStyle}>予約URL</label>
              <input value={form.reservation_url ?? ""} onChange={e => set("reservation_url", e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>出典ラベル</label>
              <input value={form.source_label ?? ""} onChange={e => set("source_label", e.target.value)} style={inputStyle} placeholder="公式サイト" />
            </div>
            <div>
              <label style={labelStyle}>出典URL</label>
              <input value={form.source_url ?? ""} onChange={e => set("source_url", e.target.value)} style={inputStyle} />
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
          <h2 style={{ fontSize: 14, color: "#aaa", marginBottom: 20, fontWeight: 500 }}>画像・コンテンツ</h2>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>メイン画像URL</label>
            <input value={form.image} onChange={e => set("image", e.target.value)} style={inputStyle} />
            {form.image && <img src={form.image} alt="" style={{ marginTop: 8, width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 4, opacity: 0.8 }} />}
          </div>

          <ArrayField label="ヒーロー画像（URL）" value={form.hero_images} onChange={v => set("hero_images", v)} />
          <ArrayField label="ギャラリー画像（URL）" value={form.gallery} onChange={v => set("gallery", v)} />
          <ArrayField label="タグ" value={form.tags} onChange={v => set("tags", v)} />
          <ArrayField label="ハイライト（3点）" value={form.highlights} onChange={v => set("highlights", v)} />
          <ArrayField label="本文（段落ごと）" value={form.body} onChange={v => set("body", v)} />
        </div>
      </div>

      {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 16 }}>{error}</p>}

      <div style={{ display: "flex", gap: 12, paddingTop: 24, borderTop: "1px solid #2a2a2a", marginTop: 24 }}>
        <button type="submit" disabled={saving}
          style={{ padding: "10px 32px", background: "#fff", color: "#000", border: "none", borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
          {saving ? "保存中..." : isNew ? "追加する" : "変更を保存"}
        </button>
        <a href="/admin/restaurants" style={{ padding: "10px 20px", background: "transparent", border: "1px solid #333", borderRadius: 4, color: "#888", textDecoration: "none", fontSize: 14 }}>
          キャンセル
        </a>
      </div>
    </form>
  );
}
