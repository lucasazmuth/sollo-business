"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollSmoother, ScrollTrigger, prefersReduced } from "@/lib/gsap";

/**
 * Envolve a página no wrapper/content exigidos pelo ScrollSmoother
 * e centraliza a navegação suave por âncoras (header, menu e rodapé).
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      let smoother: ScrollSmoother | null = null;

      if (!prefersReduced()) {
        smoother = ScrollSmoother.create({
          wrapper: wrapper.current!,
          content: content.current!,
          smooth: 1.15,
          effects: true,
          ignoreMobileResize: true
        });
      }

      const onClick = (e: MouseEvent) => {
        const link = (e.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
        if (!link) return;

        const id = link.getAttribute("href");
        if (!id || id === "#" || !document.querySelector(id)) return;

        e.preventDefault();
        document.body.dispatchEvent(new CustomEvent("sollo:navigate"));

        if (smoother) {
          smoother.scrollTo(id, true, "top top");
        } else {
          gsap.to(window, { scrollTo: { y: id, autoKill: true }, duration: 1.2, ease: "power3.inOut" });
        }
      };

      document.addEventListener("click", onClick);

      /* Depois que as fontes carregam, as medidas mudam. */
      document.fonts?.ready.then(() => ScrollTrigger.refresh());

      return () => document.removeEventListener("click", onClick);
    },
    { dependencies: [] }
  );

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content" ref={content}>
        {children}
      </div>
    </div>
  );
}
