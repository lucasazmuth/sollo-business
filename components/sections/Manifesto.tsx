import { SplitReveal, Fade } from "@/components/anim/Reveal";

export function Manifesto() {
  return (
    <section className="section" id="manifesto">
      <div className="wrap manifesto__grid">
        <div>
          <Fade as="p" className="eyebrow">
            Manifesto
          </Fade>
          <SplitReveal as="h2" className="h2" style={{ marginTop: "1.2rem" }}>
            Conecte-se com mentes brilhantes
          </SplitReveal>
        </div>

        <SplitReveal as="p" className="manifesto__text">
          Ser <span className="hl">solo</span> é trilhar o seu caminho profissional de forma
          individual. Pensando nisso, a Sollo Business se tornou parceira nessa trajetória, oferecendo a base
          fundamental para que artistas, influenciadores e demais profissionais do entretenimento
          possam desenvolver todo seu potencial através de funcionalidades completas e integradas.
          Tudo em um espaço ideal para levar a sua carreira ao próximo nível.
        </SplitReveal>
      </div>
    </section>
  );
}
