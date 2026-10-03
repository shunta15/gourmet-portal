/**
 * 総合サイト専用の欧文フォント（Cormorant Garamond）。
 * 既存サイトの layout.tsx（グルメ側の <head>）は触らず、総合サイトのページ・レイアウトからだけ読み込む。
 * React 19 の precedence 付き stylesheet は <head> に引き上げられる。
 */
export default function PortalFonts() {
  return (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap"
      precedence="default"
    />
  );
}
