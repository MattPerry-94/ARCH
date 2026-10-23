"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createStage, buildGlassSole } from "@/lib/sole";

const ZONES = [
  { key: "orteils", label: "Orteils" },
  { key: "avantInt", label: "Avant-pied int." },
  { key: "avantExt", label: "Avant-pied ext." },
  { key: "voute", label: "Voûte" },
  { key: "medioExt", label: "Bord extérieur" },
  { key: "talon", label: "Talon" },
];

const z = (talon, voute, medioExt, avantInt, avantExt, orteils, wv = 50) => ({
  talon: { h: talon, w: 50 },
  voute: { h: voute, w: wv },
  medioExt: { h: medioExt, w: 50 },
  avantInt: { h: avantInt, w: 50 },
  avantExt: { h: avantExt, w: 50 },
  orteils: { h: orteils, w: 50 },
});

const PRESETS = {
  low: { name: "Low", desc: "Soutien léger, sensation naturelle.", zones: z(35, 42, 30, 36, 32, 30), durete: 70 },
  medium: { name: "Medium", desc: "L'équilibre entre maintien et confort.", zones: z(48, 64, 38, 52, 42, 36), durete: 50 },
  high: { name: "High", desc: "Maintien maximal de la voûte.", zones: z(60, 90, 44, 70, 50, 40, 65), durete: 30 },
};

const AI = { zones: z(58, 84, 40, 66, 46, 45, 70), durete: 42 };

const PROFILES = [
  { key: "quotidien", label: "Quotidien", preset: "medium", durete: 60 },
  { key: "course", label: "Course", preset: "medium", durete: 35 },
  { key: "hockey", label: "Hockey", preset: "high", durete: 15 },
  { key: "marche", label: "Marche", preset: "low", durete: 55 },
  { key: "debout", label: "Travail debout", preset: "medium", durete: 85 },
];

const dureteLabel = (d) => (d < 34 ? "Contact sol" : d < 67 ? "Équilibré" : "Nuage");
const mm = (h) => ((h / 100) * 12).toFixed(1).replace(".", ",");

function timeLeft(pct, zones) {
  const avg = Object.values(zones).reduce((a, v) => a + v.h, 0) / 6;
  const hours = Math.round((pct / 100) * 168 * (1.15 - (avg / 100) * 0.3));
  const d = Math.floor(hours / 24);
  const h = hours % 24;
  return d ? `${d} j ${h} h` : `${h} h`;
}

const Icon = {
  home: <path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z" />,
  sliders: (
    <>
      <path d="M5 4v16M12 4v16M19 4v16" />
      <circle cx="5" cy="15" r="2.2" />
      <circle cx="12" cy="8" r="2.2" />
      <circle cx="19" cy="13" r="2.2" />
    </>
  ),
  ia: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8z" />,
  stats: <path d="M5 20V11M10 20V5M15 20v-7M20 20V8" />,
  avis: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z" />,
};

function TabIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {Icon[name]}
    </svg>
  );
}

function FootZones({ selected, onSelect, zones }) {
  // Simplified top view, 120×260, right foot. Each zone is a band clipped by the foot outline.
  const bands = {
    orteils: [0, 0, 120, 44],
    avantInt: [0, 44, 60, 66],
    avantExt: [60, 44, 60, 66],
    voute: [0, 110, 64, 74],
    medioExt: [64, 110, 56, 74],
    talon: [0, 184, 120, 76],
  };
  return (
    <svg className="foot" viewBox="0 0 120 260" role="group" aria-label="Zones de la semelle">
      <defs>
        <clipPath id="footclip">
          <path d="M58 6c22-2 44 8 48 36 4 26-6 52-8 78-2 28 6 54 4 82-2 34-20 54-44 54s-38-20-36-52c2-28 14-46 8-70-6-24-24-44-24-74C6 30 30 8 58 6z" />
        </clipPath>
      </defs>
      <g clipPath="url(#footclip)">
        {ZONES.map(({ key, label }) => {
          const [x, y, w, h] = bands[key];
          const on = selected === key;
          return (
            <rect
              key={key}
              x={x + 1}
              y={y + 1}
              width={w - 2}
              height={h - 2}
              className={`foot__zone ${on ? "is-on" : ""}`}
              style={{ "--lvl": zones[key].h / 100 }}
              onClick={() => onSelect(key)}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={label}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect(key))}
            />
          );
        })}
      </g>
      <path
        d="M58 6c22-2 44 8 48 36 4 26-6 52-8 78-2 28 6 54 4 82-2 34-20 54-44 54s-38-20-36-52c2-28 14-46 8-70-6-24-24-44-24-74C6 30 30 8 58 6z"
        fill="none"
        stroke="rgba(234,240,244,.5)"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export default function AppDemo() {
  const [tab, setTab] = useState("home");
  const [mode, setMode] = useState("preset");
  const [preset, setPreset] = useState("medium");
  const [zones, setZones] = useState(PRESETS.medium.zones);
  const [durete, setDurete] = useState(50);
  const [profile, setProfile] = useState("quotidien");
  const [subTab, setSubTab] = useState("presets");
  const [zoneSel, setZoneSel] = useState("voute");
  const [battery, setBattery] = useState(32);
  const [charging, setCharging] = useState(false);
  const [notif, setNotif] = useState(false);
  const notifShown = useRef(false);
  const [scan, setScan] = useState({ state: "idle", p: 0 });
  const [aiApplied, setAiApplied] = useState(false);
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState("");
  const [reviewSent, setReviewSent] = useState(false);
  const [idea, setIdea] = useState("");
  const [ideaCat, setIdeaCat] = useState("Application");
  const [ideaSent, setIdeaSent] = useState(false);

  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const cfgRef = useRef({ zones, durete, highlight: null });
  cfgRef.current = { zones, durete, highlight: tab === "reglages" && subTab === "custom" ? zoneSel : null };

  // 3D sole reacting to the app settings
  useEffect(() => {
    let sole;
    let cur = null;
    let colors = null;
    const stage = createStage(stageRef.current, {
      fov: 28,
      camPos: [0, 10, 27],
      onFrame: (t, s) => {
        stage.spin.rotation.y = -1.25 + (s.reduce ? 0 : Math.sin(t * 0.35) * 0.3) + s.drag;
        stage.outer.rotation.z = 0.1;
        stage.outer.position.y = s.reduce ? 0 : Math.sin(t * 1.1) * 0.15;
        const { zones: zs, durete: d, highlight } = cfgRef.current;
        const soft = d / 100;
        const base = [0.25 + 0.1 * (1 - soft), 0.78, 1];
        const gel = [0.74, 0.66, 1];
        sole.cells.forEach((c, i) => {
          const zv = zs[c.zone];
          const th = c.h * (0.35 + (zv.h / 100) * 1.25);
          const tw = 0.72 + (zv.w / 100) * 0.5;
          cur[i * 2] += (th - cur[i * 2]) * 0.08;
          cur[i * 2 + 1] += (tw - cur[i * 2 + 1]) * 0.08;
          const hi = highlight === c.zone;
          const col = hi ? [1, 0.42, 0.24] : base.map((v, k) => v + (gel[k] - v) * soft * 0.6);
          colors.setXYZ(i, ...col);
        });
        colors.needsUpdate = true;
        sole.setCells(
          (c, i) => cur[i * 2] * (s.reduce ? 1 : 0.97 + 0.03 * Math.sin(t * 2 - c.y)),
          (c, i) => cur[i * 2 + 1]
        );
      },
    });
    sole = buildGlassSole(stage.spin);
    sole.mat.color.set(0xffffff);
    sole.mat.emissiveIntensity = 0.12;
    cur = new Float32Array(sole.cells.length * 2);
    sole.cells.forEach((c, i) => {
      cur[i * 2] = c.h * 0.8;
      cur[i * 2 + 1] = 1;
    });
    colors = sole.inst.instanceColor;
    return () => stage.dispose();
  }, []);

  // Battery drains while the section is on screen; notification under 25 %
  useEffect(() => {
    let visible = false;
    const io = new IntersectionObserver((es) => (visible = es[0].isIntersecting), { threshold: 0.25 });
    io.observe(sectionRef.current);
    const id = setInterval(() => {
      if (!visible) return;
      setBattery((b) => {
        if (charging) return Math.min(100, b + 3);
        return Math.max(5, b - 1);
      });
    }, charging ? 250 : 3500);
    return () => {
      clearInterval(id);
      io.disconnect();
    };
  }, [charging]);

  useEffect(() => {
    if (!charging && battery < 25 && !notifShown.current) {
      notifShown.current = true;
      setNotif(true);
    }
    if (charging && battery >= 100) {
      setCharging(false);
      notifShown.current = false;
    }
  }, [battery, charging]);

  useEffect(() => {
    if (scan.state !== "running") return;
    const id = setInterval(() => {
      setScan((s) => (s.p >= 100 ? { state: "done", p: 100 } : { state: "running", p: s.p + 4 }));
    }, 110);
    return () => clearInterval(id);
  }, [scan.state]);

  const applyPreset = (key, d) => {
    setMode("preset");
    setPreset(key);
    setZones(PRESETS[key].zones);
    setDurete(d ?? PRESETS[key].durete);
    setAiApplied(false);
  };
  const chooseProfile = (p) => {
    setProfile(p.key);
    applyPreset(p.preset, p.durete);
  };
  const setZone = (field, v) => {
    setMode("custom");
    setAiApplied(false);
    setZones((zs) => ({ ...zs, [zoneSel]: { ...zs[zoneSel], [field]: v } }));
  };
  const applyAI = () => {
    setMode("ia");
    setZones(AI.zones);
    setDurete(AI.durete);
    setAiApplied(true);
  };
  const startCharge = () => {
    setNotif(false);
    setCharging(true);
  };

  const modeLabel = mode === "preset" ? `Preset ${PRESETS[preset].name}` : mode === "custom" ? "Sur-mesure" : "Recommandation IA";
  const innerPct = Math.round(70 - (zones.voute.h / 100) * 22);
  const left = timeLeft(battery, zones);
  const lowBatt = battery < 25 && !charging;

  const summary = useMemo(
    () => ZONES.map((zn) => ({ ...zn, v: zones[zn.key].h })),
    [zones]
  );

  return (
    <section className="section appdemo" id="app" ref={sectionRef}>
      <div className="container">
        <div className="appdemo__head" data-reveal>
          <p className="eyebrow">L'application ARCH</p>
          <h2 className="h2">Elle apprend votre pas. Puis elle s'y adapte.</h2>
          <p className="lede">
            Trois façons de régler ARCH : des réglages prêts à l'emploi, un contrôle total zone par zone, ou les
            recommandations de l'IA qui a analysé vos appuis. Essayez, la semelle réagit en direct.
          </p>
        </div>

        <div className="appdemo__layout">
          <div className="phone" data-reveal>
            <div className="phone__screen">
              <div className="phone__status" aria-hidden="true">
                <span>9:41</span>
                <span className="phone__island" />
                <span className="batt">
                  <i style={{ width: "78%" }} />
                </span>
              </div>

              <div className={`notif ${notif ? "is-on" : ""}`} role="status" aria-live="polite">
                {notif && (
                  <>
                    <div className="notif__head">
                      <b>ARCH</b>
                      <span>maintenant</span>
                    </div>
                    <p>
                      Batterie faible : {battery} %. Il vous reste environ {left} d'action. Posez vos semelles sur le socle.
                    </p>
                    <div className="notif__actions">
                      <button onClick={startCharge}>Mettre en charge</button>
                      <button onClick={() => setNotif(false)}>Plus tard</button>
                    </div>
                  </>
                )}
              </div>

              <div className="phone__body">
                {tab === "home" && (
                  <div className="scr">
                    <p className="scr__hello">Bonjour</p>
                    <div className="card battery">
                      <svg viewBox="0 0 80 80" className="ring" aria-hidden="true">
                        <circle cx="40" cy="40" r="34" />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className={`ring__val ${lowBatt ? "is-low" : ""}`}
                          style={{ strokeDasharray: `${(battery / 100) * 213.6} 213.6` }}
                        />
                      </svg>
                      <div>
                        <p className="battery__pct">
                          {battery}
                          <small>%</small>
                        </p>
                        <p className="muted">
                          {charging ? "En charge sur le socle" : `≈ ${left} d'action restante`}
                        </p>
                        {!charging && battery < 100 && (
                          <button className="link" onClick={startCharge}>
                            Simuler la recharge
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="card">
                      <p className="muted small">Réglage actif</p>
                      <p className="strong">{modeLabel}</p>
                      <p className="muted small">
                        Dureté : {dureteLabel(durete)} · Voûte {mm(zones.voute.h)} mm
                      </p>
                    </div>
                    <p className="muted small">Profil d'activité</p>
                    <div className="chips">
                      {PROFILES.map((p) => (
                        <button key={p.key} className={profile === p.key ? "is-on" : ""} onClick={() => chooseProfile(p)}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <div className="card row">
                      <div>
                        <p className="muted small">Score d'équilibre</p>
                        <p className="strong big">{mode === "ia" ? 91 : 86}</p>
                      </div>
                      <div>
                        <p className="muted small">Pas aujourd'hui</p>
                        <p className="strong big">8 432</p>
                      </div>
                    </div>
                  </div>
                )}

                {tab === "reglages" && (
                  <div className="scr">
                    <p className="scr__title">Réglages</p>
                    <div className="seg seg--sm" role="group" aria-label="Type de réglage">
                      <button className={subTab === "presets" ? "is-on" : ""} onClick={() => setSubTab("presets")}>
                        Presets
                      </button>
                      <button className={subTab === "custom" ? "is-on" : ""} onClick={() => setSubTab("custom")}>
                        Sur-mesure
                      </button>
                    </div>
                    {subTab === "presets" ? (
                      <div className="presets">
                        {Object.entries(PRESETS).map(([key, p]) => (
                          <button
                            key={key}
                            className={`preset ${mode === "preset" && preset === key ? "is-on" : ""}`}
                            onClick={() => applyPreset(key)}
                          >
                            <span className="preset__bars" aria-hidden="true">
                              {[0, 1, 2].map((i) => (
                                <i key={i} className={i <= ["low", "medium", "high"].indexOf(key) ? "on" : ""} />
                              ))}
                            </span>
                            <span>
                              <b>{p.name}</b>
                              <small>{p.desc}</small>
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="custom">
                        <div className="custom__top">
                          <FootZones selected={zoneSel} onSelect={setZoneSel} zones={zones} />
                          <div className="custom__zone">
                            <p className="muted small">Zone</p>
                            <p className="strong">{ZONES.find((x) => x.key === zoneSel).label}</p>
                            <p className="muted small">Hauteur</p>
                            <p className="strong">{mm(zones[zoneSel].h)} mm</p>
                            <p className="muted small">Largeur</p>
                            <p className="strong">{zones[zoneSel].w} %</p>
                          </div>
                        </div>
                        <label className="slider" htmlFor="app-h">
                          <span>Hauteur</span>
                          <input
                            id="app-h"
                            type="range"
                            min="0"
                            max="100"
                            value={zones[zoneSel].h}
                            onChange={(e) => setZone("h", Number(e.target.value))}
                          />
                        </label>
                        <label className="slider" htmlFor="app-w">
                          <span>Largeur</span>
                          <input
                            id="app-w"
                            type="range"
                            min="0"
                            max="100"
                            value={zones[zoneSel].w}
                            onChange={(e) => setZone("w", Number(e.target.value))}
                          />
                        </label>
                        <label className="slider" htmlFor="app-d">
                          <span>
                            Dureté · <b>{dureteLabel(durete)}</b>
                          </span>
                          <input
                            id="app-d"
                            type="range"
                            min="0"
                            max="100"
                            value={durete}
                            onChange={(e) => {
                              setMode("custom");
                              setDurete(Number(e.target.value));
                            }}
                          />
                          <span className="slider__ends" aria-hidden="true">
                            <small>Contact sol</small>
                            <small>Nuage</small>
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {tab === "ia" && (
                  <div className="scr">
                    <p className="scr__title">Recommandations IA</p>
                    {scan.state === "idle" && (
                      <div className="card ai-start">
                        <div className="ai-orb" aria-hidden="true" />
                        <p className="strong">Analyse de vos appuis</p>
                        <p className="muted small">
                          Marchez normalement pendant 30 secondes. ARCH lit ses 32 capteurs et analyse votre foulée.
                        </p>
                        <button className="btn btn--ice btn--block" onClick={() => setScan({ state: "running", p: 0 })}>
                          Lancer l'analyse
                        </button>
                      </div>
                    )}
                    {scan.state === "running" && (
                      <div className="card ai-start">
                        <div className="ai-orb is-scanning" aria-hidden="true" />
                        <p className="strong">Analyse en cours…</p>
                        <p className="muted small">{Math.round(scan.p * 12.5)} pas analysés</p>
                        <div className="progress" role="progressbar" aria-valuenow={scan.p} aria-valuemin="0" aria-valuemax="100">
                          <i style={{ width: `${scan.p}%` }} />
                        </div>
                      </div>
                    )}
                    {scan.state === "done" && (
                      <>
                        <div className="card">
                          <p className="muted small">1 248 pas analysés</p>
                          <ul className="findings">
                            <li>
                              <span className="pill pill--heat">À corriger</span>Appui intérieur excessif (+18 %)
                            </li>
                            <li>
                              <span className="pill pill--heat">À corriger</span>Voûte affaissée de 4 mm en fin de journée
                            </li>
                            <li>
                              <span className="pill pill--ok">Bien</span>Attaque du talon régulière
                            </li>
                          </ul>
                        </div>
                        <div className="card">
                          <p className="muted small">Réglage recommandé</p>
                          <ul className="reco">
                            {ZONES.map((zn) => (
                              <li key={zn.key}>
                                <span>{zn.label}</span>
                                <b>{mm(AI.zones[zn.key].h)} mm</b>
                              </li>
                            ))}
                            <li>
                              <span>Dureté</span>
                              <b>{dureteLabel(AI.durete)}</b>
                            </li>
                          </ul>
                        </div>
                        <button className="btn btn--ice btn--block" onClick={applyAI} disabled={aiApplied && mode === "ia"}>
                          {aiApplied && mode === "ia" ? "Recommandations appliquées" : "Appliquer les recommandations"}
                        </button>
                        <button className="link" onClick={() => setScan({ state: "running", p: 0 })}>
                          Relancer une analyse
                        </button>
                      </>
                    )}
                  </div>
                )}

                {tab === "stats" && (
                  <div className="scr">
                    <p className="scr__title">Ma foulée</p>
                    <div className="stats">
                      <div className="card">
                        <p className="muted small">Cadence</p>
                        <p className="strong big">
                          172 <small>pas/min</small>
                        </p>
                      </div>
                      <div className="card">
                        <p className="muted small">Foulée</p>
                        <p className="strong big">
                          1,12 <small>m</small>
                        </p>
                      </div>
                    </div>
                    <div className="card">
                      <p className="muted small">Répartition intérieur / extérieur</p>
                      <div className="split" aria-label={`${innerPct} % intérieur, ${100 - innerPct} % extérieur`}>
                        <i style={{ width: `${innerPct}%` }} />
                      </div>
                      <p className="small split__legend">
                        <span>Int. {innerPct} %</span>
                        <span>Ext. {100 - innerPct} %</span>
                      </p>
                    </div>
                    <div className="card">
                      <p className="muted small">Score d'équilibre · 7 derniers jours</p>
                      <svg viewBox="0 0 210 90" className="bars" role="img" aria-label="Score d'équilibre de 62 à 91 sur la semaine">
                        {[62, 68, 71, 70, 79, 84, mode === "ia" ? 91 : 86].map((v, i) => (
                          <g key={i}>
                            <rect x={i * 30 + 6} y={74 - v * 0.7} width="18" height={v * 0.7} rx="4" className={i === 6 ? "on" : ""} />
                            <text x={i * 30 + 15} y="87" textAnchor="middle">
                              {"LMMJVSD"[i]}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  </div>
                )}

                {tab === "avis" && (
                  <div className="scr">
                    <p className="scr__title">Votre avis</p>
                    <div className="card">
                      <p className="small">Votre avis compte pour nous et pour le développement d'ARCH.</p>
                      {reviewSent ? (
                        <p className="thanks">Merci ! Votre note de {stars}/5 a bien été envoyée.</p>
                      ) : (
                        <>
                          <div className="stars" role="radiogroup" aria-label="Note sur 5">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                role="radio"
                                aria-checked={stars === n}
                                aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
                                className={n <= stars ? "is-on" : ""}
                                onClick={() => setStars(n)}
                              >
                                <TabIcon name="avis" />
                              </button>
                            ))}
                          </div>
                          <textarea
                            id="app-review"
                            rows="3"
                            placeholder="Qu'avez-vous pensé d'ARCH ?"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                          />
                          <button className="btn btn--ice btn--block" disabled={!stars} onClick={() => setReviewSent(true)}>
                            Envoyer mon avis
                          </button>
                        </>
                      )}
                    </div>
                    <div className="card">
                      <p className="strong">Proposez-nous une idée</p>
                      <p className="muted small">Les meilleures idées arrivent dans les prochaines mises à jour.</p>
                      {ideaSent ? (
                        <p className="thanks">Merci ! Votre idée est entre les mains de l'équipe.</p>
                      ) : (
                        <>
                          <div className="chips">
                            {["Application", "Semelle", "Sport", "Autre"].map((c) => (
                              <button key={c} className={ideaCat === c ? "is-on" : ""} onClick={() => setIdeaCat(c)}>
                                {c}
                              </button>
                            ))}
                          </div>
                          <textarea
                            id="app-idea"
                            rows="3"
                            placeholder="Et si ARCH pouvait…"
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                          />
                          <button className="btn btn--ghost btn--block" disabled={!idea.trim()} onClick={() => setIdeaSent(true)}>
                            Envoyer l'idée
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <nav className="tabbar" aria-label="Application ARCH">
                {[
                  ["home", "Accueil"],
                  ["reglages", "Réglages"],
                  ["ia", "IA"],
                  ["stats", "Stats"],
                  ["avis", "Avis"],
                ].map(([key, label]) => (
                  <button key={key} className={tab === key ? "is-on" : ""} onClick={() => setTab(key)} aria-current={tab === key}>
                    <TabIcon name={key === "reglages" ? "sliders" : key} />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="appdemo__sole" data-reveal>
            <div className="appdemo__stage" ref={stageRef} aria-hidden="true" />
            <div className="live">
              <p className="live__tag">
                <span className="live__dot" /> En direct sur votre semelle
              </p>
              <p className="live__mode">{modeLabel}</p>
              <ul className="live__zones">
                {summary.map((zn) => (
                  <li key={zn.key} className={tab === "reglages" && subTab === "custom" && zoneSel === zn.key ? "is-on" : ""}>
                    <span>{zn.label}</span>
                    <i style={{ "--v": zn.v / 100 }} />
                    <b>{mm(zn.v)} mm</b>
                  </li>
                ))}
              </ul>
              <p className="live__hard">
                Dureté <b>{dureteLabel(durete)}</b>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
