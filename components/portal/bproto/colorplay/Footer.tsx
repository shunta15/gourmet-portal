import Link from "next/link";
import { BASE } from "@/lib/portal/bproto/colorplay/types";

export default function Footer() {
  return (
    <footer className="cp-footer">
      <div className="cp-wrap">
        <p className="cp-logo cp-logo-f">マチノワ<i>·</i><span>Beauty</span></p>
        <ul>
          <li><Link href={`${BASE}/search`}>お店を探す</Link></li>
          <li><Link href={`${BASE}/search#area`}>エリア</Link></li>
          <li><Link href={`${BASE}#features`}>特集</Link></li>
          <li><Link href="/beauty">本番のビューティー</Link></li>
        </ul>
        <p className="cp-note">大きな写真の一部は、デザインの見本からの仮の写真です。</p>
        <p className="cp-note">店の写真・情報は、各店の公式サイトなどをもとにしています。これはデザインの見本のページです。</p>
      </div>
    </footer>
  );
}
