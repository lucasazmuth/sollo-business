import { SplitReveal, Fade } from "@/components/anim/Reveal";
import { perks } from "@/content/site";

const icons = {
  bell: (
    <path d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
  ),
  chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </>
  )
};

export function Perks() {
  return (
    <section className="section" id="recursos">
      <div className="wrap">
        <Fade as="p" className="eyebrow">
          No app
        </Fade>
        <SplitReveal
          as="h2"
          className="h2"
          style={{ margin: "1.2rem 0 clamp(2rem,4vh,3rem)" }}
        >
          Tudo o que você precisa, no mesmo lugar
        </SplitReveal>

        <ul className="perks">
          {perks.map((perk) => (
            <Fade as="li" className="perk" key={perk.text}>
              <span className="perk__icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {icons[perk.icon]}
                </svg>
              </span>
              {perk.text}
            </Fade>
          ))}
        </ul>
      </div>
    </section>
  );
}
