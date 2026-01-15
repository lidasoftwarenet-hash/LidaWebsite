/**
 * LiDa Tools Hub - Logic Script
 */

// State
let allTools = [];
let filteredTools = [];
let favorites = JSON.parse(localStorage.getItem('lida_favorites') || '[]');
let activeCategories = [];
let activePricing = [];
let searchQuery = '';
let currentView = 'grid'; // 'grid' | 'list'

// DOM Elements
const toolsGrid = document.getElementById('toolsGrid');
const searchInput = document.getElementById('searchInput');
const categoryList = document.getElementById('categoryList');
const resultsCount = document.getElementById('resultsCount');
const emptyState = document.getElementById('emptyState');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const favoritesToggle = document.getElementById('favoritesToggle');
const favoritesCount = document.getElementById('favoritesCount');
const resetFiltersMain = document.getElementById('resetFiltersMain');
const statTotalTools = document.getElementById('statTotalTools');
const statTotalCats = document.getElementById('statTotalCats');

// Icons Mapping
const categoryIcons = {
    'AI & Coding Assistants': 'smart_toy',
    'AI & Productivity Tools': 'psychology',
    'API Development & Testing': 'api',
    'Browser Dev Tools & Extensions': 'extension',
    'Cloud & DevOps Tools': 'cloud',
    'Databases & ORMs': 'database',
    'Documentation & Knowledge Tools': 'menu_book',
    'IDE & Code Editors': 'code',
    'Monitoring & Analytics Tools': 'monitoring',
    'Media': 'perm_media',
    'Search & Indexing Tools': 'search',
    'Security & Authentication Tools': 'security',
    'Testing & QA Tools': 'bug_report',
    'UI & Design Tools': 'palette',
    'Version Control & Collaboration': 'history'
};

// Initialize
async function init() {
    updateFavoritesBadge();

    try {
        const res = await fetch('./tools.json');
        if (!res.ok) throw new Error("Could not load tools");
        allTools = await res.json();

        // Add ID to tools if missing (using index or name hash for stability)
        allTools = allTools.map((t, i) => ({ ...t, id: t.name.replace(/\s+/g, '-').toLowerCase() }));

        filteredTools = [...allTools];

        renderCategories();
        renderTools();
        updateStats();

        // Check URL params for shared filters
        const urlParams = new URLSearchParams(window.location.search);
        const q = urlParams.get('q');
        if (q) {
            searchInput.value = q;
            searchQuery = q.toLowerCase();
            applyFilters();
        }

    } catch (err) {
        console.error(err);
        toolsGrid.innerHTML = `
            <div class="col-span-full text-center text-red-500 py-10">
                <span class="material-symbols-rounded text-4xl mb-2">error</span>
                <p>Failed to load tools database.</p>
            </div>
        `;
    }
}

// Rendering
function renderCategories() {
    const counts = allTools.reduce((acc, output) => {
        acc[output.category] = (acc[output.category] || 0) + 1;
        return acc;
    }, {});

    const categories = Object.keys(counts).sort();

    categoryList.innerHTML = categories.map(cat => {
        const icon = categoryIcons[cat] || 'folder';
        const count = counts[cat];
        const isActive = activeCategories.includes(cat);
        return `
            <label class="group flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all cursor-pointer hover:bg-slate-50 ${isActive ? 'bg-brand-50/50 text-brand-700' : 'text-slate-600'}">
                <div class="flex items-center gap-3 min-w-0 flex-1">
                    <div class="relative flex items-center">
                        <input type="checkbox" 
                            name="category" 
                            value="${cat}"
                            ${isActive ? 'checked' : ''}
                            onchange="toggleCategory('${cat}')"
                            class="peer h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer">
                    </div>
                    <span class="material-symbols-rounded text-[18px] shrink-0 ${isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}">${icon}</span>
                    <span class="text-left flex-1 leading-tight">${cat}</span>
                </div>
                <span class="text-[10px] font-bold bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full shrink-0 ${isActive ? 'bg-brand-100 text-brand-600' : ''}">${count}</span>
            </label>
        `;
    }).join('');
}

function renderTools() {
    toolsGrid.innerHTML = '';

    if (filteredTools.length === 0) {
        toolsGrid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
        resultsCount.textContent = `No results found`;
        return;
    }

    toolsGrid.classList.remove('hidden');
    emptyState.classList.add('hidden');
    emptyState.classList.remove('flex');

    resultsCount.textContent = `Showing ${filteredTools.length} tool${filteredTools.length !== 1 ? 's' : ''}`;

    // Grid View
    const html = filteredTools.map(tool => {
        const isFav = favorites.includes(tool.id);
        const icon = categoryIcons[tool.category] || 'folder';

        return `
            <div class="tool-card group relative bg-white border border-slate-200 rounded-2xl p-6 flex flex-col h-full hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 animate-fade-in">
                
                <!-- Card Header -->
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:rotate-6 transition-all duration-300">
                           <span class="material-symbols-rounded text-2xl">${icon}</span>
                        </div>
                        <div>
                             <h3 class="font-bold text-slate-900 leading-tight group-hover:text-brand-700 transition-colors">${tool.name}</h3>
                             <p class="text-xs text-slate-500 mt-0.5 truncate max-w-[140px]">${tool.category}</p>
                        </div>
                    </div>
                    <button onclick="toggleFavorite(event, '${tool.id}')" class="text-slate-300 hover:text-red-500 hover:scale-110 transition-all ${isFav ? 'text-red-500' : ''}">
                        <span class="material-symbols-rounded fill-current text-xl">${isFav ? 'favorite' : 'favorite'}</span>
                    </button>
                </div>

                <!-- Description -->
                <p class="text-slate-600 text-sm mb-4 line-clamp-2 flex-grow">
                    ${tool.description}
                </p>

                <!-- Tags & Pricing -->
                <div class="flex flex-wrap gap-2 mb-6">
                    <span class="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide badge-${tool.pricing.toLowerCase()}">
                        ${tool.pricing}
                    </span>
                    ${tool.tags.slice(0, 2).map(tag => `
                        <span class="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
                            #${tag}
                        </span>
                    `).join('')}
                </div>

                <!-- Footer (Actions) -->
                <div class="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div class="text-xs text-slate-400 font-mono">
                       ${tool.name.length}kb <!-- Fake size/stat for "tech" feel -->
                    </div>
                    <a href="${tool.url}" target="_blank" class="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 group/link">
                        Open Tool
                        <span class="material-symbols-rounded text-[16px] transition-transform group-hover/link:translate-x-1">arrow_forward</span>
                    </a>
                </div>
            </div>
        `;
    }).join('');

    toolsGrid.innerHTML = html;
}

function updateStats() {
    statTotalTools.textContent = allTools.length;
    statTotalCats.textContent = new Set(allTools.map(t => t.category)).size;
}

// Logic
function applyFilters() {
    filteredTools = allTools.filter(tool => {
        // Search
        const matchesSearch = !searchQuery ||
            tool.name.toLowerCase().includes(searchQuery) ||
            tool.description.toLowerCase().includes(searchQuery) ||
            tool.tags.some(t => t.toLowerCase().includes(searchQuery));

        // Category
        const matchesCategory = activeCategories.length === 0 || activeCategories.includes(tool.category);

        // Pricing
        const matchesPricing = activePricing.length === 0 || activePricing.includes(tool.pricing);

        return matchesSearch && matchesCategory && matchesPricing;
    });

    renderTools();
    updateUIState();
}

function toggleCategory(cat) {
    const index = activeCategories.indexOf(cat);
    if (index === -1) activeCategories.push(cat);
    else activeCategories.splice(index, 1);

    applyFilters();
    renderCategories(); // Update UI states
}

function toggleFavorite(e, id) {
    e.preventDefault();
    e.stopPropagation();

    const index = favorites.indexOf(id);
    if (index === -1) {
        favorites.push(id);
        // Show generic toast?
    } else {
        favorites.splice(index, 1);
    }

    localStorage.setItem('lida_favorites', JSON.stringify(favorites));
    updateFavoritesBadge();

    // Re-render button state only to avoid full grid flash
    const btn = e.currentTarget;
    const icon = btn.querySelector('span');
    if (favorites.includes(id)) {
        btn.classList.add('text-red-500');
        btn.classList.remove('text-slate-300');
    } else {
        btn.classList.remove('text-red-500');
        btn.classList.add('text-slate-300');
    }
}

function updateFavoritesBadge() {
    if (favorites.length > 0) {
        favoritesCount.textContent = favorites.length;
        favoritesCount.classList.remove('scale-0', 'opacity-0');
    } else {
        favoritesCount.classList.add('scale-0', 'opacity-0');
    }
}

function updateUIState() {
    if (activeCategory || activePricing.length > 0 || searchQuery) {
        clearFiltersBtn.classList.remove('hidden');
    } else {
        clearFiltersBtn.classList.add('hidden');
    }
}

// Event Listeners
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    applyFilters();
});

document.querySelectorAll('input[name="pricing"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
        if (e.target.checked) activePricing.push(e.target.value);
        else activePricing = activePricing.filter(p => p !== e.target.value);
        applyFilters();
    });
});

clearFiltersBtn.addEventListener('click', () => {
    activeCategories = [];
    activePricing = [];
    searchQuery = '';
    searchInput.value = '';
    document.querySelectorAll('input[name="pricing"]').forEach(c => c.checked = false);
    document.querySelectorAll('input[name="category"]').forEach(c => c.checked = false);
    renderCategories(); // reset active classes
    applyFilters();
});

resetFiltersMain.addEventListener('click', () => clearFiltersBtn.click());

// View Toggle (Basic Implementation)
document.getElementById('viewGrid').addEventListener('click', () => {
    toolsGrid.classList.replace('grid-cols-1', 'grid-cols-1'); // Reset? No, wait.
    toolsGrid.className = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20';
});

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
});

// Initialize
init();
