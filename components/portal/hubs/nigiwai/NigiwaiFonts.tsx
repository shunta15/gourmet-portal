/**
 * 「にぎわいの輪」案の書体（Zen Maru Gothic 500 / 700 / 900）。
 * components/portal/PortalFonts.tsx と同じやり方（React 19 の precedence 付き stylesheet は <head> に引き上げられる）。
 */
export default function NigiwaiFonts() {
  return (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&display=swap"
      precedence="default"
    />
  );
}
