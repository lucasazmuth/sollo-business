"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger, ScrollSmoother } from "@/lib/gsap";
import { Wordmark } from "@/components/BrandSprite";
import { nav, menuLinks, site } from "@/content/site";

export function Header() {
  const header = useRef<HTMLElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuTl = useRef<gsap.core.Timeline | null>(null);
  const [open, setOpen] = useState(false);

  useGSAP(
    () => {
      /* Fundo do header ao sair do topo */
      ScrollTrigger.create({
        start: "top -80",
        end: 99999,
        onToggle: (self) => header.current?.classList.toggle("is-stuck", self.isActive)
      });

      /* Barra de progresso da página */
      gsap.to(progress.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 }
      });

      /* Esconde ao descer, mostra ao subir */
      let last = 0;
      ScrollTrigger.create({
        start: "top top",
        end: "max",
        onUpdate(self) {
          const y = self.scroll();
          if (Math.abs(y - last) < 8) return;
          const down = y > last && y > 300;
          gsap.to(header.current, { yPercent: down ? -140 : 0, duration: 0.5, overwrite: true });
          last = y;
        }
      });

      /* Timeline do menu mobile */
      menuTl.current = gsap
        .timeline({ paused: true })
        .to(menu.current, { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "power4.inOut" })
        .from(
          menu.current!.querySelectorAll(".menu__link, .menu__foot"),
          { yPercent: 120, opacity: 0, stagger: 0.06, duration: 0.6 },
          "-=0.35"
        );

      /* Fecha o menu quando uma âncora é acionada */
      const close = () => setOpen(false);
      document.body.addEventListener("sollo:navigate", close);
      return () => document.body.removeEventListener("sollo:navigate", close);
    },
    { dependencies: [] }
  );

  useGSAP(
    () => {
      if (!menuTl.current) return;
      document.body.classList.toggle("menu-open", open);
      ScrollSmoother.get()?.paused(open);
      open ? menuTl.current.play() : menuTl.current.reverse();
    },
    { dependencies: [open] }
  );

  return (
    <>
      <header className="header" ref={header}>
        <div className="wrap header__row">
          <a className="header__logo mark" href="#top" aria-label="Sollo Business, início">
            <Wordmark className="mark" />
          </a>

          <nav className="nav" aria-label="Principal">
            <ul className="nav__list nav">
              {nav.map((item) => (
                <li key={item.href}>
                  <a className="nav__link" href={item.href}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <a className="btn header__cta" href="#contato">
              Criar meu perfil
            </a>

            <button
              className="nav__toggle"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              aria-controls="menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          </nav>
        </div>
      </header>

      <div
        className={`menu${open ? " is-open" : ""}`}
        id="menu"
        ref={menu}
        aria-hidden={!open}
      >
        {menuLinks.map((item) => (
          <a className="menu__link" key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
        <div className="menu__foot">{site.email}</div>
      </div>

      <div className="progress" ref={progress} />
    </>
  );
}
