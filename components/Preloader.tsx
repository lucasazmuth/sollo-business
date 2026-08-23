"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, prefersReduced } from "@/lib/gsap";
import { useReady } from "@/components/ReadyProvider";
import { site } from "@/content/site";

/**
 * Contador 0→100% que revela o logotipo por máscara,
 * seguido de uma cortina magenta que atravessa a tela.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const clip = useRef<SVGRectElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const { claim, markReady } = useReady();

  /* Avisa o provider que a abertura é controlada por aqui. */
  useEffect(() => claim(), [claim]);

  useGSAP(
    () => {
      document.body.classList.add("is-locked");

      const finish = () => {
        document.body.classList.remove("is-locked");
        markReady();
      };

      const state = { v: 0 };

      const tl = gsap.timeline({
        onComplete: () => {
          finish();
          setDone(true);
        }
      });

      tl.to(state, {
        v: 100,
        duration: prefersReduced() ? 0.3 : 1.9,
        ease: "power2.inOut",
        onUpdate() {
          const v = Math.round(state.v);
          if (pct.current) pct.current.textContent = `${v}%`;
          gsap.set(fill.current, { scaleX: v / 100 });
          gsap.set(clip.current, { attr: { width: (v / 100) * 1172 } });
        }
      })
        .to(root.current, { opacity: 0, duration: 0.5 }, "+=0.15")
        .set(root.current, { display: "none" })
        .fromTo(
          curtain.current,
          { y: "100%" },
          { y: "0%", duration: 0.6, ease: "power4.inOut" },
          "-=0.5"
        )
        .to(curtain.current, { y: "-100%", duration: 0.7, ease: "power4.inOut" }, "+=0.05")
        .set(curtain.current, { y: "100%" });
    },
    { dependencies: [] }
  );

  if (done) return null;

  return (
    <>
      <div className="loader" ref={root}>
        <div className="loader__inner">
          <svg className="loader__mark mark" viewBox="0 0 1172 311" aria-label="Sollo Business">
            <defs>
              <clipPath id="loaderClip">
                <rect ref={clip} x={0} y={0} width={0} height={311} />
              </clipPath>
            </defs>
            <g opacity={0.14}>
              <use href="#mk-wordmark" />
            </g>
            <g clipPath="url(#loaderClip)">
              <use href="#mk-wordmark" />
            </g>
          </svg>

          <div className="loader__bar">
            <span className="loader__fill" ref={fill} />
          </div>

          <div className="loader__meta">
            <span>{site.name}</span>
            <span ref={pct}>0%</span>
          </div>
        </div>
      </div>

      <div className="loader__curtain" ref={curtain} />
    </>
  );
}
