import { Fragment } from "react";

/**
 * 日本語の本文。改行は "\n"(PC は見本どおりの行で折る・スマホは流す)。
 * 、。」の右半分と「の左半分の空きを詰める(見本の約物は詰めてある)。
 */
export default function Jp({ t }: { t: string }) {
  return (
    <>
      {t.split("\n").map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br className="gn-feat-br" />}
          {line.split(/([、。」』）「『（])/).map((tok, j) =>
            /[、。」』）]/.test(tok) ? (
              <span key={j} className="gn-feat-pr">
                {tok}
              </span>
            ) : /[「『（]/.test(tok) ? (
              <span key={j} className="gn-feat-pl">
                {tok}
              </span>
            ) : (
              tok
            ),
          )}
        </Fragment>
      ))}
    </>
  );
}
