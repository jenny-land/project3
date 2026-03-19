// ============================================================
// ABOUT.JS — About Page
// Enhancement layer only. The page works fully without this.
//
// What this file does:
//   1. Activates the JS-safe fade-up system (body.js-loaded)
//   2. Scroll-triggered fade-up reveals
//
// What this file does NOT do:
//   Nav shrink — the about page nav doesn't have id="nav"
//   and the about page has no scroll-dependent nav behavior.
//   (The nav shrink only applies to the homepage.)
//
//   Form validation — no form on the about page.
//   The CTA buttons link directly to index.html#contact.
// ============================================================

// ── 1. ACTIVATE JS-SAFE FADE-UP SYSTEM ──────────────────────
//
// Same pattern as index.js — must run before DOMContentLoaded
// so .fade-up elements are hidden before the observer initializes.
// ─────────────────────────────────────────────────────────────
document.body.classList.add("js-loaded");

document.addEventListener("DOMContentLoaded", () => {
  // ── 2. SCROLL-TRIGGERED FADE-UP REVEALS ──────────────────
  //
  // Same IntersectionObserver pattern as index.js with two
  // differences tuned for the about page:
  //
  // STAGGER: 60ms per element instead of 80ms.
  // The about page has larger section blocks — the hero,
  // each numbered section, and the CTA. These are fewer,
  // heavier elements than the homepage's many small cards.
  // A tighter stagger (60ms) makes the sections feel like
  // they're flowing in together rather than one-by-one.
  //
  // CAP: 300ms instead of 400ms.
  // Same reason — fewer elements, so the cap can be lower
  // without any element feeling rushed.
  //
  // Everything else is identical to index.js.
  // ──────────────────────────────────────────────────────────

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const fadeElements = document.querySelectorAll(".fade-up");

  if (fadeElements.length === 0) return;

  // Reduced motion: reveal everything immediately, skip observer
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
      // Slightly larger offset than homepage (-40px vs -40px)
      // because about page sections are taller — we want the
      // section to be meaningfully into the viewport before
      // it starts revealing, not just barely peeking in.
      rootMargin: "0px 0px -60px 0px",
    },
  );

  // ── Apply staggered delays and start observing ──
  fadeElements.forEach((el, index) => {
    // 60ms stagger, capped at 300ms
    const delay = Math.min(index * 60, 300);

    // Preserve any inline transition-delay already set
    if (!el.style.transitionDelay) {
      el.style.transitionDelay = delay + "ms";
    }

    observer.observe(el);
  });
}); // end DOMContentLoaded
