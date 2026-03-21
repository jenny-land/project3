// ============================================================
// CASE-STUDY.JS — Case Study Pages
// Enhancement layer only. The page works fully without this.
//
// What this file does:
//   1. Activates the JS-safe fade-up system (body.js-loaded)
//   2. Reading progress bar
//   3. Scroll-triggered fade-up reveals
// ============================================================

// ── 1. ACTIVATE JS-SAFE FADE-UP SYSTEM ──────────────────────
//
// Same pattern as index.js and about.js.
// Runs before DOMContentLoaded so .fade-up elements are hidden
// before the observer initializes.
// ─────────────────────────────────────────────────────────────
document.body.classList.add("js-loaded");

document.addEventListener("DOMContentLoaded", () => {
  // ── 2. READING PROGRESS BAR ──────────────────────────────
  //
  // The progress bar is a 2px fixed line at the very top of
  // the viewport. Its width goes from 0% to 100% as the user
  // scrolls from the top of the page to the bottom.
  //
  // The element: <div class="progress-bar" id="progressBar">
  // Defined in case-study.css — position:fixed, top:0, height:2px.
  // Without JS its width stays at 0% — invisible. Correct.
  //
  // CALCULATION:
  // scrollY                   = how far the user has scrolled
  // scrollHeight - innerHeight = total scrollable distance
  //                             (total page height minus viewport)
  // percentage = scrollY / scrollable distance × 100
  //
  // Edge case: if the page is shorter than the viewport
  // (scrollHeight <= innerHeight), scrollable distance is 0
  // or negative. We guard against division by zero with Math.max.
  //
  // requestAnimationFrame: we throttle the scroll handler using
  // rAF so it only runs once per frame (max 60fps) rather than
  // potentially dozens of times per scroll event tick.
  // This keeps the progress bar smooth without thrashing the
  // main thread.
  // ──────────────────────────────────────────────────────────
  const progressBar = document.getElementById("progressBar");

  if (progressBar) {
    let ticking = false;

    function updateProgressBar() {
      const scrollY = window.scrollY;
      const scrollable = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1, // prevent division by zero on very short pages
      );
      const percentage = Math.min((scrollY / scrollable) * 100, 100);

      progressBar.style.width = percentage + "%";
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        // Only schedule a new frame if one isn't already pending
        if (!ticking) {
          window.requestAnimationFrame(updateProgressBar);
          ticking = true;
        }
      },
      { passive: true },
    );

    // Run once on load so the bar reflects the correct position
    // if the page is loaded mid-scroll (e.g. browser back button)
    updateProgressBar();
  }

  // ── 3. SCROLL-TRIGGERED FADE-UP REVEALS ──────────────────
  //
  // Same IntersectionObserver pattern as index.js and about.js.
  //
  // STAGGER: 40ms per element — the tightest of the three pages.
  //
  // Why tighter here:
  // Case study sections are large, sequential blocks — cover,
  // then 6 numbered sections. The user is reading linearly,
  // moving deliberately from section to section.
  // The homepage (80ms) has more visual elements appearing
  // together so needs more separation. The about page (60ms)
  // sits between.
  //
  // CAP: 240ms — lower than both other pages for the same reason.
  // With 40ms stagger and 6 sections, uncapped would reach
  // ~480ms for the last element. That's too long for content
  // the user is actively reading through.
  //
  // rootMargin: '-80px' — the largest offset of the three pages.
  // Case study sections are the tallest elements in the whole
  // portfolio. We want a meaningful amount of the section in
  // view before it starts revealing — otherwise the top of a
  // tall section fades in while most of it is still off-screen,
  // which looks disconnected.
  // ──────────────────────────────────────────────────────────

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const fadeElements = document.querySelectorAll(".fade-up");

  if (fadeElements.length === 0) return;

  // Reduced motion: reveal everything immediately
  if (prefersReducedMotion) {
    fadeElements.forEach((el) => el.classList.add("visible"));
    return;
  }

  // ── Build the observer ──
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -80px 0px",
    },
  );

  // ── Apply staggered delays and start observing ──
  fadeElements.forEach((el, index) => {
    // 40ms stagger, capped at 240ms
    const delay = Math.min(index * 40, 240);

    if (!el.style.transitionDelay) {
      el.style.transitionDelay = delay + "ms";
    }

    observer.observe(el);
  });
}); // end DOMContentLoaded
