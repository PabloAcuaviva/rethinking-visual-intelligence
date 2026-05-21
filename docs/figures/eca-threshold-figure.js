(function () {
  const rows = [
    { name: "R8", vdm: 100, llm: 100 },
    { name: "R32", vdm: 50, llm: 50 },
    { name: "R128", vdm: 50, llm: 100 },
    { name: "R160", vdm: 50, llm: 100 },
    { name: "R4", vdm: 50, llm: 100 },
    { name: "R108", vdm: 100, llm: 100 },
    { name: "R170", vdm: 30, llm: 30 },
    { name: "R250", vdm: 100, llm: 100 },
    { name: "R30", vdm: 100, llm: 100 },
    { name: "R45", vdm: 100, llm: 100 },
    { name: "R90", vdm: 100, llm: 300 },
    { name: "R150", vdm: 500, llm: 50 },
    { name: "R110", vdm: 50, llm: 50 },
    { name: "R54", vdm: 50, llm: 100 },
    { name: "R62", vdm: 100, llm: 100 },
    { name: "R106", vdm: 100, llm: 100 },
  ];

  const BLUE = "#4771b2";
  const RED = "#f28c98";
  const INK = "#172033";
  const MUTED = "#5b6475";
  const LINE = "#dce3ee";
  const GRID = "#edf1f7";

  function yScale(value, top, height) {
    const max = 540;
    return top + (1 - value / max) * height;
  }

  function setupTooltip(root) {
    const tooltip = root.querySelector(".figure-tooltip");
    if (!tooltip) return;

    root.querySelectorAll(".eca-bar").forEach((bar) => {
      bar.addEventListener("pointerenter", () => {
        tooltip.classList.add("visible");
        tooltip.innerHTML = `
          <strong>${bar.dataset.rule}</strong>
          <div class="tooltip-subtle">samples to reach 90% accuracy</div>
          <div class="tooltip-row" style="--row-color: ${BLUE}">
            <span class="tooltip-name">CogVideoX1.5-5B</span>
            <span class="tooltip-value">${bar.dataset.vdm}</span>
          </div>
          <div class="tooltip-row" style="--row-color: ${RED}">
            <span class="tooltip-name">Qwen3-4B</span>
            <span class="tooltip-value">${bar.dataset.llm}</span>
          </div>
        `;
      });
      bar.addEventListener("pointermove", (event) => {
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
      bar.addEventListener("pointerleave", () => {
        tooltip.classList.remove("visible");
      });
    });
  }

  function render() {
    const root = document.getElementById("eca-threshold-figure");
    if (!root) return;

    const width = 760;
    const height = 330;
    const plot = { x: 82, y: 48, w: 640, h: 145 };
    const groupW = plot.w / rows.length;
    const barW = 13;
    const ticks = [0, 100, 200, 300, 400, 500];

    const grid = ticks
      .map((tick) => {
        const y = yScale(tick, plot.y, plot.h);
        return `
          <line x1="${plot.x}" y1="${y}" x2="${plot.x + plot.w}" y2="${y}" stroke="${GRID}" />
          <text x="${plot.x - 12}" y="${y + 4}" text-anchor="end" class="axis-label">${tick}</text>
        `;
      })
      .join("");

    const groups = rows
      .map((row, i) => {
        const center = plot.x + groupW * i + groupW / 2;
        const vdmX = center - barW - 2.5;
        const llmX = center + 2.5;
        const vdmY = yScale(row.vdm, plot.y, plot.h);
        const llmY = yScale(row.llm, plot.y, plot.h);
        const vdmH = plot.y + plot.h - vdmY;
        const llmH = plot.y + plot.h - llmY;

        return `
          <g>
            <rect class="eca-bar" data-rule="${row.name}" data-model="CogVideoX1.5-5B" data-value="${row.vdm}" data-vdm="${row.vdm}" data-llm="${row.llm}" x="${vdmX.toFixed(2)}" y="${vdmY.toFixed(2)}" width="${barW}" height="${vdmH.toFixed(2)}" rx="2" fill="${BLUE}" />
            <rect class="eca-bar" data-rule="${row.name}" data-model="Qwen3-4B" data-value="${row.llm}" data-vdm="${row.vdm}" data-llm="${row.llm}" x="${llmX.toFixed(2)}" y="${llmY.toFixed(2)}" width="${barW}" height="${llmH.toFixed(2)}" rx="2" fill="${RED}" />
            <text x="${(vdmX + barW / 2).toFixed(2)}" y="${(vdmY - 7).toFixed(2)}" text-anchor="middle" class="bar-label blue-label">${row.vdm}</text>
            <text x="${(llmX + barW / 2).toFixed(2)}" y="${(llmY - 7).toFixed(2)}" text-anchor="middle" class="bar-label red-label">${row.llm}</text>
            <text x="${center.toFixed(2)}" y="${plot.y + plot.h + 22}" text-anchor="middle" transform="rotate(-55 ${center.toFixed(2)} ${plot.y + plot.h + 22})" class="x-label">${row.name}</text>
          </g>
        `;
      })
      .join("");

    root.innerHTML = `
      <div class="js-figure-wrap">
        <svg class="js-figure-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Training samples needed to reach threshold accuracy on Elementary Cellular Automata">
          <style>
            .axis-label { fill: ${MUTED}; font: 700 12px system-ui, sans-serif; }
            .axis-title { fill: ${MUTED}; font: 800 14px system-ui, sans-serif; }
            .x-label { fill: ${INK}; font: 760 10px system-ui, sans-serif; }
            .bar-label { font: 850 8px system-ui, sans-serif; }
            .blue-label { fill: #3f6fb7; }
            .red-label { fill: #d83f5f; }
            .legend-text { fill: ${INK}; font: 750 14px system-ui, sans-serif; }
            .eca-bar { cursor: crosshair; }
            .eca-bar:hover { filter: brightness(0.94); }
          </style>
          <rect x="${plot.x}" y="${plot.y}" width="${plot.w}" height="${plot.h}" fill="#fff" stroke="${LINE}" />
          ${grid}
          ${groups}
          <text x="${plot.x - 54}" y="${plot.y + plot.h / 2}" text-anchor="middle" transform="rotate(-90 ${plot.x - 54} ${plot.y + plot.h / 2})" class="axis-title">Training samples</text>
          <text x="${width / 2}" y="${height - 64}" text-anchor="middle" class="axis-title">Samples to reach 90% accuracy</text>
          <g transform="translate(${width / 2 - 190}, ${height - 24})">
            <rect x="0" y="-9" width="18" height="18" rx="3" fill="${BLUE}" />
            <text x="28" y="5" class="legend-text">CogVideoX1.5-5B</text>
            <rect x="176" y="-9" width="18" height="18" rx="3" fill="${RED}" />
            <text x="204" y="5" class="legend-text">Qwen3-4B</text>
          </g>
        </svg>
        <div class="figure-tooltip" role="status" aria-live="polite"></div>
      </div>
    `;

    setupTooltip(root);
  }

  render();
})();
