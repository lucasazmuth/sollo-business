"use client";

import { useRef } from "react";
import { gsap, useGSAP, canHover, prefersReduced } from "@/lib/gsap";
import { SplitReveal, Fade } from "@/components/anim/Reveal";
import { MagneticLink } from "@/components/anim/Magnetic";
import { IconMark } from "@/components/BrandSprite";
import { site } from "@/content/site";

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const mark = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const reduced = prefersReduced();
      let cleanup: (() => void) | undefined;

      /* Parallax dos blobs pelo mouse */
      if (scene.current && canHover() && !reduced) {
        const layers = Array.from(scene.current.querySelectorAll<HTMLElement>(".blob")).map((el) => ({
          depth: parseFloat(el.dataset.depth ?? "0.1"),
          x: gsap.quickTo(el, "x", { duration: 1.1, ease: "power3" }),
          y: gsap.quickTo(el, "y", { duration: 1.1, ease: "power3" })
        }));

        const move = (e: PointerEvent) => {
          const dx = e.clientX - window.innerWidth / 2;
          const dy = e.clientY - window.innerHeight / 2;
          layers.forEach((l) => {
            l.x(dx * l.depth);
            l.y(dy * l.depth);
          });
        };

        window.addEventListener("pointermove", move);
        cleanup = () => window.removeEventListener("pointermove", move);
      }

      /* Respiro contínuo dos blobs */
      if (!reduced) {
        gsap.utils.toArray<HTMLElement>(".blob").forEach((el, i) => {
          gsap.to(el, { scale: 1.08, duration: 4 + i, repeat: -1, yoyo: true, ease: "sine.inOut" });
        });
      }

      /* Saída cinematográfica */
      gsap.to(".hero__content", {
        yPercent: -12,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: "bottom top", scrub: true }
      });

      gsap.to(".hero__bg", {
        yPercent: 16,
        scale: 1.14,
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: "bottom top", scrub: true }
      });

      gsap.to(mark.current, {
        rotate: 190,
        yPercent: 60,
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: "bottom top", scrub: 0.6 }
      });

      return () => cleanup?.();
    },
    { scope: section, dependencies: [] }
  );

  return (
    <section className="hero" id="hero" ref={section}>
      <div className="hero__bg" ref={scene} aria-hidden>
        <div className="blob blob--1" data-depth="0.06" />
        <div className="blob blob--2" data-depth="0.12" />
        <div className="blob blob--3" data-depth="0.2" />
      </div>
      <div className="hero__grain" aria-hidden />

      <IconMark className="hero__mark mark" ref={mark} />

      <div className="wrap hero__content">
        <Fade as="p" className="eyebrow">
          {site.name}
        </Fade>

        <SplitReveal as="h1" mode="chars" className="hero__title" waitReady>
          O marketplace pensado para o mercado do <em>entretenimento</em>
        </SplitReveal>

        <div className="hero__foot">
          <Fade as="p" className="lead">
            Encontre os melhores talentos do mercado, colabore em projetos e tire suas ideias do
            papel. Conecte-se, negocie e entregue com facilidade e segurança.
          </Fade>

          <Fade className="hero__actions">
            <MagneticLink className="btn" href="#contato">
              Começar agora
            </MagneticLink>
            <MagneticLink className="btn btn--ghost" href="#como-funciona">
              Como funciona
            </MagneticLink>
          </Fade>
        </div>

        <Fade style={{ marginTop: "clamp(1.6rem,4vh,2.6rem)" }}>
          <span className="scroll-hint">
            <span className="scroll-hint__line" /> role para explorar
          </span>
        </Fade>
      </div>
    </section>
  );
}
