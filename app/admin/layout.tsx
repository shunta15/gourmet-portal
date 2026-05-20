"use client";
import "./admin.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Store,
  Newspaper,
  ExternalLink,
  LogOut,
  Image as ImageIcon,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import CommandPalette from "@/components/admin/CommandPalette";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return (
      <div className="admin-root dark flex min-h-screen items-center justify-center">
        {children}
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard },
    { href: "/admin/restaurants", label: "店舗", icon: Store },
    { href: "/admin/features", label: "特集記事", icon: Newspaper },
    { href: "/admin/storage", label: "画像ライブラリ", icon: ImageIcon },
  ];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <div className="admin-root dark flex min-h-screen font-sans">
      {/* サイドバー */}
      <aside className="flex w-60 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="border-b border-sidebar-border px-5 py-5">
          <div className="text-[10px] font-mono tracking-[0.35em] text-muted-foreground">MACHINOWA</div>
          <div className="mt-1 text-base font-semibold tracking-wide">CMS</div>
          <button
            type="button"
            onClick={() => {
              const ev = new KeyboardEvent("keydown", { key: "k", metaKey: true });
              window.dispatchEvent(ev);
            }}
            className="mt-3 flex w-full items-center justify-between gap-2 rounded-md border border-sidebar-border bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/30"
          >
            <span>クイック検索…</span>
            <kbd className="rounded border border-sidebar-border bg-background/40 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-sidebar-border px-3 py-3">
          <a
            href="https://machinowa.tokyo"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
            )}
          >
            <ExternalLink className="size-4" /> 公開サイトを見る
          </a>
          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
            )}
          >
            <LogOut className="size-4" /> ログアウト
          </button>
        </div>
      </aside>

      {/* メイン */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-8">
          {children}
        </div>
      </main>

      <Toaster theme="dark" />
      <CommandPalette />
    </div>
  );
}
