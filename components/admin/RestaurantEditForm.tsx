"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Save, Trash2, ExternalLink } from "lucide-react";
import ImageUploader from "./ImageUploader";
import ImageArrayUploader from "./ImageArrayUploader";
import ArrayInput from "./ArrayInput";

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

const REGIONS = [
  "tokyo", "osaka", "kyoto", "nagoya", "fukuoka", "hyogo",
  "kanagawa", "saitama", "nara", "hiroshima", "shiga",
  "gunma", "kagoshima", "wakayama", "hokkaido", "shizuoka",
];

const SHAPES = ["square", "tall", "wide"];

const empty: Restaurant = {
  id: "",
  name: "",
  cuisine: "",
  area: "",
  region: "tokyo",
  shape: "square",
  image: "",
  hero_images: [],
  gallery: [],
  desc: "",
  address: "",
  hours: "",
  closed: "",
  seats: "",
  nearest: "",
  phone: "",
  budget: "",
  rating: "",
  reservation_url: "",
  source_label: "",
  source_url: "",
  tags: [],
  highlights: [],
  body: [],
  published: true,
};

export default function RestaurantEditForm({ restaurant }: { restaurant: Restaurant | null }) {
  const isNew = !restaurant;
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<Restaurant>({ ...empty, ...(restaurant ?? {}) });

  function set<K extends keyof Restaurant>(key: K, value: Restaurant[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (saving) return;
    setSaving(true);

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
      setSaving(false);
      toast.error(`保存失敗: ${err.message}`);
      return;
    }

    // 公開ページの ISR キャッシュを即時クリア
    try {
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paths: [
            `/restaurant/${form.id}`,
            `/region/${form.region}`,
            "/",
          ],
        }),
      });
    } catch (e) {
      console.warn("revalidate failed:", e);
    }

    setSaving(false);
    toast.success(isNew ? "店舗を追加しました" : "変更を保存しました");
    router.push("/admin/restaurants");
    router.refresh();
  }

  async function handleDelete() {
    if (!form.id) return;
    setDeleting(true);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("restaurants")
      .delete()
      .eq("id", form.id);
    setDeleting(false);
    if (err) {
      toast.error(`削除失敗: ${err.message}`);
      return;
    }
    toast.success("店舗を削除しました");
    router.push("/admin/restaurants");
    router.refresh();
  }

  // Cmd+S / Ctrl+S で保存
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSubmit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, saving]);

  const folder = form.id || "new";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">
              {isNew ? "新規店舗追加" : form.name || "(無題)"}
            </h1>
            {!isNew && (
              <Badge variant="outline" className="font-mono text-xs">
                {form.id}
              </Badge>
            )}
            <Badge variant={form.published ? "default" : "destructive"}>
              {form.published ? "公開中" : "非公開"}
            </Badge>
          </div>
          {!isNew && (
            <a
              href={`https://machinowa.tokyo/restaurant/${form.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              公開ページを開く <ExternalLink className="size-3" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isNew && (
            <Dialog>
              <DialogTrigger>
                <Button type="button" variant="destructive" size="lg">
                  <Trash2 className="size-4" /> 削除
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>本当に削除しますか？</DialogTitle>
                  <DialogDescription>
                    <span className="font-semibold text-foreground">{form.name}</span>（{form.id}）
                    を完全に削除します。この操作は取り消せません。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    完全に削除する
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? "保存中…" : isNew ? "追加" : "保存"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">基本情報</TabsTrigger>
          <TabsTrigger value="business">営業情報</TabsTrigger>
          <TabsTrigger value="images">画像</TabsTrigger>
          <TabsTrigger value="content">本文・タグ</TabsTrigger>
          <TabsTrigger value="meta">メタ情報</TabsTrigger>
        </TabsList>

        {/* ───── 基本 ───── */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">店舗の基本情報</CardTitle>
              <CardDescription>店名・ジャンル・エリアなど、検索や一覧で使われる情報</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {isNew && (
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="id">ID *</Label>
                  <Input
                    id="id"
                    value={form.id}
                    onChange={(e) => set("id", e.target.value)}
                    required
                    placeholder="r241"
                  />
                  <p className="text-xs text-muted-foreground">
                    例: r241 — 既存 ID と被らないようにしてください
                  </p>
                </div>
              )}

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="name">店舗名 *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuisine">ジャンル</Label>
                <Input
                  id="cuisine"
                  value={form.cuisine}
                  onChange={(e) => set("cuisine", e.target.value)}
                  placeholder="創作イタリアン・バー"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">リージョン *</Label>
                <select
                  id="region"
                  value={form.region}
                  onChange={(e) => set("region", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                >
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">エリア名</Label>
                <Input
                  id="area"
                  value={form.area}
                  onChange={(e) => set("area", e.target.value)}
                  placeholder="姪の浜"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shape">カード形状</Label>
                <select
                  id="shape"
                  value={form.shape}
                  onChange={(e) => set("shape", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                >
                  {SHAPES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="desc">短い説明</Label>
                <Textarea
                  id="desc"
                  value={form.desc}
                  onChange={(e) => set("desc", e.target.value)}
                  rows={3}
                  placeholder="一覧カードや SEO descriptions に使う 60〜140字程度"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                <Switch
                  id="published"
                  checked={form.published}
                  onCheckedChange={(v) => set("published", v)}
                />
                <Label htmlFor="published" className="cursor-pointer">
                  公開する
                </Label>
                <span className="text-xs text-muted-foreground">
                  OFF にすると公開ページから消えます（URL は維持）
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───── 営業情報 ───── */}
        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">営業情報・アクセス</CardTitle>
              <CardDescription>住所、営業時間、予約 URL など</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="address">住所 *</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  required
                  placeholder="福岡県福岡市西区姪の浜..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours">営業時間</Label>
                <Input
                  id="hours"
                  value={form.hours}
                  onChange={(e) => set("hours", e.target.value)}
                  placeholder="18:00 - 24:00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closed">定休日</Label>
                <Input
                  id="closed"
                  value={form.closed}
                  onChange={(e) => set("closed", e.target.value)}
                  placeholder="水曜"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nearest">最寄り駅</Label>
                <Input
                  id="nearest"
                  value={form.nearest}
                  onChange={(e) => set("nearest", e.target.value)}
                  placeholder="姪浜駅 徒歩5分"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seats">席数</Label>
                <Input
                  id="seats"
                  value={form.seats}
                  onChange={(e) => set("seats", e.target.value)}
                  placeholder="28席"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input
                  id="phone"
                  value={form.phone ?? ""}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="092-xxx-xxxx"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">予算</Label>
                <Input
                  id="budget"
                  value={form.budget ?? ""}
                  onChange={(e) => set("budget", e.target.value)}
                  placeholder="¥4,000〜¥8,000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">評価スコア</Label>
                <Input
                  id="rating"
                  value={form.rating ?? ""}
                  onChange={(e) => set("rating", e.target.value)}
                  placeholder="3.45"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="reservation_url">予約 URL</Label>
                <Input
                  id="reservation_url"
                  value={form.reservation_url ?? ""}
                  onChange={(e) => set("reservation_url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───── 画像 ───── */}
        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">メイン画像</CardTitle>
              <CardDescription>店舗カードや一覧で使う、サムネイル画像</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                value={form.image}
                onChange={(v) => set("image", v)}
                folder={folder}
                previewHeight={220}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">ヒーロー画像（最大5枚）</CardTitle>
              <CardDescription>店舗ページ上部のヒーロースライダーに使う画像</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageArrayUploader
                value={form.hero_images}
                onChange={(v) => set("hero_images", v)}
                folder={folder}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">ギャラリー画像</CardTitle>
              <CardDescription>店舗ページ下部のギャラリーに使う画像</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageArrayUploader
                value={form.gallery}
                onChange={(v) => set("gallery", v)}
                folder={folder}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───── 本文・タグ ───── */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">タグ</CardTitle>
              <CardDescription>シーン・利用ガイドに使う（例: デート / 接待 / 一人ご飯）</CardDescription>
            </CardHeader>
            <CardContent>
              <ArrayInput
                value={form.tags}
                onChange={(v) => set("tags", v)}
                placeholder="タグ名"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">ハイライト</CardTitle>
              <CardDescription>店舗ページ上部に並ぶ 3 ポイント</CardDescription>
            </CardHeader>
            <CardContent>
              <ArrayInput
                value={form.highlights}
                onChange={(v) => set("highlights", v)}
                placeholder="○○が看板メニュー"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">本文</CardTitle>
              <CardDescription>段落ごとに1ブロック。記事のメイン</CardDescription>
            </CardHeader>
            <CardContent>
              <ArrayInput
                value={form.body}
                onChange={(v) => set("body", v)}
                placeholder="段落の本文…"
                multiline
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───── メタ情報（出典） ───── */}
        <TabsContent value="meta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">出典・参照</CardTitle>
              <CardDescription>事実情報の参照元（食べログ・公式サイトなど）</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="source_label">出典ラベル</Label>
                <Input
                  id="source_label"
                  value={form.source_label ?? ""}
                  onChange={(e) => set("source_label", e.target.value)}
                  placeholder="公式サイト"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source_url">出典 URL</Label>
                <Input
                  id="source_url"
                  value={form.source_url ?? ""}
                  onChange={(e) => set("source_url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* フッター */}
      <div className="flex items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
        <span>⌘+S で保存できます</span>
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? "保存中…" : isNew ? "追加" : "保存"}
        </Button>
      </div>
    </form>
  );
}
