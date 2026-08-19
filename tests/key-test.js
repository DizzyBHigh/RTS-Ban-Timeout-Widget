(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("keytest") !== "true") return;

  document.documentElement.classList.add("key-test-mode");

  const stage = document.getElementById("stage");
  if (!stage) return;

  const cell = typeof createCell === "function"
    ? createCell({ displayName: "KEY TEST", reason: "KEY TEST", duration: 9999 })
    : document.createElement("div");

  cell.classList.add("locked", "key-test-cell");
  stage.appendChild(cell);

  const key = document.createElement("div");
  key.className = "timeout-key key-test-key";
  key.innerHTML =
    '<div class="timeout-key-head"><div class="key-test-avatar"></div></div>' +
    '<div class="timeout-key-shaft"></div>' +
    '<div class="timeout-key-tooth"></div>';
  cell.appendChild(key);

  key.style.setProperty("left", "var(--key-test-x, -90px)");
  key.style.setProperty("top", "var(--key-test-y, 96px)");
  key.style.setProperty("opacity", "1");
  key.style.setProperty("transform", "none");
})();
