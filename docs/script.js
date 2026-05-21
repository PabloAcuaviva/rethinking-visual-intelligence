function setupCarousel(root) {
  if (root.dataset.carouselInitialized === "true") return;
  const slides = Array.from(root.querySelectorAll(".carousel-slide"));
  const prev = root.querySelector(".carousel-button.prev");
  const next = root.querySelector(".carousel-button.next");
  const dotsRoot = root.querySelector(".carousel-dots");
  let index = 0;

  if (!slides.length || !prev || !next || !dotsRoot) return;
  root.dataset.carouselInitialized = "true";

  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `Show example ${i + 1}`);
    dot.addEventListener("click", () => show(i));
    dotsRoot.appendChild(dot);
    return dot;
  });

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
      slide.setAttribute("aria-hidden", i === index ? "false" : "true");
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
      dot.setAttribute("aria-current", i === index ? "true" : "false");
    });
  }

  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));
  show(0);
}

function setupTabs(root) {
  const tabs = Array.from(root.querySelectorAll(':scope > .tab-list [role="tab"]'));
  const panels = Array.from(root.querySelectorAll(':scope > .tab-panels > [role="tabpanel"]'));
  if (!tabs.length || !panels.length) return;

  function show(tab) {
    const targetId = tab.getAttribute("aria-controls");
    tabs.forEach((candidate) => {
      const active = candidate === tab;
      candidate.classList.toggle("active", active);
      candidate.setAttribute("aria-selected", active ? "true" : "false");
      candidate.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.id === targetId;
      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => show(tab));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next = tabs[(index + direction + tabs.length) % tabs.length];
      next.focus();
      show(next);
    });
  });

  show(tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0]);
}

document.querySelectorAll("[data-carousel]").forEach(setupCarousel);
document.querySelectorAll("[data-tabs]").forEach(setupTabs);
