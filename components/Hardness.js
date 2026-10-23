"use client";
import { useEffect, useRef, useState } from "react";

const N = 15;
const X0 = 60;
const X1 = 540;
const BASE = 222;
const CELL_H = 62;

function label(s) {
  if (s < 0.34) return "Contact sol";
  if (s < 0.67) return "Équilibré";
  return "Nuage";
}

export default function Hardness() {
  const [target, setTarget] = useState(35);
  const [s, setS] = useState(0.35);
  const sRef = useRef(0.35);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const goal = target / 100;
      const d = goal - sRef.current;
      if (Math.abs(d) > 0.001) {
        sRef.current += d * 0.14;
        setS(sRef.current);
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const sink = 8 + 34 * s;
  const sigma = 48 + 70 * s;
  const cw = (X1 - X0) / N;
  const cells = Array.from({ length: N }, (_, i) => {
    const cx = X0 + cw * (i + 0.5);
    const g = Math.exp(-Math.pow(cx - 300, 2) / (2 * sigma * sigma));
    const h = CELL_H - sink * g;
    return { x: cx - cw / 2 + 3, w: cw - 6, h, g };
  });
  const heelBottom = BASE - (CELL_H - sink);
  const shore = Math.round(58 - 43 * s);
  const depth = (1.2 + 5.6 * s).toFixed(1).replace(".", ",");
  const rebound = Math.round(76 - 18 * s);

  return (
    <section className="section hardness" id="durete">
      <div className="container hardness__grid">
        <div data-reveal>
          <p className="eyebrow">Dureté adaptative</p>
          <h2 className="h2">Ni trop dure. Ni trop molle. Exactement vous.</h2>
          <p className="lede">
            Le FluxGel change de consistance sous l'effet d'un champ magnétique. Ferme et réactif pour sentir la glace ou la
            piste, moelleux comme un nuage pour une journée debout. Vous choisissez, ARCH s'exécute en moins de 10
            millisecondes.
          </p>
        </div>
        <div className="hardness__demo" data-reveal>
          <svg viewBox="0 0 600 280" role="img" aria-label={`Coupe de la semelle, réglage ${label(s)}`}>
            <defs>
              <radialGradient id="heel" cx="50%" cy="35%" r="70%">
                <stop offset="0%" stopColor="#3a434c" />
                <stop offset="100%" stopColor="#14191e" />
              </radialGradient>
              <linearGradient id="cell" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--ice)" />
                <stop offset="100%" stopColor="#2aa8d0" />
              </linearGradient>
            </defs>
            <line x1="20" x2="580" y1="262" y2="262" stroke="var(--line-strong)" />
            <rect x={X0} y={232} width={X1 - X0} height={22} rx="6" fill="#1a1f24" />
            <rect x={X0} y={BASE} width={X1 - X0} height={10} rx="3" fill="var(--gel)" opacity={0.95 - 0.55 * s} />
            {cells.map((c, i) => (
              <rect
                key={i}
                x={c.x}
                y={BASE - c.h}
                width={c.w}
                height={c.h}
                rx={c.w / 2.6}
                fill="url(#cell)"
                opacity={0.55 + 0.45 * c.g}
              />
            ))}
            <ellipse cx="300" cy={heelBottom - 70} rx="150" ry="70" fill="url(#heel)" stroke="var(--line-strong)" />
            <text x="300" y={heelBottom - 62} textAnchor="middle" className="hardness__svgtext">
              votre talon
            </text>
            <text x={X1} y="252" textAnchor="end" className="hardness__svgtext">
              FluxGel
            </text>
          </svg>
          <div className="hardness__control">
            <div className="hardness__labels" aria-hidden="true">
              <span>Contact sol</span>
              <b>{label(s)}</b>
              <span>Nuage</span>
            </div>
            <input
              id="hardness-range"
              type="range"
              min="0"
              max="100"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              aria-label="Dureté de la semelle, de Contact sol à Nuage"
              aria-valuetext={label(s)}
            />
          </div>
          <dl className="readouts">
            <div>
              <dt>Dureté</dt>
              <dd>
                {shore} <small>Shore A</small>
              </dd>
            </div>
            <div>
              <dt>Enfoncement</dt>
              <dd>
                {depth} <small>mm</small>
              </dd>
            </div>
            <div>
              <dt>Retour d'énergie</dt>
              <dd>
                {rebound} <small>%</small>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
