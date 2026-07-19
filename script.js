const revealTargets = document.querySelectorAll("[data-reveal]");
const sections = document.querySelectorAll("[data-section]");
const navLinks = document.querySelectorAll(".site-nav a");
const progressBar = document.querySelector(".scroll-progress span");

const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    }
  },
  { threshold: 0.25 },
);

for (const target of revealTargets) {
  revealObserver.observe(target);
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) {
      return;
    }

    const id = visible.target.id;

    for (const link of navLinks) {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  },
  { threshold: [0.35, 0.55, 0.75] },
);

for (const section of sections) {
  sectionObserver.observe(section);
}

const updateProgress = () => {
  if (!progressBar) {
    return;
  }

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar.style.height = `${Math.max(16.66, ratio * 100)}%`;
};

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();
