"use client";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  className?: string;
  /** プレビューの高さ。default 160 */
  previewHeight?: number;
  /** 入力 URL も許可（true なら URL 直入力 UI も表示） */
  allowUrl?: boolean;
};

export default function ImageUploader({
  value,
  onChange,
  bucket = "restaurants",
  folder = "uploads",
  className,
  previewHeight = 160,
  allowUrl = true,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルのみアップロードできます");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("ファイルサイズは10MB以下にしてください");
      return;
    }
    setError("");
    setUploading(true);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `${folder}/${filename}`;

      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: "31536000",
          upsert: false,
        });

      if (uploadErr) throw uploadErr;

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(pub.publicUrl);
    } catch (e: any) {
      setError(e?.message ?? "アップロード失敗");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* プレビュー or ドロップゾーン */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-input bg-muted/30 hover:bg-muted/50"
        )}
        style={{ minHeight: previewHeight }}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt=""
              className="size-full object-cover"
              style={{ maxHeight: previewHeight * 2 }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-background/80 text-foreground shadow-sm hover:bg-background"
              aria-label="画像を削除"
            >
              <X className="size-3.5" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center text-sm text-muted-foreground">
            {uploading ? (
              <>
                <Loader2 className="size-6 animate-spin" />
                <div>アップロード中…</div>
              </>
            ) : (
              <>
                <Upload className="size-6" />
                <div>クリック または ドラッグ&ドロップで画像を追加</div>
                <div className="text-xs">JPG / PNG / WebP / AVIF / GIF / 最大 10MB</div>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {error && (
        <div className="text-xs text-destructive">{error}</div>
      )}

      {allowUrl && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <LinkIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="または URL を貼り付け"
              className="pl-8 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
