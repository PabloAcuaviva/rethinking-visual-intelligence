(function () {
  const GROUPS = {
    arc: [
      arcSlide("both", "575b1a71"),
      arcSlide("vdm-but-not-llm", "2072aba6"),
      arcSlide("llm-but-not-vdm", "332efdb3"),
      arcSlide("both", "68b67ca3"),
      arcSlide("vdm-but-not-llm", "4aab4007"),
      arcSlide("llm-but-not-vdm", "50a16a69"),
      arcSlide("both", "8ee62060"),
      arcSlide("vdm-but-not-llm", "5207a7b5"),
      arcSlide("llm-but-not-vdm", "642d658d"),
    ],
    games: [
      compactSlide("Hitori 5x5", "assets/examples/game_qualitative/hitori_5", "000"),
      compactSlide("Sudoku", "assets/examples/game_qualitative/sudoku", "000"),
      compactSlide("Hitori 5x5", "assets/examples/game_qualitative/hitori_5", "001"),
      compactSlide("Sudoku", "assets/examples/game_qualitative/sudoku", "001"),
      compactSlide("Hitori 5x5", "assets/examples/game_qualitative/hitori_5", "002"),
      compactSlide("Sudoku", "assets/examples/game_qualitative/sudoku", "002"),
    ],
    navigation: [
      compactSlide("Maze", "assets/examples/additional_qualitative/maze", "000"),
      compactSlide("Shortest Path", "assets/examples/additional_qualitative/shortest_path", "000", { hasTarget: false }),
      compactSlide("Maze", "assets/examples/additional_qualitative/maze", "006"),
      compactSlide("Shortest Path", "assets/examples/additional_qualitative/shortest_path", "005", { hasTarget: false }),
      compactSlide("Maze", "assets/examples/additional_qualitative/maze", "018"),
      compactSlide("Shortest Path", "assets/examples/additional_qualitative/shortest_path", "008", { hasTarget: false }),
    ],
    automata: [
      directSlide("Life-like rules", {
        input: "assets/examples/gol_gt_image_0_028.png",
        target: "assets/examples/gol_gt_image_1_028.png",
        vdm: "assets/examples/vdm_gol_n30_028.png",
        llm: "assets/examples/llm_gol_n30_028.png",
      }),
      compactSlide("Langton's Ant", "assets/examples/additional_qualitative/langton_ant_step10", "000"),
      directSlide("Life-like rules", {
        input: "assets/examples/gol_seeds_gt_image_0_172.png",
        target: "assets/examples/gol_seeds_gt_image_1_172.png",
        vdm: "assets/examples/vdm_gol_seeds_n30_172.png",
        llm: "assets/examples/llm_gol_seeds_n30_172.png",
      }),
      compactSlide("Langton's Ant", "assets/examples/additional_qualitative/langton_ant_step10", "001"),
      compactSlide("Langton's Ant", "assets/examples/additional_qualitative/langton_ant_step10", "002"),
    ],
  };

  function arcSlide(bucket, id) {
    return {
      type: "arc",
      label: "ARC-AGI",
      root: `assets/examples/arc_appendix/${bucket}/${id}`,
      id,
    };
  }

  function compactSlide(label, root, id, options = {}) {
    return {
      type: "compact",
      label,
      paths: {
        input: `${root}/image_0/val_${id}.png`,
        target: options.hasTarget === false ? null : `${root}/image_1/val_${id}.png`,
        vdm: `${root}/vdm_prediction/val_${id}.png`,
        llm: `${root}/llm_prediction/${id}.png`,
      },
    };
  }

  function directSlide(label, paths) {
    return { type: "compact", label, paths };
  }

  function renderMediaFigure(src, caption, alt, captionClass = "") {
    return `
      <figure>
        <img src="${src}" alt="${alt}" />
        <figcaption${captionClass ? ` class="${captionClass}"` : ""}>${caption}</figcaption>
      </figure>
    `;
  }

  function slideHeading(label) {
    return `
      <div class="mixed-slide-heading">
        <span>Task</span>
        <h5>${label}</h5>
      </div>
    `;
  }

  function renderCompactSlide(slide, index) {
    const active = index === 0 ? " active" : "";
    const targetFigure = slide.paths.target
      ? renderMediaFigure(slide.paths.target, "Target", `${slide.label} target example`)
      : "";
    const rowClass = slide.paths.target
      ? "compact-prediction-row"
      : "compact-prediction-row compact-prediction-row-three";

    return `
      <article class="carousel-slide${active}">
        ${slideHeading(slide.label)}
        <div class="${rowClass}">
          ${renderMediaFigure(slide.paths.input, "Input", `${slide.label} input example`)}
          ${targetFigure}
          ${renderMediaFigure(slide.paths.vdm, "CogVideoX1.5-5B", `CogVideoX1.5-5B prediction for ${slide.label}`, "model-caption blue-model")}
          ${renderMediaFigure(slide.paths.llm, "Qwen3-4B", `Qwen3-4B prediction for ${slide.label}`, "model-caption red-model")}
        </div>
      </article>
    `;
  }

  function renderArcSlide(slide, index) {
    const active = index === 0 ? " active" : "";
    const train = [0, 1, 2]
      .map((trainIndex) => {
        const id = String(trainIndex).padStart(3, "0");
        return `
          <img src="${slide.root}/train_${id}_gt_in.png" alt="ARC-AGI training input ${trainIndex + 1}" />
          <img src="${slide.root}/train_${id}_gt_out.png" alt="ARC-AGI training output ${trainIndex + 1}" />
        `;
      })
      .join("");

    return `
      <article class="arc-task carousel-slide${active}">
        ${slideHeading(slide.label)}
        <div class="arc-examples six-col">
          ${train}
        </div>
        <div class="prediction-row four-col">
          <div><span>Input</span><img src="${slide.root}/test_000_gt_in.png" alt="ARC-AGI held-out input" /></div>
          <div><span>Target</span><img src="${slide.root}/test_000_gt_out.png" alt="ARC-AGI target output" /></div>
          <div><span class="model-label blue-model">CogVideoX1.5-5B</span><img src="${slide.root}/test_000_vdm.png" alt="CogVideoX1.5-5B output for ARC-AGI example" /></div>
          <div><span class="model-label red-model">Qwen3-4B</span><img src="${slide.root}/test_000_llm.png" alt="Qwen3-4B output for ARC-AGI example" /></div>
        </div>
      </article>
    `;
  }

  function renderSlide(slide, index) {
    return slide.type === "arc" ? renderArcSlide(slide, index) : renderCompactSlide(slide, index);
  }

  function renderGroup(root) {
    const key = root.dataset.qualGroup;
    const slides = GROUPS[key];
    if (!slides || !slides.length) return;

    root.innerHTML = `
      <article class="qualitative-panel compact-example-panel mixed-carousel-panel">
        <div class="compact-example-header">
          <span>Qualitative examples</span>
        </div>
        <div class="arc-carousel compact-example-carousel" data-carousel="${key}-examples">
          <div class="carousel-viewport">
            ${slides.map(renderSlide).join("")}
          </div>
          <div class="carousel-controls" aria-label="Qualitative example carousel controls">
            <button class="carousel-button prev" type="button" aria-label="Previous qualitative example">‹</button>
            <div class="carousel-dots" aria-label="Qualitative example selector"></div>
            <button class="carousel-button next" type="button" aria-label="Next qualitative example">›</button>
          </div>
        </div>
      </article>
    `;

    const carousel = root.querySelector("[data-carousel]");
    if (carousel) setupGeneratedCarousel(carousel);
  }

  function setupGeneratedCarousel(root) {
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

  document.querySelectorAll("[data-qual-group]").forEach(renderGroup);
})();
