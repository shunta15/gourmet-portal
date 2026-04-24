import { Fragment } from "react";

export default function Marquee({
  items,
  reverse = false,
  dark = false,
}: {
  items: string[];
  reverse?: boolean;
  dark?: boolean;
}) {
  const content = items.map((t, i) => (
    <Fragment key={i}>
      <span>{t}</span>
      <span className="sep">✦</span>
    </Fragment>
  ));
  return (
    <div className={"marquee " + (dark ? "dark" : "")}>
      <div className={"marquee-track " + (reverse ? "reverse" : "")}>
        <span>{content}</span>
        <span>{content}</span>
      </div>
    </div>
  );
}
