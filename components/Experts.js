const STATS = [
  { v: "22", l: "joueurs professionnels" },
  { v: "6", l: "semaines de tests sur glace et en salle" },
  { v: "−31 %", l: "de fatigue plantaire ressentie" },
  { v: "94 %", l: "veulent continuer à la porter" },
];

const QUOTES = [
  {
    q: "On corrigeait les appuis avec des semelles moulées qu'il fallait refaire tous les six mois. ARCH s'ajuste en continu. C'est un changement de méthode.",
    who: "Claire Morel",
    role: "Podologue du sport",
  },
  {
    q: "Je vois enfin ce qui se passe sous le pied de mes patients pendant l'effort, pas seulement sur la table du cabinet.",
    who: "Thomas Vidal",
    role: "Kinésithérapeute du sport",
  },
  {
    q: "En patin, tout part de l'appui. Je règle ARCH sur Contact sol avant le match et sur Nuage après. Je ne reviendrai pas en arrière.",
    who: "Joueur professionnel",
    role: "Les Aigles de Nice",
  },
];

export default function Experts() {
  return (
    <section className="section experts" id="experts">
      <div className="container">
        <div className="experts__head" data-reveal>
          <p className="eyebrow">Validée par des experts</p>
          <h2 className="h2">Testée sur la glace. Approuvée par ceux qui soignent.</h2>
          <p className="lede">
            ARCH a été mise au point avec des kinésithérapeutes et des podologues spécialisés dans le sport, puis éprouvée par
            l'équipe professionnelle de hockey sur glace des Aigles de Nice.
          </p>
        </div>
        <ul className="experts__stats">
          {STATS.map((s) => (
            <li key={s.l} data-reveal>
              <b>{s.v}</b>
              <span>{s.l}</span>
            </li>
          ))}
        </ul>
        <div className="quotes">
          {QUOTES.map((x) => (
            <figure key={x.who + x.role} className="quote" data-reveal>
              <blockquote>« {x.q} »</blockquote>
              <figcaption>
                <b>{x.who}</b>
                <span>{x.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
