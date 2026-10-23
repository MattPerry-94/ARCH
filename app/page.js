import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Exploded from "@/components/Exploded";
import Hardness from "@/components/Hardness";
import Specs from "@/components/Specs";
import AppDemo from "@/components/AppDemo";
import Experts from "@/components/Experts";
import Compare from "@/components/Compare";
import Pricing from "@/components/Pricing";
import Faq from "@/components/Faq";
import Preorder from "@/components/Preorder";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Exploded />
        <Hardness />
        <Specs />
        <AppDemo />
        <Experts />
        <Compare />
        <Pricing />
        <Faq />
        <Preorder />
      </main>
      <Footer />
      <Reveal />
    </>
  );
}
