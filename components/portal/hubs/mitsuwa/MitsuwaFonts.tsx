/**
 * 三つの輪（MITSUWA）専用の書体。Dela Gothic One（極太。見出し・輪の字・数字）と Zen Kaku Gothic New（本文・小さな字）。
 * PortalFonts と同じやり方（React 19 の precedence 付き stylesheet は <head> に引き上げられる）。使う太さだけ。
 */
export default function MitsuwaFonts() {
  return (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Zen+Kaku+Gothic+New:wght@700;900&display=swap"
      precedence="default"
    />
  );
}
