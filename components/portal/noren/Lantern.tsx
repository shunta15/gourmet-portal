/** 提灯（CSSだけで描く）。灯りの強さはルートの --lamp（0〜1）に追従する。 */
export default function Lantern({ className = "", mark = "灯" }: { className?: string; mark?: string }) {
  return (
    <span className={`vN-lan ${className}`} aria-hidden="true">
      <i className="vN-lan-cord" />
      <b className="vN-lan-cap" />
      <span className="vN-lan-body">
        <em>{mark}</em>
      </span>
      <b className="vN-lan-cap vN-lan-cap--b" />
      <i className="vN-lan-tassel" />
    </span>
  );
}
