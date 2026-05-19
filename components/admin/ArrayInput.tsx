"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  /** 並び替え可（default: true） */
  reorderable?: boolean;
};

export default function ArrayInput({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  className,
  reorderable = true,
}: Props) {
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
    <div className={cn("space-y-2", className)}>
      {label && <div className="text-xs font-medium text-foreground/80">{label}</div>}

      <div className="space-y-2">
        {value.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            {multiline ? (
              <Textarea
                value={item}
                onChange={(e) => update(i, e.target.value)}
                placeholder={placeholder}
                rows={2}
                className="flex-1 text-sm"
              />
            ) : (
              <Input
                value={item}
                onChange={(e) => update(i, e.target.value)}
                placeholder={placeholder}
                className="flex-1"
              />
            )}
            <div className="flex shrink-0 items-center gap-0.5 pt-0.5">
              {reorderable && (
                <>
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
                </>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(i)}
                className="text-destructive"
                title="削除"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...value, ""])}
      >
        <Plus className="size-3.5" /> 追加
      </Button>
    </div>
  );
}
