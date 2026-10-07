import Link from "next/link";
import { THEMES, themePath, type ThemeKey } from "@/lib/portal/hubs/nigiwai/themes";

/**
 * 色を見比べる、小さな丸い色見本（縦に並べる。見比べ用の部品）。サーバー（JS なし）。
 * 押すと、その色の URL へ移る。いま表示している色は、少し大きく、輪を二重にして印をつける。
 * 丸の中の色は、themes.css の同じ値（.ng-swi[data-theme] がその色の変数を持つ）。丸の中の点は、押す所の塗りの色。
 * 最初の画面の左はしに置く（下のブロックやフッターには出ない）。見えるのは丸だけで、名前は読み上げ用。
 */
export default function ThemeSwatch({ current }: { current: ThemeKey }) {
  return (
    <nav className="ng-sw" aria-label="色の見比べ">
      <ul>
        {THEMES.map((t) => (
          <li key={t.key}>
            <Link
              href={themePath(t.key)}
              prefetch={false}
              className="ng-swi"
              data-theme={t.key}
              aria-label={`色: ${t.label}`}
              aria-current={t.key === current ? "page" : undefined}
            >
              <i>
                <b />
              </i>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
