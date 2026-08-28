(() => {
  const root = document.documentElement;
  const topbar = document.querySelector(".topbar");
  const backToTop = document.querySelector(".floating-top");
  const progress = document.querySelector(".scroll-progress > span");
  const chapterStatus = document.querySelector(".chapter-status");
  const chapterNumber = document.querySelector(".chapter-status-number");
  const chapterLabel = document.querySelector(".chapter-status-label");
  const heroVisual = document.querySelector(".hero-visual");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  root.classList.add("js-enabled");

  const updateScrollUi = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const value = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    progress?.style.setProperty("--scroll-progress", String(value));
    topbar?.classList.toggle("is-scrolled", window.scrollY > 18);
    backToTop?.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.65);
    chapterStatus?.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.72);
    if (!reducedMotion.matches) {
      heroVisual?.style.setProperty("--hero-shift", `${Math.min(window.scrollY * 0.065, 34)}px`);
    }
  };

  let scrollFrame = 0;
  const requestScrollUpdate = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      updateScrollUi();
      scrollFrame = 0;
    });
  };
  updateScrollUi();
  window.addEventListener("scroll", requestScrollUpdate, { passive: true });

  const revealSelector = [
    ".section-heading",
    ".section-code-watermark",
    ".origin-layout",
    ".age-seventeen",
    ".story-quote",
    ".code-comment",
    ".career-card",
    ".focus-card",
    ".production-note",
    ".engineering-detail-grid article",
    ".skill-row",
    ".community-card",
    ".people-closing",
    ".lida-banner",
    ".tool-card",
    ".life-grid",
    ".family-grid",
    ".education-row",
  ].join(",");
  const revealNodes = Array.from(document.querySelectorAll(revealSelector));
  revealNodes.forEach((node, index) => {
    node.classList.add("reveal-ready");
    node.style.setProperty("--reveal-delay", `${(index % 3) * 55}ms`);
  });

  if (reducedMotion.matches) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -8%" });
    revealNodes.forEach((node) => revealObserver.observe(node));
  }

  const navLinks = Array.from(document.querySelectorAll(".desktop-nav a[href^='#']"));
  const sections = Array.from(document.querySelectorAll(".chapter[id]"));
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });
    const active = navLinks.find((link) => link.hash === `#${visible.target.id}`);
    active?.classList.add("is-active");
    active?.setAttribute("aria-current", "location");
    if (chapterNumber && chapterLabel) {
      chapterNumber.textContent = visible.target.querySelector(".chapter-rail span")?.textContent || "01";
      chapterLabel.textContent = active?.textContent?.trim() || "People";
    }
  }, { threshold: [0.12, 0.3], rootMargin: "-22% 0px -55%" });
  sections.forEach((section) => sectionObserver.observe(section));

  const canTilt = window.matchMedia("(pointer: fine)").matches && !reducedMotion.matches;
  if (canTilt) {
    document.querySelectorAll(".tool-card").forEach((card) => {
      card.classList.add("js-tilt");
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--tilt-x", `${(-y * 2.4).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${(x * 2.8).toFixed(2)}deg`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(
      ".focus-card, .engineering-detail-grid article, .community-card, .tool-card, .lida-banner, .contact-links a",
    ).forEach((surface) => {
      surface.classList.add("cursor-spotlight");
      surface.addEventListener("pointermove", (event) => {
        const rect = surface.getBoundingClientRect();
        surface.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
        surface.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
      });
    });
  }

  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".mobile-menu");
  const menuLinks = Array.from(menu?.querySelectorAll("a") || []);
  const setMenuOpen = (open) => {
    toggle?.setAttribute("aria-expanded", String(open));
    toggle?.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    menu?.classList.toggle("is-open", open);
    menu?.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
    menuLinks.forEach((link) => { link.tabIndex = open ? 0 : -1; });
    if (open) window.requestAnimationFrame(() => menuLinks[0]?.focus());
  };
  toggle?.addEventListener("click", () => setMenuOpen(toggle.getAttribute("aria-expanded") !== "true"));
  menuLinks.forEach((link) => link.addEventListener("click", () => setMenuOpen(false)));
  window.addEventListener("keydown", (event) => {
    const open = toggle?.getAttribute("aria-expanded") === "true";
    if (event.key === "Escape" && open) {
      setMenuOpen(false);
      toggle?.focus();
    }
    if (event.key === "Tab" && open) {
      const last = menuLinks.at(-1);
      if (event.shiftKey && document.activeElement === toggle && last) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        toggle?.focus();
      }
    }
  });
})();
