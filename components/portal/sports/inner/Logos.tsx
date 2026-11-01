/**
 * ヘッダー左上のロゴ(SVG の文字)。以前は見本から切り出した webp(712x80 / 444x76)で、画面で拡大すると粗かった。
 * 文字の位置・長さは元の画像に合わせてある(textLength で幅を固定。書体が読み込まれる前後でも位置が動かない)。
 *  LogoShop = 店舗紹介系(明朝)/ LogoSpecial = 特集系(ゴシック)。viewBox は元の画像の半分(356x40 / 222x38)。
 */
const BLUE_SHOP = "#16407a";
const NAVY = "#12142a";
const SKY = "#4f94d8";

export function LogoShop() {
  return (
    <svg viewBox="0 0 356 40" role="img" aria-label="MACHINOWA SPORTS マチノワスポーツ" xmlns="http://www.w3.org/2000/svg">
      <g className="s2b-lg-sf" fontSize="22.5">
        <text x="7" y="22.4" textLength="153" lengthAdjust="spacingAndGlyphs" fill="#0a0a0a">MACHINOWA</text>
        <text x="163" y="22.4" textLength="81" lengthAdjust="spacingAndGlyphs" fill={BLUE_SHOP}>SPORTS</text>
      </g>
      <text className="s2b-lg-sf" x="254" y="20.4" fontSize="11.6" textLength="95" lengthAdjust="spacing" fill="#0a0a0a">マチノワスポーツ</text>
      <text className="s2b-lg-cz" x="7" y="33.4" fontSize="6.6" textLength="197" lengthAdjust="spacing" fill="#666">CITY FITNESS CULTURE MAGAZINE</text>
    </svg>
  );
}

export function LogoSpecial() {
  return (
    <svg viewBox="0 0 222 38" role="img" aria-label="MACHINOWA SPORTS マチノワスポーツ" xmlns="http://www.w3.org/2000/svg">
      <g className="s2b-lg-bl" fontSize="21.5">
        <text x="6" y="21.4" textLength="128" lengthAdjust="spacingAndGlyphs" fill={NAVY}>MACHINOWA</text>
        <text x="141" y="21.4" textLength="75" lengthAdjust="spacingAndGlyphs" fill={SKY}>SPORTS</text>
      </g>
      <text className="s2b-lg-jp" x="6" y="34.4" fontSize="9.6" textLength="83" lengthAdjust="spacing" fill={NAVY}>マチノワスポーツ</text>
    </svg>
  );
}
