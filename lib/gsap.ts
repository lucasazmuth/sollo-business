"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";
import { Observer } from "gsap/Observer";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

/* Registro único dos plugins — importar deste módulo em qualquer componente. */
if (typeof window !== "undefined") {
  gsap.registerPlugin(
    useGSAP,
    ScrollTrigger,
    ScrollSmoother,
    ScrollToPlugin,
    SplitText,
    Observer,
    Draggable,
    InertiaPlugin
  );

  gsap.defaults({ ease: "power3.out", duration: 1 });

  /* Em desenvolvimento, expõe o gsap no console para inspecionar timelines. */
  if (process.env.NODE_ENV === "development") {
    (window as unknown as { gsap: typeof gsap }).gsap = gsap;
  }
}

export {
  gsap,
  useGSAP,
  ScrollTrigger,
  ScrollSmoother,
  ScrollToPlugin,
  SplitText,
  Observer,
  Draggable,
  InertiaPlugin
};

/** `prefers-reduced-motion` — só é confiável no cliente. */
export const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Ponteiro fino com hover real (desktop). */
export const canHover = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Refresh agrupado do ScrollTrigger — evita saltos durante interações. */
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
export function refreshSoon(delay = 120) {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => ScrollTrigger.refresh(), delay);
}
