(() => {
  // The original overlay used stack1/stack2/stack3 classes, which capped
  // visible positions at four cards. Keep the existing classes for styling,
  // but assign the actual dock position through --dock-bottom so the stack
  // can grow to the configured Max Docked value (up to 25).
  function restackCapacity() {
    const stage = document.getElementById("stage");
    if (!stage) return;

    const cards = [...stage.querySelectorAll(".cell.docked")];
    cards.forEach((card, index) => {
      card.style.setProperty(
        "--dock-bottom",
        `calc(var(--edge) + ${index} * (var(--stack-h) + var(--stack-gap)))`,
      );
    });
  }

  function start() {
    const stage = document.getElementById("stage");
    if (!stage) {
      requestAnimationFrame(start);
      return;
    }

    const stageObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "childList" ||
          (mutation.type === "attributes" && mutation.attributeName === "class")
        ) {
          restackCapacity();
          return;
        }
      }
    });

    stageObserver.observe(stage, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    // Recalculate when Stack Scale, Edge Offset, or Stack Gap changes.
    const rootObserver = new MutationObserver(restackCapacity);
    rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    restackCapacity();
  }

  start();
})();
