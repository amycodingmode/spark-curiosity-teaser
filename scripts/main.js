/**
 * Lenis smooth scroll, navigation, waitlist modal, reduced-motion fallbacks.
 */
(function () {
  const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function isReduced() {
    return mqReduce.matches;
  }

  /**
   * Hero uses youtube-nocookie + origin to reduce YouTube Error 153; `si` matches your share link.
   * Src is set in JS so `origin` can be the live page origin on http(s).
   */
  function initHeroYouTubeEmbed() {
    if (isReduced()) return;
    const iframe = document.querySelector(".hero__embed-frame");
    if (!iframe) return;
    if (location.protocol === "file:") {
      iframe.closest(".hero__embed")?.classList.add("is-paused-reduced");
      return;
    }
    const videoId = "RsXU3gAqR6A";
    const base = `https://www.youtube-nocookie.com/embed/${videoId}`;
    const params = new URLSearchParams({
      si: "Ajur5eTnhHc8n7IM",
      autoplay: "1",
      mute: "1",
      playsinline: "1",
      loop: "1",
      playlist: videoId,
      controls: "0",
      modestbranding: "1",
      rel: "0",
    });
    if (location.protocol === "http:" || location.protocol === "https:") {
      params.set("origin", location.origin);
    }
    iframe.src = `${base}?${params.toString()}`;
  }

  function setupTabletLayout() {
    if (window.FormaScenes && window.FormaScenes.setupTabletObjectVisibility) {
      window.FormaScenes.setupTabletObjectVisibility();
    }
  }

  function applyReducedMotionUI() {
    document.body.classList.add("motion-reduced");
    const heroFrame = document.querySelector(".hero__embed-frame");
    if (heroFrame?.src) {
      heroFrame.removeAttribute("src");
    }
    document.querySelector(".hero__embed")?.classList.add("is-paused-reduced");
    document.querySelector(".space__video")?.pause?.();
    document.querySelector(".scenes")?.classList.add("is-reduced");
    /* Same random side-column layout as scroll choreography (hero is skipped separately). */
    if (window.FormaScenes && typeof window.FormaScenes.applyPropLayout === "function") {
      window.FormaScenes.applyPropLayout();
    }
    const cta = document.getElementById("cta-test-scenes");
    if (cta) {
      cta.classList.add("is-visible");
      cta.setAttribute("aria-hidden", "false");
      cta.tabIndex = 0;
    }
    /* Static composed scene: show objects */
    document.querySelectorAll(".scenes__object").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }

  function initNav(lenis) {
    const nav = document.getElementById("site-nav");
    const toggle = document.getElementById("nav-toggle");
    const links = nav?.querySelectorAll(".site-nav__links a");
    if (!nav || !toggle) return;

    function closeMenu() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", () => {
      const open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    links?.forEach((a) => {
      a.addEventListener("click", (e) => {
        closeMenu();
        const href = a.getAttribute("href") || "";
        if (!href.startsWith("#")) return;
        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const offset = -(parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-height")) || 80) - 12;
        if (lenis && typeof lenis.scrollTo === "function") {
          lenis.scrollTo(target, { duration: 1.15, offset });
        } else {
          const top = target.getBoundingClientRect().top + window.scrollY + offset;
          window.scrollTo({ top, behavior: "smooth" });
        }
        history.replaceState(null, "", href);
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    initNavScrollSpy(nav);
  }

  /** Marks the nav link for the section in view — drives active link color (#e5023d). */
  function initNavScrollSpy(nav) {
    const ids = ["hero", "scenes", "process", "contact"];
    const links = nav?.querySelectorAll(".site-nav__links a");
    if (!links?.length) return;

    function sync() {
      const probe = window.scrollY + Math.min(window.innerHeight * 0.35, 220);
      let currentId = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.offsetTop;
        if (top <= probe + 1) currentId = id;
      }
      links.forEach((a) => {
        if (a.getAttribute("href") === `#${currentId}`) {
          a.setAttribute("aria-current", "page");
        } else {
          a.removeAttribute("aria-current");
        }
      });
    }

    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
  }

  function initModal() {
    const modal = document.getElementById("waitlist-modal");
    const openBtn = document.getElementById("cta-test-scenes");
    const closeBtn = document.getElementById("modal-close");
    const form = document.getElementById("waitlist-form");
    const statusEl = document.getElementById("modal-status");
    if (!modal || !openBtn || !form) return;

    const focusable =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    let lastFocus = null;

    function openModal() {
      lastFocus = document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      const first = modal.querySelector(focusable);
      first?.focus();
    }

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      lastFocus?.focus?.();
    }

    openBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });

    closeBtn?.addEventListener("click", closeModal);
    modal.querySelector(".modal__backdrop")?.addEventListener("click", closeModal);

    modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
      if (e.key !== "Tab" || !modal.classList.contains("is-open")) return;
      const nodes = modal.querySelectorAll(focusable);
      const list = Array.from(nodes).filter((n) => !n.hasAttribute("disabled"));
      if (!list.length) return;
      const i = list.indexOf(document.activeElement);
      if (e.shiftKey && (i <= 0 || i === -1)) {
        e.preventDefault();
        list[list.length - 1].focus();
      } else if (!e.shiftKey && i === list.length - 1) {
        e.preventDefault();
        list[0].focus();
      }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailInput = form.querySelector("#waitlist-email");
      const submitBtn = form.querySelector('button[type="submit"]');
      const email = emailInput?.value?.trim();
      if (!email) return;

      statusEl.textContent = "";
      statusEl.classList.remove("is-error", "is-success");
      submitBtn.disabled = true;

      try {
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) throw new Error("Request failed");
        statusEl.textContent = "You’re on the list. We’ll be in touch.";
        statusEl.classList.add("is-success");
        form.reset();
      } catch {
        statusEl.textContent =
          "This is a preview — hook up /api/waitlist or try again later.";
        statusEl.classList.add("is-error");
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  function initLenis() {
    if (isReduced()) return null;
    const LenisCtor = window.Lenis;
    if (typeof LenisCtor !== "function") return null;
    return new LenisCtor({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
  }

  function initScrollCursor() {
    let scrollCursorTimer = null;
    const onScroll = () => {
      document.body.classList.add("is-scrolling");
      if (scrollCursorTimer) window.clearTimeout(scrollCursorTimer);
      scrollCursorTimer = window.setTimeout(() => {
        document.body.classList.remove("is-scrolling");
      }, 140);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHeroYouTubeEmbed();
    setupTabletLayout();
    const lenis = initLenis();
    initNav(lenis);
    initModal();
    initScrollCursor();

    if (isReduced()) {
      applyReducedMotionUI();
    }

    if (window.FormaScenes && window.FormaScenes.initAnimations) {
      window.FormaScenes.initAnimations({ lenis });
    }

  });
})();
