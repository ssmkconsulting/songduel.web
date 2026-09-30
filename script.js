/**
 * Feedback markup is a single component; fail explicitly if a required control is missing.
 * @template {Element} T
 * @param {string} selector
 * @param {{new(): T}} type
 * @param {ParentNode} root
 * @returns {T}
 */
function requiredElement(selector, type, root) {
  const element = root.querySelector(selector);
  if (!(element instanceof type))
    throw new Error(`Missing control: ${selector}`);
  return element;
}

const header = document.querySelector("[data-header]");
const menuButton = /** @type {HTMLButtonElement | null} */ (
  document.querySelector("[data-menu-toggle]")
);
const nav = document.querySelector("[data-nav]");

const updateHeader = () =>
  header?.classList.toggle("scrolled", window.scrollY > 24);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

/** @param {boolean} open */
const setMenuOpen = (open) => {
  nav?.classList.toggle("open", open);
  menuButton?.setAttribute("aria-expanded", String(open));
  const label = menuButton?.querySelector(".sr-only");
  if (label) label.textContent = open ? "Close menu" : "Open menu";
  document.body.style.overflow = open ? "hidden" : "";
};
menuButton?.addEventListener("click", () =>
  setMenuOpen(!nav?.classList.contains("open")),
);
nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});
document.addEventListener("keydown", (event) => {
  if (!nav?.classList.contains("open")) return;
  if (event.key === "Escape") {
    setMenuOpen(false);
    menuButton?.focus();
  }
  if (event.key === "Tab") {
    const last = /** @type {HTMLAnchorElement | null} */ (
      nav.querySelector("a:last-child")
    );
    if (event.shiftKey && document.activeElement === menuButton) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      menuButton?.focus();
    }
  }
});
window
  .matchMedia("(min-width: 821px)")
  .addEventListener("change", () => setMenuOpen(false));

const revealItems = document.querySelectorAll("[data-reveal]");
if (
  "IntersectionObserver" in window &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -45px" },
  );
  revealItems.forEach((item) => {
    item.classList.add("reveal-ready");
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const feedbackForm = document.querySelector("[data-feedback-form]");

if (feedbackForm) {
  const feedbackRecipient = "ssmk.consulting@icloud.com";
  const categoryInput = requiredElement(
    "[data-feedback-category]",
    HTMLSelectElement,
    feedbackForm,
  );
  const messageInput = requiredElement(
    "[data-feedback-message]",
    HTMLTextAreaElement,
    feedbackForm,
  );
  const messageCount = requiredElement(
    "[data-feedback-count]",
    HTMLElement,
    feedbackForm,
  );
  const followUpInput = requiredElement(
    "[data-feedback-follow-up]",
    HTMLInputElement,
    feedbackForm,
  );
  const emailField = requiredElement(
    "[data-feedback-email-field]",
    HTMLElement,
    feedbackForm,
  );
  const emailInput = requiredElement(
    "[data-feedback-email]",
    HTMLInputElement,
    feedbackForm,
  );
  const copyButton = requiredElement(
    "[data-copy-feedback]",
    HTMLButtonElement,
    feedbackForm,
  );
  const feedbackStatus = requiredElement(
    "[data-feedback-status]",
    HTMLElement,
    feedbackForm,
  );

  /** @param {string} message */
  const updateStatus = (message) => {
    feedbackStatus.textContent = message;
  };

  const buildFeedbackDetails = () => {
    const sharesEmail = followUpInput.checked;
    return [
      "SongDuel website feedback",
      "",
      `Topic: ${categoryInput.value}`,
      `Reply email: ${sharesEmail ? emailInput.value.trim() : "Not shared — follow-up is not possible"}`,
      "",
      "Feedback:",
      messageInput.value.trim(),
      "",
      "Sent from songduel.app",
    ].join("\n");
  };

  messageInput.addEventListener("input", () => {
    messageCount.textContent = String(messageInput.value.length);
  });

  followUpInput.addEventListener("change", () => {
    emailField.hidden = !followUpInput.checked;
    emailInput.required = followUpInput.checked;
    if (followUpInput.checked) emailInput.focus();
  });

  const validateFeedback = () => {
    if (!messageInput.value.trim()) {
      updateStatus("Please write a short message before continuing.");
      messageInput.focus();
      return false;
    }
    if (followUpInput.checked && !emailInput.checkValidity()) {
      updateStatus(
        "Please enter a valid reply email, or turn off email sharing.",
      );
      emailInput.focus();
      return false;
    }
    return true;
  };

  feedbackForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateFeedback()) return;

    const subject = `SongDuel feedback — ${categoryInput.value}`;
    const mailto = `mailto:${feedbackRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildFeedbackDetails())}`;
    updateStatus(
      "Your email draft should open now. Review the message and press Send.",
    );
    window.location.href = mailto;
  });

  copyButton.addEventListener("click", async () => {
    if (!validateFeedback()) return;
    const details = buildFeedbackDetails();

    try {
      await navigator.clipboard.writeText(details);
      updateStatus(
        "Feedback details copied. Paste them into an email to ssmk.consulting@icloud.com.",
      );
    } catch {
      const helper = document.createElement("textarea");
      helper.value = details;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.append(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
      updateStatus(
        "Feedback details copied. Paste them into an email to ssmk.consulting@icloud.com.",
      );
    }
  });
}

// Native anchor links keep every product reachable without JavaScript.
const productSections = document.querySelectorAll("[data-product]");
const productLinks = document.querySelectorAll("a[data-product-link]");
if ("IntersectionObserver" in window) {
  const productObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        productLinks.forEach((link) => {
          if (
            link.getAttribute("data-product-link") ===
            entry.target.getAttribute("data-product")
          ) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    { rootMargin: "-25% 0px -55% 0px", threshold: 0 },
  );
  productSections.forEach((section) => productObserver.observe(section));
}

const motionButton = /** @type {HTMLButtonElement | null} */ (
  document.querySelector("[data-motion-toggle]")
);
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let motionPaused = motionPreference.matches;
const updateMotion = () => {
  document.documentElement.classList.toggle("motion-paused", motionPaused);
  if (!motionButton) return;
  motionButton.textContent = motionPreference.matches
    ? "Reduced motion enabled"
    : motionPaused
      ? "Resume motion"
      : "Pause motion";
  motionButton.setAttribute("aria-pressed", String(motionPaused));
  motionButton.disabled = motionPreference.matches;
};
motionButton?.addEventListener("click", () => {
  motionPaused = !motionPaused;
  updateMotion();
});
motionPreference.addEventListener("change", () => {
  motionPaused = motionPreference.matches;
  updateMotion();
});
updateMotion();

// Stop decorative motion when the hero is offscreen or the tab is hidden.
const heroStage = document.querySelector(".hero-stage");
if (heroStage && "IntersectionObserver" in window) {
  let heroVisible = true;
  const updateHeroMotion = () =>
    heroStage.classList.toggle(
      "motion-offscreen",
      !heroVisible || document.hidden,
    );
  new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    updateHeroMotion();
  }).observe(heroStage);
  document.addEventListener("visibilitychange", updateHeroMotion);
}
