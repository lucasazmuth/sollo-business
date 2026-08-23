"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger, canHover, refreshSoon } from "@/lib/gsap";
import { SplitReveal, Fade } from "@/components/anim/Reveal";
import { services } from "@/content/site";

/** Acordeão de serviços sincronizado com o painel visual sticky. */
export function Services() {
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(-1);

  /* Abre o primeiro item quando a seção entra na tela */
  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: section.current,
        start: "top 60%",
        once: true,
        onEnter: () => setActive((v) => (v === -1 ? 0 : v))
      });
    },
    { dependencies: [] }
  );

  useGSAP(
    () => {
      services.forEach((_, i) => {
        const on = i === active;
        gsap.to(`[data-service="${i}"] .service__text`, {
          height: on ? "auto" : 0,
          opacity: on ? 1 : 0,
          duration: 0.7,
          ease: "power3.inOut"
        });
        gsap.to(`[data-service="${i}"] .service__body`, { x: on ? 14 : 0, duration: 0.6 });
        gsap.to(`[data-card="${i}"]`, {
          opacity: on ? 1 : 0,
          scale: on ? 1 : 1.06,
          duration: 0.8,
          ease: "power3.out"
        });
      });

      refreshSoon();
    },
    { scope: section, dependencies: [active] }
  );

  return (
    <section className="section" id="servicos" ref={section}>
      <div className="wrap">
        <Fade as="p" className="eyebrow">
          Serviços
        </Fade>
        <SplitReveal
          as="h2"
          className="h1"
          style={{ margin: "1.2rem 0 clamp(2.5rem,5vh,4rem)" }}
        >
          Funcionalidades que trabalham por você
        </SplitReveal>

        <div className="services__grid">
          <div className="services__list">
            {services.map((service, i) => (
              <article
                className={`service${i === active ? " is-active" : ""}`}
                data-service={i}
                key={service.n}
                onClick={() => setActive(i === active ? -1 : i)}
                onPointerEnter={() => canHover() && setActive(i)}
              >
                <span className="service__n">{service.n}</span>
                <div className="service__body">
                  <h3 className="service__title">{service.title}</h3>
                  <div className="service__text">
                    <p>{service.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="services__visual" aria-hidden>
            {services.map((service, i) => (
              <div className="services__card" data-card={i} key={service.n}>
                <span className="services__card-n">{service.n}</span>
                <span className="services__card-title">{service.title}</span>
                <span className="services__card-sub">{service.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
