"use client";
import { useState } from "react";

const SIZES = Array.from({ length: 14 }, (_, i) => 35 + i);

export default function Preorder() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [size, setSize] = useState("42");

  const submit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return;
    setSent(true);
  };

  return (
    <section className="section preorder" id="precommande">
      <div className="preorder__glow" aria-hidden="true" />
      <div className="container preorder__inner" data-reveal>
        <p className="eyebrow">Précommande</p>
        <h2 className="display">Marchez sur mesure.</h2>
        <p className="lede">Réservez votre paire. Aucun paiement aujourd'hui, vous serez parmi les premiers servis.</p>
        {sent ? (
          <p className="preorder__done" role="status">
            C'est noté. Votre paire en pointure {size} est réservée. Nous vous écrirons à <b>{email}</b>.
          </p>
        ) : (
          <form className="preorder__form" onSubmit={submit} noValidate>
            <label htmlFor="po-email" className="sr">
              Adresse e-mail
            </label>
            <input
              id="po-email"
              type="email"
              placeholder="votre@email.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <label htmlFor="po-size" className="sr">
              Pointure
            </label>
            <select id="po-size" value={size} onChange={(e) => setSize(e.target.value)}>
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  Pointure {s}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn--ice">
              Réserver ma paire
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
