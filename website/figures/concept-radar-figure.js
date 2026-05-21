(function () {
  const axes = [
    ["AboveBelow", "A/B"],
    ["TopBottom2D", "TB2D"],
    ["TopBottom3D", "TB3D"],
    ["HorizontalVertical", "H/V"],
    ["Center", "Center"],
    ["FilledNotFilled", "Fill"],
    ["CompleteShape", "Shape"],
    ["InsideOutside", "In/Out"],
    ["ExtractObjects", "Extract"],
    ["Count", "Count"],
    ["SameDifferent", "S/D"],
    ["Order", "Order"],
    ["MoveToBoundary", "MoveB"],
    ["ExtendToBoundary", "ExtB"],
    ["Copy", "Copy"],
    ["CleanUp", "CleanUp"],
  ];

  const models = {
    "CogVideoX1.5-5B": {
      family: "VDM",
      color: "#4771b2",
      values: [0.40, 0.37, 0.33, 0.47, 0.37, 0.37, 0.37, 0.33, 0.07, 0.57, 0.37, 0.07, 0.17, 0.40, 0.13, 0.53],
    },
    "Qwen3-4B": {
      family: "LLM",
      color: "#f06f7f",
      values: [0.40, 0.50, 0.13, 0.43, 0.20, 0.27, 0.23, 0.13, 0.10, 0.13, 0.27, 0.27, 0.23, 0.13, 0.17, 0.27],
    },
    "Wan2.1-14B": {
      family: "VDM",
      color: "#315f9f",
      values: [0.37, 0.63, 0.47, 0.53, 0.57, 0.50, 0.40, 0.37, 0.23, 0.83, 0.33, 0.00, 0.13, 0.50, 0.17, 0.60],
    },
    "LTX-13B": {
      family: "VDM",
      color: "#6f91c6",
      values: [0.30, 0.23, 0.27, 0.13, 0.33, 0.30, 0.20, 0.27, 0.07, 0.40, 0.23, 0.03, 0.17, 0.20, 0.20, 0.43],
    },
    "LTX-2B": {
      family: "VDM",
      color: "#8db6ce",
      values: [0.17, 0.17, 0.17, 0.20, 0.30, 0.27, 0.10, 0.27, 0.07, 0.43, 0.23, 0.03, 0.00, 0.23, 0.03, 0.40],
    },
    "Qwen3-8B": {
      family: "LLM",
      color: "#db4f68",
      values: [0.40, 0.50, 0.20, 0.47, 0.20, 0.23, 0.30, 0.20, 0.10, 0.13, 0.23, 0.27, 0.10, 0.17, 0.10, 0.30],
    },
    "Llama3.1-8B": {
      family: "LLM",
      color: "#f28c98",
      values: [0.17, 0.37, 0.17, 0.33, 0.13, 0.20, 0.13, 0.13, 0.03, 0.17, 0.27, 0.10, 0.17, 0.10, 0.10, 0.27],
    },
    "GPT-4 [IC]": {
      family: "LLM",
      color: "#f5aeba",
      values: [0.23, 0.23, 0.20, 0.27, 0.33, 0.17, 0.23, 0.10, 0.03, 0.13, 0.17, 0.27, 0.20, 0.07, 0.23, 0.20],
    },
  };

  const INK = "#172033";
  const MUTED = "#5b6475";
  const LINE = "#dce3ee";
  const GRID = "#e8edf5";
  const MAX_VALUE = 0.85;
  const MAIN_MODELS = ["CogVideoX1.5-5B", "Qwen3-4B"];
  const MODEL_ORDER = [
    "CogVideoX1.5-5B",
    "Wan2.1-14B",
    "LTX-13B",
    "LTX-2B",
    "Qwen3-4B",
    "Qwen3-8B",
    "Llama3.1-8B",
    "GPT-4 [IC]",
  ];

  function polarPoint(cx, cy, radius, index, total) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total;
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      angle,
    };
  }

  function valuePoint(cx, cy, radius, index, value) {
    return polarPoint(cx, cy, radius * (value / MAX_VALUE), index, axes.length);
  }

  function polygonPoints(cx, cy, radius, values) {
    return values
      .map((value, index) => {
        const point = valuePoint(cx, cy, radius, index, value);
        return `${point.x.toFixed(2)},${point.y.toFixed(2)}`;
      })
      .join(" ");
  }

  function renderGrid(cx, cy, radius, options) {
    const levels = [0.2, 0.4, 0.6, 0.8];
    const labelClass = options.compact ? "radar-label compact-label" : "radar-label";
    const rings = levels
      .map((level) => {
        const r = radius * (level / MAX_VALUE);
        return `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(2)}" fill="none" stroke="${GRID}" />`;
      })
      .join("");
    const spokes = axes
      .map(([, short], index) => {
        const end = polarPoint(cx, cy, radius, index, axes.length);
        const label = polarPoint(cx, cy, radius + options.labelOffset, index, axes.length);
        const anchor = Math.abs(Math.cos(label.angle)) < 0.15 ? "middle" : Math.cos(label.angle) > 0 ? "start" : "end";
        const dy = Math.abs(Math.sin(label.angle)) > 0.9 ? (Math.sin(label.angle) > 0 ? 11 : -5) : 4;
        return `
          <line x1="${cx}" y1="${cy}" x2="${end.x.toFixed(2)}" y2="${end.y.toFixed(2)}" stroke="${GRID}" />
          <text x="${label.x.toFixed(2)}" y="${(label.y + dy).toFixed(2)}" text-anchor="${anchor}" class="${labelClass}">${short}</text>
        `;
      })
      .join("");

    return `
      ${rings}
      ${spokes}
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${LINE}" stroke-width="1.2" />
    `;
  }

  function renderTrace(modelName, cx, cy, radius, options) {
    const model = models[modelName];
    const stroke = model.color;
    const opacity = options.fillOpacity || 0.12;
    const points = polygonPoints(cx, cy, radius, model.values);
    const vertices = model.values
      .map((value, index) => {
        const point = valuePoint(cx, cy, radius, index, value);
        const [concept] = axes[index];
        const r = options.pointRadius || 4;
        const hit = options.hitRadius || 12;
        return `
          <g class="radar-point" data-concept="${concept}" data-index="${index}" data-model="${modelName}" data-value="${value.toFixed(2)}" data-main="${options.main ? "true" : "false"}">
            <circle class="point-visible" cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="${r}" fill="${stroke}" />
            <circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="${hit}" fill="transparent" />
          </g>
        `;
      })
      .join("");

    return `
      <polygon points="${points}" fill="${stroke}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="${options.strokeWidth || 2.6}" stroke-linejoin="round" />
      ${vertices}
    `;
  }

  function pillFill(family) {
    return family === "VDM" ? "#dbe6f5" : "#fde0e5";
  }

  function renderSmallRadar(modelName, cx, cy) {
    const model = models[modelName];
    return `
      <g>
        ${renderGrid(cx, cy, 62, { compact: true, labelOffset: 12 })}
        ${renderTrace(modelName, cx, cy, 62, { fillOpacity: 0.10, pointRadius: 2.7, hitRadius: 9, strokeWidth: 2.1 })}
        <rect x="${cx - 60}" y="${cy + 87}" width="120" height="28" rx="5" fill="${pillFill(model.family)}" />
        <text x="${cx}" y="${cy + 107}" text-anchor="middle" class="small-title">${modelName}</text>
      </g>
    `;
  }

  function setupTooltip(root) {
    const tooltip = root.querySelector(".figure-tooltip");
    if (!tooltip) return;

    function modelRow(modelName, index, emphasized = false) {
      const model = models[modelName];
      return `
        <div class="tooltip-row ${emphasized ? "emphasized" : ""}" style="--row-color: ${model.color}">
          <span class="tooltip-name">${modelName}</span>
          <span class="tooltip-value">${model.values[index].toFixed(2)}</span>
        </div>
      `;
    }

    root.querySelectorAll(".radar-point").forEach((point) => {
      point.addEventListener("pointerenter", () => {
        const index = Number(point.dataset.index);
        const modelName = point.dataset.model;
        const comparisonRows = point.dataset.main === "true"
          ? MAIN_MODELS.map((name) => modelRow(name, index, name === modelName)).join("")
          : [
              modelRow(modelName, index, true),
              '<div class="tooltip-separator"></div>',
              ...MODEL_ORDER.filter((name) => name !== modelName).map((name) => modelRow(name, index, false)),
            ].join("");

        tooltip.classList.add("visible");
        tooltip.innerHTML = `
          <strong>${point.dataset.concept}</strong>
          ${comparisonRows}
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
    const root = document.getElementById("concept-radar-figure");
    if (!root) return;

    const width = 1180;
    const height = 720;
    const main = { cx: 305, cy: 338, r: 210 };
    const smalls = [
      ["Wan2.1-14B", 665, 172],
      ["LTX-13B", 880, 172],
      ["LTX-2B", 1095, 172],
      ["Qwen3-8B", 665, 485],
      ["Llama3.1-8B", 880, 485],
      ["GPT-4 [IC]", 1095, 485],
    ];

    root.innerHTML = `
      <div class="js-figure-wrap">
        <svg class="js-figure-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="ConceptARC radar comparison across model families">
          <style>
            .radar-label { fill: ${INK}; font: 800 14px system-ui, sans-serif; }
            .compact-label { font-size: 10px; font-weight: 800; }
            .axis-note { fill: ${MUTED}; font: 750 12px system-ui, sans-serif; }
            .legend-text { fill: ${INK}; font: 750 14px system-ui, sans-serif; }
            .small-title { fill: ${INK}; font: 850 15px system-ui, sans-serif; }
            .radar-point { cursor: crosshair; }
            .radar-point:hover .point-visible { filter: brightness(0.9); }
          </style>
          <g>
            ${renderGrid(main.cx, main.cy, main.r, { compact: false, labelOffset: 26 })}
            <text x="${main.cx}" y="${main.cy - main.r - 84}" text-anchor="middle" class="axis-note">ConceptARC concept-wise accuracy</text>
            <text x="${main.cx}" y="${main.cy - main.r - 67}" text-anchor="middle" class="axis-note">outer ring = 0.85</text>
            ${renderTrace("CogVideoX1.5-5B", main.cx, main.cy, main.r, { main: true, fillOpacity: 0.15, pointRadius: 4.5, hitRadius: 14, strokeWidth: 3 })}
            ${renderTrace("Qwen3-4B", main.cx, main.cy, main.r, { main: true, fillOpacity: 0.13, pointRadius: 4.5, hitRadius: 14, strokeWidth: 3 })}
          </g>
          <g>
            ${smalls.map(([name, cx, cy]) => renderSmallRadar(name, cx, cy)).join("")}
          </g>
          <g transform="translate(${width / 2 - 190}, ${height - 34})">
            <line x1="0" y1="0" x2="36" y2="0" stroke="${models["CogVideoX1.5-5B"].color}" stroke-width="3" stroke-linecap="round" />
            <circle cx="18" cy="0" r="4.5" fill="${models["CogVideoX1.5-5B"].color}" />
            <text x="48" y="5" class="legend-text">CogVideoX1.5-5B</text>
            <line x1="220" y1="0" x2="256" y2="0" stroke="${models["Qwen3-4B"].color}" stroke-width="3" stroke-linecap="round" />
            <circle cx="238" cy="0" r="4.5" fill="${models["Qwen3-4B"].color}" />
            <text x="268" y="5" class="legend-text">Qwen3-4B</text>
          </g>
        </svg>
        <div class="figure-tooltip" role="status" aria-live="polite"></div>
      </div>
    `;

    setupTooltip(root);
  }

  render();
})();
