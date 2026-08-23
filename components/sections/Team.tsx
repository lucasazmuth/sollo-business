import { SplitReveal, Fade } from "@/components/anim/Reveal";
import { team } from "@/content/site";

export function Team() {
  return (
    <section className="section" id="equipe">
      <div className="wrap">
        <Fade as="p" className="eyebrow">
          Equipe
        </Fade>
        <SplitReveal as="h2" className="h2" style={{ margin: "1.2rem 0 1.6rem" }}>
          As pessoas por trás da Sollo Business
        </SplitReveal>
        <Fade as="p" className="lead">
          Cada membro da nossa equipe na Sollo Business possui um forte conhecimento no mercado de
          entretenimento, com foco principal em impulsionar o sucesso dos projetos e negócios de
          nossos clientes.
        </Fade>

        {/* PLACEHOLDER: trocar nomes, cargos e fotos reais da equipe. */}
        <div className="team">
          {team.map((member, i) => (
            <Fade as="article" className="member" key={i}>
              <span className="member__orb" />
              <div>
                <div className="member__name">{member.name}</div>
                <div className="member__role">{member.role}</div>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}
