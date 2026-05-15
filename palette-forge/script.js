/* ═══════════════ PaletteForge — script.js ═══════════════ */
'use strict';

// ── State ──────────────────────────────────────────────
let state = {
  h: 262, s: 83, l: 58,
  harmony: 'monochromatic',
  savedPalettes: JSON.parse(localStorage.getItem('PaletteForge_saved') || '[]'),
};

const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

// ── Advanced Exports Constants (Moved up to prevent TDZ) ──
var ADV_GENERATORS = {
  'tailwind-next': genTailwindNext,
  'shadcn': genShadcn,
  'angular-tailwind': genAngularTailwind,
  'angular-standalone': genAngularStandalone,
  'daisyui': genDaisyUI,
  'css-vars': genCSSVars,
  'react-component': genReactComponent,
  'json': genJSON,
};

var ADV_FILENAMES = {
  'tailwind-next': 'tailwind.config.js',
  'shadcn': 'globals.css',
  'angular-tailwind': 'tailwind.config.js',
  'angular-standalone': 'theme.component.ts',
  'daisyui': 'tailwind.config.js',
  'css-vars': 'colors.css',
  'react-component': 'ThemeProvider.jsx',
  'json': 'design-tokens.json',
};

let _lastAdvFormat = '';
let _lastAdvContent = '';

// ── Semantic role hue offsets ──────────────────────────
var ROLE_OFFSETS = {
  primary: 0,
  secondary: 210,
  accent: 150,
  success: 145,
  warning: 38,
  error: 0,
  neutral: 0,
};
var ROLE_SAT_OVERRIDE = { success: 70, warning: 90, error: 92, neutral: 8 };
var ROLE_HUE_FIXED = { success: null, warning: null, error: 0, neutral: null };

// ── UI & Preset Constants (Moved up to prevent TDZ) ──
var PG_PRESETS = {
  minimal: {
    label: 'Minimal', emoji: '◻',
    radius: 6, shadowY: 2, shadowBlur: 6, shadowOp: 0.12,
    blur: 0, bgOp: 1, borderW: 0, borderOp: 0.07,
  },
  softui: {
    label: 'Soft UI', emoji: '☁',
    radius: 24, shadowY: 16, shadowBlur: 40, shadowOp: 0.22,
    blur: 0, bgOp: 1, borderW: 0, borderOp: 0.04,
  },
  neumorphism: {
    label: 'Neumorphism', emoji: '💎',
    radius: 20, shadowY: 6, shadowBlur: 18, shadowOp: 0.28,
    blur: 0, bgOp: 1, borderW: 0, borderOp: 0, neuro: true,
  },
  glassmorphism: {
    label: 'Glassmorphism', emoji: '🔮',
    radius: 16, shadowY: 8, shadowBlur: 24, shadowOp: 0.14,
    blur: 14, bgOp: 0.12, borderW: 1, borderOp: 0.20,
  },
  brutalism: {
    label: 'Brutalism', emoji: '🪨',
    radius: 0, shadowY: 4, shadowBlur: 0, shadowOp: 1,
    blur: 0, bgOp: 1, borderW: 3, borderOp: 1,
  },
};

var PG_TYPE_LABELS = {
  card: '🃏 Card selected',
  btn: '🔘 Button selected',
  navbar: '🧭 Navbar selected',
  input: '⌨️ Input selected',
  table: '📋 Table selected',
  badge: '🏷 Badge selected',
};

var BRAND_PRESETS = [
  { name: 'Linear', hex: '#5E6AD2', desc: 'Deep indigo SaaS', harmony: 'monochromatic' },
  { name: 'Vercel', hex: '#000000', desc: 'Pure minimal black', harmony: 'monochromatic' },
  { name: 'Stripe', hex: '#635BFF', desc: 'Electric violet', harmony: 'complementary' },
  { name: 'Notion', hex: '#6B7280', desc: 'Calm neutral gray', harmony: 'monochromatic' },
  { name: 'Arc', hex: '#FF4D94', desc: 'Playful magenta pink', harmony: 'analogous' },
  { name: 'Apple', hex: '#1D1D1F', desc: 'Premium dark neutral', harmony: 'monochromatic' },
  { name: 'Supabase', hex: '#3ECF8E', desc: 'Fresh electric green', harmony: 'analogous' },
  { name: 'Framer', hex: '#0055FF', desc: 'Bold cobalt blue', harmony: 'split' },
];

var MOOD_RULES = [
  { kw: ['cyberpunk', 'neon', 'synthwave', 'retrowave'], h: 285, s: 92, l: 55, harmony: 'triadic', desc: 'Electric neon purple with triadic sparks' },
  { kw: ['vaporwave', '90s', 'retro', 'pastel'], h: 320, s: 65, l: 72, harmony: 'analogous', desc: 'Soft pastel pink with analogous warmth' },
  { kw: ['dark academia', 'gothic', 'moody', 'noir'], h: 28, s: 30, l: 22, harmony: 'monochromatic', desc: 'Deep warm shadow with monochromatic depth' },
  { kw: ['cottagecore', 'nature', 'earthy', 'organic'], h: 88, s: 42, l: 42, harmony: 'analogous', desc: 'Muted sage green with earthy analogues' },
  { kw: ['brutalist', 'brutal', 'raw', 'concrete'], h: 0, s: 0, l: 18, harmony: 'monochromatic', desc: 'Hard neutral black with zero chroma' },
  { kw: ['y2k', 'bubbly', 'pop', 'funky'], h: 55, s: 95, l: 60, harmony: 'tetradic', desc: 'Punchy yellow-green with tetradic explosion' },
  { kw: ['calm', 'serene', 'zen', 'peaceful', 'breathe'], h: 200, s: 55, l: 58, harmony: 'analogous', desc: 'Soft sky blue with gentle analogues' },
  { kw: ['energetic', 'bold', 'vivid', 'loud', 'intense'], h: 18, s: 96, l: 54, harmony: 'triadic', desc: 'High-energy orange with triadic contrast' },
  { kw: ['luxurious', 'luxury', 'premium', 'expensive', 'gold'], h: 38, s: 72, l: 44, harmony: 'complementary', desc: 'Rich amber gold with deep complement' },
  { kw: ['playful', 'fun', 'happy', 'cheerful', 'startup'], h: 28, s: 90, l: 62, harmony: 'analogous', desc: 'Warm coral with playful analogues' },
  { kw: ['elegant', 'classy', 'refined', 'sophisticated'], h: 260, s: 48, l: 36, harmony: 'monochromatic', desc: 'Deep restrained violet with tonal depth' },
  { kw: ['dark', 'night', 'midnight', 'shadow'], h: 230, s: 55, l: 28, harmony: 'monochromatic', desc: 'Deep midnight blue with dark tones' },
  { kw: ['minimal', 'clean', 'simple', 'white space'], h: 210, s: 15, l: 55, harmony: 'monochromatic', desc: 'Low-chroma cool gray with airy lightness' },
  { kw: ['warm', 'cozy', 'hygge', 'autumn', 'fall'], h: 22, s: 68, l: 52, harmony: 'analogous', desc: 'Warm terracotta with cozy analogues' },
  { kw: ['cool', 'ice', 'frost', 'winter', 'arctic'], h: 196, s: 78, l: 50, harmony: 'complementary', desc: 'Icy cyan with warm complement pop' },
  { kw: ['romantic', 'love', 'rose', 'blush', 'soft'], h: 348, s: 68, l: 62, harmony: 'analogous', desc: 'Soft rose with warm pink analogues' },
  { kw: ['angry', 'aggressive', 'danger', 'warning'], h: 4, s: 92, l: 50, harmony: 'split', desc: 'Alert red with split complements' },
  { kw: ['mysterious', 'cosmic', 'galaxy', 'space'], h: 268, s: 80, l: 42, harmony: 'triadic', desc: 'Deep cosmic purple with triadic stars' },
  { kw: ['saas', 'software', 'productivity', 'app', 'tool'], h: 213, s: 72, l: 52, harmony: 'complementary', desc: 'Professional SaaS blue with warm complement' },
  { kw: ['fintech', 'finance', 'banking', 'money', 'trust'], h: 228, s: 62, l: 42, harmony: 'monochromatic', desc: 'Trustworthy deep navy with tonal authority' },
  { kw: ['healthcare', 'medical', 'health', 'clean', 'hospital'], h: 185, s: 58, l: 48, harmony: 'analogous', desc: 'Clean teal with calming analogues' },
  { kw: ['gaming', 'game', 'esport', 'stream', 'twitch'], h: 263, s: 90, l: 54, harmony: 'tetradic', desc: 'Gaming purple with tetradic excitement' },
  { kw: ['crypto', 'web3', 'blockchain', 'defi', 'dao'], h: 175, s: 85, l: 45, harmony: 'complementary', desc: 'Electric teal-green with crypto energy' },
  { kw: ['media', 'creative', 'design', 'art', 'studio'], h: 338, s: 78, l: 56, harmony: 'triadic', desc: 'Creative magenta with triadic palette' },
  { kw: ['food', 'restaurant', 'cafe', 'tasty', 'appetite'], h: 32, s: 92, l: 50, harmony: 'analogous', desc: 'Appetizing amber-orange with warm neighbours' },
  { kw: ['eco', 'green', 'sustainable', 'environment', 'planet'], h: 142, s: 68, l: 42, harmony: 'analogous', desc: 'Natural forest green with earthy analogues' },
  { kw: ['travel', 'adventure', 'explore', 'journey'], h: 198, s: 82, l: 48, harmony: 'triadic', desc: 'Ocean blue with adventurous triadic range' },
  { kw: ['education', 'learn', 'school', 'academic'], h: 244, s: 60, l: 50, harmony: 'analogous', desc: 'Thoughtful indigo with academic analogues' },
];

// ── Color Math ─────────────────────────────────────────
function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hexToRgb(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function relativeLuminance(hex) {
  return hexToRgb(hex).map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }).reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0);
}

function contrastRatio(hex1, hex2) {
  const L1 = relativeLuminance(hex1), L2 = relativeLuminance(hex2);
  const bright = Math.max(L1, L2), dark = Math.min(L1, L2);
  return +((bright + 0.05) / (dark + 0.05)).toFixed(2);
}

function shadeForStep(h, s, step) {
  const map = { 50: 97, 100: 94, 200: 88, 300: 78, 400: 66, 500: 55, 600: 44, 700: 34, 800: 25, 900: 17, 950: 12 };
  return hslToHex(h, Math.min(s + 5, 100), map[step]);
}

function generateShades(h, s) {
  return SHADE_STEPS.map(step => ({ step, hex: shadeForStep(h, s, step) }));
}

function getHarmonyColors(h, s, l, mode) {
  const mk = (hue, sat = s, lit = l) => ({ hex: hslToHex(hue % 360, sat, lit), h: hue % 360, s: sat, l: lit });
  switch (mode) {
    case 'complementary': return [mk(h), mk(h + 180)];
    case 'analogous': return [mk(h - 30), mk(h), mk(h + 30)];
    case 'triadic': return [mk(h), mk(h + 120), mk(h + 240)];
    case 'split': return [mk(h), mk(h + 150), mk(h + 210)];
    case 'tetradic': return [mk(h), mk(h + 90), mk(h + 180), mk(h + 270)];
    default: return [mk(h, s, 30), mk(h, s, 45), mk(h, s, 58), mk(h, s, 72), mk(h, s, 86)];
  }
}

function contrastColor(hex) {
  return relativeLuminance(hex) > 0.35 ? '#0f172a' : '#ffffff';
}

// ── Presets ────────────────────────────────────────────
const PRESETS = [
  { name: 'Violet Storm', h: 262, s: 83, l: 58 },
  { name: 'Ocean Breeze', h: 200, s: 85, l: 50 },
  { name: 'Rose Gold', h: 340, s: 70, l: 60 },
  { name: 'Emerald', h: 152, s: 75, l: 45 },
  { name: 'Sunset', h: 20, s: 90, l: 58 },
  { name: 'Midnight', h: 230, s: 60, l: 35 },
  { name: 'Citrus', h: 45, s: 95, l: 52 },
  { name: 'Neon Mint', h: 165, s: 80, l: 55 },
];

// ── DOM Refs ───────────────────────────────────────────
const $ = id => document.getElementById(id);
const colorPicker = $('color-picker');
const hexInput = $('hex-input');
const hueSlider = $('hue-slider');
const satSlider = $('sat-slider');
const litSlider = $('lit-slider');
const hueVal = $('hue-val');
const satVal = $('sat-val');
const litVal = $('lit-val');
const colorNameLbl = $('color-name-label');

// ── Render ─────────────────────────────────────────────
function render() {
  const { h, s, l } = state;
  const hex = hslToHex(h, s, l);
  const shades = generateShades(h, s);

  // sync controls
  if (colorPicker) colorPicker.value = hex.toLowerCase();
  if (hexInput) hexInput.value = hex;
  if (hueSlider) hueSlider.value = h;
  if (satSlider) satSlider.value = s;
  if (litSlider) litSlider.value = l;
  if (hueVal) hueVal.textContent = `${h}°`;
  if (satVal) satVal.textContent = `${s}%`;
  if (litVal) litVal.textContent = `${l}%`;

  // update sat/lit slider tracks
  document.documentElement.style.setProperty('--sat-track',
    `linear-gradient(to right, hsl(${h},0%,${l}%), hsl(${h},100%,${l}%))`);
  document.documentElement.style.setProperty('--lit-track',
    `linear-gradient(to right, hsl(${h},${s}%,5%), hsl(${h},${s}%,50%), hsl(${h},${s}%,95%))`);
  const satS = document.querySelector('.sat-slider');
  if (satS) satS.style.setProperty('--sat-track',
    `linear-gradient(to right, hsl(${h},0%,${l}%), hsl(${h},100%,${l}%))`);

  if (colorNameLbl) colorNameLbl.textContent = `HSL(${h}°, ${s}%, ${l}%)`;
  renderShadeStrip(shades);
  renderHarmonyColors();
  renderUIPreview(hex, shades);
  renderFullPalette(shades);
  renderCodeExports(shades);

  if ($('contrast-matrix')) renderContrastMatrix(shades);
  if ($('saved-palettes-grid')) renderSavedPalettes();

  updateSavedCount();
  renderColorInfoPanel(hex, h, s, l);

  // Asynchronously refresh advanced exports for the Code tab
  if (window._advTimeout) clearTimeout(window._advTimeout);
  window._advTimeout = setTimeout(renderAdvancedExports, 100);
}

function renderColorInfoPanel(hex, h, s, l) {
  const [r, g, b] = hexToRgb(hex);
  const infoHex = $('info-hex'); if (infoHex) infoHex.textContent = hex;
  const infoRgb = $('info-rgb'); if (infoRgb) infoRgb.textContent = `${r}, ${g}, ${b}`;
  const infoHsl = $('info-hsl'); if (infoHsl) infoHsl.textContent = `${h}°, ${s}%, ${l}%`;
  const infoName = $('info-name'); if (infoName) infoName.textContent = getColorName(h, s, l);
}

function getColorName(h, s, l) {
  if (s < 8) return l < 20 ? 'Near Black' : l > 80 ? 'Near White' : 'Gray';
  if (l < 15) return 'Very Dark'; if (l > 88) return 'Very Light';
  const hues = [[15, 'Red'], [40, 'Orange'], [65, 'Yellow'], [80, 'Yellow-Green'],
  [150, 'Green'], [185, 'Cyan'], [210, 'Sky Blue'], [255, 'Blue'], [290, 'Indigo'],
  [325, 'Violet'], [345, 'Pink'], [361, 'Red']];
  const name = hues.find(([lim]) => h <= lim)?.[1] || 'Red';
  const mod = l < 35 ? 'Dark ' : l > 70 ? 'Light ' : '';
  return mod + name;
}

function renderQuickContrast(shades) {
  const el = $('quick-contrast'); if (!el) return;
  const shade500 = shades.find(s => s.step === 500)?.hex || '#7c3aed';
  const pairs = [['#FFFFFF', shade500, 'White on 500'], ['#0F172A', shade500, 'Black on 500']];
  el.innerHTML = pairs.map(([fg, bg, label]) => {
    const r = contrastRatio(fg, bg);
    const pass = r >= 4.5;
    const warn = r >= 3;
    const cls = pass ? 'badge-pass' : warn ? 'badge-warn' : 'badge-fail';
    return `<div class="qc-row">
      <div style="width:24px;height:20px;border-radius:4px;background:${bg};border:1px solid rgba(255,255,255,0.1)"></div>
      <span style="font-size:11px;color:${bg}" class="font-mono">A</span>
      <div class="flex-1 text-[11px] text-gray-400 truncate">${label}</div>
      <span class="${cls}">${r}:1</span>
    </div>`;
  }).join('');
}

// ── Smart Role Suggestions ─────────────────────────────────
function renderRoleSuggestions(shades, baseHex) {
  const el = $('role-suggestions'); if (!el) return;
  const WHITE = '#FFFFFF', DARK = '#0F172A';
  const shade = step => shades.find(s => s.step === step)?.hex || baseHex;

  // Role picks from shade scale
  const roles = [
    { role: 'Primary', hex: shade(500), icon: '🟣', reason: 'Main CTAs, active states, key interactive elements' },
    { role: 'Primary Hover', hex: shade(600), icon: '🟤', reason: 'Button :hover/:focus-visible state' },
    { role: 'Accent', hex: shade(400), icon: '✨', reason: 'Focus rings, links, highlight badges' },
    { role: 'Surface', hex: shade(900), icon: '□', reason: 'Card & panel backgrounds (dark mode)' },
    { role: 'Border', hex: shade(800), icon: '◯', reason: 'Dividers, input borders, card strokes' },
    { role: 'Muted Text', hex: shade(400), icon: '💬', reason: 'Secondary text, placeholders, metadata' },
    { role: 'Success', hex: '#22c55e', icon: '✅', reason: 'Confirmations, positive status, green badges' },
    { role: 'Warning', hex: '#f59e0b', icon: '⚠️', reason: 'Caution notices, pending states, alerts' },
    { role: 'Error', hex: '#ef4444', icon: '❌', reason: 'Validation errors, destructive feedback' },
  ];

  // Best WCAG text/bg combinations from palette shades
  const contrastCombos = [];
  for (const bgStep of [900, 950, 800, 700]) {
    const bg = shade(bgStep);
    for (const txStep of [50, 100, 200, 300, 400]) {
      const tx = shade(txStep);
      const r = contrastRatio(tx, bg);
      if (r >= 4.5) {
        contrastCombos.push({
          bg, tx, ratio: r, bgStep, txStep,
          level: r >= 7 ? 'AAA' : 'AA'
        });
        break;
      }
    }
  }
  [WHITE, DARK].forEach(fg => {
    const r = contrastRatio(fg, baseHex);
    if (r >= 3) contrastCombos.push({
      bg: baseHex, tx: fg, ratio: r, bgStep: 500,
      txStep: fg === WHITE ? 'white' : 'dark',
      level: r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : 'AA Large'
    });
  });

  // Button hierarchy
  const cta = shade(500), ctaFg = contrastColor(cta);
  const ctaHov = shade(600);
  const sec = shade(700), secFg = contrastColor(sec);
  const outline = shade(500);
  const ghost = shade(400);

  el.innerHTML = `
<!-- Role picks -->
<div class="srs-section">
  <h3 class="srs-title">🎨 Suggested Role Assignments</h3>
  <div class="srs-roles">
    ${roles.map(r => {
    const fg = contrastColor(r.hex);
    return `<div class="srs-role-row">
        <div class="srs-dot" style="background:${r.hex}">
          <span style="font-size:9px;line-height:1">${r.icon}</span>
        </div>
        <div class="srs-role-info">
          <span class="srs-role-name">${r.role}</span>
          <span class="srs-role-reason">${r.reason}</span>
        </div>
        <button class="srs-copy-btn" onclick="copyWithRipple(this,'${r.hex}')" title="Copy ${r.hex}">
          <span class="srs-hex">${r.hex}</span>📋
        </button>
      </div>`;
  }).join('')}
  </div>
</div>

<!-- Contrast combos -->
<div class="srs-section">
  <h3 class="srs-title">♿ Best Contrast Combos</h3>
  <div class="srs-contrasts">
    ${contrastCombos.slice(0, 5).map(c => {
    const levelCls = c.level.startsWith('AA') ? 'badge-pass' : 'badge-warn';
    return `<div class="srs-contrast-row">
        <div class="srs-contrast-chip" style="background:${c.bg}">
          <span style="color:${c.tx};font-size:13px;font-weight:900">Aa</span>
        </div>
        <div class="srs-contrast-labels">
          <span class="srs-shade-tag">bg-${c.bgStep}</span>
          <span class="srs-arrow">+</span>
          <span class="srs-shade-tag">text-${c.txStep}</span>
        </div>
        <div class="srs-contrast-meta">
          <span class="${levelCls}" style="font-size:9px;padding:1px 5px">${c.level}</span>
          <span class="srs-ratio">${c.ratio}:1</span>
        </div>
      </div>`;
  }).join('')}
  </div>
</div>

<!-- Button hierarchy -->
<div class="srs-section">
  <h3 class="srs-title">👆 Button Hierarchy</h3>
  <div class="srs-btn-list">
    ${[
      {
        rank: '1st', label: 'Primary CTA', bg: cta, fg: ctaFg, border: 'none',
        note: `<code>${cta}</code> — solid, highest visual weight. Hover: <code>${ctaHov}</code>`
      },
      {
        rank: '2nd', label: 'Secondary', bg: sec, fg: secFg, border: 'none',
        note: `<code>${sec}</code> — darker fill, supporting actions`
      },
      {
        rank: '3rd', label: 'Outline', bg: 'transparent', fg: outline, border: `1.5px solid ${outline}`,
        note: `Transparent + <code>${outline}</code> border — tertiary or cancel`
      },
      {
        rank: '4th', label: 'Ghost/Link', bg: 'transparent', fg: ghost, border: 'none',
        note: `Text-only in <code>${ghost}</code> — nav links, lowest priority`
      },
      {
        rank: '✕', label: 'Destructive', bg: '#ef4444', fg: '#fff', border: 'none',
        note: `Fixed <code>#ef4444</code> — delete, remove, irreversible actions`, danger: true
      },
    ].map(b => `
      <div class="srs-btn-row">
        <span class="srs-rank${b.danger ? ' srs-rank-danger' : ''}">${b.rank}</span>
        <button class="srs-demo-btn"
          style="background:${b.bg};color:${b.fg};border:${b.border}"
          onclick="copyText('${b.bg !== 'transparent' ? 'background:' + b.bg + '; ' : ''}color:${b.fg}')">
          ${b.label}
        </button>
        <p class="srs-btn-note">${b.note}</p>
      </div>`).join('')}
  </div>
</div>`;
}

function renderShadeStrip(shades) {
  const el = $('shade-strip');
  el.innerHTML = shades.map(({ step, hex }) => {
    const fg = contrastColor(hex);
    return `<div class="shade-swatch" style="background:${hex}" title="${step}: ${hex}"
      onclick="copyWithRipple(this,'${hex}')" data-hex="${hex}">
      <span class="swatch-hex" style="color:${fg}">${hex}</span>
    </div>`;
  }).join('');
}

function renderHarmonyColors() {
  const colors = getHarmonyColors(state.h, state.s, state.l, state.harmony);
  const labels = {
    monochromatic: ['Light', 'Med-light', 'Base', 'Med-dark', 'Dark'],
    complementary: ['Base', 'Complement'], analogous: ['Warm', 'Base', 'Cool'],
    triadic: ['Base', 'Tri-2', 'Tri-3'], split: ['Base', 'Split-1', 'Split-2'],
    tetradic: ['Base', 'Tet-2', 'Tet-3', 'Tet-4']
  };
  const names = labels[state.harmony] || [];
  $('harmony-colors').innerHTML = colors.map(({ hex }, i) => {
    const fg = contrastColor(hex);
    return `<div class="harmony-color-card" onclick="copyText('${hex}')" title="Click to copy ${hex}">
      <div class="harmony-color-swatch" style="background:${hex}">
        <div class="harmony-color-info">
          <p class="text-xs font-semibold" style="color:${fg}">${names[i] || 'Color ' + (i + 1)}</p>
          <p class="text-[10px] font-mono" style="color:${fg};opacity:0.75">${hex}</p>
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderUIPreview(hex, shades) {
  const bg = shades.find(s => s.step === 900)?.hex || '#0f172a';
  const card = shades.find(s => s.step === 800)?.hex || '#1e293b';
  const text = shades.find(s => s.step === 50)?.hex || '#f8fafc';
  const muted = shades.find(s => s.step === 400)?.hex || '#94a3b8';
  const input = shades.find(s => s.step === 700)?.hex || '#334155';
  // Legacy preview container support:
  // - New UI uses #preview-root (rendered by updateLivePreview)
  // - Older markup used #ui-preview
  // Guard to avoid null dereference when #ui-preview is not present.
  const previewEl = $('ui-preview');
  if (!previewEl) return;

  previewEl.innerHTML = `
    <div class="preview-card" style="background:${bg}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div>
          <p style="font-size:16px;font-weight:700;color:${text};margin:0">PaletteForge UI</p>
          <p style="font-size:12px;color:${muted};margin:4px 0 0">Live color preview</p>
        </div>
        <span class="preview-badge" style="background:${hex};color:${contrastColor(hex)}">Active</span>
      </div>
      <input class="preview-input" placeholder="Search components…"
        style="background:${input};border-color:${hex};color:${text}" readonly />
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="preview-btn" style="background:${hex};color:${contrastColor(hex)};flex:1">Primary</button>
        <button class="preview-btn" style="background:${card};color:${text};border:1px solid ${muted};flex:1">Secondary</button>
      </div>
      <div style="margin-top:12px;padding:10px 12px;border-radius:8px;background:${card};border-left:3px solid ${hex}">
        <p style="font-size:12px;color:${muted};margin:0">Accent border element using your palette shade 500.</p>
      </div>
    </div>`;
}

function renderFullPalette(shades) {
  const harmonyColors = getHarmonyColors(state.h, state.s, state.l, state.harmony);
  const rows = harmonyColors.map((color, idx) => {
    const hShades = generateShades(color.h, color.s);
    const label = idx === 0 ? 'Primary' : `Harmony ${idx}`;
    return `<div class="card p-4">
      <div class="palette-row-header">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full" style="background:${color.hex}"></div>
          <span class="text-sm font-semibold text-gray-300">${label}</span>
          <span class="text-xs text-gray-600 font-mono">${color.hex}</span>
        </div>
      </div>
      <div class="palette-row-swatches">
        ${hShades.map(({ step, hex }) => {
      const fg = contrastColor(hex);
      return `<div class="palette-row-swatch" style="background:${hex}"
            onclick="copyWithRipple(this,'${hex}')" title="${hex}" data-hex="${hex}">
            <span class="swatch-label" style="color:${fg}">${step}</span>
            <span class="swatch-label" style="color:${fg};font-size:8px">${hex}</span>
          </div>`;
    }).join('')}
      </div>
    </div>`;
  });
  $('full-palette-grid').innerHTML = rows.join('');
}

function renderCodeExports(shades) {
  const name = 'brand';
  const shadeObj = shades.map(({ step, hex }) => `      '${step}': '${hex}'`).join(',\n');
  const twConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        ${name}: {
${shadeObj}
        },
      },
    },
  },
  plugins: [],
};`;

  const cssVars = `:root {\n${shades.map(({ step, hex }) => `  --color-${name}-${step}: ${hex};`).join('\n')}\n}`;
  const scssVars = shades.map(({ step, hex }) => `$${name}-${step}: ${hex};`).join('\n');
  const jsTokens = `export const ${name} = {\n${shades.map(({ step, hex }) => `  '${step}': '${hex}',`).join('\n')}\n};`;

  $('tw-config-output').textContent = twConfig;
  $('css-vars-output').textContent = cssVars;
  $('scss-vars-output').textContent = scssVars;
  $('js-tokens-output').textContent = jsTokens;

  // Also populate framework-specific advanced code previews
  renderAdvancedExports();
}

function renderContrastMatrix(shades) {
  const white = '#FFFFFF', black = '#0F172A';
  $('contrast-matrix').innerHTML = shades.map(({ step, hex }) => {
    const rw = contrastRatio(white, hex);
    const rb = contrastRatio(black, hex);
    const aaW = rw >= 4.5, aaLW = rw >= 3, aaaW = rw >= 7;
    const aaB = rb >= 4.5, aaLB = rb >= 3, aaaB = rb >= 7;
    const badge = (pass, warn, label) =>
      `<span class="${pass ? 'badge-pass' : warn ? 'badge-warn' : 'badge-fail'}">${label}</span>`;
    return `<div class="contrast-row">
      <div class="contrast-swatch-sm" style="background:${hex}"></div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-xs font-mono text-gray-400">${step}</span>
          <span class="text-xs font-mono text-gray-600">${hex}</span>
        </div>
        <div class="flex items-center gap-1 mt-1 flex-wrap">
          <span class="text-[10px] text-gray-600 mr-1">vs White:</span>
          ${badge(aaaW, false, 'AAA')} ${badge(aaW, false, 'AA')} ${badge(aaLW, aaLW && !aaW, 'AA+')}
          <span class="text-[10px] text-gray-500 ml-1">${rw}:1</span>
          <span class="text-[10px] text-gray-600 ml-2 mr-1">vs Black:</span>
          ${badge(aaaB, false, 'AAA')} ${badge(aaB, false, 'AA')}
          <span class="text-[10px] text-gray-500 ml-1">${rb}:1</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderSavedPalettes() {
  const grid = $('saved-palettes-grid');
  if (!grid) return;
  const empty = $('saved-empty-state');
  if (!state.savedPalettes.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  grid.innerHTML = state.savedPalettes.map((p, idx) => {
    const preview = p.shades.filter((_, i) => [1, 3, 5, 7, 9].includes(i));
    return `<div class="saved-card group cursor-pointer" onclick="loadPalette(${idx})">
      <div class="saved-card-swatches">
        ${preview.map(({ hex }) => `<div class="saved-card-swatch" style="background:${hex}"></div>`).join('')}
      </div>
      <div class="saved-card-footer">
        <div style="flex:1; min-width:0">
          <p class="text-sm font-semibold text-gray-200 truncate">${p.name}</p>
          <p class="text-xs text-gray-500 font-mono truncate">${p.hex} · ${p.harmony}</p>
        </div>
        <div class="flex gap-2">
          <button onclick="event.stopPropagation(); deletePalette(${idx})" 
            class="btn-danger text-xs px-2.5 py-1.5 rounded-lg hover:scale-110 transition-transform">✕</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function updateSavedCount() {
  const el = $('saved-count');
  const n = state.savedPalettes.length;
  el.textContent = n;
  n > 0 ? el.classList.remove('hidden') : el.classList.add('hidden');
}

// ── Presets Render ─────────────────────────────────────
function renderPresets() {
  $('preset-list').innerHTML = PRESETS.map(p => {
    const shades = generateShades(p.h, p.s);
    const swatches = [shades[2], shades[4], shades[5], shades[7], shades[9]];
    return `<div class="preset-item" onclick="applyPreset(${p.h},${p.s},${p.l})">
      <div class="preset-swatches">
        ${swatches.map(s => `<div class="preset-swatch" style="background:${s.hex}"></div>`).join('')}
      </div>
      <span class="text-sm text-gray-300">${p.name}</span>
    </div>`;
  }).join('');
}

// ── Actions ────────────────────────────────────────────
function applyPreset(h, s, l) {
  Object.assign(state, { h, s, l });
  render();
}

function loadPalette(idx) {
  const p = state.savedPalettes[idx];
  if (!p) return;
  state.h = p.h; state.s = p.s; state.l = p.l; state.harmony = p.harmony;
  document.querySelectorAll('.harmony-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.harmony === p.harmony);
  });
  render();
  switchTab('generator');
  toast('Palette loaded!', 'success');
}

function deletePalette(idx) {
  state.savedPalettes.splice(idx, 1);
  localStorage.setItem('PaletteForge_saved', JSON.stringify(state.savedPalettes));
  renderSavedPalettes();
  updateSavedCount();
  toast('Palette removed.', 'info');
}

window.loadPalette = loadPalette;
window.deletePalette = deletePalette;
window.copyWithRipple = function (el, hex) {
  copyText(hex);
  const ripple = document.createElement('div');
  ripple.className = 'swatch-ripple';
  el.appendChild(ripple);
  setTimeout(() => ripple.remove(), 520);
};
window.copyText = (text) => {
  navigator.clipboard.writeText(text).then(() => toast(`Copied ${text}`, 'success')).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    toast(`Copied ${text}`, 'success');
  });
};

// ── Toast ──────────────────────────────────────────────
function toast(msg, type = 'info') {
  const icons = { success: '✅', info: 'ℹ️', error: '❌' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type] || '💬'}</span><span>${msg}</span>`;
  $('toast-container').appendChild(el);
  setTimeout(() => { el.classList.add('fade-out'); setTimeout(() => el.remove(), 300); }, 2400);
}

// ── Tab Switching ──────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  $(`tab-${name}`)?.classList.remove('hidden');
  document.querySelector(`[data-tab="${name}"]`)?.classList.add('active');

  // Refresh tab-specific content if needed
  if (name === 'palette') renderFullPalette(generateShades(state.h, state.s));
  if (name === 'code') renderCodeExports(generateShades(state.h, state.s));
}

// ── Contrast Checker ───────────────────────────────────
function updateContrastChecker() {
  const fgEl = $('contrast-fg');
  if (!fgEl) return;
  const fg = fgEl.value;
  const bg = $('contrast-bg').value;
  $('contrast-fg-hex').value = fg.toUpperCase();
  $('contrast-bg-hex').value = bg.toUpperCase();
  const ratio = contrastRatio(fg, bg);
  $('contrast-ratio').textContent = `${ratio}:1`;
  const badge = (pass) => `<span class="${pass ? 'badge-pass' : 'badge-fail'}">${pass ? '✓ Pass' : '✗ Fail'}</span>`;
  $('wcag-aa-normal').outerHTML = badge(ratio >= 4.5).replace('>', ` id="wcag-aa-normal">`);
  $('wcag-aa-large').outerHTML = badge(ratio >= 3).replace('>', ` id="wcag-aa-large">`);
  $('wcag-aaa-normal').outerHTML = badge(ratio >= 7).replace('>', ` id="wcag-aaa-normal">`);
  $('wcag-aaa-large').outerHTML = badge(ratio >= 4.5).replace('>', ` id="wcag-aaa-large">`);
  $('contrast-preview').style.background = bg;
  $('contrast-preview-text').style.color = fg;
  $('contrast-preview-small').style.color = fg;
}

function syncContrastHex(which, fromPicker) {
  if (fromPicker) {
    $(`contrast-${which}-hex`).value = $(`contrast-${which}`).value.toUpperCase();
  } else {
    const hex = $(`contrast-${which}-hex`).value;
    if (/^#[0-9a-f]{6}$/i.test(hex)) $(`contrast-${which}`).value = hex;
  }
  updateContrastChecker();
}

function initEventListeners() {
  const listen = (id, evt, fn) => { const el = $(id); if (el) el.addEventListener(evt, fn); };

  listen('color-picker', 'input', () => {
    const [h, s, l] = hexToHsl(colorPicker.value);
    Object.assign(state, { h, s, l });
    render();
  });

  listen('hex-input', 'change', () => {
    const v = hexInput.value.trim();
    if (/^#?[0-9a-f]{6}$/i.test(v)) {
      const hex = v.startsWith('#') ? v : `#${v}`;
      const [h, s, l] = hexToHsl(hex);
      Object.assign(state, { h, s, l });
      render();
    }
  });

  listen('hue-slider', 'input', () => { state.h = +hueSlider.value; render(); });
  listen('sat-slider', 'input', () => { state.s = +satSlider.value; render(); });
  listen('lit-slider', 'input', () => { state.l = +litSlider.value; render(); });

  document.querySelectorAll('[data-harmony]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.harmony = btn.dataset.harmony;
      document.querySelectorAll('.harmony-btn').forEach(b => b.classList.toggle('active', b === btn));
      render();
    });
  });

  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  listen('randomize-btn', 'click', doRandomize);
  listen('randomize-btn-mobile', 'click', doRandomize);
  listen('save-palette-btn', 'click', () => saveCurrentTheme());
  listen('theme-toggle', 'click', () => {
    const isLight = document.documentElement.classList.toggle('light');
    document.documentElement.classList.toggle('dark', !isLight);
    $('theme-icon').textContent = isLight ? '☀️' : '🌙';
  });

  listen('copy-tw-btn', 'click', () => copyText($('tw-config-output').textContent));
  listen('copy-css-btn', 'click', () => copyText($('css-vars-output').textContent));
  listen('copy-scss-btn', 'click', () => copyText($('scss-vars-output').textContent));
  listen('copy-js-btn', 'click', () => copyText($('js-tokens-output').textContent));
  listen('copy-all-colors-btn', 'click', copyAllPaletteColors);

  listen('dl-tw-btn', 'click', () => downloadFile('tailwind.config.js', $('tw-config-output')?.textContent || ''));
  listen('dl-css-btn', 'click', () => downloadFile('colors.css', $('css-vars-output')?.textContent || ''));

  listen('export-all-btn', 'click', doExportAll);
  listen('export-all-btn-side', 'click', doExportAll);

  // Desktop share buttons (same behavior pattern as JSON→Zod tool)
  listen('share-facebook', 'click', (e) => {
    e.preventDefault();
    const shareUrl = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
  });

  listen('share-linkedin', 'click', (e) => {
    e.preventDefault();
    const shareUrl = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
  });

  listen('share-twitter', 'click', (e) => {
    e.preventDefault();
    const shareUrl = window.location.href;
    const shareText = 'Check out PaletteForge by LiDa Software — color palette + Tailwind generator';
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank', 'width=600,height=400');
  });

  listen('share-copy', 'click', async () => {
    const shareUrl = window.location.href;
    const btn = $('share-copy');
    if (!btn) return;
    const original = btn.innerHTML;
    try {
      await navigator.clipboard.writeText(shareUrl);
      btn.innerHTML = 'Copied!';
      toast('Share link copied', 'success');
    } catch (err) {
      console.error('Failed to copy share URL:', err);
      toast('Could not copy link', 'error');
    } finally {
      setTimeout(() => { btn.innerHTML = original; }, 1800);
    }
  });

  listen('clear-saved-btn', 'click', () => {
    if (!state.savedPalettes.length) return toast('Nothing to clear.', 'info');
    state.savedPalettes = [];
    localStorage.setItem('PaletteForge_saved', '[]');
    renderSavedPalettes();
    updateSavedCount();
    toast('All palettes cleared.', 'info');
  });

  listen('contrast-fg', 'input', () => syncContrastHex('fg', true));
  listen('contrast-bg', 'input', () => syncContrastHex('bg', true));
  listen('contrast-fg-hex', 'change', () => syncContrastHex('fg', false));
  listen('contrast-bg-hex', 'change', () => syncContrastHex('bg', false));
}

function doRandomize() {
  state.h = Math.floor(Math.random() * 360);
  state.s = 60 + Math.floor(Math.random() * 35);
  state.l = 40 + Math.floor(Math.random() * 30);
  render();
  toast('New palette generated!', 'success');
}

function copyAllPaletteColors() {
  const hColors = getHarmonyColors(state.h, state.s, state.l, state.harmony);
  const out = hColors.map((color, idx) => {
    const label = idx === 0 ? 'Primary' : `Harmony ${idx}`;
    const shades = generateShades(color.h, color.s);
    return `/* ${label} */\n` + shades.map(({ step, hex }) => `${step}: ${hex}`).join('\n');
  }).join('\n\n');
  copyText(out);
  toast('Full palette copied!', 'success');
}

function downloadFile(name, content) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
  toast(`Downloaded ${name}`, 'info');
}


// Legacy download buttons — guarded in case elements were removed
function setupLegacyDownloads() {
  const listen = (id, evt, fn) => { const el = $(id); if (el) el.addEventListener(evt, fn); };
  listen('dl-tw-btn', 'click', () => downloadFile('tailwind.config.js', $('tw-config-output')?.textContent || ''));
  listen('dl-css-btn', 'click', () => downloadFile('colors.css', $('css-vars-output')?.textContent || ''));
}

function doExportAll() {
  downloadFile('PaletteForge-export.css',
    ($('css-vars-output')?.textContent || '') + '\n\n' + ($('scss-vars-output')?.textContent || ''));
}

// ══════════════════════════════════════════════════════════
// STEP 3 — Core Functionality
// ══════════════════════════════════════════════════════════

/**
 * generateFullPalette(baseHex)
 * Returns a complete multi-role theme object with 50-950 shades
 * plus light/dark mode token sets for each role.
 */
function generateFullPalette(baseHex) {
  const [bh, bs, bl] = hexToHsl(baseHex);

  const roles = {};
  Object.keys(ROLE_OFFSETS).forEach(role => {
    const fixedHue = ROLE_HUE_FIXED[role];
    const h = fixedHue !== null && fixedHue !== undefined
      ? fixedHue
      : (bh + ROLE_OFFSETS[role]) % 360;
    const s = ROLE_SAT_OVERRIDE[role] ?? Math.min(bs + 5, 100);

    const shades = {};
    SHADE_STEPS.forEach(step => { shades[step] = shadeForStep(h, s, step); });

    // light / dark mode semantic tokens
    const light = {
      bg: shades[50],
      surface: shades[100],
      border: shades[200],
      text: shades[900],
      muted: shades[400],
      DEFAULT: shades[500],
      emphasis: shades[700],
    };
    const dark = {
      bg: shades[950],
      surface: shades[900],
      border: shades[800],
      text: shades[50],
      muted: shades[500],
      DEFAULT: shades[400],
      emphasis: shades[200],
    };

    roles[role] = { h, s, shades, light, dark };
  });

  return { baseHex, roles };
}

// ── Active full theme (updated whenever color changes) ──
let fullTheme = null;

function refreshFullTheme() {
  const hex = hslToHex(state.h, state.s, state.l);
  fullTheme = generateFullPalette(hex);
}

// Patch render() to also refresh theme + apply CSS vars
const _originalRender = render;
render = function () {
  _originalRender();
  refreshFullTheme();
  applyCSSVars();
  updateLivePreview();
  // Ensure advanced exports stay in sync
  if (typeof renderAdvancedExports === 'function') {
    setTimeout(renderAdvancedExports, 50);
  }
};

// ── Inject CSS variables onto #preview-root ────────────
function applyCSSVars() {
  if (!fullTheme) return;
  const isDark = state.previewDark !== false;
  const P = fullTheme.roles.primary;
  const S = fullTheme.roles.secondary;
  const A = fullTheme.roles.accent;
  const OK = fullTheme.roles.success;
  const W = fullTheme.roles.warning;
  const E = fullTheme.roles.error;
  const N = fullTheme.roles.neutral;
  const layer = isDark ? 'dark' : 'light';

  // Make Harmony Mode visibly affect the live UI preview roles.
  // Secondary / Accent are derived from active harmony colors.
  const harmony = getHarmonyColors(state.h, state.s, state.l, state.harmony);
  const hSecondary = harmony[1] || harmony[0];
  const hAccent = harmony[2] || harmony[1] || harmony[0];
  const hSecondaryShades = hSecondary ? generateShades(hSecondary.h, hSecondary.s) : null;
  const hAccentShades = hAccent ? generateShades(hAccent.h, hAccent.s) : null;

  const secondary500 = hSecondary?.hex || S.shades[500];
  const secondaryMode = hSecondaryShades?.find(s => s.step === (isDark ? 500 : 600))?.hex || S.shades[isDark ? 500 : 600];
  const accent500 = hAccent?.hex || A.shades[500];

  const vars = {
    '--cd-bg': P[layer].bg,
    '--cd-surface': P[layer].surface,
    '--cd-border': P[layer].border,
    '--cd-text': P[layer].text,
    '--cd-muted': P[layer].muted,
    '--cd-primary': P.shades[500],
    '--cd-primary-f': contrastColor(P.shades[500]),
    '--cd-primary-h': P.shades[isDark ? 400 : 600],
    '--cd-secondary': secondaryMode,
    '--cd-secondary-f': contrastColor(secondary500),
    '--cd-accent': accent500,
    '--cd-accent-f': contrastColor(accent500),
    '--cd-success': OK.shades[500],
    '--cd-success-f': contrastColor(OK.shades[500]),
    '--cd-warning': W.shades[500],
    '--cd-warning-f': contrastColor(W.shades[500]),
    '--cd-error': E.shades[500],
    '--cd-error-f': contrastColor(E.shades[500]),
    '--cd-neutral': N.shades[isDark ? 400 : 600],
    '--cd-ring': P.shades[500] + '55',
  };

  let s = $('cd-vars-injected');
  if (!s) { s = document.createElement('style'); s.id = 'cd-vars-injected'; document.head.appendChild(s); }

  const css = `:root {\n${Object.entries(vars).map(([k, v]) => `    ${k}: ${v};`).join('\n')}\n  }`;
  s.textContent = css;

  // Also keep the old way for legacy reasons / specificity
  const root = $('preview-root');
  if (root) {
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }
}

// ── updateLivePreview() — CSS-variable-driven demo ────
function updateLivePreview() {
  if (!fullTheme) return;
  const root = $('preview-root');
  if (!root) return;

  root.innerHTML = `
<!-- ══ NAVBAR ══ -->
<nav class="cd-navbar">
  <div class="cd-nav-brand">
    <div class="cd-nav-logo"></div>
    <span class="cd-nav-title">MyApp</span>
    <span class="cd-nav-badge">Pro</span>
  </div>
  <div class="cd-nav-links">
    <a class="cd-nav-link cd-nav-link-active">Dashboard</a>
    <a class="cd-nav-link">Analytics</a>
    <a class="cd-nav-link">Settings</a>
  </div>
  <div class="cd-nav-avatar"></div>
</nav>

<!-- ══ HERO / CARD ══ -->
<div class="cd-hero">
  <div class="cd-hero-text">
    <div class="cd-hero-eyebrow">✦ New Release</div>
    <h2 class="cd-hero-title">Build beautiful<br>products faster.</h2>
    <p class="cd-hero-sub">Design token-driven development for modern teams. Export Tailwind, CSS variables, and JSON in one click.</p>
    <div class="cd-btn-row">
      <button class="cd-btn cd-btn-solid">Get Started</button>
      <button class="cd-btn cd-btn-outline">Learn More</button>
      <button class="cd-btn cd-btn-ghost">Docs ↗</button>
    </div>
  </div>
  <div class="cd-hero-card">
    <p class="cd-card-label">Monthly Revenue</p>
    <p class="cd-card-value">$48,290</p>
    <p class="cd-card-change cd-text-success">▲ 12.5% from last month</p>
    <div class="cd-progress-bar"><div class="cd-progress-fill" style="width:72%"></div></div>
    <div class="cd-card-stats">
      <div><p class="cd-card-label">Users</p><p class="cd-card-stat">24.8K</p></div>
      <div><p class="cd-card-label">Sessions</p><p class="cd-card-stat">98.3K</p></div>
      <div><p class="cd-card-label">Bounced</p><p class="cd-card-stat cd-text-error">3.2%</p></div>
    </div>
  </div>
</div>

<!-- ══ FORM + BADGES ══ -->
<div class="cd-section">
  <div class="cd-form-grid">
    <div class="cd-field">
      <label class="cd-label">Full Name</label>
      <input class="cd-input cd-input-focus" placeholder="Jane Doe" readonly/>
    </div>
    <div class="cd-field">
      <label class="cd-label">Email Address</label>
      <input class="cd-input" placeholder="jane@example.com" readonly/>
    </div>
    <div class="cd-field">
      <label class="cd-label">Plan</label>
      <select class="cd-input" disabled><option>Professional</option></select>
    </div>
    <div class="cd-field">
      <label class="cd-label">Status</label>
      <input class="cd-input cd-input-error" placeholder="Invalid value" readonly/>
    </div>
  </div>

  <div class="cd-badges">
    <span class="cd-badge cd-badge-primary">Active</span>
    <span class="cd-badge cd-badge-success">Resolved</span>
    <span class="cd-badge cd-badge-warning">Pending</span>
    <span class="cd-badge cd-badge-error">Critical</span>
    <span class="cd-badge cd-badge-secondary">Beta</span>
    <span class="cd-badge cd-badge-ghost">Archived</span>
  </div>
</div>

<!-- ══ TABLE ══ -->
<div class="cd-section">
  <table class="cd-table">
    <thead>
      <tr>
        <th>User</th><th>Role</th><th>Status</th><th>Revenue</th><th>Action</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><div class="cd-table-user"><div class="cd-avatar" style="background:var(--cd-primary)"></div>Alice Chen</div></td>
        <td class="cd-muted">Admin</td>
        <td><span class="cd-badge cd-badge-success">Active</span></td>
        <td class="cd-mono">$12,400</td>
        <td><button class="cd-btn cd-btn-ghost cd-btn-sm">Edit</button></td>
      </tr>
      <tr>
        <td><div class="cd-table-user"><div class="cd-avatar" style="background:var(--cd-secondary)"></div>Bob Smith</div></td>
        <td class="cd-muted">Editor</td>
        <td><span class="cd-badge cd-badge-warning">Pending</span></td>
        <td class="cd-mono">$8,320</td>
        <td><button class="cd-btn cd-btn-ghost cd-btn-sm">Edit</button></td>
      </tr>
      <tr>
        <td><div class="cd-table-user"><div class="cd-avatar" style="background:var(--cd-accent)"></div>Carol Ray</div></td>
        <td class="cd-muted">Viewer</td>
        <td><span class="cd-badge cd-badge-error">Suspended</span></td>
        <td class="cd-mono">$3,100</td>
        <td><button class="cd-btn cd-btn-ghost cd-btn-sm">Edit</button></td>
      </tr>
    </tbody>
  </table>
</div>`;
}

// ── Image Upload — Canvas dominant color ───────────────
function extractDominantColor(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const size = 40;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);

      const data = ctx.getImageData(0, 0, size, size).data;
      let r = 0, g = 0, b = 0, count = 0;

      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a < 128) continue; // skip transparent
        // skip near-white and near-black
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (brightness > 230 || brightness < 20) continue;
        r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
      }

      if (!count) { resolve('#7C3AED'); return; }
      r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
      const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
      resolve(hex);
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = url;
  });
}

function initImageUpload() {
  const zone = $('image-upload-zone');
  const inp = $('image-upload-input');
  if (!zone || !inp) return;

  zone.addEventListener('click', () => inp.click());

  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImageFile(file);
  });

  inp.addEventListener('change', () => {
    if (inp.files[0]) handleImageFile(inp.files[0]);
  });
}

function handleImageFile(file) {
  const zone = $('image-upload-zone');
  if (zone) zone.textContent = '⏳ Extracting color…';
  extractDominantColor(file)
    .then(hex => {
      const [h, s, l] = hexToHsl(hex);
      Object.assign(state, { h, s, l });
      render();
      if (zone) zone.innerHTML = `<span>✅ Color extracted!</span><br><span class="text-xs font-mono">${hex}</span>`;
      toast(`Dominant color: ${hex}`, 'success');
      setTimeout(() => { if (zone) zone.innerHTML = uploadZoneDefault; }, 3000);
    })
    .catch(() => {
      if (zone) zone.innerHTML = uploadZoneDefault;
      toast('Could not extract color from image.', 'error');
    });
}

const uploadZoneDefault = `<span class="text-2xl">🖼</span>
<p class="text-xs text-gray-400 mt-1">Drop image or click to upload</p>
<p class="text-[10px] text-gray-600">Extracts dominant color via Canvas API</p>`;

// ── Named Export Functions ─────────────────────────────

/**
 * copyTailwindConfig()
 * Full multi-role tailwind.config.js with all semantic colors
 */
function copyTailwindConfig() {
  if (!fullTheme) refreshFullTheme();
  const { roles } = fullTheme;

  const lines = ['/** @type {import(\'tailwindcss\').Config} */',
    'module.exports = {', '  theme: {', '    extend: {', '      colors: {'];

  Object.entries(roles).forEach(([role, data]) => {
    lines.push(`        ${role}: {`);
    SHADE_STEPS.forEach(step => {
      lines.push(`          '${step}': '${data.shades[step]}',`);
    });
    lines.push('        },');
  });

  lines.push('      },', '    },', '  },', '  plugins: [],', '};');
  const out = lines.join('\n');
  copyText(out);
  if ($('tw-config-output')) $('tw-config-output').textContent = out;
}

/**
 * copyCSSVariables()
 * CSS custom properties for all roles + light/dark layers
 */
function copyCSSVariables() {
  if (!fullTheme) refreshFullTheme();
  const { roles } = fullTheme;

  const lines = [':root {', '  /* ── Shade tokens ── */'];
  Object.entries(roles).forEach(([role, data]) => {
    SHADE_STEPS.forEach(step => {
      lines.push(`  --color-${role}-${step}: ${data.shades[step]};`);
    });
  });

  lines.push('\n  /* ── Light mode semantics ── */');
  Object.entries(roles).forEach(([role, data]) => {
    Object.entries(data.light).forEach(([token, hex]) => {
      lines.push(`  --${role}-${token}: ${hex};`);
    });
  });

  lines.push('}\n\n.dark {', '  /* ── Dark mode semantics ── */');
  Object.entries(roles).forEach(([role, data]) => {
    Object.entries(data.dark).forEach(([token, hex]) => {
      lines.push(`  --${role}-${token}: ${hex};`);
    });
  });
  lines.push('}');

  const out = lines.join('\n');
  copyText(out);
  if ($('css-vars-output')) $('css-vars-output').textContent = out;
}

/**
 * copyJSON()
 * Full theme as a design-token JSON object
 */
function copyJSON() {
  if (!fullTheme) refreshFullTheme();
  const { roles, baseHex } = fullTheme;

  const tokenObj = { _meta: { tool: 'PaletteForge', base: baseHex, generated: new Date().toISOString() } };
  Object.entries(roles).forEach(([role, data]) => {
    tokenObj[role] = { shades: {}, light: data.light, dark: data.dark };
    SHADE_STEPS.forEach(step => { tokenObj[role].shades[step] = data.shades[step]; });
  });

  const out = JSON.stringify(tokenObj, null, 2);
  copyText(out);
  toast('JSON design tokens copied!', 'success');
}

// ── "My Themes" localStorage management ───────────────
const THEMES_KEY = 'PaletteForge_themes';

function loadThemes() {
  try { return JSON.parse(localStorage.getItem(THEMES_KEY) || '[]'); }
  catch { return []; }
}

function saveCurrentTheme(name) {
  // Always refresh to ensure we're saving the current state
  refreshFullTheme();

  const themes = loadThemes();
  const entry = {
    id: Date.now().toString(36),
    name: name || `Theme ${new Date().toLocaleDateString()}`,
    base: fullTheme.baseHex,
    h: state.h, s: state.s, l: state.l,
    harmony: state.harmony,
    preview: SHADE_STEPS.slice(2, 7).map(step => fullTheme.roles.primary.shades[step]),
    savedAt: new Date().toISOString(),
  };

  themes.unshift(entry);
  if (themes.length > 30) themes.pop();
  localStorage.setItem(THEMES_KEY, JSON.stringify(themes));

  // Also sync with the other saved system (state.savedPalettes)
  const shades = generateShades(state.h, state.s);
  state.savedPalettes.unshift({
    name: entry.name,
    h: state.h, s: state.s, l: state.l,
    harmony: state.harmony,
    hex: entry.base,
    shades
  });
  if (state.savedPalettes.length > 20) state.savedPalettes.pop();
  localStorage.setItem('PaletteForge_saved', JSON.stringify(state.savedPalettes));

  renderMyThemes();
  renderSavedPalettes();
  updateSavedCount();
  toast(`Theme "${entry.name}" saved!`, 'success');
}
window.saveCurrentTheme = saveCurrentTheme;

function deleteTheme(id) {
  const themes = loadThemes().filter(t => t.id !== id);
  localStorage.setItem(THEMES_KEY, JSON.stringify(themes));
  renderMyThemes();
  toast('Theme deleted.', 'info');
}

function applyTheme(id) {
  const t = loadThemes().find(t => t.id === id);
  if (!t) return;
  state.h = t.h; state.s = t.s; state.l = t.l; state.harmony = t.harmony;
  document.querySelectorAll('.harmony-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.harmony === t.harmony);
  });
  render();
  toast(`Loaded "${t.name}"`, 'success');
}
window.applyTheme = applyTheme;
window.deleteTheme = deleteTheme;

function renderMyThemes() {
  const container = $('my-themes-list');
  if (!container) return;
  const themes = loadThemes();

  if (!themes.length) {
    container.innerHTML = `<p class="text-xs text-gray-600 text-center py-4">No saved themes yet.</p>`;
    return;
  }

  container.innerHTML = themes.map(t => `
    <div class="saved-card group" style="margin-bottom:8px; cursor:pointer" onclick="applyTheme('${t.id}')">
      <div class="saved-card-swatches" style="height:40px">
        ${t.preview.map(hex => `<div class="saved-card-swatch" style="background:${hex}"></div>`).join('')}
      </div>
      <div style="padding:8px 12px;display:flex;align-items:center;justify-content:space-between">
        <div style="flex:1; min-width:0">
          <p style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.85);margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${t.name}</p>
          <p style="font-size:10px;color:rgba(255,255,255,0.35);font-family:monospace;margin:2px 0 0">${t.base}</p>
        </div>
        <div style="display:flex;gap:6px">
          <button onclick="event.stopPropagation(); deleteTheme('${t.id}')"
            class="hover:scale-110 transition-transform"
            style="padding:4px 8px;border-radius:6px;font-size:11px;font-weight:700;
            background:rgba(239,68,68,0.1);color:#fca5a5;border:1px solid rgba(239,68,68,0.2);cursor:pointer"
            title="Delete Theme">
            ✕
          </button>
        </div>
      </div>
    </div>`).join('');
}

// ── Wire up new Step-3 export button aliases ───────────
window.copyTailwindConfig = copyTailwindConfig;
window.copyCSSVariables = copyCSSVariables;
window.copyJSON = copyJSON;
window.saveCurrentTheme = saveCurrentTheme;
window.refreshFullTheme = refreshFullTheme;
window.generateFullPalette = generateFullPalette;

// Override existing copy buttons to use richer generators
const copyTwBtn = $('copy-tw-btn');
if (copyTwBtn) { copyTwBtn.removeEventListener('click', () => { }); copyTwBtn.onclick = copyTailwindConfig; }
const copyCssBtn = $('copy-css-btn');
if (copyCssBtn) { copyCssBtn.removeEventListener('click', () => { }); copyCssBtn.onclick = copyCSSVariables; }

// "Save Theme" button (header) → saveCurrentTheme with prompt
const saveBtn = $('save-palette-btn');
if (saveBtn) {
  saveBtn.onclick = () => {
    const name = prompt('Theme name:', `Theme ${new Date().toLocaleTimeString()}`);
    if (name === null) return; // cancelled
    saveCurrentTheme(name || undefined);
    // also keep legacy saved palette
    const shades = generateShades(state.h, state.s);
    const hex = hslToHex(state.h, state.s, state.l);
    state.savedPalettes.unshift({
      name: name || `Palette ${Date.now().toString(36).slice(-4).toUpperCase()}`,
      h: state.h, s: state.s, l: state.l, harmony: state.harmony, hex, shades
    });
    if (state.savedPalettes.length > 20) state.savedPalettes.pop();
    localStorage.setItem('PaletteForge_saved', JSON.stringify(state.savedPalettes));
    updateSavedCount();
  };
}

function updateSavedCount() {
  const el = $('saved-count');
  if (!el) return;
  const count = state.savedPalettes.length;
  el.textContent = count;
  el.classList.toggle('hidden', count === 0);
}



// ══════════════════════════════════════════════════════════
// STEP 4 — UI Enhancements
// ══════════════════════════════════════════════════════════

// ── Preview Light/Dark Toggle ──────────────────────────
state.previewDark = true;

function setPreviewMode(dark) {
  state.previewDark = dark;
  applyCSSVars();
  const lightBtn = $('prev-light-btn');
  const darkBtn = $('prev-dark-btn');
  if (lightBtn && darkBtn) {
    const active = 'background:rgba(124,58,237,0.3);color:#c4b5fd';
    const inactive = 'background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.6)';
    lightBtn.style.cssText = dark ? inactive : active;
    darkBtn.style.cssText = dark ? active : inactive;
  }
}
window.setPreviewMode = setPreviewMode;

// ── Color Blindness Simulation ─────────────────────────
const CB_MODES = {
  none: null,
  protanopia: 'url(#cb-protanopia)',
  deuteranopia: 'url(#cb-deuteranopia)',
  tritanopia: 'url(#cb-tritanopia)',
  achromatopsia: 'url(#cb-achromatopsia)',
  protanomaly: 'url(#cb-protanomaly)',
};

// Inject SVG filter definitions once into the DOM
(function injectCBFilters() {
  if ($('PaletteForge-svg-filters')) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'PaletteForge-svg-filters';
  svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
  svg.innerHTML = `<defs>
    <filter id="cb-protanopia" color-interpolation-filters="linearRGB">
      <feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0"/>
    </filter>
    <filter id="cb-deuteranopia" color-interpolation-filters="linearRGB">
      <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"/>
    </filter>
    <filter id="cb-tritanopia" color-interpolation-filters="linearRGB">
      <feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0"/>
    </filter>
    <filter id="cb-achromatopsia" color-interpolation-filters="linearRGB">
      <feColorMatrix type="matrix" values="0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0"/>
    </filter>
    <filter id="cb-protanomaly" color-interpolation-filters="linearRGB">
      <feColorMatrix type="matrix" values="0.817 0.183 0 0 0  0.333 0.667 0 0 0  0 0.125 0.875 0 0  0 0 0 1 0"/>
    </filter>
  </defs>`;
  document.body.appendChild(svg);
})();

let activeCBMode = 'none';

function applyCBFilter(mode) {
  activeCBMode = mode;
  const previewEl = $('ui-preview-wrapper') || $('ui-preview');
  if (!previewEl) return;
  previewEl.style.filter = CB_MODES[mode] || 'none';

  // Update active button state
  document.querySelectorAll('[data-cb]').forEach(btn => {
    btn.classList.toggle('cb-btn-active', btn.dataset.cb === mode);
  });
  const label = {
    none: 'Normal', protanopia: 'Protanopia', deuteranopia: 'Deuteranopia',
    tritanopia: 'Tritanopia', achromatopsia: 'Achromatopsia', protanomaly: 'Protanomaly'
  };
  if (mode !== 'none') toast(`Simulating: ${label[mode]}`, 'info');
}
window.applyCBFilter = applyCBFilter;

// ── Swatch copy-button helper (for rendered swatches) ─
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-copy-hex]');
  if (btn) { copyText(btn.dataset.copyHex); e.stopPropagation(); }
});


// ══════════════════════════════════════════════════════════
// MOOD → PALETTE ENGINE
// ══════════════════════════════════════════════════════════

// ── Mood Keyword Matching Logic ────────────────────────

/**
 * parseMood(text) → { h, s, l, harmony, desc, confidence }
 * Matches the input string against MOOD_RULES keywords.
 * Returns the best match (most keyword hits), or null.
 */
function parseMood(text) {
  const lower = text.toLowerCase().replace(/[^a-z0-9 ]/g, '');
  const words = lower.split(/\s+/);

  let bestScore = 0, bestRule = null;
  for (const rule of MOOD_RULES) {
    let score = 0;
    for (const kw of rule.kw) {
      // check each keyword word in the input
      const kwWords = kw.split(' ');
      if (kwWords.every(w => lower.includes(w))) score += kwWords.length;
    }
    if (score > bestScore) { bestScore = score; bestRule = rule; }
  }

  return bestScore > 0 ? { ...bestRule, confidence: Math.min(bestScore * 25, 100) } : null;
}

/**
 * applyMood(text)
 * Called when user submits the vibe input.
 */
function applyMood(text) {
  if (!text.trim()) { toast('Type a vibe first!', 'info'); return; }
  const mood = parseMood(text.trim());
  if (!mood) {
    toast('No vibe match — try keywords like "cyberpunk" or "calm saas"', 'info');
    return;
  }

  // Apply HSL + harmony
  state.h = mood.h; state.s = mood.s; state.l = mood.l;
  state.harmony = mood.harmony;

  // Update harmony button UI
  document.querySelectorAll('.harmony-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.harmony === mood.harmony);
  });

  render();

  // Show mood result
  const resultEl = $('mood-result');
  if (resultEl) {
    const hex = hslToHex(mood.h, mood.s, mood.l);
    resultEl.innerHTML = `
      <div class="mood-result-card">
        <div class="mood-swatch" style="background:${hex}"></div>
        <div>
          <p class="mood-result-title">${mood.desc}</p>
          <p class="mood-result-meta">
            <span class="mood-tag">${mood.harmony}</span>
            <span class="mood-tag">${hex}</span>
            <span class="mood-tag">${mood.confidence}% match</span>
          </p>
        </div>
      </div>`;
    resultEl.classList.remove('hidden');
  }

  toast(`✨ Vibe applied: ${mood.desc}`, 'success');
}
window.applyMood = applyMood;

/**
 * applyBrandPreset(name)
 * Called when a brand chip is clicked.
 */
function applyBrandPreset(name) {
  const p = BRAND_PRESETS.find(b => b.name === name);
  if (!p) return;
  const [h, s, l] = hexToHsl(p.hex);
  state.h = h; state.s = s; state.l = l;
  state.harmony = p.harmony;

  document.querySelectorAll('.harmony-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.harmony === p.harmony);
  });
  document.querySelectorAll('.brand-chip').forEach(c => {
    c.classList.toggle('brand-chip-active', c.dataset.brand === name);
  });

  render();

  const resultEl = $('mood-result');
  if (resultEl) {
    resultEl.innerHTML = `
      <div class="mood-result-card">
        <div class="mood-swatch" style="background:${p.hex}"></div>
        <div>
          <p class="mood-result-title">${name} — ${p.desc}</p>
          <p class="mood-result-meta">
            <span class="mood-tag">${p.harmony}</span>
            <span class="mood-tag">${p.hex}</span>
          </p>
        </div>
      </div>`;
    resultEl.classList.remove('hidden');
  }

  const vibeInput = $('vibe-input');
  if (vibeInput) vibeInput.value = '';
  toast(`${name} palette applied!`, 'success');
}
window.applyBrandPreset = applyBrandPreset;

// ── Render mood preset UI ──────────────────────────────
function renderMoodPresets() {
  const container = $('brand-presets');
  if (!container) return;
  container.innerHTML = BRAND_PRESETS.map(p => {
    const [h, s, l] = hexToHsl(p.hex);
    const chipColor = hslToHex(h, Math.max(s, 20), Math.min(Math.max(l, 35), 65));
    return `<button
      class="brand-chip"
      data-brand="${p.name}"
      onclick="applyBrandPreset('${p.name}')"
      title="${p.desc}"
      style="--chip-color:${chipColor}">
      <span class="brand-chip-dot" style="background:${p.hex}"></span>
      ${p.name}
    </button>`;
  }).join('');
}

// ── Render all supported mood keywords for discoverability ───
function renderMoodKeywords() {
  const container = $('mood-keywords');
  if (!container) return;

  const keywords = [...new Set(MOOD_RULES.flatMap(rule => rule.kw))]
    .sort((a, b) => a.localeCompare(b));

  container.innerHTML = keywords.map(kw =>
    `<button class="brand-chip mood-keyword-chip" type="button" data-mood-keyword="${kw}" title="Apply mood: ${kw}">${kw}</button>`
  ).join('');

  container.querySelectorAll('[data-mood-keyword]').forEach(btn => {
    btn.addEventListener('click', () => {
      const kw = btn.dataset.moodKeyword || '';
      const inp = $('vibe-input');
      if (inp) inp.value = kw;
      applyMood(kw);
    });
  });
}

// ── Wire vibe input ────────────────────────────────────
function initMoodInput() {
  const inp = $('vibe-input');
  const btn = $('vibe-submit');
  if (!inp || !btn) return;

  btn.addEventListener('click', () => applyMood(inp.value));
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') applyMood(inp.value);
  });

  // Live suggestion as user types
  inp.addEventListener('input', () => {
    const hint = $('vibe-hint');
    if (!hint) return;
    const mood = parseMood(inp.value);
    if (mood && inp.value.trim()) {
      hint.textContent = `→ ${mood.desc}`;
      hint.classList.remove('hidden');
    } else {
      hint.classList.add('hidden');
    }
  });
}




// ══════════════════════════════════════════════════════════
// COMPONENT PLAYGROUND
// ══════════════════════════════════════════════════════════

const pg = {
  radius: 12, shadowY: 8, shadowBlur: 24, shadowOp: 0.30,
  blur: 0, bgOp: 1, borderW: 0, borderOp: 0.08,
  selectedEl: null, selectedType: null, preset: 'default',
};

// ── CSS override injection ─────────────────────────────
function applyPGStyle() {
  let s = document.getElementById('pg-override');
  if (!s) { s = document.createElement('style'); s.id = 'pg-override'; document.head.appendChild(s); }

  const { radius, shadowY, shadowBlur, shadowOp, blur, bgOp, borderW, borderOp } = pg;
  const isNeuro = pg.preset === 'neumorphism';
  const isGlass = blur > 0;
  const btnR = Math.min(radius, 14);
  const badgeR = radius >= 20 ? 999 : Math.min(radius, 8);

  // Amplify visual response so sliders feel clearly active.
  const strongY = Math.round(shadowY * 1.8);
  const strongBlur = Math.round(shadowBlur * 1.7 + 6);
  const strongOp = Math.min(shadowOp * 1.35, 0.85);
  const strongBtnY = Math.round(shadowY * 1.15 + 2);
  const strongBtnBlur = Math.round(shadowBlur * 1.15 + 6);
  const strongGlass = Math.round(blur * 1.7);
  const fogAlpha = Math.min((1 - bgOp) * 0.9, 0.55);

  const frostedSurface = isGlass
    ? `color-mix(in srgb, var(--cd-surface), rgba(255,255,255,${fogAlpha.toFixed(3)}) ${Math.min(18 + strongGlass, 45)}%)`
    : `color-mix(in srgb, var(--cd-surface), transparent ${100 - (bgOp * 100)}%)`;

  const shadow = isNeuro
    ? `${strongY}px ${strongY}px ${strongBlur}px rgba(0,0,0,${strongOp}),
       -${Math.ceil(strongY * 0.55)}px -${Math.ceil(strongY * 0.55)}px ${strongBlur}px rgba(255,255,255,0.07)`
    : `0 ${strongY}px ${strongBlur}px rgba(0,0,0,${strongOp})`;

  s.textContent = `
    /* ─── PLAYGROUND INJECTION ─── */
    
    /* Cards */
    #preview-root .cd-hero-card {
      border-radius: ${radius}px !important;
      box-shadow: ${shadow} !important;
      border: ${borderW}px solid var(--cd-border) !important;
      border-color: color-mix(in srgb, var(--cd-border), transparent ${100 - (borderOp * 100)}%) !important;
      ${isGlass ? `backdrop-filter:blur(${strongGlass}px) saturate(150%) !important;-webkit-backdrop-filter:blur(${strongGlass}px) saturate(150%) !important;` : ''}
      background: ${frostedSurface} !important;
      transition: border-radius 0.25s, box-shadow 0.25s, border 0.25s, background 0.25s !important;
      position: relative !important;
    }

    /* Navbar */
    #preview-root .cd-navbar {
      ${isGlass ? `backdrop-filter:blur(${strongGlass}px) saturate(160%) !important;-webkit-backdrop-filter:blur(${strongGlass}px) saturate(160%) !important;` : ''}
      box-shadow: 0 ${Math.max(2, Math.round(strongY * 0.65))}px ${Math.max(10, Math.round(strongBlur * 0.8))}px rgba(0,0,0,${Math.min(strongOp * 0.8, 0.75)}) !important;
      border-bottom: ${Math.max(borderW, 1)}px solid var(--cd-border) !important;
      border-color: color-mix(in srgb, var(--cd-border), transparent ${100 - (borderOp * 100)}%) !important;
      background: ${frostedSurface} !important;
      transition: all 0.25s !important;
    }

    /* Tables + rows: make shadow/frost visible on larger areas */
    #preview-root .cd-table {
      border-radius: ${Math.max(6, radius - 2)}px !important;
      overflow: hidden !important;
      box-shadow: 0 ${Math.max(1, Math.round(strongY * 0.45))}px ${Math.max(8, Math.round(strongBlur * 0.65))}px rgba(0,0,0,${Math.min(strongOp * 0.6, 0.55)}) !important;
      background: ${frostedSurface} !important;
    }
    #preview-root .cd-table th,
    #preview-root .cd-table td {
      background: color-mix(in srgb, var(--cd-surface), transparent ${Math.max(35, 75 - Math.round((1 - bgOp) * 60))}%) !important;
    }

    /* Buttons (Solid) */
    #preview-root .cd-btn-solid {
      background: var(--cd-primary) !important;
      color: var(--cd-primary-f) !important;
      border-radius: ${btnR}px !important;
      box-shadow: 0 ${strongBtnY}px ${strongBtnBlur}px rgba(0,0,0,${Math.min(strongOp * 0.72, 0.78)}) !important;
      transition: border-radius 0.2s, box-shadow 0.2s !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    /* General Buttons (Radius/Shadow) */
    #preview-root .cd-btn {
      border-radius: ${btnR}px !important;
      box-shadow: 0 ${Math.max(1, Math.round(strongY * 0.35))}px ${Math.max(6, Math.round(strongBlur * 0.45))}px rgba(0,0,0,${Math.min(strongOp * 0.45, 0.42)}) !important;
    }

    /* Inputs */
    #preview-root .cd-input {
      border-radius: ${Math.min(radius, 10)}px !important;
      border-width: ${Math.max(borderW, 1.5)}px !important;
      ${isGlass ? `backdrop-filter:blur(${Math.max(0, Math.round(strongGlass * 0.55))}px) !important;-webkit-backdrop-filter:blur(${Math.max(0, Math.round(strongGlass * 0.55))}px) !important;` : ''}
      background: color-mix(in srgb, var(--cd-surface), transparent ${Math.max(25, 80 - Math.round((1 - bgOp) * 60))}%) !important;
      box-shadow: 0 ${Math.max(1, Math.round(strongY * 0.22))}px ${Math.max(4, Math.round(strongBlur * 0.35))}px rgba(0,0,0,${Math.min(strongOp * 0.35, 0.32)}) !important;
    }

    /* Progress Bar */
    #preview-root .cd-progress-bar {
      border-radius: ${radius}px !important;
      background: color-mix(in srgb, var(--cd-border), transparent 80%) !important;
    }
    #preview-root .cd-progress-fill {
      border-radius: ${radius}px !important;
      background: var(--cd-primary) !important;
    }

    /* Badges and pills respond too, so changes are obvious at all scales */
    #preview-root .cd-badge,
    #preview-root .cd-nav-badge {
      border-radius: ${badgeR}px !important;
      box-shadow: 0 ${Math.max(1, Math.round(strongY * 0.28))}px ${Math.max(5, Math.round(strongBlur * 0.38))}px rgba(0,0,0,${Math.min(strongOp * 0.42, 0.4)}) !important;
    }

    /* Selected element highlight */
    .pg-selected {
      outline: 2px solid rgba(124,58,237,0.85) !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 0 6px rgba(124,58,237,0.12) !important;
    }
  `;

  updatePGSliderDisplay();
}

// ── Update slider UI to match pg state ────────────────
function updatePGSliderDisplay() {
  const set = (id, val) => { const el = $(id); if (el) el.value = val; };
  const setLabel = (id, val, unit = '') => { const el = $(id); if (el) el.textContent = val + unit; };
  set('pg-radius-slider', pg.radius); setLabel('pg-radius-val', pg.radius, 'px');
  set('pg-shadow-y-slider', pg.shadowY); setLabel('pg-shadow-y-val', pg.shadowY, 'px');
  set('pg-blur-slider', pg.shadowBlur); setLabel('pg-blur-val', pg.shadowBlur, 'px');
  set('pg-sop-slider', Math.round(pg.shadowOp * 100)); setLabel('pg-sop-val', Math.round(pg.shadowOp * 100), '%');
  set('pg-frost-slider', pg.blur); setLabel('pg-frost-val', pg.blur, 'px');
  set('pg-border-slider', pg.borderW); setLabel('pg-border-val', pg.borderW, 'px');
  set('pg-bgop-slider', Math.round(pg.bgOp * 100)); setLabel('pg-bgop-val', Math.round(pg.bgOp * 100), '%');

  // Preset buttons active state
  document.querySelectorAll('[data-pg-preset]').forEach(b => {
    b.classList.toggle('pg-preset-active', b.dataset.pgPreset === pg.preset);
  });
}

// ── Apply a named preset ───────────────────────────────
function applyPGPreset(name) {
  const p = PG_PRESETS[name]; if (!p) return;
  Object.assign(pg, p);
  pg.preset = name;
  applyPGStyle();
  toast(`${p.emoji} ${p.label} preset applied`, 'success');
}
window.applyPGPreset = applyPGPreset;

// ── Wire a slider ──────────────────────────────────────
function pgSlider(id, key, factor) {
  const el = $(id); if (!el) return;
  el.addEventListener('input', () => {
    pg[key] = parseFloat(el.value) / (factor || 1);
    pg.preset = 'custom';
    applyPGStyle();
    updatePGSliderDisplay();
  });
}

// ── Element selection ──────────────────────────────────
function selectPGElement(el) {
  // Remove previous highlight
  document.querySelectorAll('.pg-selected').forEach(e => e.classList.remove('pg-selected'));
  if (pg.selectedEl === el) {
    pg.selectedEl = null; pg.selectedType = null;
    updatePGSelectionLabel(); return;
  }
  el.classList.add('pg-selected');
  pg.selectedEl = el;
  // Infer type from class
  if (el.classList.contains('cd-hero-card')) pg.selectedType = 'card';
  else if (el.classList.contains('cd-btn')) pg.selectedType = 'btn';
  else if (el.classList.contains('cd-navbar')) pg.selectedType = 'navbar';
  else if (el.classList.contains('cd-input')) pg.selectedType = 'input';
  else if (el.classList.contains('cd-table')) pg.selectedType = 'table';
  else if (el.classList.contains('cd-badge')) pg.selectedType = 'badge';
  else pg.selectedType = 'card';
  updatePGSelectionLabel();
}

function updatePGSelectionLabel() {
  const lbl = $('pg-selection-label');
  if (!lbl) return;
  lbl.textContent = pg.selectedType
    ? PG_TYPE_LABELS[pg.selectedType] || 'Element selected'
    : 'Click any element in preview →';
  lbl.style.color = pg.selectedType ? 'rgba(196,181,253,0.9)' : '';
}

// ── Init playground ────────────────────────────────────
function initPlayground() {
  // Wire sliders
  pgSlider('pg-radius-slider', 'radius', 1);
  pgSlider('pg-shadow-y-slider', 'shadowY', 1);
  pgSlider('pg-blur-slider', 'shadowBlur', 1);
  pgSlider('pg-sop-slider', 'shadowOp', 100);
  pgSlider('pg-frost-slider', 'blur', 1);
  pgSlider('pg-border-slider', 'borderW', 1);
  pgSlider('pg-bgop-slider', 'bgOp', 100);

  // Click delegation on preview wrapper
  const wrapper = $('ui-preview-wrapper');
  if (!wrapper) return;
  wrapper.addEventListener('click', e => {
    const target = e.target.closest(
      '.cd-hero-card, .cd-btn, .cd-navbar, .cd-input, .cd-table, .cd-badge'
    );
    if (target) { e.stopPropagation(); selectPGElement(target); }
  });

  // Deselect on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('#ui-preview-wrapper') && !e.target.closest('#pg-panel')) {
      document.querySelectorAll('.pg-selected').forEach(el => el.classList.remove('pg-selected'));
      pg.selectedEl = null; pg.selectedType = null;
      updatePGSelectionLabel();
    }
  });

  // Apply default style
  applyPGStyle();
}

// ══════════════════════════════════════════════════════════
// AI-LIKE COLOR REFINER
// ══════════════════════════════════════════════════════════

// ── History (undo stack) ───────────────────────────────
const refineHistory = [];   // [{h,s,l}, …]
const HISTORY_MAX = 8;

function pushHistory() {
  refineHistory.push({ h: state.h, s: state.s, l: state.l });
  if (refineHistory.length > HISTORY_MAX) refineHistory.shift();
  const undoBtn = $('refine-undo-btn');
  if (undoBtn) undoBtn.disabled = false;
}

function undoRefine() {
  if (!refineHistory.length) return;
  const prev = refineHistory.pop();
  state.h = prev.h; state.s = prev.s; state.l = prev.l;
  syncUIFromState();
  render();
  const undoBtn = $('refine-undo-btn');
  if (undoBtn) undoBtn.disabled = !refineHistory.length;
  toast('↩ Refinement undone', 'info');
}
window.undoRefine = undoRefine;

// ── HSL Math helpers ───────────────────────────────────
const clamp01 = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Shift h toward target hue by factor (0-1), taking shortest arc */
function shiftToward(h, target, factor) {
  let delta = ((target - h + 540) % 360) - 180; // shortest arc, -180..180
  return ((h + delta * factor) + 360) % 360;
}

/** Sync UI sliders + hex input from state */
function syncUIFromState() {
  const hex = hslToHex(state.h, state.s, state.l);
  if (colorPicker) colorPicker.value = hex;
  if ($('hex-input')) $('hex-input').value = hex;
  const hs = $('hue-slider'); if (hs) { hs.value = state.h; $('hue-val').textContent = `${Math.round(state.h)}°`; }
  const ss = $('sat-slider'); if (ss) { ss.value = state.s; $('sat-val').textContent = `${Math.round(state.s)}%`; }
  const ls = $('lit-slider'); if (ls) { ls.value = state.l; $('lit-val').textContent = `${Math.round(state.l)}%`; }
}

// ── Refinement definitions ─────────────────────────────
const REFINEMENTS = [
  {
    id: 'premium', emoji: '👑', label: 'More Premium',
    desc: 'Deeper, more exclusive tone',
    apply({ h, s, l }) {
      // Pull toward desaturated purple-navy, reduce lightness
      const targetH = h > 180 ? shiftToward(h, 255, 0.25) : shiftToward(h, 225, 0.2);
      return { h: targetH, s: clamp01(s - 10, 18, 85), l: clamp01(l - 8, 18, 62) };
    },
  },
  {
    id: 'energetic', emoji: '⚡', label: 'More Energetic',
    desc: 'Vivid, high-impact saturation',
    apply({ h, s, l }) {
      // Push saturation hard, slight warm shift, mid lightness
      const warmShift = h > 180 ? 10 : -8;   // cool colors shift warmer
      return { h: ((h + warmShift) + 360) % 360, s: clamp01(s + 22, 60, 100), l: clamp01(l + 2, 42, 68) };
    },
  },
  {
    id: 'professional', emoji: '💼', label: 'More Professional',
    desc: 'Trustworthy, measured authority',
    apply({ h, s, l }) {
      // Pull toward blue-navy, reduce saturation, lower lightness
      return { h: shiftToward(h, 218, 0.35), s: clamp01(s - 14, 22, 72), l: clamp01(l - 5, 22, 58) };
    },
  },
  {
    id: 'warmer', emoji: '🔥', label: 'Warmer',
    desc: 'More inviting and human',
    apply({ h, s, l }) {
      // Shift hue toward warm orange (30°), slight sat boost
      return { h: shiftToward(h, 30, 0.35), s: clamp01(s + 6, 30, 95), l: clamp01(l + 3, 32, 74) };
    },
  },
  {
    id: 'cooler', emoji: '🧊', label: 'Cooler',
    desc: 'Calm, composed, refined',
    apply({ h, s, l }) {
      // Shift toward blue-cyan (205°), slight sat reduction
      return { h: shiftToward(h, 205, 0.35), s: clamp01(s - 4, 22, 88), l: clamp01(l - 3, 24, 70) };
    },
  },
  {
    id: 'contrast', emoji: '◐', label: 'Higher Contrast',
    desc: 'Punchier, more readable',
    apply({ h, s, l }) {
      // Push saturation up, polarize lightness away from 50
      const newL = l >= 50 ? clamp01(l + 12, 55, 88) : clamp01(l - 12, 14, 45);
      return { h, s: clamp01(s + 18, 45, 100), l: newL };
    },
  },
];

// ── Apply a refinement ──────────────────────────────────
function applyRefinement(id) {
  const def = REFINEMENTS.find(r => r.id === id);
  if (!def) return;

  const prevHex = hslToHex(state.h, state.s, state.l);
  pushHistory();

  const next = def.apply({ h: state.h, s: state.s, l: state.l });
  state.h = Math.round(next.h * 10) / 10;
  state.s = Math.round(next.s * 10) / 10;
  state.l = Math.round(next.l * 10) / 10;

  syncUIFromState();
  render();

  const nextHex = hslToHex(state.h, state.s, state.l);
  showRefineDiff(prevHex, nextHex, def);
  animateRefineBtn(id);

  toast(`${def.emoji} ${def.label} applied`, 'success');
}
window.applyRefinement = applyRefinement;

// ── Show before/after diff ─────────────────────────────
function showRefineDiff(prevHex, nextHex, def) {
  const el = $('refine-diff');
  if (!el) return;
  el.innerHTML = `
    <div class="refine-diff-card">
      <div class="refine-diff-swatches">
        <div class="refine-diff-swatch" style="background:${prevHex}" title="Before: ${prevHex}">
          <span class="refine-diff-label">Before</span>
        </div>
        <div class="refine-diff-arrow">→</div>
        <div class="refine-diff-swatch refine-diff-next" style="background:${nextHex}" title="After: ${nextHex}">
          <span class="refine-diff-label">After</span>
        </div>
      </div>
      <div class="refine-diff-info">
        <p class="refine-diff-name">${def.emoji} ${def.label}</p>
        <p class="refine-diff-hex">
          <span class="refine-diff-tag">${prevHex}</span>
          <span style="color:rgba(255,255,255,0.2)">→</span>
          <span class="refine-diff-tag refine-diff-tag-new">${nextHex}</span>
        </p>
      </div>
    </div>`;
  el.classList.remove('hidden');
}

// ── Button pulse animation ─────────────────────────────
function animateRefineBtn(id) {
  const btn = document.querySelector(`[data-refine="${id}"]`);
  if (!btn) return;
  btn.classList.add('refine-btn-pulse');
  setTimeout(() => btn.classList.remove('refine-btn-pulse'), 600);
}

// ── Render the refiner history trail ──────────────────
function renderRefineTrail() {
  const el = $('refine-trail'); if (!el) return;
  if (!refineHistory.length) { el.innerHTML = ''; return; }
  el.innerHTML = refineHistory.slice().reverse().slice(0, 6).map((s, i) => {
    const hex = hslToHex(s.h, s.s, s.l);
    return `<div class="refine-trail-dot" style="background:${hex}" title="${hex}"
      onclick="copyText('${hex}')"></div>`;
  }).join('<span class="refine-trail-arrow">←</span>');
}
// Hook into pushHistory
const _origPushHistory = pushHistory;


// ══════════════════════════════════════════════════════════
// ADVANCED EXPORTS ENGINE
// ══════════════════════════════════════════════════════════

// ── Shared data builder ────────────────────────────────
function getExportData() {
  const { h, s, l } = state;
  const baseHex = hslToHex(h, s, l);
  const shades = generateShades(h, s);  // [{step, hex}]
  const shadObj = {}; shades.forEach(({ step, hex }) => shadObj[step] = hex);

  // Harmony roles
  const harms = getHarmonyColors(h, s, l, state.harmony);
  const sec = harms[1] || harms[0];
  const acc = harms[2] || harms[1] || harms[0];
  const [sh2, ss2] = hexToHsl(sec.hex);
  const [ah2, as2] = hexToHsl(acc.hex);
  const secObj = {}; generateShades(sh2, ss2).forEach(({ step, hex }) => secObj[step] = hex);
  const accObj = {}; generateShades(ah2, as2).forEach(({ step, hex }) => accObj[step] = hex);
  const sucObj = {}; generateShades(142, 70).forEach(({ step, hex }) => sucObj[step] = hex);
  const wrnObj = {}; generateShades(38, 90).forEach(({ step, hex }) => wrnObj[step] = hex);
  const errObj = {}; generateShades(0, 84).forEach(({ step, hex }) => errObj[step] = hex);
  const neuObj = {}; generateShades(h, Math.max(s - 45, 5)).forEach(({ step, hex }) => neuObj[step] = hex);

  return { h, s, l, baseHex, shades, shadObj, secObj, accObj, sucObj, wrnObj, errObj, neuObj };
}

// ── Format: Tailwind (Next.js / Vite) ─────────────────
function genTailwindNext(d) {
  const block = (name, obj) =>
    `        ${name}: {\n` +
    Object.entries(obj).map(([k, v]) => `          '${k}': '${v}',`).join('\n') +
    `\n        },`;
  return `/** @type {import('tailwindcss').Config} */
// Compatible: Next.js · Vite · Remix
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
${block('primary', d.shadObj)}
${block('secondary', d.secObj)}
${block('accent', d.accObj)}
${block('success', d.sucObj)}
${block('warning', d.wrnObj)}
${block('error', d.errObj)}
${block('neutral', d.neuObj)}
      },
    },
  },
  plugins: [],
};`;
}

// ── Format: Shadcn/ui (React) ─────────────────────────
function genShadcn(d) {
  const toHslVal = hex => { const [hh, ss, ll] = hexToHsl(hex); return `${hh} ${ss}% ${ll}%`; };
  const p5 = d.shadObj[500], p9 = d.shadObj[900], p1 = d.shadObj[50];
  const fg = contrastColor(p5) === '#ffffff' ? '0 0% 100%' : '222 47% 11%';
  return `/* globals.css — Shadcn/ui compatible */
/* Generated by PaletteForge · primary: ${d.baseHex} */

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;

    --primary: ${toHslVal(p5)};
    --primary-foreground: ${fg};

    --secondary: ${toHslVal(d.secObj[500])};
    --secondary-foreground: ${toHslVal(d.secObj[50])};

    --accent: ${toHslVal(d.accObj[400])};
    --accent-foreground: ${toHslVal(d.accObj[950])};

    --muted: ${toHslVal(d.neuObj[100])};
    --muted-foreground: ${toHslVal(d.neuObj[500])};

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;

    --border: ${toHslVal(d.shadObj[200])};
    --input:  ${toHslVal(d.shadObj[200])};
    --ring:   ${toHslVal(p5)};

    --radius: 0.5rem;
  }

  .dark {
    --background: ${toHslVal(d.shadObj[950])};
    --foreground: ${toHslVal(d.shadObj[50])};
    --card: ${toHslVal(d.shadObj[900])};
    --card-foreground: ${toHslVal(d.shadObj[50])};

    --primary: ${toHslVal(d.shadObj[400])};
    --primary-foreground: ${toHslVal(d.shadObj[950])};

    --secondary: ${toHslVal(d.secObj[800])};
    --secondary-foreground: ${toHslVal(d.secObj[100])};

    --muted: ${toHslVal(d.neuObj[800])};
    --muted-foreground: ${toHslVal(d.neuObj[400])};

    --border: ${toHslVal(d.shadObj[800])};
    --input:  ${toHslVal(d.shadObj[800])};
    --ring:   ${toHslVal(d.shadObj[400])};
  }
}`;
}

// ── Format: Angular + Tailwind ────────────────────────
function genAngularTailwind(d) {
  const block = (name, obj) =>
    `          ${name}: {\n` +
    Object.entries(obj).map(([k, v]) => `            '${k}': '${v}',`).join('\n') +
    `\n          },`;
  return `/** tailwind.config.js — Angular project */
// Compatible: Angular 17+ · Standalone · NX workspaces

const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
${block('primary', d.shadObj)}
${block('secondary', d.secObj)}
${block('accent', d.accObj)}
${block('success', d.sucObj)}
${block('warning', d.wrnObj)}
${block('error', d.errObj)}
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace'],
      },
    },
  },
  plugins: [],
};

/* ─ styles.scss additions ─────────────────────────────────────
:root {
  --color-primary: ${d.shadObj[500]};
  --color-primary-dark: ${d.shadObj[700]};
  --color-surface: ${d.shadObj[950]};
}
──────────────────────────────────────────────────────────── */`;
}

// ── Format: Angular Standalone Component ──────────────
function genAngularStandalone(d) {
  const p5 = d.shadObj[500], p6 = d.shadObj[600], p1 = d.shadObj[50];
  const fg = contrastColor(p5);
  return `// theme.component.ts — Angular Standalone Component
// Generated by PaletteForge · base: ${d.baseHex}

import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterModule }      from '@angular/router';

@Component({
  selector: 'app-theme-demo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: \`
    <div class="theme-host">
      <header class="theme-nav">
        <span class="theme-brand">Brand</span>
        <nav>
          <a routerLink="/">Home</a>
          <a routerLink="/about">About</a>
        </nav>
      </header>

      <main class="theme-content">
        <h1 class="theme-heading">Welcome</h1>
        <p class="theme-body">Your themed Angular component is ready.</p>
        <div class="theme-actions">
          <button class="btn-primary" (click)="onPrimary()">Primary Action</button>
          <button class="btn-outline" (click)="onSecondary()">Secondary</button>
        </div>
      </main>
    </div>
  \`,
  styles: [\`
    :host {
      --brand-primary:      ${p5};
      --brand-primary-dark: ${p6};
      --brand-primary-fg:   ${fg};
      --brand-surface:      ${d.shadObj[900]};
      --brand-border:       ${d.shadObj[800]};
      --brand-text:         ${d.shadObj[100]};
      --brand-muted:        ${d.shadObj[400]};
      --brand-success:      ${d.sucObj[500]};
      --brand-error:        ${d.errObj[500]};
    }
    .theme-host   { font-family: Inter, sans-serif; background: var(--brand-surface); color: var(--brand-text); min-height: 100vh; }
    .theme-nav    { display:flex; align-items:center; justify-content:space-between; padding:16px 24px; border-bottom:1px solid var(--brand-border); }
    .theme-brand  { font-weight:800; font-size:18px; color:var(--brand-primary); }
    .theme-nav a  { color:var(--brand-muted); text-decoration:none; margin-left:20px; transition:color .2s; }
    .theme-nav a:hover { color:var(--brand-text); }
    .theme-content { padding:40px 24px; }
    .theme-heading { font-size:28px; font-weight:700; color:var(--brand-text); margin:0 0 8px; }
    .theme-body    { color:var(--brand-muted); margin:0 0 24px; }
    .theme-actions { display:flex; gap:12px; }
    .btn-primary  { background:var(--brand-primary); color:var(--brand-primary-fg); border:none; padding:10px 20px; border-radius:8px; font-weight:600; cursor:pointer; transition:background .2s; }
    .btn-primary:hover { background:var(--brand-primary-dark); }
    .btn-outline  { background:transparent; color:var(--brand-primary); border:1.5px solid var(--brand-primary); padding:10px 20px; border-radius:8px; font-weight:600; cursor:pointer; transition:all .2s; }
    .btn-outline:hover { background:var(--brand-primary); color:var(--brand-primary-fg); }
  \`],
})
export class ThemeDemoComponent implements OnInit {
  ngOnInit(): void { console.log('Theme loaded — primary: ${p5}'); }
  onPrimary():   void { /* your action */ }
  onSecondary(): void { /* your action */ }
}`;
}

// ── Format: DaisyUI ───────────────────────────────────
function genDaisyUI(d) {
  return `/** tailwind.config.js — DaisyUI theme */
// Run: npm install daisyui@latest

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,js,jsx,tsx}'],
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        PaletteForge: {
          /* Primary role */
          'primary':          '${d.shadObj[500]}',
          'primary-content':  '${contrastColor(d.shadObj[500])}',
          /* Secondary role */
          'secondary':        '${d.secObj[500]}',
          'secondary-content':'${contrastColor(d.secObj[500])}',
          /* Accent role */
          'accent':           '${d.accObj[400]}',
          'accent-content':   '${contrastColor(d.accObj[400])}',
          /* Neutral role */
          'neutral':          '${d.neuObj[700]}',
          'neutral-content':  '${d.neuObj[100]}',
          /* Base layers */
          'base-100':         '${d.shadObj[950]}',
          'base-200':         '${d.shadObj[900]}',
          'base-300':         '${d.shadObj[800]}',
          'base-content':     '${d.shadObj[100]}',
          /* State colors */
          'info':             '${d.accObj[400]}',
          'info-content':     '${d.shadObj[950]}',
          'success':          '${d.sucObj[500]}',
          'success-content':  '#ffffff',
          'warning':          '${d.wrnObj[500]}',
          'warning-content':  '#1a0e00',
          'error':            '${d.errObj[500]}',
          'error-content':    '#ffffff',
          /* Border radius */
          '--rounded-box':    '1rem',
          '--rounded-btn':    '0.5rem',
          '--rounded-badge':  '1.9rem',
          '--animation-btn':  '0.25s',
          '--tab-border':     '2px',
        },
      },
      'light',
      'dark',
    ],
    darkTheme: 'PaletteForge',
    base: true,
    styled: true,
    utils: true,
  },
};`;
}

// ── Format: CSS Variables ─────────────────────────────
function genCSSVars(d) {
  const lines = (prefix, obj) =>
    Object.entries(obj).map(([k, v]) => `  --${prefix}-${k}: ${v};`).join('\n');
  return `/* PaletteForge — CSS Custom Properties */
/* Base: ${d.baseHex} */

:root {
  /* Primary */
${lines('color-primary', d.shadObj)}

  /* Secondary */
${lines('color-secondary', d.secObj)}

  /* Accent */
${lines('color-accent', d.accObj)}

  /* Semantic */
  --color-success-500: ${d.sucObj[500]};
  --color-warning-500: ${d.wrnObj[500]};
  --color-error-500:   ${d.errObj[500]};

  /* Surface */
  --surface-default:  ${d.shadObj[950]};
  --surface-raised:   ${d.shadObj[900]};
  --surface-overlay:  ${d.shadObj[800]};
  --border-subtle:    ${d.shadObj[800]};
  --border-default:   ${d.shadObj[700]};
  --text-primary:     ${d.shadObj[50]};
  --text-secondary:   ${d.shadObj[400]};
  --text-muted:       ${d.shadObj[600]};
}

/* Dark mode (prefers-color-scheme) */
@media (prefers-color-scheme: light) {
  :root {
    --surface-default:  ${d.shadObj[50]};
    --surface-raised:   #ffffff;
    --border-default:   ${d.shadObj[200]};
    --text-primary:     ${d.shadObj[900]};
    --text-secondary:   ${d.shadObj[600]};
    --text-muted:       ${d.shadObj[400]};
  }
}`;
}

// ── Format: Full React Component ──────────────────────
function genReactComponent(d) {
  const p5 = d.shadObj[500], p6 = d.shadObj[600], p9 = d.shadObj[900], p1 = d.shadObj[50];
  const fg = contrastColor(p5);
  return `// ThemeProvider.jsx — Full React Component
// Generated by PaletteForge · base: ${d.baseHex}
// Usage: import ThemeProvider from './ThemeProvider';

import React from 'react';

const theme = {
  colors: {
    primary:   {${Object.entries(d.shadObj).map(([k, v]) => `${k}:'${v}'`).join(', ')}},
    secondary: {${Object.entries(d.secObj).map(([k, v]) => `${k}:'${v}'`).join(', ')}},
    accent:    {${Object.entries(d.accObj).slice(0, 5).map(([k, v]) => `${k}:'${v}'`).join(', ')}},
    success: '${d.sucObj[500]}',
    warning: '${d.wrnObj[500]}',
    error:   '${d.errObj[500]}',
  },
};

const cssVars = {
  '--brand':       theme.colors.primary[500],
  '--brand-dark':  theme.colors.primary[600],
  '--brand-fg':    '${fg}',
  '--surface':     theme.colors.primary[950],
  '--surface-2':   theme.colors.primary[900],
  '--border':      theme.colors.primary[800],
  '--text':        theme.colors.primary[50],
  '--muted':       theme.colors.primary[400],
};

export function ThemeProvider({ children }) {
  return (
    <div style={cssVars} className="theme-root">
      {children}
    </div>
  );
}

export function PrimaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'var(--brand)',
        color: 'var(--brand-fg)',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

export function Card({ title, children }) {
  return (
    <div
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px',
        color: 'var(--text)',
      }}
    >
      {title && <h2 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 700 }}>{title}</h2>}
      {children}
    </div>
  );
}

export default ThemeProvider;

/* Usage:
   <ThemeProvider>
     <Card title="Hello">
       <p>Content here</p>
       <PrimaryButton>Click me</PrimaryButton>
     </Card>
   </ThemeProvider>
*/`;
}

// ── Format: JSON Design Tokens ─────────────────────────
function genJSON(d) {
  const role = (name, obj) => Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, { value: v, type: 'color' }])
  );
  return JSON.stringify({
    meta: { generator: 'PaletteForge', base: d.baseHex, harmony: state.harmony },
    colors: {
      primary: role('primary', d.shadObj),
      secondary: role('secondary', d.secObj),
      accent: role('accent', d.accObj),
      success: role('success', d.sucObj),
      warning: role('warning', d.wrnObj),
      error: role('error', d.errObj),
      neutral: role('neutral', d.neuObj),
    },
  }, null, 2);
}

// ── Copy a format ──────────────────────────────────────
function copyAdvExport(format) {
  const gen = ADV_GENERATORS[format]; if (!gen) return;
  const d = getExportData();
  const out = gen(d);
  _lastAdvFormat = format;
  _lastAdvContent = out;

  navigator.clipboard.writeText(out).then(() => {
    // Show inline toast
    const toastEl = $('adv-export-toast');
    const lblEl = $('adv-export-result-label');
    if (toastEl && lblEl) {
      lblEl.textContent = `✅ ${ADV_FILENAMES[format]} copied!`;
      toastEl.classList.remove('hidden');
      setTimeout(() => toastEl.classList.add('hidden'), 3500);
    }
    toast(`📋 ${ADV_FILENAMES[format]} copied`, 'success');

    // Highlight the button
    document.querySelectorAll('[data-adv]').forEach(b =>
      b.classList.remove('adv-export-btn-active'));
    const btn = document.querySelector(`[data-adv="${format}"]`);
    if (btn) btn.classList.add('adv-export-btn-active');

    // Update the corresponding pre element in Tailwind tab
    const preId = `adv-${format}-output`;
    const pre = $(preId); if (pre) pre.textContent = out;
  }).catch(() => toast('Clipboard error', 'error'));
}
window.copyAdvExport = copyAdvExport;

// ── Download last generated content ───────────────────
function downloadAdvExport() {
  if (!_lastAdvContent) return;
  const blob = new Blob([_lastAdvContent], { type: 'text/plain' });
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: ADV_FILENAMES[_lastAdvFormat] || 'export.txt',
  });
  a.click();
  URL.revokeObjectURL(a.href);
  toast(`⬇ ${ADV_FILENAMES[_lastAdvFormat]} downloaded`, 'success');
}
window.downloadAdvExport = downloadAdvExport;

// ── Populate all pre elements on render ───────────────
function renderAdvancedExports() {
  const d = getExportData();
  const fill = (id, gen) => { const el = $(id); if (el) el.textContent = gen(d); };
  fill('adv-shadcn-output', genShadcn);
  fill('adv-angular-tailwind-output', genAngularTailwind);
  fill('adv-angular-standalone-output', genAngularStandalone);
  fill('adv-daisyui-output', genDaisyUI);
  fill('adv-react-component-output', genReactComponent);
  fill('adv-json-output', genJSON);
}

function initApp() {
  initEventListeners();
  renderPresets();
  renderMoodPresets();
  renderMoodKeywords();
  initMoodInput();
  initPlayground();
  initImageUpload();
  renderMyThemes();

  // Refresh state and render main UI
  refreshFullTheme();
  render();
  updateContrastChecker();
  applyCSSVars();
  updateLivePreview();

  // Advanced Exports initial population
  setTimeout(renderAdvancedExports, 150);
}

// ── Kickoff ─────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
