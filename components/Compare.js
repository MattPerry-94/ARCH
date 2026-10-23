const COLS = ["ARCH", "Semelles connectées", "Orthopédiques sur mesure", "Semelles standard"];

// true = oui, false = non, string = précision
const ROWS = [
  ["Mesure vos appuis en temps réel", [true, true, false, false]],
  ["Se transforme sous votre pied", [true, false, false, false]],
  ["Réglage zone par zone depuis l'app", [true, false, false, false]],
  ["Dureté réglable", ["Contact sol → Nuage", false, false, false]],
  ["Recommandations par IA", [true, "Conseils d'entraînement", false, false]],
  ["Évolue avec vous", ["En continu", false, "À refaire tous les 6 à 12 mois", false]],
  ["Étanche et lavable", ["IP68", "Selon modèle", true, true]],
  ["Prix", ["199 €", "200 à 400 €", "150 à 250 € + consultation", "20 à 40 €"]],
];

function Cell({ v }) {
  if (v === true)
    return (
      <span className="yes">
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M4 10.5l4 4 8-9" />
        </svg>
        <span className="sr">Oui</span>
      </span>
    );
  if (v === false)
    return (
      <span className="no">
        <span aria-hidden="true">—</span>
        <span className="sr">Non</span>
      </span>
    );
  return <span className="txt">{v}</span>;
}

export default function Compare() {
  return (
    <section className="section compare" id="comparatif">
      <div className="container">
        <div className="compare__head" data-reveal>
          <p className="eyebrow">ARCH face aux autres</p>
          <h2 className="h2">Les autres mesurent. ARCH se transforme.</h2>
        </div>
        <div className="compare__scroll" data-reveal>
          <table className="compare__table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr">Critère</span>
                </th>
                {COLS.map((c, i) => (
                  <th scope="col" key={c} className={i === 0 ? "is-arch" : ""}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([label, vals]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {vals.map((v, i) => (
                    <td key={i} className={i === 0 ? "is-arch" : ""}>
                      <Cell v={v} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
