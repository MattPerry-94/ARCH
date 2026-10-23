const FAQ = [
  [
    "ARCH remplace-t-elle une semelle orthopédique ?",
    "ARCH a été conçue avec des podologues et des kinésithérapeutes du sport pour corriger les déséquilibres d'appui les plus courants. Pour une pathologie diagnostiquée, montrez vos données ARCH à votre praticien : il pourra s'appuyer dessus.",
  ],
  [
    "Est-ce qu'elle rentre dans toutes mes chaussures ?",
    "Oui. ARCH existe du 35 au 48 et mesure de 4 à 9 mm d'épaisseur selon le réglage. Elle remplace la semelle d'origine de vos baskets, chaussures de ville ou patins.",
  ],
  [
    "Comment la laver ?",
    "À la main, à l'eau tiède savonneuse. ARCH est certifiée IP68 : vous pouvez l'immerger sans risque. Laissez-la sécher à l'air libre avant de la reposer sur son socle.",
  ],
  [
    "Quelle est son autonomie ?",
    "Environ 7 jours en usage quotidien. Posez-la sur son socle à induction : 2 heures suffisent pour une charge complète. L'application vous prévient dès que la batterie passe sous 25 %.",
  ],
  [
    "Que se passe-t-il sans abonnement ?",
    "Tout l'essentiel reste à vous, sans limite de durée : presets, réglage sur-mesure, dureté adaptative et analyse IA essentielle. ARCH+ ajoute une IA qui se réajuste chaque semaine et des analyses avancées.",
  ],
  [
    "Où vont mes données ?",
    "Vos données d'appui sont chiffrées et hébergées en Europe, conformément au RGPD. Elles ne sont jamais revendues. Vous pouvez les exporter ou les supprimer depuis l'application.",
  ],
];

export default function Faq() {
  return (
    <section className="section faq" id="faq">
      <div className="container faq__grid">
        <div data-reveal>
          <p className="eyebrow">Questions fréquentes</p>
          <h2 className="h2">Tout ce que vous voulez savoir.</h2>
        </div>
        <div className="faq__list">
          {FAQ.map(([q, a]) => (
            <details key={q} data-reveal>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
