'use strict';

/* ===========================================================================
   Портфолио — весь интерактив.
   Подключается из <head> с атрибутом defer, поэтому DOM уже разобран
   к моменту выполнения.
   =========================================================================== */

const photo      = document.getElementById('profilePhoto');
const photoFrame = document.getElementById('photoFrame');

/* ─── Soap Bubbles on Avatar Click ─────────────────────────────────────── */
function createBubble(originX, originY) {
  const bubble = document.createElement('div');
  bubble.className = 'soap-bubble';
  const size = 18 + Math.random() * 36;
  const angle = Math.random() * 2 * Math.PI;
  const distance = 60 + Math.random() * 100;
  const tx = Math.cos(angle) * distance;
  const ty = Math.sin(angle) * distance - 80;
  const duration = 1.2 + Math.random() * 1.2;
  const hue = Math.floor(Math.random() * 360);
  bubble.style.cssText = `
    width: ${size}px; height: ${size}px;
    left: ${originX - size / 2}px; top: ${originY - size / 2}px;
    --tx: ${tx}px; --ty: ${ty}px; --hue: ${hue};
    animation-duration: ${duration}s;
  `;
  document.body.appendChild(bubble);
  bubble.addEventListener('animationend', () => bubble.remove());
}

function spawnBubbles() {
  const rect = photo.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const count = 8 + Math.floor(Math.random() * 6);
  for (let i = 0; i < count; i++) {
    setTimeout(() => createBubble(cx, cy), i * 40);
  }
}

photo.addEventListener('click', spawnBubbles);
photo.addEventListener('touchstart', (e) => {
  e.preventDefault();
  spawnBubbles();
}, { passive: false });

/* ─── Flowers Canvas Border ────────────────────────────────────────────── */
/* Подход: рисуем один раз на offscreen canvas → копируем на видимый.
   Анимация — только CSS opacity/transform на canvas элементе, без перерисовки. */

const canvas = document.getElementById('flowersCanvas');
const ctx = canvas.getContext('2d');
const frame = document.getElementById('flowerFrame');

const FLOWERS = [
  // TOP
  { px:0.08, py:0, r:16, col:'#f5a0c0', cc:'#f8d040', n:5, a:-20 },
  { px:0.22, py:0, r:14, col:'#f5f0a0', cc:'#e07030', n:6, a:15  },
  { px:0.36, py:0, r:15, col:'#e8e8ff', cc:'#f0c030', n:5, a:-5  },
  { px:0.50, py:0, r:17, col:'#f5a0c0', cc:'#f8d040', n:5, a:30  },
  { px:0.64, py:0, r:14, col:'#f5d060', cc:'#e07030', n:6, a:-15 },
  { px:0.78, py:0, r:15, col:'#e8e8ff', cc:'#f0c030', n:5, a:10  },
  { px:0.92, py:0, r:16, col:'#f5a0c0', cc:'#f8d040', n:6, a:-25 },
  // BOTTOM
  { px:0.08, py:1, r:15, col:'#f5d060', cc:'#e07030', n:5, a:20  },
  { px:0.22, py:1, r:16, col:'#f5a0c0', cc:'#f8d040', n:6, a:-10 },
  { px:0.36, py:1, r:14, col:'#e8e8ff', cc:'#f0c030', n:5, a:5   },
  { px:0.50, py:1, r:17, col:'#f5d060', cc:'#e07030', n:5, a:-30 },
  { px:0.64, py:1, r:15, col:'#f5a0c0', cc:'#f8d040', n:6, a:15  },
  { px:0.78, py:1, r:14, col:'#f5f0a0', cc:'#f0c030', n:5, a:-5  },
  { px:0.92, py:1, r:16, col:'#e8e8ff', cc:'#e07030', n:6, a:25  },
  // LEFT
  { px:0, py:0.12, r:15, col:'#e8e8ff', cc:'#f8d040', n:5, a:20  },
  { px:0, py:0.28, r:14, col:'#f5a0c0', cc:'#e07030', n:6, a:-10 },
  { px:0, py:0.44, r:16, col:'#f5d060', cc:'#f0c030', n:5, a:15  },
  { px:0, py:0.60, r:14, col:'#f5f0a0', cc:'#f8d040', n:6, a:-5  },
  { px:0, py:0.76, r:15, col:'#f5a0c0', cc:'#e07030', n:5, a:25  },
  { px:0, py:0.90, r:14, col:'#e8e8ff', cc:'#f0c030', n:6, a:-15 },
  // RIGHT
  { px:1, py:0.12, r:15, col:'#f5d060', cc:'#f8d040', n:5, a:-20 },
  { px:1, py:0.28, r:14, col:'#f5a0c0', cc:'#e07030', n:6, a:10  },
  { px:1, py:0.44, r:16, col:'#e8e8ff', cc:'#f0c030', n:5, a:-15 },
  { px:1, py:0.60, r:14, col:'#f5f0a0', cc:'#f8d040', n:6, a:5   },
  { px:1, py:0.76, r:15, col:'#f5d060', cc:'#e07030', n:5, a:-25 },
  { px:1, py:0.90, r:14, col:'#f5a0c0', cc:'#f0c030', n:6, a:15  },
  // CORNERS
  { px:0, py:0, r:18, col:'#f5a0c0', cc:'#f8d040', n:5, a:45   },
  { px:1, py:0, r:18, col:'#f5d060', cc:'#e07030', n:5, a:-45  },
  { px:0, py:1, r:18, col:'#f5f0a0', cc:'#f0c030', n:5, a:-135 },
  { px:1, py:1, r:18, col:'#e8e8ff', cc:'#f8d040', n:6, a:135  },
];

const LEAVES = [
  { px:0.15, py:0, len:38, w:14, a:-88 }, { px:0.29, py:0, len:34, w:12, a:-82 },
  { px:0.43, py:0, len:36, w:13, a:-95 }, { px:0.57, py:0, len:38, w:14, a:-85 },
  { px:0.71, py:0, len:34, w:12, a:-92 }, { px:0.85, py:0, len:36, w:13, a:-88 },
  { px:0.15, py:1, len:38, w:14, a:90  }, { px:0.29, py:1, len:34, w:12, a:85  },
  { px:0.43, py:1, len:36, w:13, a:93  }, { px:0.57, py:1, len:38, w:14, a:88  },
  { px:0.71, py:1, len:34, w:12, a:95  }, { px:0.85, py:1, len:36, w:13, a:87  },
  { px:0, py:0.20, len:36, w:13, a:180 }, { px:0, py:0.36, len:34, w:12, a:175 },
  { px:0, py:0.52, len:36, w:13, a:183 }, { px:0, py:0.68, len:34, w:12, a:177 },
  { px:0, py:0.83, len:36, w:13, a:181 },
  { px:1, py:0.20, len:36, w:13, a:0   }, { px:1, py:0.36, len:34, w:12, a:-3  },
  { px:1, py:0.52, len:36, w:13, a:4   }, { px:1, py:0.68, len:34, w:12, a:-2  },
  { px:1, py:0.83, len:36, w:13, a:3   },
];

function drawPetal(c, cx, cy, r, angle) {
  const rad = angle * Math.PI / 180;
  const tx = cx + Math.cos(rad) * r;
  const ty = cy + Math.sin(rad) * r;
  const p1 = (angle - 90) * Math.PI / 180;
  const p2 = (angle + 90) * Math.PI / 180;
  const pw = r * 0.46;
  c.beginPath();
  c.moveTo(cx, cy);
  c.bezierCurveTo(
    cx + Math.cos(p1)*pw + Math.cos(rad)*r*0.3, cy + Math.sin(p1)*pw + Math.sin(rad)*r*0.3,
    tx + Math.cos(p1)*pw*0.3, ty + Math.sin(p1)*pw*0.3, tx, ty
  );
  c.bezierCurveTo(
    tx + Math.cos(p2)*pw*0.3, ty + Math.sin(p2)*pw*0.3,
    cx + Math.cos(p2)*pw + Math.cos(rad)*r*0.3, cy + Math.sin(p2)*pw + Math.sin(rad)*r*0.3,
    cx, cy
  );
  c.closePath();
}

function drawLeaf(c, bx, by, len, w, angleDeg) {
  const a = angleDeg * Math.PI / 180;
  const perp = (angleDeg + 90) * Math.PI / 180;
  const tx = bx + Math.cos(a) * len, ty = by + Math.sin(a) * len;
  const mx = bx + Math.cos(a) * len * 0.55, my = by + Math.sin(a) * len * 0.55;
  c.beginPath();
  c.moveTo(bx, by);
  c.quadraticCurveTo(mx + Math.cos(perp)*w, my + Math.sin(perp)*w, tx, ty);
  c.quadraticCurveTo(mx - Math.cos(perp)*w, my - Math.sin(perp)*w, bx, by);
  c.closePath();
}

// Рисуем ВСЁ один раз на offscreen canvas
function buildOffscreen(cw, ch, offX, offY) {
  const off = document.createElement('canvas');
  off.width = cw + 120;
  off.height = ch + 120;
  const c = off.getContext('2d');

  for (const lf of LEAVES) {
    const bx = offX + lf.px * cw, by = offY + lf.py * ch;
    drawLeaf(c, bx, by, lf.len, lf.w, lf.a);
    const g = c.createLinearGradient(bx, by,
      bx + Math.cos(lf.a*Math.PI/180)*lf.len,
      by + Math.sin(lf.a*Math.PI/180)*lf.len);
    g.addColorStop(0, 'rgba(168,218,168,0.92)');
    g.addColorStop(1, 'rgba(70,160,80,0.65)');
    c.fillStyle = g;
    c.fill();
  }

  for (const fl of FLOWERS) {
    const cx = offX + fl.px * cw, cy = offY + fl.py * ch;
    c.save();
    for (let i = 0; i < fl.n; i++) {
      drawPetal(c, cx, cy, fl.r, fl.a + (360/fl.n)*i);
      c.fillStyle = fl.col + 'ee';
      c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.55)';
      c.lineWidth = 0.7;
      c.stroke();
    }
    c.restore();
    c.beginPath();
    c.arc(cx, cy, fl.r * 0.3, 0, Math.PI*2);
    c.fillStyle = fl.cc;
    c.fill();
  }
  return off;
}

let offscreen = null;

function setupCanvas() {
  const card = frame.querySelector('.about-me');

  // Сбрасываем размер чтобы не влиял на измерения
  canvas.width = 1; canvas.height = 1;

  const cw = card.offsetWidth;
  const ch = card.offsetHeight;

  canvas.width = cw + 120;
  canvas.height = ch + 120;

  // canvas стоит absolute top:-60px left:-60px относительно frame,
  // card тоже внутри frame → смещение всегда ровно 60px
  const offX = 60;
  const offY = 60;

  offscreen = buildOffscreen(cw, ch, offX, offY);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(offscreen, 0, 0);
}

// Анимация — только CSS transition на opacity/scale, нулевая нагрузка на CPU
canvas.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
canvas.style.opacity = '0.2';
canvas.style.transform = 'scale(0.92)';
canvas.style.transformOrigin = 'center center';

frame.addEventListener('mouseenter', () => {
  canvas.style.opacity = '1';
  canvas.style.transform = 'scale(1)';
});
frame.addEventListener('mouseleave', () => {
  canvas.style.opacity = '0.2';
  canvas.style.transform = 'scale(0.92)';
});

let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(setupCanvas, 150);
});
// Ждём полной загрузки + даём браузеру отрендерить layout
window.addEventListener('load', () => requestAnimationFrame(() => requestAnimationFrame(setupCanvas)));

/* ─── Frog Family on Avatar Hover ──────────────────────────────────────── */
// Главная лягушка выпрыгивает на макушку аватара, а пара друзей — по бокам
// пониже, выглядывая из-за края круга. Все моргают вразнобой, и все вместе
// спрыгивают вниз/исчезают, когда курсор уходит.
function frogSVG(eyeOnly) {
  return `
    <svg viewBox="0 0 64 54" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="frogBody${eyeOnly}" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stop-color="#9bc25a"/>
          <stop offset="55%" stop-color="#6f9e3f"/>
          <stop offset="100%" stop-color="#4f7a2c"/>
        </radialGradient>
        <radialGradient id="frogEye${eyeOnly}" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#e8c878"/>
          <stop offset="70%" stop-color="#b8923a"/>
          <stop offset="100%" stop-color="#7a5c20"/>
        </radialGradient>
      </defs>

      <!-- задние лапы, подложены под тело -->
      <ellipse cx="11" cy="42" rx="9" ry="6" fill="#5c8a35"/>
      <ellipse cx="53" cy="42" rx="9" ry="6" fill="#5c8a35"/>

      <!-- тело — приземистое, сплющенное -->
      <ellipse cx="32" cy="34" rx="26" ry="17" fill="url(#frogBody${eyeOnly})"/>
      <ellipse cx="32" cy="38" rx="17" ry="9" fill="#cfe8a0" opacity="0.85"/>

      <!-- складка рта -->
      <path d="M14 32 Q32 41 50 32" stroke="#3d5e22" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.6"/>

      <!-- пятна на спине -->
      <ellipse cx="20" cy="24" rx="4" ry="2.6" fill="#577f30" opacity="0.55"/>
      <ellipse cx="44" cy="25" rx="4.5" ry="2.8" fill="#577f30" opacity="0.55"/>
      <ellipse cx="32" cy="20" rx="3.5" ry="2.2" fill="#577f30" opacity="0.5"/>

      <!-- глаза — крупные, выпуклые, посажены сверху -->
      <circle cx="18" cy="13" r="10.5" fill="url(#frogEye${eyeOnly})" stroke="#4f7a2c" stroke-width="1.2"/>
      <circle cx="46" cy="13" r="10.5" fill="url(#frogEye${eyeOnly})" stroke="#4f7a2c" stroke-width="1.2"/>
      <g class="frog-eye">
        <ellipse class="frog-pupil" cx="18" cy="14" rx="3.6" ry="6.2" fill="#1a1408"/>
        <circle cx="15.5" cy="10.5" r="1.6" fill="#fff" opacity="0.7"/>
      </g>
      <g class="frog-eye">
        <ellipse class="frog-pupil" cx="46" cy="14" rx="3.6" ry="6.2" fill="#1a1408"/>
        <circle cx="43.5" cy="10.5" r="1.6" fill="#fff" opacity="0.7"/>
      </g>

      <!-- ноздри -->
      <circle cx="27" cy="24" r="0.9" fill="#3d5e22"/>
      <circle cx="37" cy="24" r="0.9" fill="#3d5e22"/>
    </svg>
  `;
}

// Геометрия стайки задана для эталонного радиуса аватара 90px (десктоп, 180px).
// На мобильных аватар становится 140px (радиус 70), поэтому позиции и размеры
// пересчитываются в момент появления от ФАКТИЧЕСКОГО размера фото.
const PHOTO_BASE_R   = 90;  // радиус, под который подобраны size/offset
const ARC_OFFSET_BASE = 6;  // насколько лягушка "сидит" над ободком (при R=90)

// angle: позиция по дуге (−90 = макушка); size: размер при R=90; order: очередь появления.
const FROG_ARC = [
  { angle: -90,  size: 56, order: 0 },  // макушка — главная, самая крупная
  { angle: -56,  size: 46, order: 2 },  // справа сверху
  { angle: -124, size: 46, order: 1 },  // слева сверху
  { angle: -26,  size: 38, order: 4 },  // справа ниже
  { angle: -154, size: 38, order: 3 },  // слева ниже
  { angle: 2,    size: 32, order: 6 },  // справа у середины
  { angle: -182, size: 32, order: 5 },  // слева у середины
];

// Текущий радиус/центр аватара. offsetWidth — это layout-размер: он не зависит
// от hover-зума (.profile-photo:hover scale 1.04), в отличие от
// getBoundingClientRect(), поэтому лягушки садятся ровно и не «плывут».
function avatarMetrics() {
  const radius = (photo.offsetWidth || PHOTO_BASE_R * 2) / 2;
  return {
    radius,
    center: radius,                 // photo-frame плотно облегает круг → центр = радиус
    scale: radius / PHOTO_BASE_R,
  };
}

function buildFrogFamily() {
  const { radius, center, scale } = avatarMetrics();
  const arcOffset = ARC_OFFSET_BASE * scale;
  return FROG_ARC.map((f, i) => {
    const rad = f.angle * Math.PI / 180;
    const rr = radius + arcOffset;
    const cx = Math.cos(rad) * rr;
    const cy = Math.sin(rad) * rr;
    const size = f.size * scale;
    return {
      id: String.fromCharCode(97 + i),
      size,
      delay: f.order * 110,
      left: center + cx - size / 2,
      top:  center + cy - size / 2,
    };
  });
}

let frogEls = [];
let frogBlinkTimers = [];
let acrobatTimer = null;

function scheduleBlink(el) {
  function loop() {
    const t = setTimeout(() => {
      if (!frogEls.includes(el)) return;
      el.classList.add('frog-blink');
      setTimeout(() => el.classList.remove('frog-blink'), 160);
      loop();
    }, 1200 + Math.random() * 2000);
    frogBlinkTimers.push(t);
  }
  loop();
}

function spawnFrog() {
  if (frogEls.length) return;

  const family = buildFrogFamily();

  family.forEach(cfg => {
    const el = document.createElement('div');
    el.className = 'frog-perch';
    el.style.cssText = `
      left: ${cfg.left}px;
      top: ${cfg.top}px;
      width: ${cfg.size}px;
      height: ${cfg.size * 0.86}px;
      animation-delay: ${cfg.delay}ms;
    `;
    el.innerHTML = frogSVG(cfg.id);
    photoFrame.appendChild(el);
    frogEls.push(el);
    scheduleBlink(el); // моргание со случайным интервалом, своё у каждой
  });

  // ─── Лягушка-акробат ───
  // Появляется последней и запрыгивает на голову центральной лягушки.
  const { radius, center, scale } = avatarMetrics();
  const arcOffset = ARC_OFFSET_BASE * scale;
  const lastDelay = Math.max(...family.map(f => f.delay));

  acrobatTimer = setTimeout(() => {
    if (!frogEls.length) return; // курсор уже ушёл
    const acro = document.createElement('div');
    acro.className = 'frog-perch frog-acrobat';
    const acroSize = 34 * scale;
    acro.style.cssText = `
      left: ${center - acroSize / 2}px;
      top: ${center - (radius + arcOffset) - 52 * scale}px;
      width: ${acroSize}px;
      height: ${acroSize * 0.86}px;
    `;
    acro.innerHTML = frogSVG('acro');
    photoFrame.appendChild(acro);
    frogEls.push(acro);
    scheduleBlink(acro);
  }, lastDelay + 320);
}

function dismissFrog() {
  if (!frogEls.length) return;
  clearTimeout(acrobatTimer);
  frogBlinkTimers.forEach(clearTimeout);
  frogBlinkTimers = [];
  const els = frogEls;
  frogEls = [];
  els.forEach((el, i) => {
    // спрыгивают тоже по очереди, но быстрее
    el.style.animationDelay = (i * 45) + 'ms';
    el.classList.add('frog-leap');
    el.addEventListener('animationend', () => el.remove());
  });
}

photoFrame.addEventListener('mouseenter', spawnFrog);
photoFrame.addEventListener('mouseleave', dismissFrog);

/* ─── Theme Toggle ─────────────────────────────────────────────────────── */
const toggle = document.getElementById('themeToggle');
const html = document.documentElement;
const icon = toggle.querySelector('.theme-icon');

const saved = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', saved);
icon.textContent = saved === 'dark' ? '🌙' : '🌸';

toggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  icon.textContent = next === 'dark' ? '🌙' : '🌸';
  localStorage.setItem('theme', next);
});

/* ─── Cursor Trail ─────────────────────────────────────────────────────── */
const TRAIL_COLORS = [
  'rgba(245,160,192,VAL)',
  'rgba(123,167,188,VAL)',
  'rgba(245,208,96,VAL)',
  'rgba(168,218,168,VAL)',
  'rgba(232,232,255,VAL)',
];

let lastTrailX = 0, lastTrailY = 0;
const MIN_DIST = 42;

function spawnDrop(x, y) {
  // Дополнительное прореживание — даже если мышь двигалась рывками
  if (Math.random() > 0.5) return;
  const drop = document.createElement('div');
  drop.className = 'cursor-drop';
  const size = 4 + Math.random() * 5;
  const color = TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)]
    .replace('VAL', (0.22 + Math.random() * 0.18).toFixed(2));
  drop.style.cssText = `
    left: ${x}px; top: ${y}px;
    width: ${size}px; height: ${size}px;
    background: ${color};
    box-shadow: 0 0 ${size}px ${color};
  `;
  document.body.appendChild(drop);
  drop.addEventListener('animationend', () => drop.remove());
}

document.addEventListener('mousemove', (e) => {
  const dx = e.clientX - lastTrailX;
  const dy = e.clientY - lastTrailY;
  if (dx * dx + dy * dy < MIN_DIST * MIN_DIST) return;
  lastTrailX = e.clientX;
  lastTrailY = e.clientY;
  spawnDrop(e.clientX, e.clientY);
});
