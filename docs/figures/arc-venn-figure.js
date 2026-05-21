(function () {
  const BLUE = "#4771b2";
  const RED = "#f28c98";
  const INK = "#172033";
  const MUTED = "#5b6475";
  const LINE = "#dce3ee";

  const counts = {
    total: 400,
    vdmOnly: 52,
    both: 15,
    llmOnly: 17,
  };
  counts.either = counts.vdmOnly + counts.both + counts.llmOnly;
  counts.neither = counts.total - counts.either;
  counts.vdmTotal = counts.vdmOnly + counts.both;
  counts.llmTotal = counts.llmOnly + counts.both;

  function setupTooltip(root) {
    const tooltip = root.querySelector(".figure-tooltip");
    if (!tooltip) return;

    root.querySelectorAll(".venn-region").forEach((region) => {
      region.addEventListener("pointerenter", () => {
        tooltip.classList.add("visible");
        tooltip.innerHTML = `
          <strong>${region.dataset.label}</strong>
          <div class="tooltip-row" style="--row-color: ${region.dataset.color}">
            <span class="tooltip-name">Tasks</span>
            <span class="tooltip-value">${region.dataset.count}</span>
          </div>
          <div class="tooltip-subtle">${region.dataset.detail}</div>
        `;
      });
      region.addEventListener("pointermove", (event) => {
        const rect = root.getBoundingClientRect();
        const cursorX = event.clientX - rect.left;
        const cursorY = event.clientY - rect.top;
        let left = cursorX + 16;
        let top = cursorY - 12;

        if (left + tooltip.offsetWidth > rect.width - 8) {
          left = cursorX - tooltip.offsetWidth - 16;
        }
        if (top + tooltip.offsetHeight > rect.height - 8) {
          top = cursorY - tooltip.offsetHeight - 16;
        }
        if (top < 8) {
          top = cursorY + 16;
        }

        tooltip.style.left = `${Math.max(8, left)}px`;
        tooltip.style.top = `${Math.max(8, top)}px`;
      });
      region.addEventListener("pointerleave", () => {
        tooltip.classList.remove("visible");
      });
    });
  }

  function render() {
    const root = document.getElementById("arc-venn-figure");
    if (!root) return;

    const width = 860;
    const height = 360;
    const left = { cx: 382, cy: 176, r: 116 };
    const right = { cx: 472, cy: 176, r: 90 };
    const overlapX = 430;

    root.innerHTML = `
      <div class="js-figure-wrap">
        <svg class="js-figure-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="ARC-AGI solved task overlap between CogVideoX1.5-5B and Qwen3-4B">
          <style>
            .venn-title { fill: ${INK}; font: 850 18px system-ui, sans-serif; }
            .venn-subtitle { fill: ${MUTED}; font: 750 12px system-ui, sans-serif; }
            .venn-model { fill: ${INK}; font: 820 13px system-ui, sans-serif; }
            .venn-count { fill: ${INK}; font: 850 23px system-ui, sans-serif; }
            .venn-note { fill: ${MUTED}; font: 750 12px system-ui, sans-serif; }
            .venn-region { cursor: crosshair; }
            .venn-region:hover { filter: brightness(0.97); }
          </style>

          <text x="${width / 2}" y="36" text-anchor="middle" class="venn-title">ARC-AGI solved tasks</text>
          <text x="${width / 2}" y="56" text-anchor="middle" class="venn-subtitle">400 tasks, official two-attempt evaluation</text>

          <text x="${left.cx - 102}" y="96" text-anchor="middle" class="venn-model">CogVideoX1.5-5B</text>
          <text x="${right.cx + 96}" y="96" text-anchor="middle" class="venn-model">Qwen3-4B</text>

          <circle class="venn-region" data-label="CogVideo only" data-count="${counts.vdmOnly}" data-detail="${counts.vdmTotal} solved by CogVideo in total" data-color="${BLUE}" cx="${left.cx}" cy="${left.cy}" r="${left.r}" fill="${BLUE}" fill-opacity="0.26" stroke="${BLUE}" stroke-width="2.2" />
          <circle class="venn-region" data-label="Qwen only" data-count="${counts.llmOnly}" data-detail="${counts.llmTotal} solved by Qwen in total" data-color="${RED}" cx="${right.cx}" cy="${right.cy}" r="${right.r}" fill="${RED}" fill-opacity="0.35" stroke="${RED}" stroke-width="2.2" />

          <circle class="venn-region" data-label="Solved by both" data-count="${counts.both}" data-detail="${counts.either} solved by at least one model" data-color="${INK}" cx="${overlapX}" cy="${left.cy}" r="40" fill="#ffffff" fill-opacity="0.01" stroke="transparent" stroke-width="1" />

          <text x="${left.cx - 64}" y="${left.cy + 8}" text-anchor="middle" class="venn-count">${counts.vdmOnly}</text>

          <text x="${overlapX}" y="${left.cy + 8}" text-anchor="middle" class="venn-count">${counts.both}</text>

          <text x="${right.cx + 54}" y="${right.cy + 8}" text-anchor="middle" class="venn-count">${counts.llmOnly}</text>

          <line x1="${width / 2 - 150}" y1="300" x2="${width / 2 + 150}" y2="300" stroke="${LINE}" />
          <text x="${width / 2}" y="324" text-anchor="middle" class="venn-note">${counts.either} solved by at least one model; ${counts.neither} unsolved by both</text>

        </svg>
        <div class="figure-tooltip" role="status" aria-live="polite"></div>
      </div>
    `;

    setupTooltip(root);
  }

  render();
})();
