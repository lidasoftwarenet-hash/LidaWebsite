/* ══════════════════════════════════════════════════════
   LOGO FALLBACK HANDLER
══════════════════════════════════════════════════════ */
function handleLogoError(img) {
  if (img.dataset.fb) {
    img.style.display = 'none';
    if (img.nextElementSibling) img.nextElementSibling.style.display = 'block';
  } else {
    img.dataset.fb = '1';
    img.src = 'https://www.google.com/s2/favicons?domain=' + img.dataset.domain + '&sz=64';
  }
}

/* ══════════════════════════════════════════════════════
   PROVIDER CONFIGURATION  (metadata only — no direct fetching)
══════════════════════════════════════════════════════ */
const PROVIDERS = [
  {
    id: 'openai', backendId: 'openai',
    name: 'OpenAI', models: 'GPT-5 · GPT-4o · o3',
    icon: '⚡', siSlug: 'openai', logoDomain: 'openai.com',
    iconBg: 'rgba(16,163,127,0.12)', color: '#10a37f',
    statusPage: 'https://status.openai.com',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    uptime90: 99.5, typicalLatency: '380',
    contextWindow: '128K',
    freeTier: 'limited',
    dataSource: 'Official public status API',
    tagline: 'The industry benchmark. GPT-5 sets the standard for reasoning, code, and multimodal tasks.',
    features: ['Vision', 'Function Calling', 'Web Search', 'Code Interpreter'],
  },
  {
    id: 'anthropic', backendId: 'anthropic',
    name: 'Anthropic', models: 'Claude 4 Sonnet · Opus · Haiku',
    icon: '🔶', siSlug: 'anthropic', logoDomain: 'anthropic.com',
    iconBg: 'rgba(217,119,6,0.12)', color: '#d97706',
    statusPage: 'https://status.anthropic.com',
    apiKeyUrl: 'https://console.anthropic.com/',
    uptime90: 99.72, typicalLatency: '510',
    contextWindow: '200K',
    freeTier: 'limited',
    dataSource: 'Official public status API',
    tagline: 'Gold standard for long documents, coding, and safety-first AI. Best extended thinking model.',
    features: ['Computer Use', 'Extended Thinking', 'Vision', 'Function Calling'],
  },
  {
    id: 'google', backendId: 'gemini',
    name: 'Gemini', models: 'Gemini 2.5 Pro · Flash · Ultra',
    icon: '🌐', siSlug: 'googlegemini', logoDomain: 'gemini.google.com',
    iconBg: 'rgba(66,133,244,0.12)', color: '#4285f4',
    statusPage: 'https://status.cloud.google.com',
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
    uptime90: 99.91, typicalLatency: '290',
    contextWindow: '1M',
    freeTier: true,
    dataSource: 'Google Cloud incidents feed',
    tagline: 'Industry-leading 1M token context. Grounded in real-time Google Search. Best free tier.',
    features: ['1M Context', 'Google Search', 'Vision', 'Code Execution'],
  },
  {
    id: 'mistral', backendId: 'mistral',
    name: 'Mistral AI', models: 'Mistral Large 2 · Mixtral · NeMo',
    icon: '🌊', siSlug: 'mistralai', logoDomain: 'mistral.ai',
    iconBg: 'rgba(249,115,22,0.12)', color: '#f97316',
    statusPage: 'https://status.mistral.ai',
    apiKeyUrl: 'https://console.mistral.ai/',
    uptime90: 99.78, typicalLatency: '370',
    contextWindow: '128K',
    freeTier: true,
    dataSource: 'Public status page only (no machine-readable API)',
    tagline: 'European privacy-first AI. Open-source roots with enterprise-grade performance and speed.',
    features: ['Open Source', 'Function Calling', 'JSON Mode', 'Vision (Pixtral)'],
  },
  {
    id: 'groq', backendId: 'groq',
    name: 'Groq', models: 'Llama 3.3 70B · Mixtral · Gemma',
    icon: '🚀', siSlug: 'groq', logoDomain: 'groq.com',
    iconBg: 'rgba(124,58,237,0.12)', color: '#7c3aed',
    statusPage: 'https://status.groq.com',
    apiKeyUrl: 'https://console.groq.com/',
    uptime90: 99.6, typicalLatency: '75',
    contextWindow: '128K',
    freeTier: true,
    dataSource: 'Public status page only (no machine-readable API)',
    tagline: 'LPU hardware delivers 10× faster inference than GPU cloud. The speed king of LLM APIs.',
    features: ['Ultra-Fast LPU', 'Open Models', 'Function Calling', 'Audio'],
  },
  {
    id: 'deepseek', backendId: 'deepseek',
    name: 'DeepSeek', models: 'DeepSeek V3 · R1 (reasoning)',
    icon: '🔵', siSlug: 'deepseek', logoDomain: 'deepseek.com',
    iconBg: 'rgba(37,99,235,0.12)', color: '#2563eb',
    statusPage: 'https://status.deepseek.com',
    apiKeyUrl: 'https://platform.deepseek.com/',
    uptime90: 99.1, typicalLatency: '610',
    contextWindow: '64K',
    freeTier: true,
    dataSource: 'Official public status API',
    tagline: 'Best cost-per-token on the market. R1 matches frontier reasoning at a fraction of the cost.',
    features: ['Reasoning (R1)', 'Low Cost', 'Open Weights', 'Function Calling'],
  },
  {
    id: 'perplexity', backendId: 'perplexity',
    name: 'Perplexity', models: 'Sonar Pro · Sonar · Sonar Huge',
    icon: '🔍', siSlug: 'perplexity', logoDomain: 'perplexity.ai',
    iconBg: 'rgba(32,178,170,0.12)', color: '#20b2aa',
    statusPage: 'https://status.perplexity.ai',
    apiKeyUrl: 'https://www.perplexity.ai/settings/api',
    uptime90: 99.7, typicalLatency: '460',
    contextWindow: '300K',
    freeTier: true,
    dataSource: 'Public status page only (no machine-readable API)',
    tagline: 'Real-time web search built into every response. Always up-to-date with inline citations.',
    features: ['Real-time Search', 'Citations', 'Vision', 'Online Mode'],
  },
  {
    id: 'xai', backendId: 'xai',
    name: 'xAI (Grok)', models: 'Grok 3 · Grok 2 Vision',
    icon: '✕', siSlug: 'xai', logoDomain: 'x.ai',
    iconBg: 'rgba(255,255,255,0.06)', color: '#e2e8f0',
    statusPage: 'https://status.x.ai',
    apiKeyUrl: 'https://console.x.ai/',
    uptime90: 99.5, typicalLatency: '490',
    contextWindow: '131K',
    freeTier: false,
    dataSource: 'Official public status API',
    tagline: 'Live X/Twitter data access. Grok 3 matches frontier reasoning with real-time web grounding.',
    features: ['X/Twitter Data', 'Vision', 'Reasoning', 'Live Web'],
  },
];

/* ══════════════════════════════════════════════════════
   BACKEND CONFIG
══════════════════════════════════════════════════════ */
const API_BASE   = 'https://www.benzotracker.support/api/ai-status';
const API_LATEST  = `${API_BASE}/latest`;
const API_HISTORY = `${API_BASE}/history`;

/* ══════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════ */
const state = {
  statuses: {},    // { providerId: normalized status object }
  history:  {},    // { backendId: [ { date, status, avg_latency, checks } ] }
  countdown: 60,
  countdownTimer: null,
  refreshTimer: null,
  isRefreshing: false,
  currentFilter: 'all',
};

const CACHE_KEY = 'lida_ai_status_cache_v3';
const CACHE_TTL = 55 * 1000; // 55 s

/* ══════════════════════════════════════════════════════
   BACKEND FETCH HELPERS
══════════════════════════════════════════════════════ */
async function fetchBackend(url, retry = true) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    if (retry) {
      await new Promise(r => setTimeout(r, 1500));
      return fetchBackend(url, false);
    }
    return null;
  }
}

/* ══════════════════════════════════════════════════════
   NORMALIZE  /latest  →  internal status objects
   Backend status values: operational | degraded | outage | unsupported
══════════════════════════════════════════════════════ */
function normalizeLatest(latestArr) {
  const map = {};
  for (const row of latestArr) {
    map[row.provider] = {
      state:       row.status,                // keep as-is
      label:       labelFor(row.status),
      latency:     row.latency_ms,            // null for unsupported
      description: row.description || null,
      checkedAt:   row.checked_at ? new Date(row.checked_at).getTime() : Date.now(),
    };
  }
  return map; // keyed by backendId (e.g. "gemini")
}

function labelFor(status) {
  return {
    operational:  'Operational',
    degraded:     'Degraded',
    outage:       'Outage',
    unsupported:  'No public API',
  }[status] ?? 'Unknown';
}

/* ══════════════════════════════════════════════════════
   HISTORY BLOCKS  from /history  (real data)
   Falls back to empty 90-slot placeholder if no data.
══════════════════════════════════════════════════════ */
function buildHistoryHtml(backendId) {
  const days = state.history[backendId] || [];

  if (days.length === 0) {
    // No data yet — show 90 neutral blocks
    return Array(90).fill('<div class="hb uk" title="No data"></div>').join('');
  }

  // Backend may return fewer than 90 days if the service is new.
  // We left-pad with "uk" to always show a full 90-block bar.
  const needed = 90 - days.length;
  const pad = needed > 0
    ? Array(needed).fill('<div class="hb uk" title="No data"></div>').join('')
    : '';

  const blocks = days.map(d => {
    const cls = d.status === 'operational' ? 'op'
              : d.status === 'degraded'    ? 'mi'
              : d.status === 'outage'      ? 'ot'
              : 'uk'; // unsupported / unknown
    const tip = d.date + (d.avg_latency ? ` · ${d.avg_latency}ms avg` : '');
    return `<div class="hb ${cls}" title="${tip}"></div>`;
  }).join('');

  return pad + blocks;
}

/* ══════════════════════════════════════════════════════
   RENDER
══════════════════════════════════════════════════════ */
function getSpeedTier(ttftStr) {
  const ms = parseInt(ttftStr);
  if (ms < 100) return { label: '⚡ Fastest', cls: 'speed-fastest', tip: `~${ms}ms avg` };
  if (ms < 400) return { label: '▲ Fast',    cls: 'speed-fast',    tip: `~${ms}ms avg` };
  if (ms < 700) return { label: '● Medium',  cls: 'speed-medium',  tip: `~${ms}ms avg` };
  return             { label: '▼ Slow',     cls: 'speed-slow',    tip: `~${ms}ms avg` };
}

function renderCard(provider, status) {
  const p = provider;
  const s = status || { state: 'checking', label: 'Checking…' };

  const isLive       = ['operational', 'degraded', 'outage'].includes(s.state);
  const isUnsupported = s.state === 'unsupported';

  const stateClass = s.state === 'operational'  ? 'state-operational'
                   : s.state === 'degraded'      ? 'state-degraded'
                   : s.state === 'outage'        ? 'state-outage'
                   : 'state-unknown';

  const badgeClass = s.state === 'operational'  ? 'operational'
                   : s.state === 'degraded'      ? 'degraded'
                   : s.state === 'outage'        ? 'outage'
                   : s.state === 'checking'      ? 'checking'
                   : isUnsupported               ? 'unavailable'
                   : 'manual';

  const badgeLabel = isUnsupported ? 'No public API' : s.label;

  // Latency: show measured value only for live providers
  const latencyValue = (isLive && s.latency != null) ? `${s.latency}ms` : '—';
  const latencyClass = !isLive ? 'dim'
                     : s.latency < 300 ? 'good'
                     : s.latency < 700 ? ''
                     : 'warn';

  // "est." tag when we have no live data
  const bmark = !isLive ? '<span class="bmark">est.</span>' : '';

  const uptimeClass = p.uptime90 >= 99.9 ? 'good' : p.uptime90 >= 99.5 ? '' : 'warn';
  const checkedStr  = s.checkedAt ? timeAgo(s.checkedAt) : '—';

  // Caveat for unsupported providers
  const caveat = isUnsupported
    ? `<div class="status-caveat">
         <span>No machine-readable API available</span>
         <span>·</span>
         <a href="${p.statusPage}" target="_blank" rel="noopener">View status page →</a>
       </div>`
    : '';

  const filterState = s.state === 'degraded'     ? 'issues'
                    : s.state === 'outage'        ? 'outage'
                    : s.state === 'operational'   ? 'operational'
                    : 'all';

  const speed    = getSpeedTier(p.typicalLatency);
  const freePill = p.freeTier === true      ? '<span class="feature-pill free">Free tier ✓</span>'
                 : p.freeTier === 'limited' ? '<span class="feature-pill trial">Trial credits</span>'
                 :                            '<span class="feature-pill paid">Paid only</span>';
  const featurePills = p.features.map(f => `<span class="feature-pill">${f}</span>`).join('');
  const histHtml     = buildHistoryHtml(p.backendId);

  return `
    <div class="provider-card ${stateClass}"
         style="--provider-color:${p.color}"
         data-filter-state="${filterState}"
         data-id="${p.id}"
         id="card-${p.id}">

      <!-- Header: icon + name + speed tier -->
      <div class="card-header">
        <div class="provider-icon" style="background:${p.iconBg}">
          ${p.siSlug ? `<img
            src="https://cdn.simpleicons.org/${p.siSlug}/${p.color.replace('#','')}"
            class="provider-logo"
            alt="${p.name} logo"
            width="22" height="22"
            loading="lazy" decoding="async"
            data-domain="${p.logoDomain}"
            onerror="handleLogoError(this)"
          /><span class="provider-logo-fallback">${p.icon}</span>` : p.icon}
        </div>
        <div class="card-header-text">
          <div class="provider-name">${p.name}</div>
          <div class="provider-models">${p.models}</div>
        </div>
        <span class="speed-tag ${speed.cls}" title="Avg time to first token: ${speed.tip}">${speed.label}</span>
      </div>

      <!-- Live status badge -->
      <div class="status-badge ${badgeClass}">
        <span class="status-indicator"></span>
        ${badgeLabel}
      </div>
      ${caveat}

      <!-- What this provider is best at -->
      <p class="provider-tagline">${p.tagline}</p>

      <!-- Feature pills + pricing tier -->
      <div class="feature-pills">
        ${featurePills}
        ${freePill}
      </div>

      <!-- Key metrics -->
      <div class="card-metrics">
        <div class="metric">
          <div class="metric-label">Status check${isLive ? ' ✓' : ''}</div>
          <div class="metric-value ${latencyClass}">${latencyValue}</div>
        </div>
        <div class="metric">
          <div class="metric-label">TTFT${bmark}</div>
          <div class="metric-value">${p.typicalLatency}<span style="font-size:11px;color:var(--dim)">ms</span></div>
        </div>
        <div class="metric">
          <div class="metric-label">Context</div>
          <div class="metric-value">${p.contextWindow}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Uptime (90d)${bmark}</div>
          <div class="metric-value ${uptimeClass}">${p.uptime90}%</div>
        </div>
      </div>

      <!-- 90-day sparkline (real backend data) -->
      <div class="card-history" onclick="openHistoryModal('${p.id}')">
        <div class="history-label">
          <span>90-day history</span>
          <span style="display:flex;align-items:center;gap:8px">
            <span class="history-expand-hint">↗ expand</span>
            <span>${p.uptime90}% avg</span>
          </span>
        </div>
        <div class="history-blocks">${histHtml}</div>
      </div>

      <!-- Data source label -->
      <div class="card-source">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="6" cy="6" r="5"/><path d="M6 5v3M6 4h.01"/></svg>
        ${isUnsupported
          ? '<span class="card-source-text unavail">Live automation unavailable</span>'
          : `<span class="card-source-text">Source: ${p.dataSource || 'Status API'}</span>`
        }
      </div>

      <!-- Footer: timestamp + quick links -->
      <div class="card-footer">
        <span class="last-checked">Updated ${checkedStr}</span>
        <div style="display:flex;gap:14px;align-items:center">
          <a class="api-key-link" href="${p.apiKeyUrl}" target="_blank" rel="noopener" title="Get API key">
            API key
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 10L10 2M5 2h5v5"/></svg>
          </a>
          <a class="status-link" href="${p.statusPage}" target="_blank" rel="noopener">
            Status
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 10L10 2M5 2h5v5"/></svg>
          </a>
        </div>
      </div>
    </div>`;
}

function renderAllCards() {
  const grid = document.getElementById('providerGrid');
  grid.innerHTML = PROVIDERS.map(p => renderCard(p, state.statuses[p.id])).join('');
  applyFilter(state.currentFilter);
  requestAnimationFrame(() => {
    staggerCards(true);
    setTimeout(staggerHistoryBlocks, 180);
  });
}

function updateCard(provider) {
  const existing = document.getElementById(`card-${provider.id}`);
  if (!existing) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = renderCard(provider, state.statuses[provider.id]);
  const card = tmp.firstElementChild;
  existing.replaceWith(card);
  applyFilter(state.currentFilter);
  requestAnimationFrame(() => {
    card.classList.add('card-visible');
    staggerHistoryBlocks();
  });
}

function updateGlobalBanner() {
  const banner = document.getElementById('globalBanner');
  const text   = document.getElementById('globalText');
  const vals   = Object.values(state.statuses);

  if (vals.length === 0) {
    banner.className = 'loading';
    text.textContent = 'Checking all providers…';
    return;
  }

  const hasOutage   = vals.some(s => s.state === 'outage');
  const hasDegraded = vals.some(s => s.state === 'degraded');
  const operCount   = vals.filter(s => s.state === 'operational').length;

  if (hasOutage) {
    banner.className = 'outage';
    text.textContent = '🔴  Active outage detected — check cards below';
  } else if (hasDegraded) {
    banner.className = 'degraded';
    text.textContent = '🟡  Some providers reporting issues';
  } else {
    banner.className = 'operational';
    text.textContent = `✓  All ${operCount} auto-checked providers operational`;
  }

  document.getElementById('operationalCount').textContent = operCount;
}

function updateStats() {
  const vals = Object.values(state.statuses).filter(s => s.checkedAt);
  if (!vals.length) return;
  const latest = Math.max(...vals.map(s => s.checkedAt));
  document.getElementById('updatedLabel').textContent = `Updated ${timeAgo(latest)}`;
}

/* ══════════════════════════════════════════════════════
   FILTER
══════════════════════════════════════════════════════ */
function setFilter(filter, btn) {
  state.currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilter(filter);
}

function applyFilter(filter) {
  document.querySelectorAll('.provider-card').forEach(card => {
    if (filter === 'all') { card.style.display = ''; return; }
    card.style.display = card.dataset.filterState === filter ? '' : 'none';
  });
}

/* ══════════════════════════════════════════════════════
   CACHE
══════════════════════════════════════════════════════ */
function saveCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      ts: Date.now(),
      statuses: state.statuses,
      history:  state.history,
    }));
  } catch (_) {}
}

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return false;
    const { ts, statuses, history } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return false;
    // Discard cache if any provider is stuck in "checking"
    const hasStuck = Object.values(statuses || {}).some(s => s.state === 'checking');
    if (hasStuck) { localStorage.removeItem(CACHE_KEY); return false; }
    state.statuses = statuses || {};
    state.history  = history  || {};
    return true;
  } catch (_) { return false; }
}

/* ══════════════════════════════════════════════════════
   REFRESH — fetch from backend only
══════════════════════════════════════════════════════ */
async function refreshAll(isManual = false) {
  if (state.isRefreshing) return;
  state.isRefreshing = true;

  const btn = document.getElementById('refreshBtn');
  if (btn) btn.classList.add('spinning');

  try {
    // Show "checking" skeletons on very first load
    if (Object.keys(state.statuses).length === 0) {
      PROVIDERS.forEach(p => { state.statuses[p.id] = { state: 'checking', label: 'Checking…' }; });
      renderAllCards();
    }

    // Fetch both endpoints in parallel
    const [latestArr, historyObj] = await Promise.all([
      fetchBackend(API_LATEST),
      fetchBackend(API_HISTORY),
    ]);

    if (latestArr === null && historyObj === null) {
      PROVIDERS.forEach(p => {
        if (state.statuses[p.id]?.state === 'checking') {
          state.statuses[p.id] = { state: 'unknown', label: 'Unavailable' };
        }
      });
      showToast('⚠ Could not reach backend — showing last known data');
    } else {
      if (latestArr !== null) {
        const byBackendId = normalizeLatest(latestArr);
        PROVIDERS.forEach(p => {
          if (byBackendId[p.backendId]) {
            state.statuses[p.id] = byBackendId[p.backendId];
          }
        });
      }
      if (historyObj !== null) {
        state.history = historyObj;
      }
      saveCache();
      if (isManual) showToast('Status refreshed');
    }

    renderAllCards();
    updateGlobalBanner();
    updateStats();
    updateCommandStrip();
  } catch (err) {
    console.error('[ai-status] refreshAll error:', err);
    showToast('⚠ Error loading status data');
  } finally {
    if (btn) btn.classList.remove('spinning');
    state.isRefreshing = false;
    resetCountdown();
  }
}

function manualRefresh() {
  if (state.isRefreshing) return;
  clearInterval(state.countdownTimer);
  clearTimeout(state.refreshTimer);
  state.countdown = 60;
  document.getElementById('countdown').textContent = '60s';
  refreshAll(true);
}

/* ══════════════════════════════════════════════════════
   COUNTDOWN
══════════════════════════════════════════════════════ */
function resetCountdown() {
  clearInterval(state.countdownTimer);
  clearTimeout(state.refreshTimer);
  state.countdown = 60;
  document.getElementById('countdown').textContent = '60s';
  setArc(60);

  state.countdownTimer = setInterval(() => {
    state.countdown--;
    document.getElementById('countdown').textContent = `${state.countdown}s`;
    setArc(state.countdown);
    if (state.countdown <= 0) clearInterval(state.countdownTimer);
  }, 1000);

  state.refreshTimer = setTimeout(() => refreshAll(), 60000);
}

/* ══════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════ */
function timeAgo(ts) {
  const sec = Math.round((Date.now() - ts) / 1000);
  if (sec < 5)  return 'just now';
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ══════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════ */
async function init() {
  startSysClock();
  renderShareButtons();
  // Instant render from cache if fresh
  if (loadCache()) {
    renderAllCards();
    updateGlobalBanner();
    updateStats();
    // Refresh in background after 1s so user sees data immediately
    setTimeout(() => refreshAll(), 1000);
  } else {
    await refreshAll();
  }
  resetCountdown();

  // Keep "updated X ago" label ticking
  setInterval(updateStats, 10000);
}

init();

/* ══════════════════════════════════════════════════════
   MISSION CONTROL — COMMAND STRIP (Stock-terminal style)
══════════════════════════════════════════════════════ */

function startSysClock() { initCommandStrip(); } // backward-compat alias

function initCommandStrip() {
  // ── Clock ──
  const clockEl = document.getElementById('sysTime');
  if (clockEl) {
    const tick = () => { clockEl.textContent = new Date().toTimeString().slice(0, 8); };
    tick(); setInterval(tick, 1000);
  }

  // ── Initial ticker text (before data loads) ──
  _buildTicker();

  // ── Refresh strip every 10s so chips stay live ──
  setInterval(updateCommandStrip, 10000);
}

function updateCommandStrip() {
  _buildChips();
  _buildTicker();
  _updateRightStats();
}

/* Build provider status chips */
function _buildChips() {
  const wrap = document.getElementById('csChips');
  if (!wrap) return;

  const shortNames = {
    openai: 'GPT', anthropic: 'CLDE', google: 'GEMN',
    mistral: 'MSTR', groq: 'GROQ', deepseek: 'DSKP',
    perplexity: 'PPLX', xai: 'XAI'
  };

  wrap.innerHTML = PROVIDERS.map(p => {
    const s = state.statuses[p.id];
    let cls = 'unk', latTxt = '—';
    if (s) {
      cls = s.state === 'operational' ? 'op'
          : s.state === 'degraded'    ? 'deg'
          : s.state === 'outage'      ? 'out'
          : 'unk';
      if (s.latency != null) latTxt = s.latency + 'ms';
    }
    const abbr = shortNames[p.id] || p.id.slice(0, 4).toUpperCase();
    return `<div class="cs-chip ${cls}">
      <span class="cs-chip-dot"></span>${abbr}<span class="cs-chip-lat">${latTxt}</span>
    </div>`;
  }).join('');
}

/* Build scrolling ticker text from live data */
function _buildTicker() {
  const el = document.getElementById('csTicker');
  if (!el) return;

  const operational = PROVIDERS.filter(p => state.statuses[p.id]?.state === 'operational').length;
  const degraded    = PROVIDERS.filter(p => state.statuses[p.id]?.state === 'degraded').length;
  const outages     = PROVIDERS.filter(p => state.statuses[p.id]?.state === 'outage').length;
  const total       = PROVIDERS.length;

  // Build per-provider items
  const providerItems = PROVIDERS.map(p => {
    const s  = state.statuses[p.id];
    if (!s) return `${p.name.toUpperCase()}  CHECKING`;
    const st = s.state === 'operational' ? '▲ OK'
             : s.state === 'degraded'    ? '▼ DEGRADED'
             : s.state === 'outage'      ? '✕ OUTAGE'
             : '— N/A';
    const lat = s.latency != null ? ` ${s.latency}ms` : '';
    return `${p.name.toUpperCase()}${lat}  ${st}`;
  }).join('    ·    ');

  // System stats segment
  const sysLine = [
    `PROVIDERS ${total}`,
    `OK ${operational}/${total}`,
    degraded ? `⚠ DEGRADED ${degraded}` : null,
    outages  ? `✕ OUTAGE ${outages}` : null,
    `REFRESH 60s`,
    `SOURCES: STATUSPAGE.IO · GCP INCIDENTS · INSTATUS`,
    `LIDA OPS DASHBOARD`
  ].filter(Boolean).join('    ·    ');

  const full = `${providerItems}    ◆    ${sysLine}`;
  // Double the text so the translateX(-50%) loop is seamless
  el.textContent = full + '          ' + full;
  // Reset animation so the new text starts from the left
  el.style.animation = 'none';
  requestAnimationFrame(() => { el.style.animation = 'ticker-scroll 70s linear infinite'; });
}

/* Update UPTIME and NEXT cells */
function _updateRightStats() {
  const uptimeEl = document.getElementById('csUptime');
  const nextEl   = document.getElementById('csNext');

  if (uptimeEl) {
    const ops = PROVIDERS.filter(p => state.statuses[p.id]?.state === 'operational').length;
    const pct = Math.round((ops / PROVIDERS.length) * 100);
    uptimeEl.textContent = pct + '%';
    uptimeEl.className = `cs-stat-val ${pct === 100 ? 'green' : pct >= 75 ? 'amber' : 'red'}`;
  }
  if (nextEl) {
    nextEl.textContent = (state.countdown ?? 60) + 's';
  }
}


// Drive SVG countdown arc (circumference = 2π × 14 ≈ 87.96)
function setArc(seconds) {
  const arc = document.getElementById('countdownArc');
  if (!arc) return;
  const circ = 87.96;
  arc.style.strokeDashoffset = String(circ * (1 - seconds / 60));
}

// Stagger cards in with spring entrance
function staggerCards(isInitial = false) {
  document.querySelectorAll('.provider-card').forEach((card, i) => {
    const delay = isInitial ? i * 65 : 25;
    setTimeout(() => card.classList.add('card-visible'), delay);
  });
}

// Stagger history blocks per-row like telemetry data streaming in
function staggerHistoryBlocks() {
  document.querySelectorAll('.history-blocks').forEach(row => {
    const blocks = row.querySelectorAll('.hb');
    blocks.forEach((block, i) => {
      block.classList.remove('hb-ready');
      setTimeout(() => block.classList.add('hb-ready'), i * 4);
    });
    // Blinking live-dot on the most recent (rightmost) block
    const last = blocks[blocks.length - 1];
    if (last && !last.querySelector('.hb-live-marker')) {
      last.style.position = 'relative';
      const dot = document.createElement('div');
      dot.className = 'hb-live-marker';
      last.appendChild(dot);
    }
  });
}

/* ══════════════════════════════════════════════════════
   SOCIAL SHARE
══════════════════════════════════════════════════════ */

function renderShareButtons() {
  const container = document.getElementById('shareButtons');
  if (!container) return;

  const shareUrl   = 'https://www.lidasoftware.online/tools/ai-status/';
  const shareText  = 'Check real-time status of OpenAI, Anthropic, Gemini, Groq, DeepSeek & more — live AI API monitor by @LiDaSoftware';
  const shareTitle = 'AI API Status — Is it Down? | LiDa Software';

  container.innerHTML = `
    <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}"
       target="_blank" rel="noopener" class="social-share-btn share-x">
      <svg fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      X / Twitter
    </a>
    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}"
       target="_blank" rel="noopener" class="social-share-btn share-li">
      <svg fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      LinkedIn
    </a>
    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}"
       target="_blank" rel="noopener" class="social-share-btn share-fb">
      <svg fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      Facebook
    </a>
    <button class="social-share-btn share-copy" id="shareCopyBtn">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
      Copy Link
    </button>
  `;

  document.getElementById('shareCopyBtn').onclick = () => {
    navigator.clipboard.writeText(shareUrl).then(() => showToast('Link copied to clipboard ✔'));
  };

  // Native share on mobile
  if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    const btn = document.createElement('button');
    btn.className = 'social-share-btn';
    btn.innerHTML = '↗2️ Share';
    btn.onclick = async () => {
      try { await navigator.share({ title: shareTitle, text: shareText, url: shareUrl }); }
      catch (e) { if (e.name !== 'AbortError') console.error(e); }
    };
    container.prepend(btn);
  }
}

/* ══════════════════════════════════════════════════════
   HISTORY MODAL + CANVAS CHART
══════════════════════════════════════════════════════ */

// ── DOM scaffold (injected once) ─────────────────────────────
(function createModal() {
  const el = document.createElement('div');
  el.id = 'historyModal';
  el.innerHTML = `
    <div class="hm-backdrop" id="hmBackdrop"></div>
    <div class="hm-panel" role="dialog" aria-modal="true" aria-labelledby="hmTitle">
      <div class="hm-header">
        <div class="hm-icon" id="hmIcon"></div>
        <div class="hm-title">
          <h2 id="hmTitle"></h2>
          <p id="hmSubtitle"></p>
        </div>
        <button class="hm-close" id="hmClose" aria-label="Close">×</button>
      </div>
      <div class="hm-stats" id="hmStats"></div>
      <div class="hm-chart-wrap">
        <div class="hm-chart-title">Response latency (ms) — 90-day window</div>
        <canvas id="historyCanvas" height="220"></canvas>
      </div>
      <div class="hm-timeline-wrap">
        <div class="hm-timeline-title">Status timeline</div>
        <div class="hm-timeline" id="hmTimeline"></div>
        <div class="hm-date-labels" id="hmDateLabels"></div>
      </div>
      <div class="hm-legend">
        <div class="hm-legend-item"><span class="hm-legend-dot" style="background:rgba(34,197,94,.75)"></span>Operational</div>
        <div class="hm-legend-item"><span class="hm-legend-dot" style="background:rgba(245,158,11,.75)"></span>Degraded</div>
        <div class="hm-legend-item"><span class="hm-legend-dot" style="background:rgba(239,68,68,.85)"></span>Outage</div>
        <div class="hm-legend-item"><span class="hm-legend-dot" style="background:rgba(71,85,105,.4)"></span>No data</div>
      </div>
    </div>
    <div class="hm-tooltip" id="hmTooltip"></div>`;
  document.body.appendChild(el);

  document.getElementById('hmClose').addEventListener('click', closeHistoryModal);
  document.getElementById('hmBackdrop').addEventListener('click', closeHistoryModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeHistoryModal(); });
})();

// ── Open / Close ────────────────────────────────────────────
function openHistoryModal(providerId) {
  const p = PROVIDERS.find(x => x.id === providerId);
  if (!p) return;

  const days = state.history[p.backendId] || [];

  // ── Header
  document.getElementById('hmIcon').textContent = p.icon;
  document.getElementById('hmIcon').style.background = p.iconBg;
  document.getElementById('hmTitle').textContent = p.name;
  document.getElementById('hmSubtitle').textContent =
    `${p.models} · Last 90 days`;

  // ── Stats row
  const latDays  = days.filter(d => d.avg_latency != null);
  const avgLat   = latDays.length ? Math.round(latDays.reduce((a,d) => a + d.avg_latency, 0) / latDays.length) : null;
  const minLat   = latDays.length ? Math.min(...latDays.map(d => d.avg_latency)) : null;
  const maxLat   = latDays.length ? Math.max(...latDays.map(d => d.avg_latency)) : null;
  const upDays   = days.filter(d => d.status === 'operational').length;
  const upPct    = days.length ? ((upDays / days.length) * 100).toFixed(2) : null;

  const latClass = avgLat == null ? '' : avgLat < 300 ? 'good' : avgLat < 700 ? '' : 'warn';
  const upClass  = upPct == null ? '' : upPct >= 99.9 ? 'good' : upPct >= 99 ? '' : 'warn';

  document.getElementById('hmStats').innerHTML = `
    <div class="hm-stat">
      <div class="hm-stat-label">Avg latency</div>
      <div class="hm-stat-value ${latClass}">${avgLat != null ? avgLat + '<small style="font-size:12px;font-weight:400;color:var(--dim)">ms</small>' : '—'}</div>
    </div>
    <div class="hm-stat">
      <div class="hm-stat-label">Best day</div>
      <div class="hm-stat-value good">${minLat != null ? minLat + '<small style="font-size:12px;font-weight:400;color:var(--dim)">ms</small>' : '—'}</div>
    </div>
    <div class="hm-stat">
      <div class="hm-stat-label">Worst day</div>
      <div class="hm-stat-value warn">${maxLat != null ? maxLat + '<small style="font-size:12px;font-weight:400;color:var(--dim)">ms</small>' : '—'}</div>
    </div>
    <div class="hm-stat">
      <div class="hm-stat-label">Uptime</div>
      <div class="hm-stat-value ${upClass}">${upPct != null ? upPct + '<small style="font-size:12px;font-weight:400;color:var(--dim)">%</small>' : '—'}</div>
    </div>`;

  // ── Canvas latency chart
  drawLatencyChart(days, p.color);

  // ── Status timeline bars
  const needed = 90 - days.length;
  const padDays = Array(Math.max(0, needed)).fill({ status: 'unknown', date: '' });
  const allDays = [...padDays, ...days];

  const tl = document.getElementById('hmTimeline');
  const tooltip = document.getElementById('hmTooltip');

  tl.innerHTML = allDays.map((d, i) => {
    const cls = d.status === 'operational' ? 'op'
              : d.status === 'degraded'    ? 'mi'
              : d.status === 'outage'      ? 'ot'
              : 'uk';
    return `<div class="hm-bar ${cls}" data-i="${i}"></div>`;
  }).join('');

  // Tooltip on bar hover
  tl.querySelectorAll('.hm-bar').forEach((bar, i) => {
    const d = allDays[i];
    bar.addEventListener('mouseenter', e => {
      if (!d.date) return;
      tooltip.textContent = d.date +
        (d.status ? '  ·  ' + d.status.charAt(0).toUpperCase() + d.status.slice(1) : '') +
        (d.avg_latency ? '  ·  ' + d.avg_latency + 'ms avg' : '');
      tooltip.classList.add('show');
      positionTooltip(e);
    });
    bar.addEventListener('mousemove', positionTooltip);
    bar.addEventListener('mouseleave', () => tooltip.classList.remove('show'));
  });

  // Date labels: oldest, midpoint, newest
  const dl = document.getElementById('hmDateLabels');
  const labels = allDays.filter(d => d.date);
  const oldest = labels[0]?.date ?? '';
  const mid    = labels[Math.floor(labels.length / 2)]?.date ?? '';
  const newest = labels[labels.length - 1]?.date ?? '';
  dl.innerHTML = `<span>${oldest}</span><span>${mid}</span><span>${newest}</span>`;

  // ── Open
  document.getElementById('historyModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeHistoryModal() {
  document.getElementById('historyModal').classList.remove('open');
  document.body.style.overflow = '';
}

function positionTooltip(e) {
  const t = document.getElementById('hmTooltip');
  t.style.left = (e.clientX + 14) + 'px';
  t.style.top  = (e.clientY - 36) + 'px';
}

// ── Canvas latency area chart ─────────────────────────────
function drawLatencyChart(days, providerColor) {
  const canvas = document.getElementById('historyCanvas');
  const dpr    = window.devicePixelRatio || 1;
  const W      = canvas.offsetWidth  || canvas.parentElement.clientWidth || 800;
  const H      = 220;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const PAD = { top: 16, right: 24, bottom: 40, left: 58 };
  const cW  = W - PAD.left - PAD.right;
  const cH  = H - PAD.top  - PAD.bottom;

  // ── Background
  ctx.fillStyle = 'rgba(255,255,255,0.018)';
  roundRect(ctx, 0, 0, W, H, 10);
  ctx.fill();

  // data with latency only
  const latData = days
    .map((d, i) => ({ i, val: d.avg_latency, date: d.date, status: d.status }))
    .filter(d => d.val != null);

  if (latData.length < 2) {
    // Not enough data — draw friendly message
    ctx.fillStyle = 'rgba(148,163,184,0.4)';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Not enough data yet', W / 2, H / 2);
    return;
  }

  const totalSlots = Math.max(90, days.length);
  const xOf = i => PAD.left + (i / (totalSlots - 1)) * cW;

  const vals  = latData.map(d => d.val);
  const maxV  = Math.max(...vals) * 1.15 || 1;
  const yOf   = v => PAD.top + cH - (v / maxV) * cH;

  // ── Y-axis grid lines + labels
  const steps = 5;
  for (let s = 0; s <= steps; s++) {
    const v = (maxV / steps) * s;
    const y = yOf(v);
    ctx.beginPath();
    ctx.strokeStyle = s === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + cW, y);
    ctx.stroke();

    ctx.fillStyle = 'rgba(148,163,184,0.5)';
    ctx.font = `10px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(v) + 'ms', PAD.left - 8, y + 3.5);
  }

  // ── Status band background (coloured regions per day)
  days.forEach((d, i) => {
    if (!d.status || d.status === 'unsupported' || d.status === 'unknown') return;
    const x0 = xOf(i);
    const x1 = xOf(i + 1);
    const col = d.status === 'operational' ? 'rgba(34,197,94,0.04)'
              : d.status === 'degraded'    ? 'rgba(245,158,11,0.08)'
              : 'rgba(239,68,68,0.10)';
    ctx.fillStyle = col;
    ctx.fillRect(x0, PAD.top, x1 - x0, cH);
  });

  // ── Gradient area fill
  const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + cH);
  grad.addColorStop(0, hexAlpha(providerColor, 0.35));
  grad.addColorStop(1, hexAlpha(providerColor, 0.0));

  ctx.beginPath();
  ctx.moveTo(xOf(latData[0].i), PAD.top + cH);  // baseline start
  latData.forEach(d => ctx.lineTo(xOf(d.i), yOf(d.val)));
  ctx.lineTo(xOf(latData[latData.length - 1].i), PAD.top + cH); // baseline end
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // ── Line
  ctx.beginPath();
  ctx.strokeStyle = providerColor;
  ctx.lineWidth   = 2.5;
  ctx.lineJoin    = 'round';
  ctx.lineCap     = 'round';
  latData.forEach((d, idx) => {
    if (idx === 0) ctx.moveTo(xOf(d.i), yOf(d.val));
    else           ctx.lineTo(xOf(d.i), yOf(d.val));
  });
  ctx.stroke();

  // ── Dots at each data point
  latData.forEach(d => {
    ctx.beginPath();
    ctx.arc(xOf(d.i), yOf(d.val), 3.5, 0, Math.PI * 2);
    ctx.fillStyle = providerColor;
    ctx.fill();
    ctx.strokeStyle = '#0d0d1c';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // ── Interactive hover tooltip via mouse move on canvas
  canvas._latData       = latData;
  canvas._totalSlots    = totalSlots;
  canvas._PAD           = PAD;
  canvas._cW            = cW;
  canvas._cH            = cH;
  canvas._maxV          = maxV;
  canvas._providerColor = providerColor;
  canvas._days          = days;
  canvas.onmousemove    = canvasHover;
  canvas.onmouseleave   = () => {
    const tip = document.getElementById('hmTooltip');
    tip.classList.remove('show');
    // Redraw to clear crosshair
    drawLatencyChart(canvas._days, canvas._providerColor);
  };
}

function canvasHover(e) {
  const canvas = e.target;
  const { _latData: latData, _totalSlots: totalSlots,
          _PAD: PAD, _cW: cW, _cH: cH, _maxV: maxV,
          _providerColor: color, _days: days } = canvas;

  const rect = canvas.getBoundingClientRect();
  const mx   = e.clientX - rect.left;

  // Find nearest data point
  const xOf  = i => PAD.left + (i / (totalSlots - 1)) * cW;
  let nearest = null, nearestDist = Infinity;
  latData.forEach(d => {
    const dist = Math.abs(xOf(d.i) - mx);
    if (dist < nearestDist) { nearestDist = dist; nearest = d; }
  });
  if (!nearest || nearestDist > cW / totalSlots * 2) return;

  // Redraw to paint crosshair cleanly
  drawLatencyChart(days, color);

  const dpr = window.devicePixelRatio || 1;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const yOf = v => PAD.top + cH - (v / maxV) * cH;
  const x   = xOf(nearest.i);
  const y   = yOf(nearest.val);
  const H   = canvas.height / dpr;

  // Vertical crosshair
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.moveTo(x, PAD.top);
  ctx.lineTo(x, PAD.top + cH);
  ctx.stroke();
  ctx.setLineDash([]);

  // Highlight dot
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Tooltip
  const tip = document.getElementById('hmTooltip');
  tip.textContent = `${nearest.date}  ·  ${nearest.val}ms avg`;
  tip.classList.add('show');
  positionTooltip(e);
}

// ── Helpers ───────────────────────────────────────────────────
function hexAlpha(hex, alpha) {
  // Converts a CSS hex colour to rgba(r,g,b,alpha)
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
