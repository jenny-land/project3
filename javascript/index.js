// ============================================================
// INDEX.JS — Homepage
// Enhancement layer only.
//
// What this file does:
//   1. Activates the JS-safe fade-up system (body.js-loaded)
//   2. Nav shrink on scroll
//   3. Contact form validation + success state
//
// What this file does NOT do yet:
//   Scroll-triggered fade-up reveals
// ============================================================

// ── 1. ACTIVATE JS-SAFE FADE-UP SYSTEM ──────────────────────
//
// shared.css has two rules for .fade-up:
//
//   .fade-up                  → fully visible (no JS fallback)
//   .js-loaded .fade-up       → hidden, ready to be revealed
//   .js-loaded .fade-up.visible → visible (revealed by observer)
//
// Adding 'js-loaded' to body right now — before DOMContentLoaded —
// means elements are hidden as early as possible, preventing a
// flash of visible content before the observer runs in later steps
//
// If this script fails or is blocked, 'js-loaded' never gets added
// and all content remains permanently visible. Safe degradation.
// ─────────────────────────────────────────────────────────────
document.body.classList.add("js-loaded");

// Everything else waits for the DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
  // ── 2. NAV SHRINK ON SCROLL ───────────────────────────────
  //
  // shared.css defines two nav states:
  //   nav           → padding: 24px 80px (tall)
  //   nav.scrolled  → padding: 18px 80px (compact)
  //
  // We toggle the 'scrolled' class based on scroll position.
  // The CSS transition handles the smooth animation.
  //
  // Threshold: 60px — roughly one nav height.
  // Below 60px: full nav (user is at the top of the page).
  // Above 60px: compact nav (user is reading content).
  // ──────────────────────────────────────────────────────────
  const nav = document.getElementById("nav");

  if (nav) {
    // Run once on load in case the page is refreshed mid-scroll
    nav.classList.toggle("scrolled", window.scrollY > 60);

    window.addEventListener(
      "scroll",
      () => {
        nav.classList.toggle("scrolled", window.scrollY > 60);
      },
      {
        // passive: true tells the browser this handler never calls
        // preventDefault() — allows scroll performance optimizations
        passive: true,
      },
    );
  }

  // ── 3. CONTACT FORM VALIDATION ───────────────────────────
  //
  // The form has novalidate on it — we handle all validation here.
  //
  // Fields validated:
  //   - Name: must not be empty
  //   - Email: must match a basic email pattern
  //   - Message: must not be empty
  //
  // Reason (select): optional — no validation required.
  //
  // Error states:
  //   JS adds .has-error to the .form-field wrapper.
  //   CSS shows the .form-error-msg span and turns the
  //   input border coral. Defined in index.css.
  //
  // Success state:
  //   form is hidden, #formSuccess div is shown.
  //   Defined in index.css — .form-success.visible { display: flex }
  // ──────────────────────────────────────────────────────────
  const form = document.getElementById("contactForm");
  const successMsg = document.getElementById("formSuccess");

  // Guard: only run if both elements exist on this page
  if (!form || !successMsg) return;

  // ── Email validation helper ──
  // Tests for the pattern: something@something.something
  // Deliberately simple — catches obvious mistakes without
  // being so strict it rejects valid addresses.
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  // ── Show error on a field ──
  // Adds .has-error to the .form-field wrapper (not the input).
  // CSS uses the parent class to show the error message span
  // and change the input border color to coral.
  function showError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) field.classList.add("has-error");
  }

  // ── Clear error on a field ──
  function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) field.classList.remove("has-error");
  }

  // ── Clear all error states ──
  function clearAllErrors() {
    ["field-name", "field-email", "field-message"].forEach(clearError);
  }

  // ── Show the success state ──
  // Hides the form, shows the confirmation message.
  // No page reload — pure DOM manipulation.
  function showSuccess() {
    form.style.display = "none";
    successMsg.classList.add("visible");

    // Scroll the success message into view smoothly
    // in case the user submitted from far down the form
    successMsg.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // ── Form submit handler ──
  form.addEventListener("submit", (e) => {
    // Always prevent default — we control what happens next
    e.preventDefault();

    // Clear previous errors before re-validating
    clearAllErrors();

    // Grab current field values
    const nameInput = document.getElementById("contact-name");
    const emailInput = document.getElementById("contact-email");
    const messageInput = document.getElementById("contact-message");

    // Track whether the whole form is valid
    let isValid = true;

    // Validate name: must have at least 1 non-whitespace character
    if (!nameInput.value.trim()) {
      showError("field-name");
      isValid = false;
    }

    // Validate email: must match email pattern
    if (!isValidEmail(emailInput.value)) {
      showError("field-email");
      isValid = false;
    }

    // Validate message: must have at least 1 non-whitespace character
    if (!messageInput.value.trim()) {
      showError("field-message");
      isValid = false;
    }

    // If any field failed, stop here.
    // Focus the first errored field for accessibility.
    if (!isValid) {
      const firstError = form.querySelector(
        ".has-error input, .has-error textarea",
      );
      if (firstError) firstError.focus();
      return;
    }

    // ── All fields valid — submit the form ──
    //
    // RIGHT NOW: we just show the success state immediately.
    //
    // WHEN YOU'RE READY TO GO LIVE:
    // Replace the showSuccess() call below with a fetch() to your
    // form endpoint. Easy option:
    //
    // OPTION — Formspree (free tier, no backend needed):
    //   1. Create account at formspree.io
    //   2. Create a new form, copy your form ID
    //   3. Replace showSuccess() with:
    //
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
    //   .then(response => {
    //     if (response.ok) {
    //       showSuccess();
    //     } else {
    //       // Handle server error — show a generic message
    //       alert('Something went wrong. Please email me directly.');
    //     }
    //   })
    //   .catch(() => {
    //     // Handle network error
    //     alert('Could not send message. Please email me directly.');
    //   });
    // ─────────────────────────────────────────────────────────
    showSuccess();
  });

  // ── Clear errors on input ──
  // As soon as the user starts typing in a field that has an error,
  // the error clears. Feels responsive and not punishing.
  // We listen on the field wrapper's inputs, not the form globally,
  // so we can target specific field IDs.

  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const messageInput = document.getElementById("contact-message");

  if (nameInput) {
    nameInput.addEventListener("input", () => clearError("field-name"));
  }

  if (emailInput) {
    emailInput.addEventListener("input", () => clearError("field-email"));
  }

  if (messageInput) {
    messageInput.addEventListener("input", () => clearError("field-message"));
  }
}); // end DOMContentLoaded
