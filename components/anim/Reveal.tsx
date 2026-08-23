"use client";

import { createElement, useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, SplitText, prefersReduced } from "@/lib/gsap";
import { useReady } from "@/components/ReadyProvider";

type BaseProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** Espera o preloader terminar antes de animar (usado no hero). */
  waitReady?: boolean;
  style?: React.CSSProperties;
};

/**
 * Revelação tipográfica com SplitText.
 * `mode="chars"` — caractere a caractere (títulos de destaque).
 * `mode="lines"` — linha a linha (títulos de seção e blocos de texto).
 *
 * `autoSplit` refaz a divisão quando a fonte carrega ou a viewport muda,
 * evitando que as linhas quebrem caractere a caractere no resize.
 */
export function SplitReveal({
  as = "div",
  mode = "lines",
  className,
  children,
  waitReady = false,
  style
}: BaseProps & { mode?: "chars" | "lines" }) {
  const ref = useRef<HTMLElement>(null);
  const { ready } = useReady();
  const gate = waitReady ? ready : true;

  useGSAP(
    () => {
      if (!ref.current || !gate) return;

      if (prefersReduced()) {
        gsap.set(ref.current, { opacity: 1 });
        return;
      }

      SplitText.create(ref.current, {
        type: mode === "chars" ? "lines,chars" : "lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          return mode === "chars"
            ? gsap.from(self.chars, {
                yPercent: 118,
                opacity: 0,
                rotate: 3,
                stagger: { each: 0.014, from: "start" },
                duration: 1.15,
                ease: "power4.out",
                scrollTrigger: { trigger: ref.current, start: "top 88%" }
              })
            : gsap.from(self.lines, {
                yPercent: 110,
                opacity: 0,
                stagger: 0.08,
                duration: 1.1,
                ease: "power4.out",
                scrollTrigger: { trigger: ref.current, start: "top 88%" }
              });
        }
      });
    },
    { dependencies: [gate, mode], revertOnUpdate: true }
  );

  return createElement(as, { ref, className, style }, children);
}

/** Entrada simples (sobe + aparece) para elementos que não são texto corrido. */
export function Fade({ as = "div", className, children, style, delay = 0 }: BaseProps & { delay?: number }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current || prefersReduced()) return;
      gsap.from(ref.current, {
        y: 34,
        opacity: 0,
        duration: 1,
        delay,
        scrollTrigger: { trigger: ref.current, start: "top 92%" }
      });
    },
    { dependencies: [] }
  );

  return createElement(as, { ref, className, style }, children);
}
