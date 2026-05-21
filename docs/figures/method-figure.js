(function () {
  const input = [
    [0, 3, 4, 1],
    [1, 0, 3, 0],
    [0, 0, 0, 4],
    [0, 2, 0, 3],
  ];

  const target = [
    [2, 3, 4, 1],
    [1, 4, 3, 2],
    [3, 1, 2, 4],
    [4, 2, 1, 3],
  ];

  function colorGrid(values, label) {
    const cells = values
      .flat()
      .map((value) => `<span class="method-cell c${value}"></span>`)
      .join("");
    return `<div class="method-color-grid" aria-label="${label}">${cells}</div>`;
  }

  function tokenRows(values, label) {
    const rows = values
      .map((row, rowIndex) => {
        const prefix = rowIndex === 0 ? "[[" : "&nbsp;[";
        const suffix = rowIndex === values.length - 1 ? "]]" : "],";
        const cells = row.map((value) => `<span class="n${value}">${value}</span>`).join(",");
        return `<div class="token-row">${prefix}${cells}${suffix}</div>`;
      })
      .join("");
    return `<div class="method-token-stack" aria-label="${label}">${rows}</div>`;
  }

  function arrow(colorClass = "") {
    return `<span class="method-flow-arrow ${colorClass}" aria-hidden="true">→</span>`;
  }

  function modelBox(kind, label) {
    return `
      <div class="method-model-box">
        <span>Frozen pretrained</span>
        <strong>${kind}</strong>
        <em>${label}</em>
      </div>
    `;
  }

  function render() {
    const root = document.getElementById("method-figure");
    if (!root) return;

    root.innerHTML = `
      <figure class="method-comparison-figure" aria-labelledby="method-caption">
        <div class="method-branches">
          <section class="method-branch vdm-branch" aria-label="VDM branch">
            <h3>VDM branch</h3>
            <div class="method-branch-flow">
              <div class="method-endpoint">
                <span>Input I(x)</span>
                ${colorGrid(input, "Input grid rendered as an image")}
              </div>
              ${arrow()}
              ${modelBox("VDM", "LoRA adapters")}
              ${arrow()}
              <div class="method-endpoint">
                <span>Output I&#770;(x)</span>
                ${colorGrid(target, "Output grid rendered as an image")}
              </div>
            </div>
            <div class="method-loss">Loss: diffusion denoising</div>
          </section>

          <section class="method-branch llm-branch" aria-label="LLM branch">
            <h3>LLM branch</h3>
            <div class="method-branch-flow">
              <div class="method-endpoint">
                <span>Input J(x) tokens</span>
                ${tokenRows(input, "Input grid serialized as tokens")}
              </div>
              ${arrow("red-arrow")}
              ${modelBox("LLM", "LoRA adapters")}
              ${arrow("red-arrow")}
              <div class="method-endpoint">
                <span>Output J&#770;(x) tokens</span>
                ${tokenRows(target, "Output grid serialized as tokens")}
              </div>
            </div>
            <div class="method-loss">Loss: next-token prediction</div>
          </section>
        </div>

        <figcaption id="method-caption">
          The same input-output relation is adapted in each model family’s native modality:
          rendered images for the video diffusion model and serialized arrays for the language model.
        </figcaption>
      </figure>
    `;
  }

  render();
})();
