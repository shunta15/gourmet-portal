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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Save, Trash2, ExternalLink, Info } from "lucide-react";
import ImageUploader from "./ImageUploader";

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

const empty: FeatureArticle = {
  id: "",
  no: "",
  tag: "",
  kicker: "",
  title: "",
  title_html: "",
  subtitle: "",
  lede: "",
  date: "",
  reading: "約3分",
  author: "マチノワ編集部",
  hero_image: "",
  published: true,
};

export default function FeatureEditForm({ article }: { article: FeatureArticle | null }) {
  const isNew = !article;
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<FeatureArticle>({ ...empty, ...(article ?? {}) });

  function set<K extends keyof FeatureArticle>(key: K, value: FeatureArticle[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (saving) return;
    setSaving(true);

    const supabase = createClient();
    const { error: err } = isNew
      ? await supabase.from("feature_articles").insert(form)
      : await supabase.from("feature_articles").update(form).eq("id", form.id);

    setSaving(false);
    if (err) {
      toast.error(`保存失敗: ${err.message}`);
      return;
    }
    toast.success(isNew ? "記事を追加しました" : "変更を保存しました");
    router.push("/admin/features");
    router.refresh();
  }

  async function handleDelete() {
    if (!form.id) return;
    setDeleting(true);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("feature_articles")
      .delete()
      .eq("id", form.id);
    setDeleting(false);
    if (err) {
      toast.error(`削除失敗: ${err.message}`);
      return;
    }
    toast.success("記事を削除しました");
    router.push("/admin/features");
    router.refresh();
  }

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
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">
              {isNew ? "新規特集記事" : form.title || "(無題)"}
            </h1>
            {!isNew && form.id && (
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
              href={`https://machinowa.tokyo/feature/${form.id}`}
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
                    <span className="font-semibold text-foreground">{form.title}</span>
                    を完全に削除します。関連するランキングアイテムも消えます。取り消せません。
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

      <Alert>
        <Info className="size-4" />
        <AlertDescription>
          POINT/SPOT セクションや quote・closing は現状 data.ts で管理されており、Day 8〜10
          で記事 CMS（POINT エディタ・関連記事 D&D など）を実装予定。
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="head" className="space-y-4">
        <TabsList>
          <TabsTrigger value="head">ヘッダー</TabsTrigger>
          <TabsTrigger value="text">本文ヘッド</TabsTrigger>
          <TabsTrigger value="hero">ヒーロー画像</TabsTrigger>
        </TabsList>

        <TabsContent value="head" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">記事の基本情報</CardTitle>
              <CardDescription>ID・No・タグなどのインデックス情報</CardDescription>
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
                    placeholder="feature-xxx-yyy"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="no">No</Label>
                <Input
                  id="no"
                  value={form.no}
                  onChange={(e) => set("no", e.target.value)}
                  placeholder="NG-103"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tag">タグ</Label>
                <Input
                  id="tag"
                  value={form.tag}
                  onChange={(e) => set("tag", e.target.value)}
                  placeholder="観光 / 大阪ランチ など"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kicker">キッカー</Label>
                <Input
                  id="kicker"
                  value={form.kicker}
                  onChange={(e) => set("kicker", e.target.value)}
                  placeholder="KINOSHA NACHIKATSUURA"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">日付</Label>
                <Input
                  id="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                  placeholder="2026-05-19"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reading">読了時間</Label>
                <Input
                  id="reading"
                  value={form.reading}
                  onChange={(e) => set("reading", e.target.value)}
                  placeholder="約3分"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">著者</Label>
                <Input
                  id="author"
                  value={form.author}
                  onChange={(e) => set("author", e.target.value)}
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
                  OFF で noindex のドラフトに（URL は維持）
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">タイトル・lede</CardTitle>
              <CardDescription>記事のキャッチコピーと冒頭文</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">タイトル *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  required
                  placeholder="姪浜デートのディナーには..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title_html">タイトル（HTML）</Label>
                <Textarea
                  id="title_html"
                  value={form.title_html}
                  onChange={(e) => set("title_html", e.target.value)}
                  rows={3}
                  placeholder='川と海の<em>あいだ</em>、<br>汽ノ舎。'
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  ヒーロー大見出し。&lt;br&gt; / &lt;em&gt; のみ使用可
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">サブタイトル</Label>
                <Textarea
                  id="subtitle"
                  value={form.subtitle}
                  onChange={(e) => set("subtitle", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lede">lede（リード文）</Label>
                <Textarea
                  id="lede"
                  value={form.lede}
                  onChange={(e) => set("lede", e.target.value)}
                  rows={6}
                  placeholder="記事冒頭の語り出し…"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ヒーロー画像</CardTitle>
              <CardDescription>記事トップとシェア時の OGP に使用</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                value={form.hero_image}
                onChange={(v) => set("hero_image", v)}
                bucket="features"
                folder={folder}
                previewHeight={260}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
