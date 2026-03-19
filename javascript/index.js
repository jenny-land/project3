// ============================================================
// INDEX.JS — Homepage
// Enhancement layer only. The page works fully without this.
//
// What this file does:
//   1. Activates the JS-safe fade-up system (body.js-loaded)
//   2. Nav shrink on scroll
//   3. Contact form validation + success state
//   4. Scroll-triggered fade-up reveals  ← added later

// ── 1. ACTIVATE JS-SAFE FADE-UP SYSTEM ──────────────────────
//
// Runs immediately — before DOMContentLoaded — so .fade-up
// elements get opacity:0 applied as early as possible.
// If JS fails, 'js-loaded' is never added and all content
// stays permanently visible. Safe degradation.
// ─────────────────────────────────────────────────────────────
document.body.classList.add("js-loaded");

document.addEventListener("DOMContentLoaded", () => {
  // ── 2. NAV SHRINK ON SCROLL ───────────────────────────────
  //
  // Toggles nav.scrolled when scrollY passes 60px.
  // CSS handles the smooth padding transition.
  // passive:true allows browser scroll optimizations.
  // ──────────────────────────────────────────────────────────
  const nav = document.getElementById("nav");

  if (nav) {
    nav.classList.toggle("scrolled", window.scrollY > 60);

    window.addEventListener(
      "scroll",
      () => {
        nav.classList.toggle("scrolled", window.scrollY > 60);
      },
      { passive: true },
    );
  }

  // ── 3. CONTACT FORM VALIDATION ───────────────────────────
  //
  // Validates name, email, message on submit.
  // Shows inline error per field via .has-error class.
  // Clears errors on input. Shows success state on valid submit.
  // ──────────────────────────────────────────────────────────
  const form = document.getElementById("contactForm");
  const successMsg = document.getElementById("formSuccess");

  if (form && successMsg) {
    function isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    }

    function showError(fieldId) {
      const field = document.getElementById(fieldId);
      if (field) field.classList.add("has-error");
    }

    function clearError(fieldId) {
      const field = document.getElementById(fieldId);
      if (field) field.classList.remove("has-error");
    }

    function clearAllErrors() {
      ["field-name", "field-email", "field-message"].forEach(clearError);
    }

    function showSuccess() {
      form.style.display = "none";
      successMsg.classList.add("visible");
      successMsg.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearAllErrors();

      const nameInput = document.getElementById("contact-name");
      const emailInput = document.getElementById("contact-email");
      const messageInput = document.getElementById("contact-message");

      let isValid = true;

      if (!nameInput.value.trim()) {
        showError("field-name");
        isValid = false;
      }
      if (!isValidEmail(emailInput.value)) {
        showError("field-email");
        isValid = false;
      }
      if (!messageInput.value.trim()) {
        showError("field-message");
        isValid = false;
      }

      if (!isValid) {
        const firstError = form.querySelector(
          ".has-error input, .has-error textarea",
        );
        if (firstError) firstError.focus();
        return;
      }

      // ── Production: replace showSuccess() with fetch() ──
      //
      // Formspree example:
      //   fetch('https://formspree.io/f/YOUR_FORM_ID', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       name:    nameInput.value.trim(),
      //       email:   emailInput.value.trim(),
      //       reason:  document.getElementById('contact-reason').value,
      //       message: messageInput.value.trim()
      //     })
      //   })
      //   .then(res => res.ok ? showSuccess() : alert('Something went wrong.'))
      //   .catch(() => alert('Could not send. Please email me directly.'));
      //
      // ────────────────────────────────────────────────────
      showSuccess();
    });

    // Clear individual field errors as the user types
    const nameInput = document.getElementById("contact-name");
    const emailInput = document.getElementById("contact-email");
    const messageInput = document.getElementById("contact-message");

    if (nameInput)
      nameInput.addEventListener("input", () => clearError("field-name"));
    if (emailInput)
      emailInput.addEventListener("input", () => clearError("field-email"));
    if (messageInput)
      messageInput.addEventListener("input", () => clearError("field-message"));
  } // end form guard

  // ── 4. SCROLL-TRIGGERED FADE-UP REVEALS ──────────────────
  //
  // Uses IntersectionObserver to watch every .fade-up element.
  // When an element becomes 10% visible, we add .visible to it.
  // shared.css transitions it from opacity:0/translateY(16px)
  // to opacity:1/translateY(0).
  //
  // Stagger: each element gets a small delay based on its index
  // in the NodeList. This creates a cascade effect when multiple
  // elements enter the viewport at the same time — e.g. the
  // work cards all appearing slightly after each other.
  //
  // The stagger is capped at 400ms so elements late in the page
  // don't have unreasonably long waits.
  //
  // unobserve() after firing: once revealed, the observer stops
  // watching. The element stays visible permanently and we free
  // up the observer from tracking it.
  //
  // prefers-reduced-motion: if the user has requested reduced
  // motion, we reveal everything immediately with no animation.
  // The CSS already handles this (shared.css Section 4) but we
  // also skip the stagger delay here for consistency.
  // ──────────────────────────────────────────────────────────

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Grab all fade-up elements on this page
  const fadeElements = document.querySelectorAll(".fade-up");

  if (fadeElements.length === 0) return;

  // If user prefers reduced motion, reveal everything immediately
  // No observer needed — just add .visible to all elements now
  if (prefersReducedMotion) {
    fadeElements.forEach((el) => el.classList.add("visible"));
    return;
  }

  // ── Build the observer ──
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Only act when element is entering the viewport
        if (!entry.isIntersecting) return;

        // Reveal the element
        entry.target.classList.add("visible");

        // Stop watching — element stays visible, no re-trigger
        observer.unobserve(entry.target);
      });
    },
    {
      // 10% of the element must be visible before triggering.
      // Lower values (0.05) trigger too early — elements reveal
      // before the user consciously sees them entering.
      // Higher values (0.3) feel too late on tall mobile screens.
      threshold: 0.1,

      // rootMargin: slight negative offset so elements don't
      // trigger at the very instant they peek into the viewport.
      // '-40px' means the element needs to be 40px into the
      // viewport before revealing. Feels more intentional.
      rootMargin: "0px 0px -40px 0px",
    },
  );

  // ── Apply staggered delays and start observing ──
  fadeElements.forEach((el, index) => {
    // Stagger: 80ms per element, capped at 400ms
    // Cap prevents absurdly long waits for elements
    // near the bottom of the page
    const delay = Math.min(index * 80, 400);

    // Only apply delay if no delay already set inline
    // (some elements have transition-delay set in HTML
    // e.g. the hero-right has style="transition-delay:120ms")
    if (!el.style.transitionDelay) {
      el.style.transitionDelay = delay + "ms";
    }

    observer.observe(el);
  });
}); // end DOMContentLoaded
