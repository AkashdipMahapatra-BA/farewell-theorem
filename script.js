
/* ---------------------------
   Starfield + Equations + UI
---------------------------- */

const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d", { alpha: true });

let w, h, dpr;
let stars = [];
let warp = 0;
let ambientMode = false;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = canvas.clientWidth = window.innerWidth;
  h = canvas.clientHeight = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

function rand(min, max) { return Math.random() * (max - min) + min; }

function createStars(count = Math.floor((w * h) / 9000)) {
  stars = Array.from({ length: count }, () => ({
    x: rand(0, w),
    y: rand(0, h),
    z: rand(0.1, 1),
    r: rand(0.6, 1.8),
    tw: rand(0, Math.PI * 2),
    hue: rand(190, 280) // cool range
  }));
}
createStars();

function drawStars(t) {
  ctx.clearRect(0, 0, w, h);

  // Subtle vignette
  const vg = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h) * 0.65);
  vg.addColorStop(0, "rgba(0,0,0,0.00)");
  vg.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);

  for (const s of stars) {
    s.tw += 0.02 + s.z * 0.03;
    const twinkle = 0.55 + Math.sin(s.tw) * 0.45;

    // Warp effect (stars slightly streak)
    const dx = (warp * (0.8 + s.z)) * (s.x - w / 2) / (w / 2);
    const dy = (warp * (0.8 + s.z)) * (s.y - h / 2) / (h / 2);

    const x = s.x + dx;
    const y = s.y + dy;

    const alpha = (0.30 + s.z * 0.55) * twinkle;
    ctx.beginPath();
    ctx.fillStyle = `hsla(${s.hue}, 95%, 70%, ${alpha})`;
    ctx.arc(x, y, s.r * (0.6 + s.z), 0, Math.PI * 2);
    ctx.fill();

    // occasional glow
    if (s.z > 0.85 && twinkle > 0.92) {
      ctx.beginPath();
      ctx.fillStyle = `hsla(${s.hue}, 100%, 80%, ${alpha * 0.25})`;
      ctx.arc(x, y, s.r * 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/* ---------------------------
   Floating equation layer
---------------------------- */
const eqLayer = document.getElementById("equation-layer");

const equations = [
  "ŷ = Xβ",
  "H(X) = -∑ p log p",
  "P(A|B)=P(B|A)P(A)/P(B)",
  "X = UΣVᵀ",
  "∇θ L(θ) → 0",
  "E[X] = ∑ x·p(x)",
  "Var(X)=E[X²]-E[X]²",
  "MAE = (1/n)∑|y-ŷ|",
  "RMSE = √((1/n)∑(y-ŷ)²)",
  "SLA = Uptime ≥ 99.9%",
  "MTTR ↓  ⇒  Calm ↑",
  "Signal = Data − Noise"
];

function spawnEquation() {
  const el = document.createElement("div");
  el.className = "eq";

  const txt = equations[Math.floor(Math.random() * equations.length)];
  // add a little emphasis sometimes
  el.innerHTML = (Math.random() > 0.7)
    ? txt.replace("=", "<strong>=</strong>")
    : txt;

  const startX = rand(-100, w + 100);
  const startY = rand(h * 0.15, h + 80);
  const dx = rand(-140, 140);
  const dy = rand(220, 560);
  const rot = rand(-8, 8);
  const duration = rand(9, 18);

  el.style.setProperty("--x", `${startX}px`);
  el.style.setProperty("--y", `${startY}px`);
  el.style.setProperty("--dx", `${dx}px`);
  el.style.setProperty("--dy", `${dy}px`);
  el.style.setProperty("--r", `${rot}deg`);
  el.style.animationDuration = `${duration}s`;

  // varied size/opacity
  el.style.fontSize = `${rand(12, 16)}px`;
  el.style.opacity = `${rand(0.22, 0.45)}`;

  eqLayer.appendChild(el);

  setTimeout(() => el.remove(), duration * 1000 + 1000);
}

let eqTimer = null;
function startEquations() {
  if (eqTimer) return;
  eqTimer = setInterval(spawnEquation, 650);
  // burst initially
  for (let i = 0; i < 10; i++) setTimeout(spawnEquation, i * 80);
}
function stopEquations() {
  clearInterval(eqTimer);
  eqTimer = null;
}
startEquations();

/* ---------------------------
   Typewriter
---------------------------- */
const twEl = document.querySelector(".typewriter");
const text = twEl?.dataset?.text || "A Theorem of Impact";
let idx = 0;

function typeLoop() {
  if (!twEl) return;
  twEl.textContent = text.slice(0, idx);
  idx++;
  if (idx <= text.length) requestAnimationFrame(typeLoop);
}
typeLoop();

/* ---------------------------
   Reveal on scroll
---------------------------- */
const reveals = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add("is-visible");
  });
}, { threshold: 0.12 });

reveals.forEach(el => io.observe(el));

/* ---------------------------
   Counters
---------------------------- */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const isFloat = el.dataset.target.includes(".");
  const duration = 1400;
  const start = performance.now();

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    // easeOutCubic
    const eased = 1 - Math.pow(1 - t, 3);
    const val = target * eased;

    el.textContent = isFloat ? val.toFixed(2) : Math.floor(val).toString();
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counters = document.querySelectorAll(".counter");
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterIO.unobserve(e.target);
    }
  });
}, { threshold: 0.25 });

counters.forEach(el => counterIO.observe(el));

/* ---------------------------
   Toast helper
---------------------------- */
const toast = document.getElementById("toast");
let toastTimer = null;

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
}

/* ---------------------------
   Copy equation buttons
---------------------------- */
document.querySelectorAll(".copyEq").forEach(btn => {
  btn.addEventListener("click", async () => {
    const text = btn.dataset.copy || "";
    try {
      await navigator.clipboard.writeText(text);
      showToast("Equation copied ✨");
    } catch {
      showToast("Copy not allowed here (browser restriction).");
    }
  });
});

/* ---------------------------
   Notes wall
---------------------------- */
const noteForm = document.getElementById("noteForm");
const noteInput = document.getElementById("noteInput");
const noteStream = document.getElementById("noteStream");

function stamp() {
  const d = new Date();
  return d.toLocaleString([], { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
}

function addNote(text) {
  if (!noteStream) return;
  const card = document.createElement("div");
  card.className = "note";
  card.innerHTML = `
    <div class="note__text">${escapeHTML(text)}</div>
    <div class="note__stamp">${stamp()} • logged</div>
  `;
  noteStream.prepend(card);

  // turn the note into a floating "constellation" effect
  floatMessage(text);
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

noteForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const v = noteInput.value.trim();
  if (!v) return;
  addNote(v);
  noteInput.value = "";
  showToast("Message sent to the stars ✦");
});

/* ---------------------------
   Floating message effect
---------------------------- */
function floatMessage(text) {
  const el = document.createElement("div");
  el.className = "eq";
  el.innerHTML = `“${escapeHTML(text)}”`;
  el.style.fontSize = `${rand(12, 15)}px`;
  el.style.opacity = `${rand(0.35, 0.55)}`;

  const startX = rand(10, w - 10);
  const startY = h + 30;
  const dx = rand(-180, 180);
  const dy = rand(520, 820);
  const rot = rand(-10, 10);
  const duration = rand(12, 20);

  el.style.setProperty("--x", `${startX}px`);
  el.style.setProperty("--y", `${startY}px`);
  el.style.setProperty("--dx", `${dx}px`);
  el.style.setProperty("--dy", `${dy}px`);
  el.style.setProperty("--r", `${rot}deg`);
  el.style.animationDuration = `${duration}s`;

  eqLayer.appendChild(el);
  setTimeout(() => el.remove(), duration * 1000 + 1000);
}

/* ---------------------------
   Confetti (QED) + Fireworks
---------------------------- */
const btnQED = document.getElementById("btnQED");
const btnFireworks = document.getElementById("btnFireworks");

function burstConfetti(x = w * 0.5, y = h * 0.35, n = 120) {
  const pieces = [];
  for (let i = 0; i < n; i++) {
    pieces.push({
      x, y,
      vx: rand(-5.2, 5.2),
      vy: rand(-7.5, -2.5),
      g: rand(0.12, 0.20),
      life: rand(50, 90),
      size: rand(2, 4),
      hue: [260, 195, 315][Math.floor(rand(0,3))]
    });
  }

  let frame = 0;
  function tick(){
    frame++;
    // overlay, not full clear
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.g;
      p.life--;

      ctx.fillStyle = `hsla(${p.hue}, 95%, 65%, ${Math.max(p.life/90, 0)})`;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.restore();

    if (frame < 90) requestAnimationFrame(tick);
  }
  tick();
}

btnQED?.addEventListener("click", () => {
  warp = 1.3;
  burstConfetti();
  showToast("QED ✦ Proof delivered!");
  setTimeout(() => warp = 0, 700);
});

btnFireworks?.addEventListener("click", () => {
  warp = 2.0;
  burstConfetti(rand(w*0.2, w*0.8), rand(h*0.2, h*0.5), 160);
  setTimeout(() => burstConfetti(rand(w*0.2, w*0.8), rand(h*0.2, h*0.5), 160), 260);
  setTimeout(() => burstConfetti(rand(w*0.2, w*0.8), rand(h*0.2, h*0.5), 160), 520);
  showToast("Stars launched ✨");
  setTimeout(() => warp = 0, 900);
});

/* ---------------------------
   Ambient Mode toggle (calmer)
---------------------------- */
const btnSnapshot = document.getElementById("btnSnapshot");
btnSnapshot?.addEventListener("click", () => {
  ambientMode = !ambientMode;
  if (ambientMode) {
    stopEquations();
    showToast("Ambient mode: calm & minimal");
  } else {
    startEquations();
    showToast("Ambient mode: off");
  }
});

/* ---------------------------
   Theme toggle (subtle shift)
---------------------------- */
const toggleTheme = document.getElementById("toggleTheme");
toggleTheme?.addEventListener("click", () => {
  document.body.classList.toggle("theme-alt");
  showToast("Theme shifted ✦");
});

/* Optional alternate theme */
const style = document.createElement("style");
style.textContent = `
  body.theme-alt{
    background:
      radial-gradient(1100px 650px at 20% 10%, rgba(255,79,216,0.16), transparent 60%),
      radial-gradient(900px 550px at 90% 25%, rgba(124,92,255,0.16), transparent 62%),
      radial-gradient(900px 650px at 60% 90%, rgba(0,229,255,0.14), transparent 60%),
      #050810;
  }
`;
document.head.appendChild(style);

/* ---------------------------
   Smooth anchor scrolling
---------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* ---------------------------
   Animation loop
---------------------------- */
function loop(t){
  // smooth warp decay
  warp *= 0.92;
  if (warp < 0.01) warp = 0;

  // slightly drift stars if ambient mode off
  for (const s of stars) {
    s.y += (0.08 + s.z * 0.35) * (ambientMode ? 0.25 : 1);
    if (s.y > h + 2) {
      s.y = -2;
      s.x = rand(0, w);
      s.z = rand(0.1, 1);
      s.r = rand(0.6, 1.8);
      s.hue = rand(190, 280);
    }
  }

  drawStars(t);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ---------------------------
   Seed some starter notes (farewell messages)
---------------------------- */
const starter = [
  "Thank you for making releases calmer and dashboards clearer.",
  "Your data-driven insights turned noise into signal — we learned so much from you.",
  "You brought observability and empathy to every runbook, every incident, every late night.",
  "The team will carry forward the standards of excellence you set.",
  "You made on-call nights less stressful and reliability feel effortless."
];
starter.forEach((s, i) => setTimeout(() => addNote(s), 900 + i * 600));
