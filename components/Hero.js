"use client";
import { useEffect, useRef } from "react";
import { createStage, buildGlassSole } from "@/lib/sole";

export default function Hero() {
  const stageRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    let scrollP = 0;
    const onScroll = () => {
      const h = section.offsetHeight || 1;
      scrollP = Math.min(1, Math.max(0, window.scrollY / h));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    let sole;
    const stage = createStage(stageRef.current, {
      fov: 28,
      camPos: [0, 7.5, 24],
      onFrame: (t, s) => {
        const w = stageRef.current ? stageRef.current.clientWidth : 1200;
        const wide = w > 900;
        const phone = w < 600;
        const auto = s.reduce ? 0 : t * 0.28;
        stage.spin.rotation.y = 0.6 + auto + s.drag + scrollP * 1.6;
        stage.outer.rotation.z = 0.14 - scrollP * 0.2;
        stage.outer.rotation.x = 0.1 + scrollP * 0.5;
        stage.outer.position.y = (s.reduce ? 0 : Math.sin(t * 1.1) * 0.22) + scrollP * 2.2;
        stage.outer.position.x = wide ? 3.4 : 0;
        stage.outer.position.y += wide ? 0.8 : phone ? 3.6 : 2.2;
        const k = wide ? 0.92 : phone ? 0.5 : 0.7;
        stage.outer.scale.setScalar(k * (1 - scrollP * 0.15));
        sole.setCells((c) => c.h * 0.82 * (s.reduce ? 1 : 0.72 + 0.28 * Math.sin(t * 2.2 - c.y * 0.9)));
      },
    });
    sole = buildGlassSole(stage.spin);
    return () => {
      window.removeEventListener("scroll", onScroll);
      stage.dispose();
    };
  }, []);

  return (
    <section className="hero" id="top" ref={sectionRef}>
      <div className="hero__word" aria-hidden="true">
        ARCH
      </div>
      <div className="hero__stage" ref={stageRef} aria-hidden="true" />
      <div className="hero__glow" aria-hidden="true" />
      <div className="container hero__content">
        <p className="eyebrow">Nouveau · Semelle adaptative intelligente</p>
        <h1 className="hero__title">
          Pensée pour vos pieds.
          <br />
          <span>Réglée par vous.</span>
        </h1>
        <p className="hero__lede">
          La première semelle qui sent chacun de vos appuis et se transforme sous votre pied, en temps réel.
        </p>
        <div className="hero__ctas">
          <a href="#precommande" className="btn btn--ice">
            Précommander · 199 €
          </a>
          <a href="#probleme" className="btn btn--ghost">
            Découvrir
          </a>
        </div>
      </div>
      <a href="#probleme" className="hero__scroll" aria-label="Faire défiler">
        <span />
      </a>
    </section>
  );
}
