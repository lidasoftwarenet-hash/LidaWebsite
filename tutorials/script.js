// Videos
// tutorials array is now loaded from tutorials-data.js

// DOM Elements
const grid = document.getElementById('tutorialsGrid');
const searchInput = document.getElementById('searchInput');
const topicFilter = document.getElementById('topicFilter');
const levelFilter = document.getElementById('levelFilter');
const emptyState = document.getElementById('emptyState');
const gridBtn = document.getElementById('gridViewBtn');
const listBtn = document.getElementById('listViewBtn');

// State
let currentView = 'grid'; // 'grid' or 'list'

// Initialize
function init() {
    renderTutorials(tutorials);
    setupEventListeners();
}

// Render
// Render
function renderTutorials(data) {
    grid.innerHTML = '';

    if (data.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    // Add staggered animation delay
    data.forEach((tutorial, index) => {
        const card = document.createElement('div');
        card.className = `tutorial-card ${currentView === 'list' ? 'list-view' : ''}`;
        card.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s backwards`;

        card.innerHTML = `
      <div class="card-thumb">
        <img src="${tutorial.thumbnail}" alt="${tutorial.title}" loading="lazy">
        <div class="card-duration">${tutorial.duration}</div>
      </div>
      
      <div class="card-content">
        <div class="card-header">
          <span class="card-topic">${tutorial.topic}</span>
          
          <div class="card-actions">
             <div class="share-dropdown" style="position: relative;">
                <button class="action-btn share-btn" title="Share" aria-label="Share">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
                </button>
                <div class="share-menu">
                  <button onclick="shareTo('twitter', '${tutorial.title}', '${tutorial.id}')">
                    <span>Twitter</span>
                  </button>
                   <button onclick="shareTo('facebook', '${tutorial.title}', '${tutorial.id}')">
                    <span>Facebook</span>
                  </button>
                   <button onclick="shareTo('linkedin', '${tutorial.title}', '${tutorial.id}')">
                    <span>LinkedIn</span>
                  </button>
                   <button onclick="copyLink('${tutorial.id}', this)" style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 4px; padding-top: 8px;">
                    <span>Copy Link</span>
                  </button>
                </div>
             </div>
             <button class="action-btn" title="Save" aria-label="Save to favorites">♡</button>
          </div>
        </div>
        
        <h3 class="card-title">${tutorial.title}</h3>
        <p class="card-desc">${tutorial.description}</p>
        
        <div class="card-footer">
          <span class="card-level ${tutorial.level}">${tutorial.level}</span>
          <button onclick="openVideoPopup('${tutorial.video}', '${tutorial.title}')" class="watch-btn">
            Watch Now 
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
        </div>
      </div>
    `;

        // Share menu toggle logic
        const shareBtn = card.querySelector('.share-btn');
        const shareMenu = card.querySelector('.share-menu');

        shareBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close all other open menus
            document.querySelectorAll('.share-menu').forEach(el => {
                if (el !== shareMenu) el.style.display = 'none';
            });
            shareMenu.style.display = shareMenu.style.display === 'flex' ? 'none' : 'flex';
        });

        grid.appendChild(card);
    });

    // Close menus on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.share-dropdown')) {
            document.querySelectorAll('.share-menu').forEach(el => el.style.display = 'none');
        }
    });
}

// Share Functions
function shareTo(platform, title, id) {
    const url = encodeURIComponent(`${window.location.origin}${window.location.pathname}?tutorial=${id}`);
    const text = encodeURIComponent(`Check out this tutorial: ${title}`);
    let shareUrl = '';

    switch (platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
    }

    if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
}

function copyLink(id, btn) {
    const url = `${window.location.origin}${window.location.pathname}?tutorial=${id}`;
    navigator.clipboard.writeText(url).then(() => {
        const originalText = btn.querySelector('span').innerText;
        btn.querySelector('span').innerText = 'Copied!';
        setTimeout(() => {
            btn.querySelector('span').innerText = originalText;
        }, 2000);
    });
}

function filterTutorials() {
    const term = searchInput.value.toLowerCase();
    const topic = topicFilter.value;
    const level = levelFilter.value;

    const filtered = tutorials.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term);
        const matchesTopic = topic ? t.topic === topic : true;
        const matchesLevel = level ? t.level === level : true;
        return matchesSearch && matchesTopic && matchesLevel;
    });

    renderTutorials(filtered);
}

function setupEventListeners() {
    searchInput.addEventListener('input', filterTutorials);
    topicFilter.addEventListener('change', filterTutorials);
    levelFilter.addEventListener('change', filterTutorials);

    gridBtn.addEventListener('click', () => {
        currentView = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
        gridBtn.classList.add('active');
        gridBtn.style.background = 'rgba(102, 126, 234, 0.2)';
        gridBtn.style.color = '#fff';

        listBtn.classList.remove('active');
        listBtn.style.background = 'transparent';
        listBtn.style.color = '#9090b0';

        filterTutorials(); // Re-render
    });

    listBtn.addEventListener('click', () => {
        currentView = 'list';
        grid.style.gridTemplateColumns = '1fr';

        listBtn.classList.add('active');
        listBtn.style.background = 'rgba(102, 126, 234, 0.2)';
        listBtn.style.color = '#fff';

        gridBtn.classList.remove('active');
        gridBtn.style.background = 'transparent';
        gridBtn.style.color = '#9090b0';

        filterTutorials(); // Re-render
    });
}

// --- Shared / Layout Scripts (Navbar, Mobile Menu, WhatsApp) ---

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});


// Mobile menu toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}


// Close mobile menu when clicking on a link
if (navLinks) {
    const navLinkItems = navLinks.querySelectorAll('a');
    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

// WhatsApp popup functions
window.openWhatsAppPopup = function () {
    document.getElementById('whatsappPopup').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

window.closeWhatsAppPopup = function () {
    document.getElementById('whatsappPopup').style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Close popup when clicking outside the content
const waPopup = document.getElementById('whatsappPopup');
if (waPopup) {
    waPopup.addEventListener('click', function (e) {
        if (e.target === this) {
            closeWhatsAppPopup();
        }
    });
}


// Close popup with Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeWhatsAppPopup();
    }
});

// Scroll to top functionality
const scrollToTopBtn = document.getElementById('scrollToTop');

if (scrollToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Video Popup Logic
function openVideoPopup(videoUrl, title) {
    const popup = document.getElementById('videoPopup');
    const video = document.getElementById('tutorialVideo');
    const titleEl = document.getElementById('videoTitle');

    if (popup && video) {
        video.src = videoUrl;
        titleEl.textContent = title;
        popup.style.display = 'block';
        document.body.style.overflow = 'hidden';
        video.play().catch(e => console.log('Autoplay prevented:', e));
    }
}

window.closeVideoPopup = function () {
    const popup = document.getElementById('videoPopup');
    const video = document.getElementById('tutorialVideo');

    if (popup && video) {
        video.pause();
        video.currentTime = 0;
        popup.style.display = 'none';
        document.body.style.overflow = 'auto';
        video.src = ""; // Clear source to stop buffering
    }
}

// Close video popup logic
const videoPopup = document.getElementById('videoPopup');
if (videoPopup) {
    videoPopup.addEventListener('click', function (e) {
        if (e.target === this) {
            closeVideoPopup();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeVideoPopup();
        }
    });
}

// Easter Egg: Click logo 5 times to show toast
(function () {
    const logoElement = document.querySelector('.nav-logo');
    const toastElement = document.getElementById('easterEggToast');

    if (!logoElement || !toastElement) return;

    let clickCount = 0;
    let lastClickTime = 0;
    const clickTimeout = 2000; // Reset after 2 seconds

    logoElement.addEventListener('click', function (e) {
        e.preventDefault();
        const currentTime = Date.now();

        // Reset count if too much time has passed between clicks
        if (currentTime - lastClickTime > clickTimeout) {
            clickCount = 0;
        }

        clickCount++;
        lastClickTime = currentTime;

        // Show toast after 5 clicks
        if (clickCount >= 5) {
            toastElement.classList.add('show');

            // Hide toast after 3 seconds
            setTimeout(() => {
                toastElement.classList.remove('show');
            }, 3000);

            // Reset count
            clickCount = 0;
        }
    });
})();

// Run
init(); // Start the tutorials logic logic
