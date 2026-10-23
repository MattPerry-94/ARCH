const SPECS = [
  { v: "95", u: "g", l: "par semelle. Deux fois plus légère que votre téléphone." },
  { v: "7", u: "jours", l: "d'autonomie en usage quotidien." },
  { v: "2", u: "h", l: "pour une charge complète sur son socle à induction." },
  { v: "IP68", u: "", l: "Immergeable. Lavable à la main, à l'eau savonneuse." },
  { v: "32", u: "capteurs", l: "de pression, lus 200 fois par seconde." },
  { v: "<10", u: "ms", l: "pour passer de Contact sol à Nuage." },
];

export default function Specs() {
  return (
    <section className="section specs" id="specs">
      <div className="container">
        <div className="specs__head" data-reveal>
          <p className="eyebrow">Léger. Étanche. Endurant.</p>
          <h2 className="h2">Vous l'oubliez. Elle ne vous oublie jamais.</h2>
        </div>
        <div className="specs__layout">
          <ul className="specs__grid">
            {SPECS.map((s) => (
              <li key={s.l} data-reveal>
                <p className="specs__value">
                  {s.v}
                  {s.u && <span>{s.u}</span>}
                </p>
                <p className="specs__label">{s.l}</p>
              </li>
            ))}
          </ul>
          <figure className="dock" data-reveal>
            <div className="dock__pad" aria-hidden="true">
              <div className="dock__ring" />
              <svg className="dock__soles" viewBox="0 0 200 200">
                <path
                  d="M78 168c-12 0-18-10-18-24 0-20 6-40 2-62-3-20 2-46 22-50 18-3 26 12 24 34-2 22-8 30-6 52 2 22-6 50-24 50z"
                  fill="#1a2026"
                  stroke="var(--ice)"
                  strokeOpacity=".5"
                />
                <path
                  d="M122 168c12 0 18-10 18-24 0-20-6-40-2-62 3-20-2-46-22-50-18-3-26 12-24 34 2 22 8 30 6 52-2 22 6 50 24 50z"
                  fill="#1a2026"
                  stroke="var(--ice)"
                  strokeOpacity=".5"
                />
              </svg>
            </div>
            <figcaption>
              <b>Socle ARCH</b>
              <span>Posez, c'est en charge. Aucun câble, aucun port à protéger.</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
