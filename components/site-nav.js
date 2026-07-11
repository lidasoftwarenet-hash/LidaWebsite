class SiteNav extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <nav class="nav-header" id="navbar">
        <div class="nav-container">
          <a href="#" class="nav-logo" style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 40px; height: 40px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(102, 126, 234, 0.2);">
              <img src="/logo.png" alt="LiDa Software Logo - Free Developer Tools" width="30" height="30" style="width: 30px; height: 30px; max-width: 30px; max-height: 30px; object-fit: contain; display: block; flex-shrink: 0;">
            </div>
            LiDa Software
          </a>
          <ul class="nav-links" id="navLinks">
            <li><a href="/index.html#projects">Projects</a></li>
            <li><a href="/index.html#about">About</a></li>
            <li><a href="/engineering.html">Engineering</a></li>
            <li><a href="/interview-prep.html">Interview Prep</a></li>
            <li><a href="/guides.html">Guides</a></li>
            <li><a href="/index.html#contact">Contact</a></li>
            <li><a href="/powers-your-business/you-business.html">Payment Solutions</a></li>
            <li><a href="/dev-news.html" style="display:flex;align-items:center;gap:6px;color:#22c55e !important">
                <span style="width:5px;height:5px;border-radius:50%;background:#22c55e;box-shadow:0 0 5px rgba(34,197,94,0.8);animation:blink-dot 1.5s ease-in-out infinite;flex-shrink:0;display:inline-block"></span>
                Dev-news
              </a></li>

            <div class="nav-social">
              <a href="https://www.linkedin.com/in/hen-faibish-0469931b0/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61581626213032" target="_blank" rel="noopener noreferrer" title="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" onclick="openWhatsAppPopup(); return false;" title="WhatsApp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488" />
                </svg>
              </a>
            </div>
          </ul>
          <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Toggle menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px;"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
        </div>
      </nav>
    `;

    // Navbar scroll effect
    const navbar = this.querySelector('#navbar');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    // Mobile menu toggle
    const mobileMenuToggle = this.querySelector('#mobileMenuToggle');
    const navLinks = this.querySelector('#navLinks');

    mobileMenuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    const navLinkItems = navLinks.querySelectorAll('a');
    navLinkItems.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });

    // Handle active state (attribute vs hash)
    const activePage = this.getAttribute('active');
    const path = window.location.pathname;
    const isIndexPage = path === '/' || path.endsWith('/index.html');
    const hash = window.location.hash;

    const clearActiveStates = () => {
      this.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    };

    if (isIndexPage && hash) {
      const hashLink = this.querySelector(`a[href$="${hash}"]`);
      if (hashLink && hashLink.parentElement.tagName === 'LI') {
        hashLink.parentElement.classList.add('active');
      }
    } else if (activePage) {
      const activeLink = this.querySelector(`a[href*="${activePage}.html"]`);
      if (activeLink && activeLink.parentElement.tagName === 'LI') {
        activeLink.parentElement.classList.add('active');
      }
    }

    // Handle smooth scrolling for hash links within the navbar
    this.querySelectorAll('a').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href) return;
        
        const path = window.location.pathname;
        const isIndexPage = path === '/' || path.endsWith('/index.html');
        
        const isLocalHash = href.startsWith('#');
        const isIndexHash = href.startsWith('/index.html#') || href.startsWith('/#');
        
        if (isLocalHash || (isIndexPage && isIndexHash)) {
          const hashIndex = href.indexOf('#');
          const hash = href.substring(hashIndex);
          
          if (hash === '#') {
            e.preventDefault();
            return;
          }
          
          const target = document.querySelector(hash);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });

            // Update active state for nav links
            clearActiveStates();
            if (anchor.parentElement.tagName === 'LI') {
              anchor.parentElement.classList.add('active');
            }
            
            // Also update URL to reflect the hash without jumping
            history.pushState(null, null, hash);

            // Add highlight class to target element
            target.classList.add('highlight-target');
            setTimeout(() => {
              target.classList.remove('highlight-target');
            }, 800);
          }
        }
      });
    });
  }
}

customElements.define('site-nav', SiteNav);

