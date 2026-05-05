"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return <>{children}</>;

  const navItems = [
    { href: "/admin", label: "ダッシュボード" },
    { href: "/admin/restaurants", label: "店舗" },
    { href: "/admin/features", label: "特集記事" },
  ];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif", background: "#0f0f0f", color: "#fff" }}>
      {/* サイドバー */}
      <aside style={{ width: 220, background: "#1a1a1a", borderRight: "1px solid #2a2a2a", padding: "24px 0", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 20px 24px", fontSize: 14, fontWeight: 700, letterSpacing: 2, color: "#aaa" }}>
          MACHINOWA CMS
        </div>
        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "block",
                padding: "10px 20px",
                fontSize: 14,
                color: pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)) ? "#fff" : "#888",
                background: pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)) ? "#2a2a2a" : "transparent",
                textDecoration: "none",
                borderLeft: pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)) ? "2px solid #fff" : "2px solid transparent",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          style={{ margin: "0 20px 20px", padding: "8px 12px", background: "transparent", border: "1px solid #333", color: "#888", cursor: "pointer", fontSize: 13, borderRadius: 4 }}
        >
          ログアウト
        </button>
      </aside>

      {/* メインコンテンツ */}
      <main style={{ flex: 1, padding: 32, overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
