/**
 * site-footer-v2.js
 * Global footer Web Component — LiDa Software
 *
 * Uses LIGHT DOM (no Shadow DOM) so the external CSS loads cleanly via
 * a <link> in the document <head> (or injected once by this script).
 * This mirrors how the site-nav.js (v1) works and avoids the FOUC
 * risk that Shadow DOM + dynamic stylesheet loading can introduce.
 *
 * Usage:
 *   <site-footer-v2></site-footer-v2>
 *
 * The component self-injects the stylesheet link (<link>) into <head>
 * the first time it is connected to the DOM, so consuming pages only
 * need the single <script> tag — no manual <link> required.
 */

(function () {
  'use strict';

  /* ── Inject the stylesheet once into <head> ── */
  function ensureStylesheet() {
    const HREF = '/components/site-footer-v2.css';
    if (!document.querySelector(`link[href="${HREF}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = HREF;
      document.head.appendChild(link);
    }
  }

  /* ── SVG icons ── */
  const ICONS = {
    linkedin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>`,

    facebook: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>`,

    whatsapp: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
    </svg>`,
  };

  /* ── Component definition ── */
  class SiteFooterV2 extends HTMLElement {

    connectedCallback() {
      ensureStylesheet();
      this._render();
      this._bindWhatsApp();
    }

    _render() {
      const year = new Date().getFullYear();

      this.innerHTML = `
<footer class="sf2-footer" role="contentinfo" aria-label="Site footer">

  <!-- Main grid -->
  <div class="sf2-main">

    <!-- 1. Brand area -->
    <div class="sf2-brand">
      <a href="/index.html" class="sf2-logo-link" aria-label="LiDa Software home">
        <div class="sf2-logo-icon">
          <img src="/logo.png" alt="" width="24" height="24" loading="lazy">
        </div>
        <span class="sf2-logo-name">LiDa Software</span>
      </a>

      <p class="sf2-brand-desc">
        Free developer tools, engineering guides, and tutorials, no paywalls, no gatekeeping.
      </p>

      <!-- Social links -->
      <nav class="sf2-socials" aria-label="Social media links">
        <a href="https://www.linkedin.com/in/hen-faibish-0469931b0/"
           class="sf2-social-link"
           target="_blank"
           rel="noopener noreferrer"
           aria-label="LinkedIn profile">
          ${ICONS.linkedin}
        </a>
        <a href="https://www.facebook.com/profile.php?id=61581626213032"
           class="sf2-social-link"
           target="_blank"
           rel="noopener noreferrer"
           aria-label="Facebook page">
          ${ICONS.facebook}
        </a>
        <a href="#"
           class="sf2-social-link sf2-whatsapp sf2-whatsapp-btn"
           aria-label="Contact on WhatsApp">
          ${ICONS.whatsapp}
        </a>
      </nav>
    </div>

    <!-- 2. Site navigation -->
    <nav aria-label="Footer site navigation">
      <span class="sf2-col-heading">Navigate</span>
      <ul class="sf2-link-list">
        <li><a href="/index.html#projects">Projects</a></li>
        <li><a href="/engineering.html">Engineering</a></li>
        <li><a href="/interview-prep.html">Interview Prep</a></li>
        <li><a href="/guides.html">Guides</a></li>
        <li>
          <a href="/dev-news.html">
            <span class="sf2-devnews-dot" aria-hidden="true"></span>Dev-news
          </a>
        </li>
        <li><a href="/powers-your-business/you-business.html">Payment Solutions</a></li>
        <li><a href="/index.html#contact">Contact</a></li>
      </ul>
    </nav>

    <!-- 3. Tools & Resources -->
    <nav aria-label="Tools and resources">
      <span class="sf2-col-heading">Tools</span>
      <ul class="sf2-link-list">
        <li><a href="/tools/toolSList/tools.html">All Tools</a></li>
        <li><a href="/tools/jsonBeautifier/json-beautifier.html">JSON Beautifier</a></li>
        <li><a href="/tools/aiCodeDiff/the-code-diff-viewer.html">AI Code Diff</a></li>
        <li><a href="/tools/ai-selector/index.html">AI Model Selector</a></li>
        <li><a href="/tools/promptPilot/index.html">PromptPilot</a></li>
        <li><a href="/tools/gitCheat/git-cheat.html">Git Cheat Sheet</a></li>
        <li><a href="/palette-forge/index.html">PaletteForge</a></li>
      </ul>
    </nav>

    <!-- 4. More links -->
    <nav aria-label="More site links">
      <span class="sf2-col-heading">More</span>
      <ul class="sf2-link-list">
        <li><a href="/about/index.html">About LiDa</a></li>
        <li><a href="/tools/mcp-blueprint-generator/mcp-blueprint-generator.html">MCP Generator</a></li>
        <li><a href="/tools/vector-sandbox/index.html">Vector Sandbox</a></li>
        <li><a href="/tools/architecture-compatibility-tool/architecture-compatibility.html">Arch&nbsp;Compatibility</a></li>
        <li><a href="/tools/timeStampConvert/time-stamp-convert.html">Timestamp Converter</a></li>
        <li><a href="/lida-mix-play/index.html">LiDa Mix Play</a></li>
        <li><a href="mailto:bandel79@gmail.com">Email Us</a></li>
      </ul>
    </nav>

  </div><!-- /.sf2-main -->

  <!-- Bottom band -->
  <div class="sf2-bottom-band">
    <span class="sf2-open-source-badge">&#10084;&#65039; Inspired by the open-source community</span>
    <p class="sf2-philosophy-text">I build tools the same way I write code: small, boring, and useful.</p>
    <p class="sf2-copyright">&copy; ${year} <strong>LiDa Software</strong>. All rights reserved.</p>
    <p class="sf2-disclaimer">LiDa Software is an independent developer platform by Hen Faibish, named after his children Lia &amp; Daniel.</p>
  </div>

</footer>
      `.trim();
    }

    _bindWhatsApp() {
      const btn = this.querySelector('.sf2-whatsapp-btn');
      if (!btn) return;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof window.openWhatsAppPopup === 'function') {
          window.openWhatsAppPopup();
        } else {
          // Fallback: direct WhatsApp link
          window.open(
            'https://wa.me/40753358749?text=Hi%20Hen%2C%20I%27d%20like%20to%20get%20in%20touch.',
            '_blank',
            'noopener,noreferrer'
          );
        }
      });
    }
  }

  customElements.define('site-footer-v2', SiteFooterV2);
}());
