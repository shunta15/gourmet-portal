/**
 * 種類の名前を、「・」の所だけで折れるように並べる(「車・修理・クリーニング・買取」が「…クリーニン / グ」と途中で折れないように)。
 * 1 行に収まるときは見た目はふつうの文字と同じ。折り返す幅のときだけ「車・修理・ / クリーニング・買取」のように「・」の後ろで折れる。
 * サーバーでもクライアントでも使える(状態を持たない)。.vk-kn は common/base.css。
 */
export default function KindName({ name }: { name: string }) {
  const parts = name.split("・");
  return (
    <>
      {parts.map((w, i) => (
        <span key={i} className="vk-kn">
          {w}
          {i < parts.length - 1 ? "・" : ""}
        </span>
      ))}
    </>
  );
}
