import { BrandSprite } from "@/components/BrandSprite";
import { ReadyProvider } from "@/components/ReadyProvider";
import { Preloader } from "@/components/Preloader";
import { Cursor } from "@/components/Cursor";
import { Header } from "@/components/Header";
import { SmoothScroll } from "@/components/SmoothScroll";

import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { Steps } from "@/components/sections/Steps";
import { Perks } from "@/components/sections/Perks";
import { Services } from "@/components/sections/Services";
import { Connect } from "@/components/sections/Connect";
import { Communities } from "@/components/sections/Communities";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

export default function Page() {
  return (
    <ReadyProvider>
      <BrandSprite />
      <Preloader />
      <Cursor />
      <Header />

      <SmoothScroll>
        <main id="top">
          <Hero />
          <Manifesto />
          <Steps />
          <Perks />
          <Services />
          <Connect />
          <Communities />
          <Pricing />
          <Faq />
          <Contact />
          <Footer />
        </main>
      </SmoothScroll>
    </ReadyProvider>
  );
}
