import * as THREE from "three";

// Right-foot insole, top view. x: medial (−) → lateral (+). y: heel (−5) → toe (+5).
const shape = new THREE.Shape();
shape.moveTo(0, -5);
shape.bezierCurveTo(0.9, -5, 1.42, -4.6, 1.42, -3.6);
shape.bezierCurveTo(1.45, -2, 1.55, -0.5, 1.85, 1.2);
shape.bezierCurveTo(2.05, 2.4, 1.9, 3.6, 1.2, 4.3);
shape.bezierCurveTo(0.6, 4.85, -0.3, 5.15, -0.95, 4.95);
shape.bezierCurveTo(-1.7, 4.7, -2.0, 3.8, -2.0, 2.6);
shape.bezierCurveTo(-2.0, 1.4, -1.6, 0.2, -1.25, -0.9);
shape.bezierCurveTo(-1.05, -1.7, -1.45, -3.0, -1.4, -3.7);
shape.bezierCurveTo(-1.35, -4.6, -0.8, -5, 0, -5);

export const outline = shape.getSpacedPoints(600);
export const ymin = Math.min(...outline.map((p) => p.y));
export const ymax = Math.max(...outline.map((p) => p.y));

export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const smooth = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

export function slice(y) {
  const xs = [];
  for (let i = 0; i < outline.length; i++) {
    const a = outline[i];
    const b = outline[(i + 1) % outline.length];
    if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) xs.push(a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x));
  }
  return xs.length ? [Math.min(...xs), Math.max(...xs)] : [0, 0];
}

// Top surface height. u: 0 medial edge → 1 lateral edge. archGain scales the medial arch bump.
export function height(u, y, archGain = 1) {
  const heel = smooth(-0.5, -3.8, y);
  const toe = smooth(2.2, 5, y);
  const h = (0.22 + 0.2 * heel) * (1 - 0.45 * toe);
  const arch = 0.62 * archGain * Math.exp(-Math.pow((y + 0.9) / 1.55, 2)) * Math.pow(1 - u, 2.2);
  const rim = 0.16 * heel * Math.pow(Math.abs(2 * u - 1), 5);
  const edge = Math.pow(Math.sin(Math.PI * clamp(u, 0, 1)), 0.35);
  return (h + arch + rim) * (0.55 + 0.45 * edge);
}

// Plantar pressure, 0..1. balance 0 = collapsed inward (pronation), 1 = corrected by ARCH.
export function pressure(u, y, balance = 0) {
  const g = (cy, sy, cu, su) => Math.exp(-(Math.pow(y - cy, 2) / sy + Math.pow(u - cu, 2) / su));
  const heel = g(-3.9, 1.0, 0.5 - 0.12 * (1 - balance), 0.08);
  const ballIn = (1 - 0.25 * balance) * g(2.2, 0.7, 0.25, 0.05);
  const ballOut = (0.45 + 0.3 * balance) * g(2.0, 0.7, 0.75, 0.05);
  const archIn = 0.85 * (1 - balance) * g(-0.8, 1.6, 0.06, 0.03);
  const midOut = 0.35 * balance * g(-0.6, 1.8, 0.82, 0.03);
  const toe = 0.5 * g(4.2, 0.15, 0.25, 0.03);
  return clamp(heel + ballIn + ballOut + archIn + midOut + toe, 0, 1);
}

export function zoneOf(u, y) {
  if (y < -2.6) return "talon";
  if (y < 1.0) return u < 0.55 ? "voute" : "medioExt";
  if (y < 3.6) return u < 0.5 ? "avantInt" : "avantExt";
  return "orteils";
}

function rows(R) {
  const out = [];
  for (let r = 0; r < R; r++) {
    const t = 0.5 - 0.5 * Math.cos((Math.PI * r) / (R - 1));
    const y = ymin + 0.003 + t * (ymax - ymin - 0.006);
    const [x0, x1] = slice(y);
    out.push({ y, x0, x1, t });
  }
  return out;
}

// Closed slab between lo(u,y) and hi(u,y). Mapped to three.js as (x, height, −y).
export function slabGeometry(lo = () => 0, hi = (u, y) => height(u, y), R = 140, C = 48) {
  const rs = rows(R);
  const pos = [];
  const uv = [];
  const idx = [];
  for (const pass of [0, 1])
    for (const row of rs)
      for (let c = 0; c < C; c++) {
        const u = c / (C - 1);
        const x = row.x0 + u * (row.x1 - row.x0);
        pos.push(x, pass === 0 ? hi(u, row.y) : lo(u, row.y), -row.y);
        uv.push(u, row.t);
      }
  const T = (r, c) => r * C + c;
  const B = (r, c) => R * C + r * C + c;
  for (let r = 0; r < R - 1; r++)
    for (let c = 0; c < C - 1; c++) {
      idx.push(T(r, c), T(r, c + 1), T(r + 1, c), T(r, c + 1), T(r + 1, c + 1), T(r + 1, c));
      idx.push(B(r, c), B(r + 1, c), B(r, c + 1), B(r, c + 1), B(r + 1, c), B(r + 1, c + 1));
    }
  for (let r = 0; r < R - 1; r++) {
    idx.push(T(r, 0), T(r + 1, 0), B(r, 0), T(r + 1, 0), B(r + 1, 0), B(r, 0));
    const L = C - 1;
    idx.push(T(r, L), B(r, L), T(r + 1, L), T(r + 1, L), B(r, L), B(r + 1, L));
  }
  for (let c = 0; c < C - 1; c++) {
    idx.push(T(0, c), B(0, c), T(0, c + 1), T(0, c + 1), B(0, c), B(0, c + 1));
    const L = R - 1;
    idx.push(T(L, c), T(L, c + 1), B(L, c), T(L, c + 1), B(L, c + 1), B(L, c));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// Hex grid of AeroCells inside the outline.
export function cellLayout(spacing = 0.4, margin = 0.28) {
  const cells = [];
  for (let y = ymin + 0.45, row = 0; y < ymax - 0.35; y += spacing * 0.866, row++) {
    const [x0, x1] = slice(y);
    for (let x = x0 + margin + (row % 2 ? spacing / 2 : 0); x < x1 - margin; x += spacing) {
      const u = (x - x0) / (x1 - x0);
      cells.push({ x, y, u, h: height(u, y), zone: zoneOf(u, y) });
    }
  }
  return cells;
}

export function outlineLine(color, opacity, lift = 0.01) {
  const pts = outline.map((p) => new THREE.Vector3(p.x, lift, -p.y));
  const g = new THREE.BufferGeometry().setFromPoints(pts);
  return new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}

// Glass shell with instanced glowing cells (the hero look).
export function buildGlassSole(group) {
  const shell = new THREE.Mesh(
    slabGeometry(),
    new THREE.MeshPhysicalMaterial({
      color: 0xbfefff,
      transparent: true,
      opacity: 0.2,
      roughness: 0.08,
      metalness: 0.1,
      clearcoat: 1,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  group.add(shell);
  group.add(outlineLine(0x8be8ff, 0.9));
  const cells = cellLayout();
  const geo = new THREE.CylinderGeometry(0.145, 0.145, 1, 18);
  geo.translate(0, 0.5, 0);
  const mat = new THREE.MeshStandardMaterial({ color: 0x8be8ff, emissive: 0x2aa8d0, emissiveIntensity: 0.9, roughness: 0.35, metalness: 0.1 });
  const inst = new THREE.InstancedMesh(geo, mat, cells.length);
  inst.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(cells.length * 3).fill(1), 3);
  group.add(inst);
  const dummy = new THREE.Object3D();
  // heightOf(cell, i) → height in world units; widthOf(cell, i) → radius scale
  function setCells(heightOf, widthOf = () => 1) {
    cells.forEach((c, i) => {
      dummy.position.set(c.x, 0.02, -c.y);
      const w = widthOf(c, i);
      dummy.scale.set(w, Math.max(0.03, heightOf(c, i)), w);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
  }
  return { shell, inst, mat, cells, setCells };
}

// Shared renderer / camera / lights / drag-to-rotate / visibility-aware loop.
export function createStage(container, { fov = 30, camPos = [0, 8.5, 21], drag = true, onFrame } = {}) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 200);
  camera.position.set(...camPos);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight(0xdff6ff, 0x0a0d10, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(5, 10, 7);
  scene.add(key);
  const rim = new THREE.PointLight(0x8be8ff, 2.2, 0, 0);
  rim.position.set(-6, 3, -7);
  scene.add(rim);

  const outer = new THREE.Group();
  const spin = new THREE.Group();
  outer.add(spin);
  scene.add(outer);

  const state = { visible: true, drag: 0, dragging: false, lastX: 0, reduce };
  const size = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(size);
  ro.observe(container);
  size();

  const el = renderer.domElement;
  const down = (e) => {
    state.dragging = true;
    state.lastX = e.clientX;
  };
  const move = (e) => {
    if (!state.dragging) return;
    state.drag += (e.clientX - state.lastX) * 0.012;
    state.lastX = e.clientX;
  };
  const up = () => (state.dragging = false);
  if (drag) {
    el.style.touchAction = "pan-y";
    el.style.cursor = "grab";
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }
  const io = new IntersectionObserver((es) => (state.visible = es[0].isIntersecting), { rootMargin: "100px" });
  io.observe(container);

  let raf = 0;
  const t0 = performance.now();
  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    if (!state.visible) return;
    onFrame && onFrame((now - t0) / 1000, state);
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(loop);

  return {
    THREE,
    scene,
    camera,
    renderer,
    outer,
    spin,
    state,
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      scene.traverse((o) => {
        o.geometry && o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      });
      renderer.dispose();
      el.remove();
    },
  };
}
