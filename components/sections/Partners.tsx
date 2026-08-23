"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, prefersReduced } from "@/lib/gsap";
import { Fade } from "@/components/anim/Reveal";
import { partners } from "@/content/site";

/** Marquee infinito que acelera e inclina conforme a velocidade do scroll. */
export function Partners() {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = track.current;
      if (!el) return;

      /* Duplica o conteúdo até cobrir o dobro da viewport */
      const original = el.innerHTML;
      let guard = 0;
      while (el.scrollWidth < window.innerWidth * 2 && guard++ < 10) el.innerHTML += original;

      const speed = 0.6;
      const distance = el.scrollWidth / 2;

      const tl = gsap.to(el, {
        x: -distance,
        duration: distance / (60 * speed),
        ease: "none",
        repeat: -1,
        modifiers: { x: (x) => `${parseFloat(x) % distance}px` }
      });

      if (prefersReduced()) {
        tl.pause();
        return;
      }

      ScrollTrigger.create({
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-3, 3, self.getVelocity() / 900);
          gsap.to(tl, { timeScale: 1 + Math.abs(v), duration: 0.4, overwrite: true });
          gsap.to(el, { skewX: -v * 3, duration: 0.5, overwrite: true });
        }
      });
    },
    { dependencies: [] }
  );

  return (
    <section className="section section--tight" id="parceiros">
      <div className="wrap">
        <Fade as="p" className="eyebrow">
          Quem está ao nosso lado
        </Fade>
      </div>

      {/* PLACEHOLDER: substituir pelos logos reais dos parceiros. */}
      <div className="marquee" ref={wrap} style={{ marginTop: "clamp(1.5rem,3vh,2.5rem)" }}>
        <div className="marquee__track" ref={track}>
          {partners.map((name, i) => (
            <span className="marquee__item" key={i}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
