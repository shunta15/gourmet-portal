"use client";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, X, ChevronUp, ChevronDown, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  value: string[];
  onChange: (v: string[]) => void;
  bucket?: string;
  folder?: string;
  className?: string;
};

export default function ImageArrayUploader({
  label,
  value,
  onChange,
  bucket = "restaurants",
  folder = "uploads",
  className,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    setError("");
    setUploading(true);
    const supabase = createClient();
    const uploads: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 10 * 1024 * 1024) {
          setError(`${file.name} は10MB超のためスキップ`);
          continue;
        }
        const ext = file.name.split(".").pop() || "jpg";
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const path = `${folder}/${filename}`;
        const { error: e } = await supabase.storage
          .from(bucket)
          .upload(path, file, { cacheControl: "31536000", upsert: false });
        if (e) {
          setError(e.message);
          continue;
        }
        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
        uploads.push(pub.publicUrl);
      }
      if (uploads.length > 0) onChange([...value, ...uploads]);
    } finally {
      setUploading(false);
    }
  }

  function update(i: number, v: string) {
    const next = [...value];
    next[i] = v;
    onChange(next);
  }
  function remove(i: number) {
    onChange(value.filter((_, j) => j !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const next = [...value];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className={cn("space-y-3", className)}>
      {label && <div className="text-xs font-medium text-foreground/80">{label}</div>}

      <div className="space-y-2">
        {value.map((url, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-md border border-input bg-muted/20 p-2"
          >
            {/* サムネイル */}
            <div className="size-14 shrink-0 overflow-hidden rounded bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {url ? (
                <img src={url} alt="" className="size-full object-cover" />
              ) : (
                <div className="grid size-full place-items-center text-xs text-muted-foreground">—</div>
              )}
            </div>

            {/* URL */}
            <div className="relative min-w-0 flex-1">
              <LinkIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={url}
                onChange={(e) => update(i, e.target.value)}
                className="pl-8 text-xs"
                placeholder="画像 URL"
              />
            </div>

            {/* 操作ボタン */}
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                title="上へ"
              >
                <ChevronUp className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => move(i, 1)}
                disabled={i === value.length - 1}
                title="下へ"
              >
                <ChevronDown className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(i)}
                title="削除"
                className="text-destructive"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* 追加ボタン */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
          画像アップロード
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange([...value, ""])}
        >
          <LinkIcon className="size-3.5" /> URL 行を追加
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {error && <div className="text-xs text-destructive">{error}</div>}
    </div>
  );
}
