import FloatingSymbols from "@/components/elements/FloatingSymbols";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <main className="mx-auto flex flex-col items-center justify-between min-h-screen w-full">
      {/* Navbar Section */}
      <section className="w-full">
        <Navbar />
      </section>

      {/* Main Content Section */}
      <section className="flex-grow pt-[30px] md:pt-0 w-full"></section>

      {/* Footer Section */}
      <section className="w-full">
        <Footer />
      </section>
    </main>
  );
}
