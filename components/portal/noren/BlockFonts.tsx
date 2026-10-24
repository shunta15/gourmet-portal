/**
 * 「block」の見た目の書体（手書き風の Klee One・丸ゴシックの Zen Maru Gothic）。
 * React 19 の precedence 付き stylesheet は <head> に引き上げられ、同じ href は 1 度だけ出る。
 */
export default function BlockFonts() {
  return (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Klee+One:wght@400;600&family=Zen+Maru+Gothic:wght@500;700;900&display=swap"
      precedence="default"
    />
  );
}
