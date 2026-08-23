"use client";

import { useRef } from "react";
import { gsap, useGSAP, canHover, prefersReduced } from "@/lib/gsap";

/** Bolinha magenta que segue o ponteiro e cresce sobre elementos interativos. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = dot.current;
      if (!el || !canHover() || prefersReduced()) return;

      const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });

      const move = (e: PointerEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };

      const grow = (size: number, text: string) => {
        gsap.to(el, {
          width: size,
          height: size,
          margin: `${-size / 2}px 0 0 ${-size / 2}px`,
          duration: 0.4
        });
        gsap.to(label.current, { opacity: text ? 1 : 0, duration: 0.3 });
        if (text && label.current) label.current.textContent = text;
      };

      const over = (e: PointerEvent) => {
        const t = (e.target as HTMLElement)?.closest?.(
          "a, button, [data-cursor], .chip, .service"
        ) as HTMLElement | null;
        if (!t) return;
        grow(t.dataset.cursor ? 88 : 46, t.dataset.cursor ?? "");
      };

      const out = (e: PointerEvent) => {
        const t = (e.target as HTMLElement)?.closest?.(
          "a, button, [data-cursor], .chip, .service"
        );
        if (t) grow(14, "");
      };

      window.addEventListener("pointermove", move);
      document.addEventListener("pointerover", over);
      document.addEventListener("pointerout", out);

      return () => {
        window.removeEventListener("pointermove", move);
        document.removeEventListener("pointerover", over);
        document.removeEventListener("pointerout", out);
      };
    },
    { dependencies: [] }
  );

  return (
    <div className="cursor" ref={dot} aria-hidden>
      <span className="cursor__label" ref={label}>
        arraste
      </span>
    </div>
  );
}
