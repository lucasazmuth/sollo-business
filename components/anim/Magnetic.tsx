"use client";

import { useRef } from "react";
import { gsap, useGSAP, canHover, prefersReduced } from "@/lib/gsap";

type Props = {
  href: string;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

/** Link com efeito magnético — segue levemente o cursor e volta com elástico. */
export function MagneticLink({ href, className, children, style }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !canHover() || prefersReduced()) return;

      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "elastic.out(1, 0.4)" });

      const move = (e: PointerEvent) => {
        const b = el.getBoundingClientRect();
        xTo((e.clientX - (b.left + b.width / 2)) * 0.35);
        yTo((e.clientY - (b.top + b.height / 2)) * 0.45);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { dependencies: [] }
  );

  return (
    <a ref={ref} href={href} className={className} style={style}>
      {children}
    </a>
  );
}
