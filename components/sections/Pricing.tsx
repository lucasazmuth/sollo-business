"use client";

import { useRef } from "react";
import { gsap, useGSAP, canHover, prefersReduced } from "@/lib/gsap";
import { SplitReveal, Fade } from "@/components/anim/Reveal";
import { plans } from "@/content/site";

export function Pricing() {
  const section = useRef<HTMLElement>(null);

  /* Tilt 3D nos cards */
  useGSAP(
    () => {
      if (!canHover() || prefersReduced()) return;

      const cards = gsap.utils.toArray<HTMLElement>(".plan");
      const cleanups = cards.map((card) => {
        const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3" });
        const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3" });
        gsap.set(card, { transformPerspective: 900, transformOrigin: "center" });

        const move = (e: PointerEvent) => {
          const b = card.getBoundingClientRect();
          rx(gsap.utils.mapRange(0, b.height, 6, -6, e.clientY - b.top));
          ry(gsap.utils.mapRange(0, b.width, -7, 7, e.clientX - b.left));
        };
        const leave = () => {
          rx(0);
          ry(0);
        };

        card.addEventListener("pointermove", move);
        card.addEventListener("pointerleave", leave);
        return () => {
          card.removeEventListener("pointermove", move);
          card.removeEventListener("pointerleave", leave);
        };
      });

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: section, dependencies: [] }
  );

  return (
    <section className="section" id="comissao" ref={section}>
      <div className="wrap">
        <Fade as="p" className="eyebrow">
          Planos
        </Fade>
        <SplitReveal as="h2" className="h2" style={{ margin: "1.2rem 0 1.6rem" }}>
          Sem taxas escondidas
        </SplitReveal>
        <Fade as="p" className="lead">
          Não precisa se preocupar com taxas escondidas. O cadastro é gratuito, tanto para
          profissionais quanto para contratantes, e não há cobrança para publicar vagas ou se
          candidatar. A única cobrança da plataforma é opcional: destacar uma vaga no topo do feed.
        </Fade>

        <div className="pricing">
          {plans.map((plan) => (
            <article className={`plan${plan.accent ? " plan--accent" : ""}`} key={plan.label}>
              <span className="plan__label">{plan.label}</span>
              <span className="plan__price">{plan.price}</span>
              <span className="plan__note">{plan.note}</span>
              <ul className="plan__list">
                {plan.items.map((item) => (
                  <li className="plan__item" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
