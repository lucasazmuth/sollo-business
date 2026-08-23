"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, refreshSoon } from "@/lib/gsap";
import { SplitReveal, Fade } from "@/components/anim/Reveal";
import { faq, site } from "@/content/site";

export function Faq() {
  const section = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  useGSAP(
    () => {
      faq.forEach((_, i) => {
        gsap.to(`[data-faq="${i}"] .faq__a`, {
          height: i === open ? "auto" : 0,
          duration: 0.6,
          ease: "power3.inOut",
          onComplete: () => refreshSoon()
        });
      });
    },
    { scope: section, dependencies: [open] }
  );

  return (
    <section className="section" id="faq" ref={section}>
      <div className="wrap">
        <Fade as="p" className="eyebrow">
          FAQ
        </Fade>
        <SplitReveal as="h2" className="h2" style={{ margin: "1.2rem 0 1.4rem" }}>
          Perguntas frequentes
        </SplitReveal>
        <Fade as="p" className="lead">
          <>
            Você tem mais perguntas? Nós preparamos algumas respostas para você. Mas se você
            precisar de mais, apenas envie um e-mail para{" "}
            <a href={`mailto:${site.email}`} style={{ color: "var(--magenta)" }}>
              {site.email}
            </a>
            .
          </>
        </Fade>

        {/* PLACEHOLDER: respostas redigidas a partir da copy — validar com o time. */}
        <div className="faq">
          {faq.map((item, i) => (
            <div
              className={`faq__item${i === open ? " is-open" : ""}`}
              data-faq={i}
              key={item.q}
            >
              <button
                className="faq__q"
                aria-expanded={i === open}
                onClick={() => setOpen(i === open ? null : i)}
              >
                {item.q}
                <span className="faq__sign" />
              </button>
              <div className="faq__a" style={{ height: 0 }}>
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
