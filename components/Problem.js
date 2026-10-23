"use client";
import { useEffect, useRef, useState } from "react";
import { outline, slice, pressure } from "@/lib/sole";

const RW = 72;
const RH = 174;
const X0 = -2.15;
const XW = 4.3;
const Y0 = 5.2;
const YH = 10.4;

// 32 sensor positions as (u, y)
const SENSORS = (() => {
  const rows = [
    [-4.3, 3], [-3.3, 3], [-2.3, 3], [-1.3, 3], [-0.3, 3],
    [0.7, 4], [1.7, 4], [2.7, 4], [3.6, 3], [4.4, 2],
  ];
  const out = [];
  rows.forEach(([y, n]) => {
    for (let i = 0; i < n; i++) out.push([(i + 0.5) / n, y]);
  });
  return out;
})();

const STOPS = [
  [0.0, [10, 24, 40]],
  [0.18, [27, 77, 255]],
  [0.45, [139, 232, 255]],
  [0.72, [255, 211, 90]],
  [1.0, [255, 107, 61]],
];
function ramp(p) {
  for (let i = 1; i < STOPS.length; i++) {
    if (p <= STOPS[i][0]) {
      const [a, ca] = STOPS[i - 1];
      const [b, cb] = STOPS[i];
      const t = (p - a) / (b - a);
      return [0, 1, 2].map((k) => ca[k] + (cb[k] - ca[k]) * t);
    }
  }
  return STOPS[STOPS.length - 1][1];
}

export default function Problem() {
  const canvasRef = useRef(null);
  const [target, setTarget] = useState(0);
  const [balance, setBalance] = useState(0);
  const userRef = useRef(false);
  const targetRef = useRef(0);
  targetRef.current = target;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const buf = document.createElement("canvas");
    buf.width = RW;
    buf.height = RH;
    const bctx = buf.getContext("2d");
    const img = bctx.createImageData(RW, RH);

    // Precompute u per pixel (or −1 outside the foot)
    const U = new Float32Array(RW * RH);
    const Y = new Float32Array(RH);
    for (let j = 0; j < RH; j++) {
      const y = Y0 - ((j + 0.5) / RH) * YH;
      Y[j] = y;
      const [x0, x1] = slice(y);
      for (let i = 0; i < RW; i++) {
        const x = X0 + ((i + 0.5) / RW) * XW;
        U[j * RW + i] = x1 > x0 && x >= x0 && x <= x1 ? (x - x0) / (x1 - x0) : -1;
      }
    }
    const path = new Path2D();
    outline.forEach((p, i) => (i ? path.lineTo(p.x, -p.y) : path.moveTo(p.x, -p.y)));
    path.closePath();

    let cur = 0;
    let visible = false;
    let raf = 0;
    let lastToggle = performance.now();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function paint(b) {
      const d = img.data;
      for (let j = 0; j < RH; j++)
        for (let i = 0; i < RW; i++) {
          const k = j * RW + i;
          const u = U[k];
          const o = k * 4;
          if (u < 0) {
            d[o + 3] = 0;
            continue;
          }
          const p = pressure(u, Y[j], b);
          const [r, g, bl] = ramp(p);
          d[o] = r;
          d[o + 1] = g;
          d[o + 2] = bl;
          d[o + 3] = 255;
        }
      bctx.putImageData(img, 0, 0);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const s = Math.min(w / 2 / (XW + 0.9), h / (YH + 0.4));
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.translate(w / 2 + side * (w / 4), h / 2);
        ctx.scale(side * s, s);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.save();
        ctx.clip(path);
        ctx.drawImage(buf, X0, -Y0, XW, YH);
        ctx.restore();
        ctx.lineWidth = 1.2 / s;
        ctx.strokeStyle = "rgba(234,240,244,0.55)";
        ctx.stroke(path);
        ctx.fillStyle = "rgba(5,7,9,0.55)";
        ctx.strokeStyle = "rgba(234,240,244,0.5)";
        SENSORS.forEach(([u, y]) => {
          const [x0, x1] = slice(y);
          const x = x0 + 0.18 + u * (x1 - x0 - 0.36);
          ctx.beginPath();
          ctx.arc(x, -y, 0.07, 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = 0.9 / s;
          ctx.stroke();
        });
        ctx.restore();
      });
    }

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      if (!userRef.current && !reduce && now - lastToggle > 3600) {
        lastToggle = now;
        setTarget((t) => (t ? 0 : 1));
      }
      const tgt = targetRef.current;
      if (Math.abs(cur - tgt) > 0.002 || canvas.width === 0) {
        cur += (tgt - cur) * (reduce ? 1 : 0.06);
        paint(cur);
        setBalance(cur);
      }
    };
    paint(0);
    const io = new IntersectionObserver((es) => {
      visible = es[0].isIntersecting;
      if (visible) lastToggle = performance.now();
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => paint(cur));
    ro.observe(canvas);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  const choose = (v) => {
    userRef.current = true;
    setTarget(v);
  };
  const inner = Math.round(68 - 17 * balance);
  const kpa = Math.round(312 - 164 * balance);
  const score = Math.round(54 + 37 * balance);

  return (
    <section className="section problem" id="probleme">
      <div className="container problem__grid">
        <div className="problem__text" data-reveal>
          <p className="eyebrow">Le problème</p>
          <h2 className="h2">Votre équilibre, recalculé à chaque pas.</h2>
          <p className="lede">
            La plupart d'entre nous posent le pied de travers sans le savoir. Quand la voûte s'affaisse vers l'intérieur, la
            pression se concentre là où elle ne devrait pas, et la chaîne entière en paie le prix : chevilles, genoux, dos.
          </p>
          <p className="lede">
            ARCH le détecte à chaque appui et relève exactement ce qu'il faut, là où il faut. Sans rendez-vous, sans moulage,
            sans attendre.
          </p>
          <div className="seg" role="group" aria-label="Comparer">
            <button className={target === 0 ? "is-on" : ""} onClick={() => choose(0)} aria-pressed={target === 0}>
              Sans ARCH
            </button>
            <button className={target === 1 ? "is-on" : ""} onClick={() => choose(1)} aria-pressed={target === 1}>
              Avec ARCH
            </button>
          </div>
          <dl className="metrics">
            <div>
              <dt>Appui côté intérieur</dt>
              <dd>
                {inner}
                <small>%</small>
              </dd>
            </div>
            <div>
              <dt>Pic de pression sous la voûte</dt>
              <dd>
                {kpa}
                <small>kPa</small>
              </dd>
            </div>
            <div>
              <dt>Score d'équilibre</dt>
              <dd>
                {score}
                <small>/100</small>
              </dd>
            </div>
          </dl>
        </div>
        <figure className="problem__map" data-reveal>
          <canvas ref={canvasRef} aria-label="Carte de pression plantaire des deux pieds" role="img" />
          <figcaption>
            <span className="legend" aria-hidden="true" />
            <span>Pression faible</span>
            <span>Forte</span>
            <span className="problem__state">{balance > 0.5 ? "Corrigé par ARCH" : "Appui effondré vers l'intérieur"}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
