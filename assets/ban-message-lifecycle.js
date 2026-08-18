(() => {
  const stage = document.getElementById("stage");
  if (!stage) return;

  const REVEAL_MS = 4300;
  const FADE_MS = 1200;

  const originalAppendChild = stage.appendChild.bind(stage);
  stage.appendChild = (node) => {
    if (node instanceof HTMLElement && node.classList.contains("ban-scene")) {
      prepareScene(node);
    }
    return originalAppendChild(node);
  };

  function prepareScene(scene) {
    if (scene.dataset.messageLifecycle === "1") return;
    scene.dataset.messageLifecycle = "1";

    const trail = scene.querySelector(".ban-trail");
    const sourceReason = trail?.querySelector(".ban-reason span");
    if (!trail || !sourceReason) return;

    const layer = document.createElement("div");
    layer.className = "ban-message-layer";
    layer.innerHTML = '<div class="ban-message-label">BANNED:</div><div class="ban-message-viewport"><div class="ban-message-text"></div></div>';
    scene.appendChild(layer);

    const label = layer.querySelector(".ban-message-label");
    const viewport = layer.querySelector(".ban-message-viewport");
    const text = layer.querySelector(".ban-message-text");

    let scrollMs = 0;
    let scrollDistance = 0;
    let revealStarted = false;
    let scrollingStarted = false;
    let cleanupRequested = false;
    let cleanupTimer = null;

    const syncReason = () => {
      const value = sourceReason.textContent || "BANNED";
      text.textContent = value;
      measureReason();
    };

    const measureReason = () => {
      requestAnimationFrame(() => {
        if (!layer.isConnected) return;
        const overflow = Math.max(0, text.scrollWidth - viewport.clientWidth);
        scrollDistance = overflow > 0 ? -overflow : 0;
        if (overflow > 0) {
          scrollMs = Math.max(6000, Math.min(14000, (overflow / 40) * 1000));
          layer.style.setProperty("--ban-message-scroll-distance", `${scrollDistance}px`);
          layer.style.setProperty("--ban-message-scroll-time", `${scrollMs}ms`);
        } else {
          scrollMs = 0;
          layer.style.removeProperty("--ban-message-scroll-distance");
          layer.style.removeProperty("--ban-message-scroll-time");
        }
        if (revealStarted && !scrollingStarted) scheduleScroll();
      });
    };

    const scheduleScroll = () => {
      if (scrollingStarted) return;
      if (!revealStarted) return;
      scrollingStarted = true;
      setTimeout(() => {
        if (!layer.isConnected) return;
        if (scrollMs > 0) layer.classList.add("scrolling");
        else requestCleanup();
      }, REVEAL_MS);
    };

    const requestCleanup = () => {
      if (!cleanupRequested) cleanupRequested = true;
      const totalHold = REVEAL_MS + scrollMs + FADE_MS;
      const elapsed = revealStarted ? performance.now() - revealStarted : 0;
      const wait = Math.max(0, totalHold - elapsed);
      if (cleanupTimer) clearTimeout(cleanupTimer);
      cleanupTimer = setTimeout(() => {
        if (!scene.isConnected) return;
        layer.classList.add("fading");
        setTimeout(() => {
          if (scene.isConnected) originalRemove();
        }, FADE_MS);
      }, wait);
    };

    const originalRemove = scene.remove.bind(scene);
    scene.remove = () => {
      if (!revealStarted) {
        originalRemove();
        return;
      }
      requestCleanup();
    };

    const textObserver = new MutationObserver(syncReason);
    textObserver.observe(sourceReason, { childList: true, characterData: true, subtree: true });

    const classObserver = new MutationObserver(() => {
      if (!revealStarted && trail.classList.contains("revealing")) {
        revealStarted = true;
        layer.classList.add("revealing");
        syncReason();
        scheduleScroll();
      }

      if (trail.classList.contains("fading")) {
        requestCleanup();
      }
    });
    classObserver.observe(trail, { attributes: true, attributeFilter: ["class"] });

    syncReason();

    const cleanupObservers = () => {
      textObserver.disconnect();
      classObserver.disconnect();
    };

    const originalSceneRemove = originalRemove;
    const observerCleanup = new MutationObserver(() => {
      if (!scene.isConnected) cleanupObservers();
    });
    observerCleanup.observe(stage, { childList: true });

    // Keep the independent message visible until its own lifecycle is complete.
    // The existing Ban Truck code remains responsible for the truck and skid timing.
    void label;
    void originalSceneRemove;
    void cleanupRequested;
  }
})();
