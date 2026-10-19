import Header from "@/components/portal/hproto/machi/Header";
import Hero from "@/components/portal/hproto/machi/Hero";
import Lower from "@/components/portal/hproto/machi/Lower";

export default function Page() {
  return (
    <>
      <Header />
      <main className="hm-main">
        <Hero />
        <Lower />
      </main>
    </>
  );
}
