/**
 * 光の輪案の書体（Google Fonts）。使う太さだけ。PortalFonts と同じやり方（precedence 付き stylesheet は <head> に引き上げられる）。
 * 見出し・数字・名前: Shippori Mincho B1 / 小さな文字: Zen Kaku Gothic New
 */
export default function HikariwaFonts() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@500;600;700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap"
        precedence="default"
      />
    </>
  );
}
