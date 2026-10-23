"use client";
import { useState } from "react";

const BASE = [
  "La paire de semelles ARCH",
  "Le socle de recharge à induction",
  "Presets Low, Medium et High",
  "Réglage sur-mesure zone par zone",
  "Analyse IA essentielle",
  "Garantie 2 ans",
];

const PLUS = [
  "L'IA se réajuste chaque semaine selon vos appuis",
  "Profils d'activité illimités",
  "Analyse de foulée avancée et historique complet",
  "Nouveaux modes en avant-première",
  "Garantie étendue à 3 ans",
];

function Check() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}

export default function Pricing() {
  const [annual, setAnnual] = useState(true);
  return (
    <section className="section pricing" id="prix">
      <div className="container">
        <div className="pricing__head" data-reveal>
          <p className="eyebrow">Prix</p>
          <h2 className="h2">Une semelle. Toutes les possibilités.</h2>
        </div>
        <div className="pricing__grid">
          <article className="plan" data-reveal>
            <p className="plan__name">ARCH</p>
            <p className="plan__price">
              199 <span>€</span>
            </p>
            <p className="plan__note">Paiement unique. Tout ce qu'il faut pour commencer.</p>
            <ul>
              {BASE.map((f) => (
                <li key={f}>
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
            <a href="#precommande" className="btn btn--ice btn--block">
              Précommander
            </a>
          </article>

          <article className="plan plan--plus" data-reveal>
            <div className="plan__top">
              <p className="plan__name">
                ARCH<span>+</span>
              </p>
              <div className="seg seg--sm" role="group" aria-label="Facturation">
                <button className={!annual ? "is-on" : ""} onClick={() => setAnnual(false)} aria-pressed={!annual}>
                  Mensuel
                </button>
                <button className={annual ? "is-on" : ""} onClick={() => setAnnual(true)} aria-pressed={annual}>
                  Annuel
                </button>
              </div>
            </div>
            <p className="plan__price">
              {annual ? "2,99" : "4,99"} <span>€ / mois</span>
            </p>
            <p className="plan__note">
              {annual ? (
                <>
                  Facturé 35,88 € par an. <b className="save">40 % d'économie</b>
                </>
              ) : (
                <>
                  <b className="save">3 mois offerts</b>, puis 4,99 € par mois. Sans engagement.
                </>
              )}
            </p>
            <ul>
              {PLUS.map((f) => (
                <li key={f}>
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
            <a href="#precommande" className="btn btn--ghost btn--block">
              Ajouter ARCH+
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
