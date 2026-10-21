import Link from "next/link";
import Img from "./Img";
import { IconArrow } from "../common/Icons";
import type { Card } from "./data";

/** 行ごとに改行する(PC は見本どおりの改行、スマホは自然に折り返す) */
export function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <span className="ar-ln" key={i}>
          {l}
        </span>
      ))}
    </>
  );
}

/** 新着などの記事カード(写真+タグ+見出し+説明+日付+矢印の丸)。外側の li は .io(せり上がる)、中のリンクが持ち上がる */
export default function ArticleCard({ c, eager = false }: { c: Card; eager?: boolean }) {
  return (
    <li className="io">
      <Link href={c.href} className="ar-lt-card pt-hov">
        <span className="ar-lt-img pt-zoom pt-shine">
          <Img src={c.img} w={c.w} h={c.h} alt="" eager={eager} />
        </span>
        <span className="ar-lt-body">
          <span className="ar-tagp">{c.tag}</span>
          <h3 className="ar-lt-t">
            <Lines lines={c.title} />
          </h3>
          <p className="ar-lt-d">
            <Lines lines={c.desc} />
          </p>
          <span className="ar-lt-foot">
            <time className="ar-date">{c.date}</time>
            <span className="pt-arrow ar-lt-arrow">
              <IconArrow />
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}
