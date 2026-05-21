(function () {
  const samples = [3, 5, 10, 30, 50, 100, 300, 500, 1000, 3000, 5000];
  const tasks = [
    {
      name: "Hitori 5x5",
      vdm: [0.0, 0.0, 0.62, 0.72, 0.84, 0.92, 0.94, 0.94, 0.96, 0.98, 0.99],
      llm: [0.0, 0.0, 0.0, 0.02, 0.1, 0.28, 0.57, 0.64, 0.86, 0.94, 0.96],
    },
    {
      name: "Sudoku Mini",
      vdm: [0.22, 0.36, 0.65, 0.78, 0.9, 0.91, 0.9, 0.94, 0.91, 0.95, 0.96],
      llm: [0.18, 0.22, 0.48, 0.64, 0.68, 0.78, 0.8, 0.86, 0.9, 0.92, 0.96],
    },
    {
      name: "Sudoku",
      vdm: [0.0, 0.0, 0.0, 0.2, 0.34, 0.6, 0.55, 0.6, 0.79, 0.86, 0.86],
      llm: [null, null, null, 0.0, 0.0, 0.01, 0.01, 0.06, 0.14, 0.32, 0.55],
    },
    {
      name: "Connect 4",
      vdm: [0.44, 0.62, 0.74, 0.78, 0.8, 0.85, 0.84, 0.89, 0.9, 0.92, 0.9],
      llm: [0.03, 0.05, 0.08, 0.38, 0.38, 0.69, 0.71, 0.69, 0.76, 0.78, 0.82],
    },
    {
      name: "Chess Mate-in-1",
      vdm: [0.0, 0.0, 0.0, 0.02, 0.04, 0.08, 0.14, 0.2, 0.22, null, null],
      llm: [0.0, 0.02, 0.04, 0.13, 0.15, 0.24, 0.38, 0.44, 0.56, null, null],
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
    return value == null ? "not evaluated" : value.toFixed(2);
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
        const label = `${task.name} | ${modelName} | n=${samples[i]} | accuracy=${value.toFixed(2)}`;
        const shape =
          marker === "square"
            ? `<rect class="point-visible" x="${(x - 3.8).toFixed(2)}" y="${(y - 3.8).toFixed(2)}" width="7.6" height="7.6" fill="${color}" />`
            : `<circle class="point-visible" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="4" fill="${color}" />`;
        return `
          <g class="game-point" data-task="${task.name}" data-model="${modelName}" data-sample="${samples[i]}" data-vdm="${formatValue(task.vdm[i])}" data-llm="${formatValue(task.llm[i])}" aria-label="${label}">
            ${shape}
            <circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="12" fill="transparent" />
          </g>
        `;
      })
      .join("");
  }

  function renderPanel(task, index, plot, ticks) {
    const yTicks = [0, 0.25, 0.5, 0.75, 1.0];
    const yGrid = yTicks
      .map((tick) => {
        const y = yScale(tick, plot.y, plot.h);
        return `
          <line x1="${plot.x}" y1="${y}" x2="${plot.x + plot.w}" y2="${y}" stroke="${GRID}" />
          ${
            index === 0
              ? `<text x="${plot.x - 12}" y="${y + 4}" text-anchor="end" class="axis-label">${axisFormat(tick)}</text>`
              : ""
          }
        `;
      })
      .join("");

    const xGrid = ticks
      .map((tick) => {
        const x = logScale(tick, plot.x, plot.w);
        return `
          <line x1="${x}" y1="${plot.y}" x2="${x}" y2="${plot.y + plot.h}" stroke="${GRID}" />
          <text x="${x}" y="${plot.y + plot.h + 24}" text-anchor="middle" class="axis-label">${sampleTickLabel(tick)}</text>
        `;
      })
      .join("");

    return `
      <g>
        <text x="${plot.x + plot.w / 2}" y="${plot.y - 24}" text-anchor="middle" class="panel-title">${task.name}</text>
        <rect x="${plot.x}" y="${plot.y}" width="${plot.w}" height="${plot.h}" fill="#fff" stroke="${LINE}" />
        ${yGrid}
        ${xGrid}
        <path d="${pathFor(task.vdm, plot)}" fill="none" stroke="${BLUE}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
        <path d="${pathFor(task.llm, plot)}" fill="none" stroke="${RED}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="6 5" />
        ${pointTargets(task, "CogVideoX1.5-5B", task.vdm, plot, BLUE, "circle")}
        ${pointTargets(task, "Qwen3-4B", task.llm, plot, RED, "square")}
      </g>
    `;
  }

  function setupTooltip(root) {
    const tooltip = root.querySelector(".figure-tooltip");
    if (!tooltip) return;

    root.querySelectorAll(".game-point").forEach((point) => {
      point.addEventListener("pointerenter", () => {
        tooltip.classList.add("visible");
        tooltip.innerHTML = `
          <strong>${point.dataset.task}</strong>
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
    const roots = Array.from(document.querySelectorAll("[data-games-figure], #games-figure"));
    roots.forEach((root) => {
      const selectedTask = root.dataset.gamesFigure;
      const visibleTasks = selectedTask
        ? tasks.filter((task) => task.name === selectedTask)
        : tasks;
      if (!visibleTasks.length) return;

      const single = visibleTasks.length === 1;
      const width = single ? 760 : 1180;
      const height = single ? 330 : 485;
      const margin = single
        ? { top: 58, right: 42, bottom: 82, left: 82 }
        : { top: 92, right: 44, bottom: 92, left: 84 };
      const gap = single ? 0 : 34;
      const plotW =
        (width - margin.left - margin.right - gap * (visibleTasks.length - 1)) /
        visibleTasks.length;
      const plotH = single ? 145 : 230;
      const xTicks = [10, 100, 1000, 5000];

      const panels = visibleTasks
        .map((task, index) => {
          const plot = {
            x: margin.left + index * (plotW + gap),
            y: margin.top,
            w: plotW,
            h: plotH,
          };
          return renderPanel(task, index, plot, xTicks);
        })
        .join("");

      root.innerHTML = `
        <div class="js-figure-wrap">
          <svg class="js-figure-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Accuracy curves on visual games">
            <style>
              .panel-title { fill: ${INK}; font: 800 ${single ? 17 : 18}px system-ui, sans-serif; }
              .axis-label { fill: ${MUTED}; font: 700 12px system-ui, sans-serif; }
              .axis-title { fill: ${MUTED}; font: 800 14px system-ui, sans-serif; }
              .legend-text { fill: ${INK}; font: 750 14px system-ui, sans-serif; }
              .game-point { cursor: crosshair; }
              .game-point:hover .point-visible { filter: brightness(0.92); }
            </style>
            ${panels}
            <text x="${margin.left - 54}" y="${margin.top + plotH / 2}" text-anchor="middle" transform="rotate(-90 ${margin.left - 54} ${margin.top + plotH / 2})" class="axis-title">Accuracy</text>
            <text x="${width / 2}" y="${height - 70}" text-anchor="middle" class="axis-title">Training samples</text>
            <g transform="translate(${width / 2 - 190}, ${height - 24})">
              <line x1="0" y1="0" x2="34" y2="0" stroke="${BLUE}" stroke-width="2.5" stroke-linecap="round" />
              <circle cx="17" cy="0" r="4" fill="${BLUE}" />
              <text x="46" y="5" class="legend-text">CogVideoX1.5-5B</text>
              <line x1="210" y1="0" x2="244" y2="0" stroke="${RED}" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="6 5" />
              <rect x="223" y="-4" width="8" height="8" fill="${RED}" />
              <text x="256" y="5" class="legend-text">Qwen3-4B</text>
            </g>
          </svg>
          <div class="figure-tooltip" role="status" aria-live="polite"></div>
        </div>
      `;

      setupTooltip(root);
    });
  }

  render();
})();
