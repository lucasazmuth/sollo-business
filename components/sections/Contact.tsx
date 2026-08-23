"use client";

import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { SplitReveal, Fade } from "@/components/anim/Reveal";
import { MagneticLink } from "@/components/anim/Magnetic";
import { site } from "@/content/site";

type Status = "idle" | "sending" | "ok" | "error";

export function Contact() {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [note, setNote] = useState(
    "Configure CONTACT_WEBHOOK_URL na Vercel para receber as mensagens."
  );

  const shake = () => {
    gsap.fromTo(form.current, { x: -8 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = form.current;
    if (!el) return;

    if (!el.checkValidity()) {
      shake();
      setStatus("error");
      setNote("Preencha nome, e-mail e uma descrição do projeto.");
      return;
    }

    setStatus("sending");
    setNote("Enviando…");

    const data = Object.fromEntries(new FormData(el).entries());

    try {
      const res = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const json = await res.json();

      if (res.ok) {
        setStatus("ok");
        setNote("Mensagem enviada. Retornamos em breve!");
        el.reset();
      } else {
        setStatus("error");
        setNote(json.error ?? "Não foi possível enviar agora.");
        shake();
      }
    } catch {
      setStatus("error");
      setNote("Falha de conexão. Tente novamente.");
      shake();
    }
  }

  return (
    <section className="section" id="contato">
      <div className="wrap contact">
        <div>
          <Fade as="p" className="eyebrow">
            Parcerias
          </Fade>
          <SplitReveal as="h2" className="h1" style={{ margin: "1.2rem 0 1.4rem" }}>
            <>
              Quer ser parceiro<span className="dot">?</span>
            </>
          </SplitReveal>
          <Fade as="p" className="lead">
            Conte-nos mais sobre seu projeto, ou envie-nos um e-mail para
          </Fade>
          <MagneticLink
            className="mailto"
            href={`mailto:${site.email}`}
            style={{ marginTop: "1rem" }}
          >
            {site.email}
          </MagneticLink>
        </div>

        <form className="form" ref={form} onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              name="nome"
              type="text"
              autoComplete="name"
              placeholder="Como podemos te chamar?"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="projeto">Seu projeto</label>
            <textarea
              id="projeto"
              name="projeto"
              placeholder="Conte-nos mais sobre seu projeto"
              required
            />
          </div>

          <button className="btn" type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Enviando…" : "Enviar mensagem"}
          </button>

          <p className="form__note" role="status">
            {note}
          </p>
        </form>
      </div>
    </section>
  );
}
