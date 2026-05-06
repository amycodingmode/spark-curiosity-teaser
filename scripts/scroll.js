/**
 * GSAP ScrollTrigger choreography — Scenes narrative, space CTA reveal.
 * Tune scroll ranges via ScrollTrigger `start` / `end` and timeline positions (second argument / duration).
 */
(function () {
  const prefersReduced = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Props sit outside the center corridor (~36–64%) reserved for the falling apple */
  function applyOuterRingLayout() {
    const mq = window.matchMedia("(max-width: 767px)").matches;
    const set = (id, props) => {
      const el = document.getElementById(id);
      if (!el || el.classList.contains("is-tablet-hidden")) return;
      gsap.set(el, { position: "absolute", ...props });
    };
    if (mq) {
      set("obj-clock", { left: "0", top: "10%", width: "46%", right: "auto", bottom: "auto" });
      set("obj-sunflower", { left: "0", top: "38%", width: "46%", right: "auto", bottom: "auto" });
      set("obj-table", { left: "0", bottom: "6%", width: "48%", top: "auto", right: "auto" });
      set("obj-rose", { right: "0", top: "10%", width: "46%", left: "auto", bottom: "auto" });
      set("obj-teapot", { right: "0", top: "38%", width: "46%", left: "auto", bottom: "auto" });
      set("obj-vase", { right: "0", bottom: "10%", width: "46%", left: "auto", top: "auto" });
    } else {
      set("obj-clock", { left: "2%", top: "12%", width: "27%", right: "auto", bottom: "auto" });
      set("obj-sunflower", { left: "0%", top: "38%", width: "30%", right: "auto", bottom: "auto" });
      set("obj-table", { left: "0%", bottom: "7%", width: "32%", top: "auto", right: "auto" });
      set("obj-rose", { right: "2%", top: "12%", width: "27%", left: "auto", bottom: "auto" });
      set("obj-teapot", { right: "1%", top: "38%", width: "28%", left: "auto", bottom: "auto" });
      set("obj-vase", { right: "2%", bottom: "10%", width: "26%", left: "auto", top: "auto" });
    }
  }

  function initAnimations(opts) {
    const { lenis } = opts;
    if (prefersReduced()) return;

    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop(value) {
          if (arguments.length) {
            lenis.scrollTo(value, { immediate: true });
          }
          const y =
            typeof lenis.scroll === "number"
              ? lenis.scroll
              : window.scrollY || document.documentElement.scrollTop;
          return y;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
        pinType: document.documentElement.style.transform ? "transform" : "fixed",
      });
    }

    const mobile = window.matchMedia("(max-width: 374px)").matches;
    const easeEntrance = "power2.out";
    const featuresSection = document.getElementById("features");
    const hasScenes = Boolean(
      featuresSection && !featuresSection.hasAttribute("hidden") && document.querySelector(".scenes__inner")
    );

    if (hasScenes) {
      applyOuterRingLayout();

      const appleEl = document.querySelector(".scenes__apple-wrap");
      const bgLayer = document.querySelector(".scenes__bg");
      const bgFallback = document.querySelector(".scenes__bg-fallback");

      /** ~3× viewport — narrative pacing (not fixed px) */
      const pinScrollDistance = () => Math.max(Math.round(window.innerHeight * 2.85), 1800);

      const scenesTl = gsap.timeline({
        defaults: { ease: easeEntrance },
        scrollTrigger: {
          trigger: "#features",
          start: "top top",
          end: () => "+=" + pinScrollDistance(),
          scrub: 1,
          pin: ".scenes__inner",
          anticipatePin: 1,
        },
      });

    /*
     * UX story (scrubbed 0 → 1):
     * 1) Apple fades in
     * 2–3) Apple falls on motion path while hole BG scrolls — tunnel / falling illusion
     * 4) Props fade in on outer ring; drift inward (still outside apple corridor)
     * 5) Apple exits bottom; hole fades; six props merge into one centered still-life
     */

    /** Fall begins immediately when pin starts — apple visible almost instantly */
    const FALL_START = 0;
    const FALL_DUR = 0.58;
    const PROPS_FADE0 = 0.06;
    const DRIFT_START = 0.2;
    const DRIFT_DUR = 0.44;
    const APPLE_EXIT = 0.62;
    const MERGE_START = 0.68;
    const MERGE_DUR = 0.26;

    if (appleEl) {
      gsap.set(appleEl, { xPercent: -50, opacity: 0 });
      scenesTl.to(appleEl, { opacity: 1, duration: 0.035, ease: "power1.out" }, 0);
    }

    if (appleEl && document.getElementById("apple-path")) {
      scenesTl.to(
        appleEl,
        {
          duration: FALL_DUR,
          motionPath: {
            path: "#apple-path",
            align: "#apple-path",
            alignOrigin: [0.5, 0.5],
            autoRotate: false,
          },
        },
        FALL_START
      );
      scenesTl.to(appleEl, { opacity: 0, duration: 0.07, ease: "power2.in" }, APPLE_EXIT);
    }

    /*
     * Scenes BG: subtle vertical pan through space-bg.png while apple falls.
     */
    if (bgLayer) {
      gsap.set(bgLayer, { y: 0, transformOrigin: "50% 0%" });
      scenesTl.fromTo(
        bgLayer,
        { backgroundPosition: "center 0%" },
        { backgroundPosition: "center 100%", ease: "none", duration: FALL_DUR },
        FALL_START
      );
    }

    const objectDefs = [
      { id: "obj-clock", fromLeft: true },
      { id: "obj-rose", fromLeft: false },
      { id: "obj-teapot", fromLeft: false },
      { id: "obj-sunflower", fromLeft: true },
      { id: "obj-table", fromLeft: true },
      { id: "obj-vase", fromLeft: false },
    ];

    const visibleDefs = objectDefs.filter((o) => {
      const el = document.getElementById(o.id);
      return el && !el.classList.contains("is-tablet-hidden");
    });

    visibleDefs.forEach((o, i) => {
      const el = document.getElementById(o.id);
      if (!el) return;
      gsap.set(el, { opacity: 0 });
      const dir = o.fromLeft ? -1 : 1;
      const fromX = mobile ? 0 : dir * 56;
      const fromY = mobile ? 36 : 0;
      scenesTl.fromTo(
        el,
        { opacity: 0, x: fromX, y: fromY, scale: 0.94 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.06,
          ease: easeEntrance,
        },
        PROPS_FADE0 + i * 0.022
      );
    });

    /* Drift toward center — “approach” ring still outside 36–64% apple corridor */
    const approachLayoutsDesk = {
      "obj-clock": { left: "14%", top: "18%", width: "21%", right: "auto", bottom: "auto" },
      "obj-sunflower": { left: "11%", top: "40%", width: "23%", right: "auto", bottom: "auto" },
      "obj-table": { left: "6%", bottom: "14%", width: "28%", top: "auto", right: "auto" },
      "obj-rose": { right: "14%", top: "18%", width: "21%", left: "auto", bottom: "auto" },
      "obj-teapot": { right: "11%", top: "40%", width: "23%", left: "auto", bottom: "auto" },
      "obj-vase": { right: "14%", bottom: "16%", width: "21%", left: "auto", top: "auto" },
    };
    const approachLayoutsMob = {
      "obj-clock": { left: "2%", top: "12%", width: "42%", right: "auto", bottom: "auto" },
      "obj-sunflower": { left: "2%", top: "40%", width: "42%", right: "auto", bottom: "auto" },
      "obj-table": { left: "2%", bottom: "10%", width: "44%", top: "auto", right: "auto" },
      "obj-rose": { right: "2%", top: "12%", width: "42%", left: "auto", bottom: "auto" },
      "obj-teapot": { right: "2%", top: "40%", width: "42%", left: "auto", bottom: "auto" },
      "obj-vase": { right: "2%", bottom: "14%", width: "42%", left: "auto", top: "auto" },
    };
    const narrowUi = window.matchMedia("(max-width: 767px)").matches;
    const approachMap = narrowUi ? approachLayoutsMob : approachLayoutsDesk;

    visibleDefs.forEach((o) => {
      const el = document.getElementById(o.id);
      const props = approachMap[o.id];
      if (!el || !props) return;
      scenesTl.to(el, { ...props, duration: DRIFT_DUR, ease: "power2.inOut" }, DRIFT_START);
    });

    if (bgLayer) {
      scenesTl.to(
        bgLayer,
        { opacity: 0, duration: MERGE_DUR * 0.85, ease: "power2.inOut" },
        MERGE_START
      );
    }
    if (bgFallback) {
      scenesTl.to(
        bgFallback,
        { opacity: 0, duration: MERGE_DUR * 0.75, ease: "power1.inOut" },
        MERGE_START
      );
    }

    scenesTl.to(
      ".scenes__inner",
      { backgroundColor: "#0a0a0a", duration: MERGE_DUR * 0.9, ease: "none" },
      MERGE_START
    );

    const mergeSteps = [
      [
        "#obj-table",
        {
          left: "50%",
          right: "auto",
          xPercent: -50,
          bottom: "10%",
          top: "auto",
          width: "58%",
          zIndex: 2,
        },
      ],
      [
        "#obj-clock",
        {
          left: "30%",
          top: "26%",
          width: "14%",
          right: "auto",
          bottom: "auto",
          zIndex: 6,
        },
      ],
      [
        "#obj-sunflower",
        {
          left: "24%",
          top: "42%",
          width: "18%",
          right: "auto",
          zIndex: 4,
        },
      ],
      [
        "#obj-rose",
        {
          left: "56%",
          top: "26%",
          width: "14%",
          right: "auto",
          zIndex: 6,
        },
      ],
      [
        "#obj-teapot",
        {
          left: "52%",
          top: "44%",
          width: "15%",
          right: "auto",
          zIndex: 7,
        },
      ],
      [
        "#obj-vase",
        {
          left: "48%",
          bottom: "22%",
          top: "auto",
          width: "12%",
          right: "auto",
          zIndex: 8,
        },
      ],
    ];

    mergeSteps.forEach(([sel, props]) => {
      const node = document.querySelector(sel);
      if (!node || node.classList.contains("is-tablet-hidden")) return;
      scenesTl.to(
        sel,
        {
          ...props,
          x: 0,
          y: 0,
          scale: 1,
          duration: MERGE_DUR,
          ease: "power2.inOut",
          filter: "drop-shadow(0 10px 28px rgba(0,0,0,0.35))",
        },
        MERGE_START
      );
    });

      scenesTl.to(
        ".scenes__caption",
        { opacity: 1, duration: 0.22, ease: "power2.out" },
        MERGE_START + 0.14
      );
    }

    const space = document.getElementById("contact");
    const spaceBg = document.querySelector(".space__bg");
    if (space && spaceBg) {
      let px = 0;
      let py = 0;
      let tx = 0;
      let ty = 0;
      space.addEventListener("mousemove", (e) => {
        const r = space.getBoundingClientRect();
        px = ((e.clientX - r.left) / r.width - 0.5) * 2;
        py = ((e.clientY - r.top) / r.height - 0.5) * 2;
      });
      gsap.ticker.add(() => {
        tx += (px * 12 - tx) * 0.08;
        ty += (py * 10 - ty) * 0.08;
        gsap.set(spaceBg, { x: tx, y: ty });
      });
    }

    const ctaBtn = document.getElementById("cta-test-scenes");
    if (ctaBtn && !prefersReduced()) {
      ScrollTrigger.create({
        trigger: "#contact",
        start: "top 65%",
        once: true,
        onEnter: () => {
          ctaBtn.classList.add("is-visible");
          ctaBtn.setAttribute("aria-hidden", "false");
          ctaBtn.tabIndex = 0;
        },
      });
    }

    initProcessPanelScroll({ lenis });

    ScrollTrigger.addEventListener("refresh", () => {
      if (lenis) lenis.resize();
    });

    window.addEventListener("load", () => ScrollTrigger.refresh());
    ScrollTrigger.refresh();
  }

  /**
   * Process panel: scrub advances active step + swaps left imagery.
   * Red bar (.process-row--accent, #e5023d) only on explicit click; cleared when scrub leaves that step.
   */
  function initProcessPanelScroll(opts) {
    const { lenis } = opts || {};
    const pinShell = document.querySelector(".process-panel__pin");
    const rows = document.querySelectorAll(".process-row");
    const figures = document.querySelectorAll(".process-panel__figure");
    const videos = Array.from(document.querySelectorAll(".process-panel__figure video"));
    if (!pinShell || !rows.length || prefersReduced()) return;

    const n = rows.length;
    let accentStep = null;
    let prevIdx = -1;
    const scrollDistance = () => Math.max(Math.round(window.innerHeight * 1.9), 1600);

    const syncVideos = (activeIdx) => {
      videos.forEach((video, i) => {
        if (i === activeIdx) {
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      });
    };

    const syncRows = (progress) => {
      const idx = Math.min(n - 1, Math.floor(progress * n));
      /* Drop click accent only when scrub leaves the accented step (not mid-flight to a click target). */
      if (accentStep !== null && prevIdx === accentStep && idx !== accentStep) {
        rows.forEach((el) => el.classList.remove("process-row--accent"));
        accentStep = null;
      }
      prevIdx = idx;
      rows.forEach((el, i) => {
        const on = i === idx;
        el.classList.toggle("is-active", on);
        el.setAttribute("aria-expanded", on ? "true" : "false");
      });
      figures.forEach((fig, i) => fig.classList.toggle("is-active", i === idx));
      syncVideos(idx);
    };

    const st = ScrollTrigger.create({
      trigger: pinShell,
      start: "top top",
      end: () => "+=" + scrollDistance(),
      pin: true,
      anticipatePin: 1,
      scrub: 0.22,
      onUpdate: (self) => syncRows(self.progress),
    });

    syncRows(0);

    function scrollToStep(i) {
      ScrollTrigger.refresh();
      const progress = (i + 0.5) / n;
      const start = st.start;
      const end = st.end;
      const target = start + progress * (end - start);
      if (lenis && typeof lenis.scrollTo === "function") {
        lenis.scrollTo(target, { duration: 0.95 });
      } else {
        window.scrollTo({ top: target, behavior: "smooth" });
      }
    }

    rows.forEach((row, i) => {
      row.addEventListener("click", (e) => {
        e.preventDefault();
        accentStep = i;
        rows.forEach((r, j) => r.classList.toggle("process-row--accent", j === i));
        scrollToStep(i);
      });
      row.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        accentStep = i;
        rows.forEach((r, j) => r.classList.toggle("process-row--accent", j === i));
        scrollToStep(i);
      });
    });
  }

  function setupTabletObjectVisibility() {
    /* Fewer props on small tablets — hide two of six */
    const hiddenIds = ["obj-vase", "obj-teapot"];
    const mq = window.matchMedia("(max-width: 768px)");
    function apply() {
      hiddenIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle("is-tablet-hidden", mq.matches);
      });
    }
    mq.addEventListener("change", apply);
    apply();
  }

  window.FormaScenes = window.FormaScenes || {};
  window.FormaScenes.initAnimations = initAnimations;
  window.FormaScenes.setupTabletObjectVisibility = setupTabletObjectVisibility;
  window.FormaScenes.applyPropLayout = function applyPropLayout() {
    if (typeof gsap === "undefined") return;
    applyOuterRingLayout();
  };
})();
