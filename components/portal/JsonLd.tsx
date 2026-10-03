/** JSON-LD を1つ出す小部品（サーバー）。`<` をエスケープして script の途中終了を防ぐ。 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
