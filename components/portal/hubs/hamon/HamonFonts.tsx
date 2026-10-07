/** 波紋 HAMON の書体（Zen Kaku Gothic New 500 / 700 / 900）。React 19 の precedence 付き stylesheet は <head> に引き上げられる。 */
export default function HamonFonts() {
  return (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@500;700;900&display=swap"
      precedence="default"
    />
  );
}
