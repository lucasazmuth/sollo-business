"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { SplitReveal, Fade } from "@/components/anim/Reveal";
import { steps } from "@/content/site";

/**
 * "Como funciona" — scroll horizontal com pin no desktop
 * e rolagem nativa com snap no mobile.
 */
export function Steps() {
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 761px)", () => {
        const shift = () => track.current!.scrollWidth - window.innerWidth + 64;

        const tween = gsap.to(track.current, {
          x: () => -shift(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${shift()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => gsap.set(bar.current, { scaleX: self.progress })
          }
        });

        gsap.utils.toArray<HTMLElement>(".step", track.current!).forEach((step) => {
          gsap.from(step, {
            scale: 0.94,
            opacity: 0.35,
            duration: 0.6,
            scrollTrigger: {
              trigger: step,
              containerAnimation: tween,
              start: "left 92%",
              end: "left 55%",
              scrub: true
            }
          });
        });

        return () => gsap.set(track.current, { x: 0 });
      });

      mm.add("(max-width: 760px)", () => {
        const vp = viewport.current!;
        vp.style.overflowX = "auto";
        vp.style.scrollSnapType = "x mandatory";
        gsap.utils.toArray<HTMLElement>(".step", track.current!).forEach((s) => {
          s.style.scrollSnapAlign = "center";
        });
        gsap.set(bar.current, { scaleX: 1, opacity: 0.4 });

        return () => {
          vp.style.overflowX = "";
          vp.style.scrollSnapType = "";
          gsap.set(bar.current, { scaleX: 0, opacity: 1 });
        };
      });
    },
    { dependencies: [] }
  );

  return (
    <section className="section steps" id="como-funciona" ref={section}>
      <div className="wrap steps__head">
        <div>
          <Fade as="p" className="eyebrow">
            Passo a passo
          </Fade>
          <SplitReveal as="h2" className="h1" style={{ marginTop: "1.2rem" }}>
            <>
              Como funciona<span className="dot">?</span>
            </>
          </SplitReveal>
        </div>
        <Fade as="p" className="lead" style={{ maxWidth: "38ch" }}>
          Do primeiro contato à avaliação final: cada etapa acontece dentro da plataforma.
        </Fade>
      </div>

      <div className="steps__viewport" ref={viewport}>
        <div className="steps__track" ref={track}>
          {steps.map((step) => (
            <article className="step" key={step.n}>
              <span className="step__n">{step.n}</span>
              <div className="step__body">
                <span className="step__label">{step.label}</span>
                <h3 className="step__title">{step.title}</h3>
                <p className="step__text">{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="steps__progress">
        <span ref={bar} />
      </div>
    </section>
  );
}
