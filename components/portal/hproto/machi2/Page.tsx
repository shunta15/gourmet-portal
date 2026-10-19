import Header from "./Header";
import Hero from "./Hero";
import Lower from "./Lower";

export default function Page({ mihon }: { mihon: boolean }) {
  return (
    <>
      <Header base={mihon ? "/proto-home/machi2/mihon" : "/proto-home/machi2"} />
      <main className="h2-main">
        <Hero mihon={mihon} />
        <Lower />
      </main>
    </>
  );
}
