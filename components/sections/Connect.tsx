"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, useGSAP, refreshSoon } from "@/lib/gsap";
import { SplitReveal, Fade } from "@/components/anim/Reveal";
import { MagneticLink } from "@/components/anim/Magnetic";
import { connectTabs } from "@/content/site";

/** Abas Contratantes / Profissionais com pílula deslizante. */
export function Connect() {
  const section = useRef<HTMLElement>(null);
  const switcher = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);

  const movePill = (index: number, animate: boolean) => {
    const tab = tabRefs.current[index];
    if (!tab || !switcher.current) return;
    const box = tab.getBoundingClientRect();
    const parent = switcher.current.getBoundingClientRect();
    gsap[animate ? "to" : "set"](pill.current, {
      x: box.left - parent.left - 5,
      width: box.width,
      duration: 0.6,
      ease: "power4.out"
    });
  };

  useGSAP(
    () => {
      movePill(active, false);

      const onResize = () => movePill(active, false);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    },
    { scope: section, dependencies: [] }
  );

  useGSAP(
    () => {
      movePill(active, true);
      gsap.fromTo(
        `#panel-${connectTabs[active].id}`,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", onComplete: () => refreshSoon() }
      );
    },
    { scope: section, dependencies: [active] }
  );

  return (
    <section className="section" id="conecte-se" ref={section}>
      <div className="wrap">
        <Fade as="p" className="eyebrow">
          Conecte-se
        </Fade>
        <SplitReveal as="h2" className="h1" style={{ margin: "1.2rem 0 clamp(2rem,4vh,3rem)" }}>
          Terra prometida para mentes inovadoras
        </SplitReveal>

        <div className="connect__switch" ref={switcher} role="tablist" aria-label="Perfis">
          <span className="connect__pill" ref={pill} />
          {connectTabs.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              className={`connect__tab${i === active ? " is-active" : ""}`}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={i === active}
              aria-controls={`panel-${t.id}`}
              onClick={() => setActive(i)}
            >
              {t.tab}
            </button>
          ))}
        </div>

        <div className="connect__panels">
          {connectTabs.map((t, i) => (
            <div
              key={t.id}
              className="connect__panel"
              id={`panel-${t.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${t.id}`}
              hidden={i !== active}
            >
              <div>
                <h3 className="h2">{t.title}</h3>
                <p className="lead" style={{ marginTop: "1.4rem" }}>
                  {t.text}
                </p>

                <div className="connect__stats">
                  {t.stats.map((s) => (
                    <div className="stat" key={s.l}>
                      <div className="stat__n">{s.n}</div>
                      <div className="stat__l">{s.l}</div>
                    </div>
                  ))}
                </div>

                <MagneticLink
                  className={`btn${t.cta.variant === "lime" ? " btn--lime" : ""}`}
                  href="#contato"
                  style={{ marginTop: "2rem" }}
                >
                  {t.cta.label}
                </MagneticLink>
              </div>

              <figure className="connect__figure">
                <Image
                  src={t.image.src}
                  alt={t.image.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="connect__photo"
                  priority={i === 0}
                />
                <span className="connect__figure-tint" aria-hidden />
              </figure>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
