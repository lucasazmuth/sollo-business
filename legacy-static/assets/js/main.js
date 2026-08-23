/* =========================================================
   SOLLO — Landing page interativa
   GSAP 3 + ScrollTrigger / ScrollSmoother / SplitText / Draggable
   ========================================================= */

(() => {
  "use strict";

  gsap.registerPlugin(
    ScrollTrigger,
    ScrollSmoother,
    SplitText,
    ScrollToPlugin,
    Observer,
    Draggable,
    InertiaPlugin
  );

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CAN_HOVER = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  gsap.defaults({ ease: "power3.out", duration: 1 });

  let smoother = null;

  /* Refresh do ScrollTrigger agrupado — evita saltos durante interações */
  let refreshTimer = null;
  const refreshSoon = () => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 120);
  };

  /* ---------------------------------------------------------
     1. Scroll suave
     --------------------------------------------------------- */
  function initSmoother() {
    if (REDUCED || !ScrollSmoother.create) return;
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.15,
      effects: true,
      ignoreMobileResize: true
    });
  }

  /* ---------------------------------------------------------
     2. Preloader
     --------------------------------------------------------- */
  function initLoader(onDone) {
    const loader = $("#loader");
    const fill = $("#loaderFill");
    const pct = $("#loaderPct");
    const clip = $("#loaderClipRect");
    const curtain = $("#curtain");

    if (!loader) return onDone();

    document.body.classList.add("is-locked");

    const state = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        document.body.classList.remove("is-locked");
        onDone();
      }
    });

    tl.to(state, {
      v: 100,
      duration: REDUCED ? 0.3 : 1.9,
      ease: "power2.inOut",
      onUpdate() {
        const v = Math.round(state.v);
        pct.textContent = v + "%";
        gsap.set(fill, { scaleX: v / 100 });
        gsap.set(clip, { attr: { width: (v / 100) * 1172 } });
      }
    })
      .to(loader, { opacity: 0, duration: 0.5 }, "+=0.15")
      .set(loader, { display: "none" })
      .fromTo(
        curtain,
        { y: "100%" },
        { y: "0%", duration: 0.6, ease: "power4.inOut" },
        "-=0.5"
      )
      .to(curtain, { y: "-100%", duration: 0.7, ease: "power4.inOut" }, "+=0.05")
      .set(curtain, { y: "100%" });

    return tl;
  }

  /* ---------------------------------------------------------
     3. Cursor personalizado
     --------------------------------------------------------- */
  function initCursor() {
    if (!CAN_HOVER || REDUCED) return;
    const cursor = $("#cursor");
    const label = $("#cursorLabel");
    if (!cursor) return;

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });

    window.addEventListener("pointermove", (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    });

    const grow = (size, text) => {
      gsap.to(cursor, { width: size, height: size, margin: -size / 2 + "px 0 0 " + -size / 2 + "px", duration: 0.4 });
      gsap.to(label, { opacity: text ? 1 : 0, duration: 0.3 });
      if (text) label.textContent = text;
    };

    $$("a, button, [data-cursor], .chip, .service").forEach((el) => {
      el.addEventListener("pointerenter", () => grow(el.dataset.cursor ? 88 : 46, el.dataset.cursor || ""));
      el.addEventListener("pointerleave", () => grow(14, ""));
    });
  }

  /* ---------------------------------------------------------
     4. Header, menu e progresso
     --------------------------------------------------------- */
  function initHeader() {
    const header = $("#header");
    const progress = $("#progress");
    const toggle = $("#navToggle");
    const menu = $("#menu");

    ScrollTrigger.create({
      start: "top -80",
      end: 99999,
      onToggle: (self) => header.classList.toggle("is-stuck", self.isActive)
    });

    gsap.to(progress, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3 }
    });

    /* Esconde o header ao descer, mostra ao subir */
    let last = 0;
    ScrollTrigger.create({
      start: "top top",
      end: "max",
      onUpdate(self) {
        const y = self.scroll();
        if (Math.abs(y - last) < 8) return;
        const down = y > last && y > 300;
        gsap.to(header, { yPercent: down ? -140 : 0, duration: 0.5, overwrite: true });
        last = y;
      }
    });

    /* Menu mobile */
    let open = false;
    const menuTl = gsap
      .timeline({ paused: true })
      .to(menu, { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "power4.inOut" })
      .from($$(".menu__link, .menu__foot", menu), { yPercent: 120, opacity: 0, stagger: 0.06, duration: 0.6 }, "-=0.35");

    toggle.addEventListener("click", () => {
      open = !open;
      document.body.classList.toggle("menu-open", open);
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", String(!open));
      toggle.setAttribute("aria-expanded", String(open));
      open ? menuTl.play() : menuTl.reverse();
      if (smoother) smoother.paused(open);
    });

    /* Navegação suave */
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (!id || id === "#" || !$(id)) return;
        e.preventDefault();
        if (open) toggle.click();
        if (smoother) {
          smoother.scrollTo(id, true, "top top");
        } else {
          gsap.to(window, { scrollTo: { y: id, autoKill: true }, duration: 1.2, ease: "power3.inOut" });
        }
      });
    });
  }

  /* ---------------------------------------------------------
     5. Tipografia animada (SplitText)
     --------------------------------------------------------- */
  function initText() {
    /* Títulos por caractere — autoSplit re-divide no resize/troca de fonte */
    $$('[data-split="chars"]').forEach((el) => {
      SplitText.create(el, {
        type: "lines,chars",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.chars, {
            yPercent: 118,
            opacity: 0,
            rotate: 3,
            stagger: { each: 0.014, from: "start" },
            duration: 1.15,
            ease: "power4.out",
            scrollTrigger: { trigger: el, start: "top 88%" }
          });
        }
      });
    });

    /* Títulos e blocos por linha */
    $$('[data-split="lines"]').forEach((el) => {
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 110,
            opacity: 0,
            stagger: 0.08,
            duration: 1.1,
            ease: "power4.out",
            scrollTrigger: { trigger: el, start: "top 88%" }
          });
        }
      });
    });

    /* Elementos simples */
    $$("[data-fade]").forEach((el) => {
      gsap.from(el, {
        y: 34,
        opacity: 0,
        duration: 1,
        scrollTrigger: { trigger: el, start: "top 92%" }
      });
    });
  }

  /* ---------------------------------------------------------
     6. Hero — parallax de mouse e saída no scroll
     --------------------------------------------------------- */
  function initHero() {
    const scene = $("[data-parallax-scene]");
    const mark = $("#heroMark");

    if (scene && CAN_HOVER && !REDUCED) {
      const layers = $$(".blob", scene).map((el) => ({
        el,
        depth: parseFloat(el.dataset.depth) || 0.1,
        x: gsap.quickTo(el, "x", { duration: 1.1, ease: "power3" }),
        y: gsap.quickTo(el, "y", { duration: 1.1, ease: "power3" })
      }));

      window.addEventListener("pointermove", (e) => {
        const dx = e.clientX - window.innerWidth / 2;
        const dy = e.clientY - window.innerHeight / 2;
        layers.forEach((l) => {
          l.x(dx * l.depth);
          l.y(dy * l.depth);
        });
      });
    }

    /* Respiro contínuo dos blobs */
    if (!REDUCED) {
      $$(".blob, [data-float]").forEach((el, i) => {
        gsap.to(el, {
          scale: 1.08,
          duration: 4 + i,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      });
    }

    /* Saída cinematográfica do hero */
    gsap.to(".hero__content", {
      yPercent: -12,
      opacity: 0.15,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    gsap.to(".hero__bg", {
      yPercent: 16,
      scale: 1.14,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    if (mark) {
      gsap.to(mark, {
        rotate: 190,
        yPercent: 60,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 }
      });
    }
  }

  /* ---------------------------------------------------------
     7. Marquee infinito com resposta à velocidade do scroll
     --------------------------------------------------------- */
  function initMarquee() {
    $$("[data-marquee]").forEach((wrap) => {
      const track = $(".marquee__track", wrap);
      if (!track) return;

      /* Duplica o conteúdo até cobrir o dobro da largura da viewport */
      const original = track.innerHTML;
      while (track.scrollWidth < window.innerWidth * 2) track.innerHTML += original;

      const speed = parseFloat(wrap.dataset.marqueeSpeed) || 1;
      const distance = track.scrollWidth / 2;
      const tl = gsap.to(track, {
        x: -distance,
        duration: distance / (60 * speed),
        ease: "none",
        repeat: -1,
        modifiers: { x: (x) => (parseFloat(x) % distance) + "px" }
      });

      if (REDUCED) tl.pause();

      /* A velocidade do scroll acelera e inclina o marquee */
      ScrollTrigger.create({
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-3, 3, self.getVelocity() / 900);
          gsap.to(tl, { timeScale: 1 + Math.abs(v), duration: 0.4, overwrite: true });
          gsap.to(track, { skewX: -v * 3, duration: 0.5, overwrite: true });
        }
      });
    });
  }

  /* ---------------------------------------------------------
     8. Como funciona — scroll horizontal com pin
     --------------------------------------------------------- */
  function initSteps() {
    const section = $("#como-funciona");
    const track = $("#stepsTrack");
    const bar = $("#stepsProgress");
    if (!section || !track) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 761px)", () => {
      const shift = () => track.scrollWidth - window.innerWidth + 64;

      const tween = gsap.to(track, {
        x: () => -shift(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + shift(),
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => gsap.set(bar, { scaleX: self.progress })
        }
      });

      /* Cada card entra com leve escala */
      $$(".step", track).forEach((step) => {
        gsap.from(step, {
          scale: 0.94,
          opacity: 0.35,
          duration: 0.6,
          scrollTrigger: {
            trigger: step,
            containerAnimation: tween,
            start: "left 92%",
            end: "left 55%",
            scrub: true
          }
        });
      });

      return () => gsap.set(track, { x: 0 });
    });

    /* Mobile: rolagem horizontal nativa */
    mm.add("(max-width: 760px)", () => {
      const vp = $("#stepsViewport");
      vp.style.overflowX = "auto";
      vp.style.scrollSnapType = "x mandatory";
      $$(".step", track).forEach((s) => (s.style.scrollSnapAlign = "center"));
      gsap.set(bar, { scaleX: 1, opacity: 0.4 });
      return () => {
        vp.style.overflowX = "";
        vp.style.scrollSnapType = "";
      };
    });
  }

  /* ---------------------------------------------------------
     9. Serviços — acordeão sincronizado com o painel visual
     --------------------------------------------------------- */
  function initServices() {
    const list = $("#servicesList");
    if (!list) return;

    const items = $$(".service", list);
    const cards = $$(".services__card");
    let active = -1;

    const open = (i) => {
      if (i === active) return;
      active = i;

      items.forEach((item, idx) => {
        const text = $(".service__text", item);
        const on = idx === i;
        item.classList.toggle("is-active", on);
        gsap.to(text, {
          height: on ? "auto" : 0,
          opacity: on ? 1 : 0,
          duration: 0.7,
          ease: "power3.inOut"
        });
        gsap.to($(".service__body", item), { x: on ? 14 : 0, duration: 0.6 });
      });

      cards.forEach((card, idx) => {
        gsap.to(card, {
          opacity: idx === i ? 1 : 0,
          scale: idx === i ? 1 : 1.06,
          duration: 0.8,
          ease: "power3.out"
        });
      });

      refreshSoon();
    };

    items.forEach((item, i) => {
      item.addEventListener("click", () => open(i === active ? -1 : i));
      item.addEventListener("pointerenter", () => CAN_HOVER && open(i));
    });

    /* Abre o primeiro item ao entrar na seção */
    ScrollTrigger.create({
      trigger: "#servicos",
      start: "top 60%",
      once: true,
      onEnter: () => open(0)
    });
  }

  /* ---------------------------------------------------------
     10. Conecte-se — abas com pílula deslizante
     --------------------------------------------------------- */
  function initTabs() {
    const wrap = $("#connectSwitch");
    if (!wrap) return;

    const pill = $("#connectPill");
    const tabs = $$(".connect__tab", wrap);
    const panels = tabs.map((t) => $("#" + t.getAttribute("aria-controls")));

    const movePill = (tab, animate = true) => {
      const box = tab.getBoundingClientRect();
      const parent = wrap.getBoundingClientRect();
      gsap[animate ? "to" : "set"](pill, {
        x: box.left - parent.left - 5,
        width: box.width,
        duration: 0.6,
        ease: "power4.out"
      });
    };

    const select = (i) => {
      tabs.forEach((tab, idx) => {
        const on = idx === i;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", String(on));
        const panel = panels[idx];
        if (on) {
          panel.hidden = false;
          gsap.fromTo(
            panel,
            { opacity: 0, y: 26 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", onComplete: refreshSoon }
          );
        } else {
          gsap.to(panel, { opacity: 0, duration: 0.25, onComplete: () => (panel.hidden = true) });
        }
      });
      movePill(tabs[i]);
    };

    tabs.forEach((tab, i) => tab.addEventListener("click", () => select(i)));
    movePill(tabs[0], false);
    window.addEventListener("resize", () => movePill($(".connect__tab.is-active", wrap), false));
  }

  /* ---------------------------------------------------------
     11. Contadores
     --------------------------------------------------------- */
  function initCounters() {
    $$("[data-count]").forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const obj = { v: 0 };
      gsap.to(obj, {
        v: end,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => (el.textContent = Math.round(obj.v) + suffix),
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });
  }

  /* ---------------------------------------------------------
     12. Chips e planos
     --------------------------------------------------------- */
  function initChips() {
    const chips = $$(".chip");
    if (chips.length) {
      gsap.from(chips, {
        y: 24,
        opacity: 0,
        scale: 0.92,
        stagger: { each: 0.04, from: "random" },
        duration: 0.8,
        scrollTrigger: { trigger: "#chips", start: "top 86%" }
      });
    }

    /* Tilt 3D nos cards de comissão */
    if (!CAN_HOVER || REDUCED) return;
    $$("[data-tilt]").forEach((card) => {
      const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3" });
      const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3" });
      gsap.set(card, { transformPerspective: 900, transformOrigin: "center" });

      card.addEventListener("pointermove", (e) => {
        const b = card.getBoundingClientRect();
        rx(gsap.utils.mapRange(0, b.height, 6, -6, e.clientY - b.top));
        ry(gsap.utils.mapRange(0, b.width, -7, 7, e.clientX - b.left));
      });
      card.addEventListener("pointerleave", () => {
        rx(0);
        ry(0);
      });
    });
  }

  /* ---------------------------------------------------------
     13. Depoimentos — carrossel arrastável
     --------------------------------------------------------- */
  function initQuotes() {
    const track = $("#quotesTrack");
    if (!track) return;

    const bounds = () => ({
      minX: -(track.scrollWidth - window.innerWidth + 32),
      maxX: 0
    });

    Draggable.create(track, {
      type: "x",
      inertia: true,
      edgeResistance: 0.85,
      bounds: bounds(),
      onPress() {
        this.applyBounds(bounds());
      }
    });

    /* Também avança com o scroll da página */
    gsap.to(track, {
      x: () => bounds().minX * 0.35,
      ease: "none",
      scrollTrigger: {
        trigger: "#depoimentos",
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
        invalidateOnRefresh: true
      }
    });
  }

  /* ---------------------------------------------------------
     14. FAQ
     --------------------------------------------------------- */
  function initFaq() {
    $$(".faq__item").forEach((item) => {
      const btn = $(".faq__q", item);
      const panel = $(".faq__a", item);
      gsap.set(panel, { height: 0 });

      btn.addEventListener("click", () => {
        const isOpen = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(isOpen));
        gsap.to(panel, {
          height: isOpen ? "auto" : 0,
          duration: 0.6,
          ease: "power3.inOut",
          onComplete: refreshSoon
        });
      });
    });
  }

  /* ---------------------------------------------------------
     15. Botões magnéticos
     --------------------------------------------------------- */
  function initMagnetic() {
    if (!CAN_HOVER || REDUCED) return;
    $$("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "elastic.out(1, 0.4)" });

      el.addEventListener("pointermove", (e) => {
        const b = el.getBoundingClientRect();
        xTo((e.clientX - (b.left + b.width / 2)) * 0.35);
        yTo((e.clientY - (b.top + b.height / 2)) * 0.45);
      });
      el.addEventListener("pointerleave", () => {
        xTo(0);
        yTo(0);
      });
    });
  }

  /* ---------------------------------------------------------
     16. Formulário (sem back-end — apenas feedback visual)
     --------------------------------------------------------- */
  function initForm() {
    const form = $("#contactForm");
    const note = $("#formNote");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        note.textContent = "Preencha nome, e-mail e uma descrição do projeto.";
        return;
      }
      note.textContent = "Conecte este formulário ao seu back-end para enviar de verdade.";
      gsap.fromTo(note, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5 });
    });
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  function boot() {
    $("#year").textContent = new Date().getFullYear();

    initSmoother();
    initHeader();
    initText();
    initHero();
    initMarquee();
    initSteps();
    initServices();
    initTabs();
    initCounters();
    initChips();
    initQuotes();
    initFaq();
    initMagnetic();
    initCursor();
    initForm();

    ScrollTrigger.refresh();
  }

  /* Espera as fontes para o SplitText medir as linhas corretamente */
  const start = () => initLoader(boot);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
  } else {
    window.addEventListener("load", start);
  }
})();
