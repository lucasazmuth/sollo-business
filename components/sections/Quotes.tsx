"use client";

import { useRef } from "react";
import { gsap, useGSAP, Draggable, prefersReduced } from "@/lib/gsap";
import { SplitReveal, Fade } from "@/components/anim/Reveal";
import { quotes } from "@/content/site";

/** Carrossel arrastável com inércia, que também avança com o scroll da página. */
export function Quotes() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = track.current;
      if (!el) return;

      const bounds = () => ({
        minX: -(el.scrollWidth - window.innerWidth + 32),
        maxX: 0
      });

      const [instance] = Draggable.create(el, {
        type: "x",
        inertia: true,
        edgeResistance: 0.85,
        bounds: bounds(),
        onPress(this: Draggable) {
          this.applyBounds(bounds());
        }
      });

      if (!prefersReduced()) {
        gsap.to(el, {
          x: () => bounds().minX * 0.35,
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            invalidateOnRefresh: true
          }
        });
      }

      return () => instance?.kill();
    },
    { dependencies: [] }
  );

  return (
    <section className="section quotes" id="depoimentos" ref={section}>
      <div className="wrap">
        <Fade as="p" className="eyebrow">
          Depoimentos
        </Fade>
        <SplitReveal
          as="h2"
          className="h2"
          style={{ margin: "1.2rem 0 clamp(2rem,4vh,3rem)" }}
        >
          Quem já está do outro lado
        </SplitReveal>
      </div>

      {/* PLACEHOLDER: depoimentos da copy de referência — substituir por reais. */}
      <div className="quotes__track" ref={track} data-cursor="arraste">
        {quotes.map((q) => (
          <article className={`quote${q.accent ? " quote--accent" : ""}`} key={q.name}>
            <p className="quote__text">{q.text}</p>
            <div className="quote__who">
              <span className="quote__avatar" />
              <span>
                <span className="quote__name">{q.name}</span>
                <br />
                <span className="quote__role">{q.role}</span>
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
