"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReduced } from "@/lib/gsap";
import { SplitReveal, Fade } from "@/components/anim/Reveal";
import { communities } from "@/content/site";

export function Communities() {
  const section = useRef<HTMLElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const photo = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!prefersReduced()) {
        gsap.from(".chip", {
          y: 24,
          opacity: 0,
          scale: 0.92,
          stagger: { each: 0.04, from: "random" },
          duration: 0.8,
          scrollTrigger: { trigger: ".communities__cloud", start: "top 86%" }
        });

        /* Parallax suave da foto enquanto a seção passa */
        gsap.fromTo(
          photo.current,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: section.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          }
        );
      }

      const obj = { v: 0 };
      gsap.to(obj, {
        v: 200,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => {
          if (counter.current) counter.current.textContent = `${Math.round(obj.v)}+`;
        },
        scrollTrigger: { trigger: counter.current, start: "top 88%", once: true }
      });
    },
    { scope: section, dependencies: [] }
  );

  return (
    <section className="section" id="comunidades" ref={section}>
      <div className="wrap">
        <div className="communities__head">
          <div>
            <Fade as="p" className="eyebrow">
              Comunidades
            </Fade>
            <SplitReveal as="h2" className="h1 communities__title" style={{ marginTop: "1.2rem" }}>
              Projetos para todas as áreas do entretenimento
            </SplitReveal>
          </div>

          <figure className="communities__figure">
            <div className="communities__photo-inner" ref={photo}>
              <div className="communities__blobs" aria-hidden>
                <span className="blob communities__blob--1" />
                <span className="blob communities__blob--2" />
              </div>
            </div>
            <figcaption className="communities__caption">
              <span className="dot">●</span> Feito por gente do meio
            </figcaption>
          </figure>
        </div>

        <div className="communities__cloud">
          {communities.map((c) => (
            <span className="chip" key={c}>
              {c}
            </span>
          ))}
        </div>

        <div className="counter">
          <span className="lead" style={{ margin: 0 }}>
            …e mais de
          </span>
          <span className="counter__n" ref={counter}>
            0
          </span>
          <span className="counter__l">tipos de serviços</span>
        </div>
      </div>
    </section>
  );
}
