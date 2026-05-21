(function () {
  const samples = [3, 5, 10, 30, 50, 100, 300, 500, 1000, 3000, 5000];
  const tasks = [
    {
      name: "Step 2",
      vdm: [0.18, 0.23, 0.67, 1.0, 1.0, 1.0, null, null, null, null, null],
      llm: [0.32, 0.21, 0.51, 0.79, 0.95, 0.99, 1.0, 1.0, 1.0, null, null],
    },
    {
      name: "Step 3",
      vdm: [0.03, 0.07, 0.29, 0.76, 0.99, 1.0, null, null, null, null, null],
      llm: [0.03, 0.04, 0.19, 0.46, 0.58, 0.91, 1.0, 1.0, 1.0, null, null],
    },
    {
      name: "Step 5",
      vdm: [0.03, 0.04, 0.06, 0.25, 0.41, 0.88, 1.0, 1.0, 1.0, null, null],
      llm: [null, null, null, 0.06, 0.14, 0.39, 0.98, 1.0, 1.0, null, null],
    },
    {
      name: "Step 10",
      vdm: [null, 0.0, 0.01, 0.01, 0.01, 0.08, 0.42, 0.83, 0.98, 0.99, null],
      llm: [null, null, null, 0.0, 0.01, 0.01, 0.12, 0.21, 0.47, 0.71, 0.93],
    },
  ];

  const BLUE = "#4771b2";
  const RED = "#f28c98";
  const INK = "#172033";
  const MUTED = "#5b6475";
  const LINE = "#dce3ee";
  const GRID = "#edf1f7";
  const MIN_SAMPLE = 3;
  const MAX_SAMPLE = 5000;

  function logScale(value, left, width) {
    const t =
      (Math.log10(value) - Math.log10(MIN_SAMPLE)) /
      (Math.log10(MAX_SAMPLE) - Math.log10(MIN_SAMPLE));
    return left + t * width;
  }

  function yScale(value, top, height) {
    return top + (1 - value) * height;
  }

  function axisFormat(tick) {
    if (tick === 0) return "0";
    if (tick === 1) return "1.0";
    return tick.toFixed(2);
  }

  function formatValue(value) {
    return value == null ? "not evaluated" : value.toFixed(3);
  }

  function sampleTickLabel(tick) {
    if (tick === 10) return "10";
    if (tick === 100) return '10<tspan baseline-shift="super" font-size="9">2</tspan>';
    if (tick === 1000) return '10<tspan baseline-shift="super" font-size="9">3</tspan>';
    if (tick === 5000) return '5x10<tspan baseline-shift="super" font-size="9">3</tspan>';
    return String(tick);
  }

  function pathFor(values, plot) {
    let d = "";
    let active = false;
    values.forEach((value, i) => {
      if (value == null) {
        active = false;
        return;
      }
      const x = logScale(samples[i], plot.x, plot.w);
      const y = yScale(value, plot.y, plot.h);
      d += `${active ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)} `;
      active = true;
    });
    return d.trim();
  }

  function pointTargets(task, modelName, values, plot, color, marker) {
    return values
      .map((value, i) => {
        if (value == null) return "";
        const x = logScale(samples[i], plot.x, plot.w);
        const y = yScale(value, plot.y, plot.h);
        const shape =
          marker === "square"
            ? `<rect class="point-visible" x="${(x - 3.8).toFixed(2)}" y="${(y - 3.8).toFixed(2)}" width="7.6" height="7.6" rx="1.2" fill="${color}" />`
            : `<circle class="point-visible" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="4" fill="${color}" />`;
        return `
          <g class="langton-point" data-task="${task.name}" data-model="${modelName}" data-sample="${samples[i]}" data-vdm="${formatValue(task.vdm[i])}" data-llm="${formatValue(task.llm[i])}">
            ${shape}
            <circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="13" fill="transparent" />
          </g>
        `;
      })
      .join("");
  }

  function renderPanel(task, index, plot, xTicks) {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const yTicks = [0, 0.25, 0.5, 0.75, 1.0];
    const yGrid = yTicks
      .map((tick) => {
        const y = yScale(tick, plot.y, plot.h);
        return `
          <line x1="${plot.x}" y1="${y}" x2="${plot.x + plot.w}" y2="${y}" stroke="${GRID}" />
          ${
            col === 0
              ? `<text x="${plot.x - 12}" y="${y + 4}" text-anchor="end" class="axis-label">${axisFormat(tick)}</text>`
              : ""
          }
        `;
      })
      .join("");

    const xGrid = xTicks
      .map((tick) => {
        const x = logScale(tick, plot.x, plot.w);
        return `
          <line x1="${x}" y1="${plot.y}" x2="${x}" y2="${plot.y + plot.h}" stroke="${GRID}" />
          ${
            row === 1
              ? `<text x="${x}" y="${plot.y + plot.h + 22}" text-anchor="middle" class="axis-label">${sampleTickLabel(tick)}</text>`
              : ""
          }
        `;
      })
      .join("");

    return `
      <g>
        <text x="${plot.x + plot.w / 2}" y="${plot.y - 22}" text-anchor="middle" class="panel-title">${task.name}</text>
        <rect x="${plot.x}" y="${plot.y}" width="${plot.w}" height="${plot.h}" fill="#fff" stroke="${LINE}" />
        ${yGrid}
        ${xGrid}
        <path d="${pathFor(task.vdm, plot)}" fill="none" stroke="${BLUE}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" />
        <path d="${pathFor(task.llm, plot)}" fill="none" stroke="${RED}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="6 5" />
        ${pointTargets(task, "CogVideoX1.5-5B", task.vdm, plot, BLUE, "circle")}
        ${pointTargets(task, "Qwen3-4B", task.llm, plot, RED, "square")}
      </g>
    `;
  }

  function setupTooltip(root) {
    const tooltip = root.querySelector(".figure-tooltip");
    if (!tooltip) return;

    root.querySelectorAll(".langton-point").forEach((point) => {
      point.addEventListener("pointerenter", () => {
        tooltip.classList.add("visible");
        tooltip.innerHTML = `
          <strong>Langton's Ant, ${point.dataset.task}</strong>
          <div class="tooltip-subtle">n = ${point.dataset.sample}</div>
          <div class="tooltip-row" style="--row-color: ${BLUE}">
            <span class="tooltip-name">CogVideoX1.5-5B</span>
            <span class="tooltip-value">${point.dataset.vdm}</span>
          </div>
          <div class="tooltip-row" style="--row-color: ${RED}">
            <span class="tooltip-name">Qwen3-4B</span>
            <span class="tooltip-value">${point.dataset.llm}</span>
          </div>
        `;
      });
      point.addEventListener("pointermove", (event) => {
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
      point.addEventListener("pointerleave", () => {
        tooltip.classList.remove("visible");
      });
    });
  }

  function render() {
    const root = document.getElementById("langton-figure");
    if (!root) return;

    const width = 760;
    const height = 405;
    const plot = { x: 82, y: 58, w: 282, h: 92 };
    const gapX = 52;
    const gapY = 58;
    const xTicks = [10, 100, 1000, 5000];

    const panels = tasks
      .map((task, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        return renderPanel(task, index, {
          x: plot.x + col * (plot.w + gapX),
          y: plot.y + row * (plot.h + gapY),
          w: plot.w,
          h: plot.h,
        }, xTicks);
      })
      .join("");

    root.innerHTML = `
      <div class="js-figure-wrap">
        <svg class="js-figure-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Langton's Ant accuracy curves by prediction horizon">
          <style>
            .panel-title { fill: ${INK}; font: 800 14px system-ui, sans-serif; }
            .axis-label { fill: ${MUTED}; font: 700 12px system-ui, sans-serif; }
            .axis-title { fill: ${MUTED}; font: 800 14px system-ui, sans-serif; }
            .legend-text { fill: ${INK}; font: 750 14px system-ui, sans-serif; }
            .langton-point { cursor: crosshair; }
            .langton-point:hover .point-visible { filter: brightness(0.92); }
          </style>
          ${panels}
          <text x="${plot.x - 54}" y="${plot.y + plot.h + gapY / 2}" text-anchor="middle" transform="rotate(-90 ${plot.x - 54} ${plot.y + plot.h + gapY / 2})" class="axis-title">Accuracy</text>
          <text x="${width / 2}" y="${height - 58}" text-anchor="middle" class="axis-title">Training samples</text>
          <g transform="translate(${width / 2 - 190}, ${height - 24})">
            <line x1="0" y1="0" x2="34" y2="0" stroke="${BLUE}" stroke-width="2.6" stroke-linecap="round" />
            <circle cx="17" cy="0" r="4" fill="${BLUE}" />
            <text x="46" y="5" class="legend-text">CogVideoX1.5-5B</text>
            <line x1="210" y1="0" x2="244" y2="0" stroke="${RED}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="6 5" />
            <rect x="223" y="-4" width="8" height="8" rx="1.2" fill="${RED}" />
            <text x="256" y="5" class="legend-text">Qwen3-4B</text>
          </g>
        </svg>
        <div class="figure-tooltip" role="status" aria-live="polite"></div>
      </div>
    `;

    setupTooltip(root);
  }

  render();
})();
