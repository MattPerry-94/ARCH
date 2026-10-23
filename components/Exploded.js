"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createStage, slabGeometry, height, cellLayout, smooth, clamp, slice as sliceAt } from "@/lib/sole";

// Bottom → top. Fractions of the top-surface height each layer occupies when assembled.
const LAYERS = [
  { key: "base", name: "Base carbone", spec: "Mousse TPU expansée renforcée de fibre de carbone. Rigide là où il faut, 38 g." },
  { key: "core", name: "Noyau", spec: "Puce IA embarquée, centrale inertielle 9 axes et batterie de 180 mAh, scellés dans 4 mm." },
  { key: "gel", name: "FluxGel", spec: "1,5 mm de gel magnétorhéologique. Sa dureté change en moins de 10 ms." },
  { key: "cells", name: "AeroCells", spec: "183 micro-chambres d'air, gonflées une à une pour sculpter votre voûte." },
  { key: "sensors", name: "Capteurs", spec: "32 capteurs de pression sur un film de 0,2 mm. 200 mesures par seconde." },
  { key: "knit", name: "Tissu 3D", spec: "Maille respirante, antibactérienne aux ions d'argent. Lavable à la main." },
];

function knitTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 640;
  const g = c.getContext("2d");
  g.fillStyle = "#23292f";
  g.fillRect(0, 0, c.width, c.height);
  for (let y = 0; y < c.height; y += 6)
    for (let x = 0; x < c.width; x += 6) {
      g.fillStyle = (x / 6 + y / 6) % 2 ? "#2d353c" : "#1c2227";
      g.fillRect(x, y, 5, 5);
    }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function Exploded() {
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const wrap = wrapRef.current;
    let p = 0;
    const onScroll = () => {
      const r = wrap.getBoundingClientRect();
      const total = wrap.offsetHeight - window.innerHeight;
      p = clamp(-r.top / (total || 1), 0, 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const layers = [];
    let lastActive = -2;
    const stage = createStage(stageRef.current, {
      fov: 30,
      camPos: [0, 9, 21],
      onFrame: (t, s) => {
        const e = smooth(0.08, 0.45, p);
        const w = stageRef.current.clientWidth;
        const narrow = w < 760;
        stage.camera.position.set(0, 6.5 + e * 1.5, narrow ? 31 : 23);
        stage.camera.lookAt(0, 3.2 * e, 0);
        stage.outer.position.x = w > 1000 ? 3.6 : 0;
        stage.outer.position.y = narrow ? 0.6 : 0;
        stage.spin.rotation.y = -1.75 + p * 0.7 + s.drag + (s.reduce ? 0 : Math.sin(t * 0.5) * 0.05);
        stage.outer.rotation.z = 0.08;
        const act = p < 0.42 ? -1 : Math.min(LAYERS.length - 1, Math.floor(((p - 0.42) / 0.56) * LAYERS.length));
        layers.forEach((L, i) => {
          L.obj.position.y = i * 1.3 * e;
          const on = act === -1 || act === i;
          L.mats.forEach((m) => {
            m.opacity += ((on ? m.userData.base : 0.2) - m.opacity) * 0.12;
          });
        });
        if (act !== lastActive) {
          lastActive = act;
          setActive(act);
        }
      },
    });

    const mk = (Mat, opts) => {
      const m = new Mat({ transparent: true, ...opts });
      m.userData.base = opts.opacity ?? 1;
      m.opacity = m.userData.base;
      return m;
    };
    const add = (obj, mats) => {
      stage.spin.add(obj);
      layers.push({ obj, mats });
    };

    // 0 base
    {
      const m = mk(THREE.MeshStandardMaterial, { color: 0x1a1f24, roughness: 0.8, metalness: 0.2 });
      add(new THREE.Mesh(slabGeometry(() => 0, (u, y) => 0.3 * height(u, y)), m), [m]);
    }
    // 1 core: board + chip + battery, sitting under the arch
    {
      const g = new THREE.Group();
      const board = mk(THREE.MeshStandardMaterial, { color: 0x0e3a44, roughness: 0.5, metalness: 0.4 });
      const chip = mk(THREE.MeshStandardMaterial, { color: 0x101418, emissive: 0x8be8ff, emissiveIntensity: 0.8, roughness: 0.3 });
      const batt = mk(THREE.MeshStandardMaterial, { color: 0x9aa4ad, roughness: 0.35, metalness: 0.8 });
      const b = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.08, 3.2), board);
      b.position.set(0.1, 0.14, 0.9);
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.8), chip);
      c.position.set(-0.3, 0.24, 0.1);
      const bt = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.16, 1.2), batt);
      bt.position.set(0.3, 0.26, 1.6);
      g.add(b, c, bt);
      add(g, [board, chip, batt]);
    }
    // 2 FluxGel
    {
      const m = mk(THREE.MeshPhysicalMaterial, {
        color: 0xb9a8ff,
        roughness: 0.15,
        clearcoat: 1,
        opacity: 0.7,
        emissive: 0x3a2a8a,
        emissiveIntensity: 0.5,
      });
      add(new THREE.Mesh(slabGeometry((u, y) => 0.3 * height(u, y), (u, y) => 0.4 * height(u, y)), m), [m]);
    }
    // 3 AeroCells
    {
      const cells = cellLayout();
      const geo = new THREE.CylinderGeometry(0.15, 0.15, 1, 16);
      geo.translate(0, 0.5, 0);
      const m = mk(THREE.MeshStandardMaterial, { color: 0x8be8ff, emissive: 0x2aa8d0, emissiveIntensity: 0.9, roughness: 0.35 });
      const inst = new THREE.InstancedMesh(geo, m, cells.length);
      const d = new THREE.Object3D();
      cells.forEach((c, i) => {
        d.position.set(c.x, 0.4 * c.h, -c.y);
        d.scale.set(1, 0.42 * c.h, 1);
        d.updateMatrix();
        inst.setMatrixAt(i, d.matrix);
      });
      add(inst, [m]);
    }
    // 4 sensor film + 32 sensors
    {
      const g = new THREE.Group();
      const film = mk(THREE.MeshStandardMaterial, { color: 0xd8e6ee, roughness: 0.3, opacity: 0.22, depthWrite: false });
      g.add(new THREE.Mesh(slabGeometry((u, y) => 0.82 * height(u, y), (u, y) => 0.82 * height(u, y) + 0.025), film));
      const dot = mk(THREE.MeshStandardMaterial, { color: 0xffffff, emissive: 0xff6b3d, emissiveIntensity: 1.2 });
      const rows = [[-4.3, 3], [-3.3, 3], [-2.3, 3], [-1.3, 3], [-0.3, 3], [0.7, 4], [1.7, 4], [2.7, 4], [3.6, 3], [4.4, 2]];
      const sg = new THREE.CylinderGeometry(0.13, 0.13, 0.04, 20);
      const inst = new THREE.InstancedMesh(sg, dot, 32);
      const d = new THREE.Object3D();
      let k = 0;
      rows.forEach(([y, n]) => {
        for (let i = 0; i < n; i++) {
          const u = 0.12 + ((i + 0.5) / n) * 0.76;
          const [x0, x1] = sliceAt(y);
          d.position.set(x0 + u * (x1 - x0), 0.82 * height(u, y) + 0.04, -y);
          d.updateMatrix();
          inst.setMatrixAt(k++, d.matrix);
        }
      });
      g.add(inst);
      add(g, [film, dot]);
    }
    // 5 knit top
    {
      const m = mk(THREE.MeshStandardMaterial, { map: knitTexture(), roughness: 0.95 });
      add(new THREE.Mesh(slabGeometry((u, y) => 0.86 * height(u, y), (u, y) => height(u, y) + 0.05), m), [m]);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      stage.dispose();
    };
  }, []);

  return (
    <section className="exploded" id="technologie" ref={wrapRef}>
      <div className="exploded__sticky">
        <div className="exploded__stage" ref={stageRef} aria-hidden="true" />
        <div className="container exploded__ui">
          <div className="exploded__head">
            <p className="eyebrow">À l'intérieur</p>
            <h2 className="h2">Six couches. Moins de 9 mm.</h2>
          </div>
          <ol className="layers" aria-label="Les couches d'ARCH, de haut en bas">
            {LAYERS.map((L, i) => ({ L, i }))
              .reverse()
              .map(({ L, i }) => (
                <li key={L.key} className={active === i ? "is-on" : active === -1 ? "" : "is-off"}>
                  <b>{L.name}</b>
                  <span>{L.spec}</span>
                </li>
              ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
