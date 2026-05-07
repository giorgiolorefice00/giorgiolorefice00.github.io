function initReveal() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const els = document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-stagger]");

  if (reducedMotion) {
    els.forEach(el => el.setAttribute("data-revealed", "true"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-revealed", "true");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  els.forEach(el => observer.observe(el));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initReveal);
} else {
  initReveal();
}

document.addEventListener("astro:page-load", initReveal);
