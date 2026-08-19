(() => {
  document.documentElement.classList.add("key-test-mode");

  const stage = document.getElementById("stage");
  if (!stage) return;

  const DEFAULT_X = -90;
  const DEFAULT_Y = 96;
  const root = document.documentElement;
  const xInput = document.getElementById("key-test-x");
  const yInput = document.getElementById("key-test-y");
  const xValue = document.getElementById("key-test-x-value");
  const yValue = document.getElementById("key-test-y-value");
  const output = document.getElementById("key-test-output");
  const resetButton = document.getElementById("key-test-reset");
  const copyButton = document.getElementById("key-test-copy");

  const cell = typeof createCell === "function"
    ? createCell({ displayName: "KEY TEST", reason: "KEY TEST", duration: 9999 })
    : document.createElement("div");

  cell.classList.add("locked", "key-test-cell");
  stage.appendChild(cell);

  // script.js builds asset URLs relative to the production root. This test page
  // lives one directory deeper, so correct the frame URL for the test harness.
  const frame = cell.querySelector(".frame");
  if (frame) frame.src = "../assets/cell_frame_final.png";

  const key = document.createElement("div");
  key.className = "timeout-key key-test-key";
  key.innerHTML =
    '<div class="timeout-key-head"><div class="key-test-avatar"></div></div>' +
    '<div class="timeout-key-shaft"></div>' +
    '<div class="timeout-key-tooth"></div>';
  cell.appendChild(key);

  const apply = () => {
    const x = Number(xInput?.value ?? DEFAULT_X);
    const y = Number(yInput?.value ?? DEFAULT_Y);
    root.style.setProperty("--key-test-x", `${x}px`);
    root.style.setProperty("--key-test-y", `${y}px`);
    if (xValue) xValue.textContent = `${x}px`;
    if (yValue) yValue.textContent = `${y}px`;
    if (output) output.textContent = `--key-test-x: ${x}px;\n--key-test-y: ${y}px;`;
  };

  xInput?.addEventListener("input", apply);
  yInput?.addEventListener("input", apply);

  resetButton?.addEventListener("click", () => {
    if (xInput) xInput.value = DEFAULT_X;
    if (yInput) yInput.value = DEFAULT_Y;
    apply();
  });

  copyButton?.addEventListener("click", async () => {
    const text = output?.textContent || "";
    try {
      await navigator.clipboard.writeText(text);
      copyButton.textContent = "Copied!";
      setTimeout(() => { copyButton.textContent = "Copy Values"; }, 1200);
    } catch {
      window.prompt("Copy these values:", text);
    }
  });

  apply();
})();
