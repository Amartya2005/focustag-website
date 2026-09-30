import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const plastic = (hex) =>
  new THREE.MeshStandardMaterial({
    color: hex,
    metalness: 0.04,
    roughness: 0.68,
  });

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function teardrop(cx, cy, rw, rh) {
  const p = new THREE.Path();
  const r = rw;
  p.absarc(cx, cy - rh * 0.28, r, Math.PI * 0.15, Math.PI * 0.85, false);
  p.lineTo(cx, cy + rh * 0.55);
  p.closePath();
  return p;
}

function makeTag(color = 0xecece8, showBack = false) {
  const g = new THREE.Group();
  const mat = plastic(color);
  const matDim = plastic(new THREE.Color(color).multiplyScalar(0.92).getHex());
  const shell = roundedRect(1.78, 2.28, 0.28);
  shell.holes.push(teardrop(0, 0.62, 0.13, 0.42));
  shell.holes.push(teardrop(0, -0.72, 0.13, 0.42));
  const back = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shell, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.018,
      bevelSize: 0.018,
      bevelSegments: 2,
    }),
    mat
  );
  back.castShadow = true;
  back.receiveShadow = true;
  g.add(back);
  const plate = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundedRect(1.58, 2.08, 0.24), {
      depth: 0.07,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 2,
    }),
    matDim
  );
  plate.position.z = 0.14;
  plate.castShadow = true;
  g.add(plate);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.018, 16, 64), mat);
  ring.position.z = 0.225;
  g.add(ring);
  const pad = new THREE.Mesh(new THREE.CircleGeometry(0.3, 48), matDim);
  pad.position.z = 0.211;
  g.add(pad);
  const dimple = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), mat);
  dimple.position.z = 0.24;
  g.add(dimple);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 512, 256);
  ctx.fillStyle = "rgba(90,90,90,0.55)";
  ctx.font = "48px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("FOCUSTAG", 256, 140);
  const tex = new THREE.CanvasTexture(canvas);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 0.28),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true })
  );
  label.position.set(0, 0.12, -0.002);
  label.rotation.y = Math.PI;
  g.add(label);
  g.rotation.y = showBack ? Math.PI : 0;
  g.rotation.x = -0.18;
  return g;
}

function makePhone() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.02, 2.12, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.7, roughness: 0.4 })
  );
  g.add(body);
  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(0.96, 2.06, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.6 })
  );
  bezel.position.z = 0.055;
  g.add(bezel);
  const screen = document.createElement("canvas");
  screen.width = 384;
  screen.height = 832;
  const s = screen.getContext("2d");
  s.fillStyle = "#0b0b0b";
  s.fillRect(0, 0, 384, 832);
  s.fillStyle = "#ff6308";
  s.beginPath();
  s.arc(48, 72, 5, 0, Math.PI * 2);
  s.fill();
  s.font = "18px monospace";
  s.fillText("FOCUS ACTIVE", 64, 78);
  s.fillStyle = "#ffffff";
  s.font = "72px sans-serif";
  s.fillText("42:18", 92, 400);
  s.fillStyle = "#8a8a8a";
  s.font = "20px sans-serif";
  s.fillText("Main Library", 120, 460);
  s.fillText("Room 402", 138, 490);
  const tex = new THREE.CanvasTexture(screen);
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 1.96),
    new THREE.MeshBasicMaterial({ map: tex })
  );
  plane.position.z = 0.072;
  g.add(plane);
  return g;
}

function boot(canvas, mode) {
  if (!canvas) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    if (mode === "hero") document.querySelector(".hero")?.classList.add("has-webgl");
  } catch (err) {
    canvas.style.display = "none";
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 40);
  camera.position.set(mode === "hero" ? 3.4 : 0.2, mode === "hero" ? 1.6 : 2.2, mode === "hero" ? 4.6 : 3.4);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 2.4;
  controls.maxDistance = 8;
  controls.autoRotate = !reduce;
  controls.autoRotateSpeed = mode === "hero" ? 0.6 : 1.1;
  controls.target.set(mode === "hero" ? 0.6 : 0, 0.1, 0);
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(3.2, 5.5, 4.2);
  key.castShadow = true;
  scene.add(key);
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const rim = new THREE.DirectionalLight(0xffffff, 0.7);
  rim.position.set(-5, 2, -2);
  scene.add(rim);
  const fill = new THREE.PointLight(0xfff4e8, 0.55, 14);
  fill.position.set(-2, 2, 4);
  scene.add(fill);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(8, 48), new THREE.ShadowMaterial({ opacity: 0.28 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.15;
  floor.receiveShadow = true;
  scene.add(floor);
  if (mode === "hero") {
    const white = makeTag(0xecece8);
    white.position.set(0.55, 0.1, 0.4);
    white.rotation.set(-0.22, -0.35, 0.08);
    white.scale.setScalar(1.05);
    scene.add(white);
    const sand = makeTag(0xd7b394);
    sand.position.set(1.35, 0.18, -0.15);
    sand.rotation.set(-0.28, -0.55, 0.12);
    sand.scale.setScalar(0.98);
    scene.add(sand);
    const phone = makePhone();
    phone.position.set(2.55, 0.25, 0.55);
    phone.rotation.set(-0.1, -0.4, 0.04);
    phone.scale.setScalar(0.92);
    scene.add(phone);
    controls.target.set(1.2, 0.1, 0.2);
  } else {
    const tag = makeTag(0xecece8);
    tag.scale.setScalar(1.35);
    scene.add(tag);
    controls.target.set(0, 0, 0.1);
    camera.position.set(0.15, 0.4, 4.2);
  }
  function resize() {
    const w = canvas.clientWidth || canvas.parentElement.clientWidth;
    const h = canvas.clientHeight || canvas.parentElement.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement || canvas);
  function tick() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
}

boot(document.getElementById("stage"), "hero");
boot(document.getElementById("studio"), "studio");
