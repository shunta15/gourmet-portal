import Link from "next/link";
import type { CpSite } from "@/lib/portal/colorplay/site";
import { specialHref, type CpSpecial } from "@/lib/portal/colorplay/specials";
import { IconArrow } from "@/components/portal/bproto/colorplay/Icons";
import "./article.css";
import "./special.css";

/** 札の色面(順に回す。特集の入口の色もこの順) */
export const SPECIAL_TONES = ["red", "blue", "pink", "sky"];
export const specialTone = (i: number) => SPECIAL_TONES[i % SPECIAL_TONES.length];

/** 特集の札: 上に色面(大きな番号。写真は使わない)、下に種類の色面で 題・導入の文。札ぜんたいが特集のページへのリンク */
export function SpecialCard({ site, sp, i, no }: { site: CpSite; sp: CpSpecial; i: number; no: number }) {
  return (
    <article className={`art-card sp-card t-${specialTone(i)}`} data-sp="e" style={{ ["--i" as string]: i % 6 }}>
      <div className="art-card-ph sp-face" aria-hidden="true">
        <span className="sp-no cp-cond">{String(no).padStart(2, "0")}</span>
      </div>
      <div className="art-card-body">
        <p className="cp-tags"><span className="cp-tag">特集</span></p>
        <h3><Link href={specialHref(site, sp.slug)} prefetch={false}>{sp.title}</Link></h3>
        <p className="art-lede">{sp.lead}</p>
        <span className="art-go" aria-hidden="true"><IconArrow size={18} /></span>
      </div>
    </article>
  );
}
