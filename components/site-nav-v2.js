class SiteNavV2 extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.updateActiveState();
  }

  static get observedAttributes() {
    return ['active'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'active' && oldValue !== newValue) {
      this.updateActiveState();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        @import url('/components/site-nav-v2.css');
      </style>
      <nav class="nav-header" id="navbar" aria-label="Main navigation">
        <div class="nav-container">
          <a href="/index.html" class="nav-logo-link" aria-label="LiDa Software Home">
            <div class="nav-logo-icon-container" aria-hidden="true">
              <img src="/logo.png" alt="" class="nav-logo-img">
            </div>
            <span>LiDa Software</span>
          </a>
          
          <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-expanded="false" aria-controls="navLinks" aria-label="Open menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="menu-icon">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <ul class="nav-links" id="navLinks">
            <li data-nav-item="projects"><a href="/index.html#projects">Projects</a></li>
            <li data-nav-item="about"><a href="/index.html#about">About</a></li>
            <li data-nav-item="engineering"><a href="/engineering.html">Engineering</a></li>
            <li data-nav-item="interview-prep"><a href="/interview-prep.html">Interview Prep</a></li>
            <li data-nav-item="guides"><a href="/guides.html">Guides</a></li>
            <li data-nav-item="contact"><a href="/index.html#contact">Contact</a></li>
            <li data-nav-item="payment-solutions"><a href="/powers-your-business/you-business.html">Payment Solutions</a></li>
            <li data-nav-item="dev-news">
              <a href="/dev-news.html" class="nav-dev-news">
                <span class="nav-dev-news-dot" aria-hidden="true"></span>
                <span>Dev-news</span>
              </a>
            </li>

            <li class="nav-social" role="none">
              <a href="https://www.linkedin.com/in/hen-faibish-0469931b0/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61581626213032" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" class="whatsapp-link" aria-label="WhatsApp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488" />
                </svg>
              </a>
            </li>
          </ul>
        </div>
        
        <!-- Share Bar -->
        <div class="share-bar" id="shareBar">
          <span class="share-bar-label">Share:</span>
          <a href="#" class="share-btn" id="share-facebook" title="Share on Facebook" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </a>
          <a href="#" class="share-btn" id="share-linkedin" title="Share on LinkedIn" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            LinkedIn
          </a>
          <a href="#" class="share-btn" id="share-twitter" title="Share on X (Twitter)" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            X
          </a>
          <button class="share-btn share-copy-btn" id="share-copy" title="Copy link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span class="copy-text">Copy</span>
          </button>
        </div>
      </nav>
    `;
  }

  setupEventListeners() {
    const navbar = this.shadowRoot.querySelector('#navbar');
    
    // Scroll effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    // Mobile menu toggle
    const mobileMenuToggle = this.shadowRoot.querySelector('#mobileMenuToggle');
    const navLinks = this.shadowRoot.querySelector('#navLinks');

    mobileMenuToggle.addEventListener('click', () => {
      const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
      this.toggleMenu(!isExpanded);
    });

    // Close menu on escape key
    this.shadowRoot.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        this.toggleMenu(false);
        mobileMenuToggle.focus();
      }
    });

    // Click outside to close menu
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('active')) {
        const path = e.composedPath();
        if (!path.includes(this)) {
          this.toggleMenu(false);
        }
      }
    });

    // Close menu when a link is clicked
    const linkElements = this.shadowRoot.querySelectorAll('.nav-links a');
    linkElements.forEach(link => {
      link.addEventListener('click', () => {
        this.toggleMenu(false);
      });
    });

    // Handle WhatsApp click
    const whatsappLink = this.shadowRoot.querySelector('.whatsapp-link');
    whatsappLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof window.openWhatsAppPopup === 'function') {
        window.openWhatsAppPopup();
      }
    });

    // Share Bar functionality
    const currentUrl = encodeURIComponent(window.location.href);
    const currentTitle = encodeURIComponent(document.title);

    const shareFacebook = this.shadowRoot.querySelector('#share-facebook');
    if (shareFacebook) {
      shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
    }

    const shareLinkedin = this.shadowRoot.querySelector('#share-linkedin');
    if (shareLinkedin) {
      shareLinkedin.href = `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`;
    }

    const shareTwitter = this.shadowRoot.querySelector('#share-twitter');
    if (shareTwitter) {
      shareTwitter.href = `https://twitter.com/intent/tweet?url=${currentUrl}&text=${currentTitle}`;
    }

    const shareCopy = this.shadowRoot.querySelector('#share-copy');
    if (shareCopy) {
      shareCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
          const copyText = shareCopy.querySelector('.copy-text');
          if (copyText) {
            const originalText = copyText.textContent;
            copyText.textContent = 'Copied';
            setTimeout(() => {
              copyText.textContent = originalText;
            }, 2000);
          }
        }).catch(err => {
          console.error('Failed to copy link: ', err);
        });
      });
    }
  }

  toggleMenu(show) {
    const mobileMenuToggle = this.shadowRoot.querySelector('#mobileMenuToggle');
    const navLinks = this.shadowRoot.querySelector('#navLinks');
    
    if (show) {
      navLinks.classList.add('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
      mobileMenuToggle.setAttribute('aria-label', 'Close menu');
    } else {
      navLinks.classList.remove('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      mobileMenuToggle.setAttribute('aria-label', 'Open menu');
    }
  }

  updateActiveState() {
    const activeValue = this.getAttribute('active');
    
    // Reset all
    const items = this.shadowRoot.querySelectorAll('[data-nav-item]');
    items.forEach(item => {
      item.classList.remove('active');
      const link = item.querySelector('a');
      if (link) link.removeAttribute('aria-current');
    });

    if (!activeValue) return;

    // Set new active
    const activeItem = this.shadowRoot.querySelector(`[data-nav-item="${activeValue}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
      const link = activeItem.querySelector('a');
      if (link) link.setAttribute('aria-current', 'page');
    }
  }
}

customElements.define('site-nav-v2', SiteNavV2);
