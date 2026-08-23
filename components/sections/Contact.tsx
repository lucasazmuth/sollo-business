import { SplitReveal, Fade } from "@/components/anim/Reveal";
import { MagneticLink } from "@/components/anim/Magnetic";
import { site } from "@/content/site";

export function Contact() {
  return (
    <section className="section" id="contato">
      <div className="wrap contact contact--single">
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
            Conte-nos mais sobre seu projeto pelo e-mail
          </Fade>
          <MagneticLink
            className="mailto"
            href={`mailto:${site.email}`}
            style={{ marginTop: "1rem" }}
          >
            {site.email}
          </MagneticLink>
        </div>
      </div>
    </section>
  );
}
