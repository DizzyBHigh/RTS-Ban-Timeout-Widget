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

    const viewport = layer.querySelector(".ban-message-viewport");
    const text = layer.querySelector(".ban-message-text");

    let scrollMs = 0;
    let revealStartedAt = 0;
    let revealStarted = false;
    let scrollStarted = false;
    let fadeStarted = false;
    let removeTimer = null;

    const syncReason = () => {
      text.textContent = sourceReason.textContent || "BANNED";
      requestAnimationFrame(measureReason);
    };

    const measureReason = () => {
      if (!layer.isConnected) return;
      const overflow = Math.max(0, text.scrollWidth - viewport.clientWidth);
      if (overflow > 0) {
        scrollMs = Math.max(6000, Math.min(14000, (overflow / 40) * 1000));
        layer.style.setProperty("--ban-message-scroll-distance", `${-overflow}px`);
        layer.style.setProperty("--ban-message-scroll-time", `${scrollMs}ms`);
      } else {
        scrollMs = 0;
        layer.style.removeProperty("--ban-message-scroll-distance");
        layer.style.removeProperty("--ban-message-scroll-time");
      }
    };

    const startFade = () => {
      if (fadeStarted || !layer.isConnected) return;
      fadeStarted = true;
      layer.classList.add("fading");
      setTimeout(() => {
        if (scene.isConnected) originalRemove();
      }, FADE_MS);
    };

    const startScroll = () => {
      if (scrollStarted || !revealStarted || !layer.isConnected) return;
      scrollStarted = true;
      requestAnimationFrame(measureReason);
      setTimeout(() => {
        if (!layer.isConnected) return;
        if (scrollMs > 0) {
          layer.classList.add("scrolling");
          setTimeout(startFade, scrollMs);
        } else {
          startFade();
        }
      }, REVEAL_MS);
    };

    const originalRemove = scene.remove.bind(scene);
    scene.remove = () => {
      if (!revealStarted) {
        originalRemove();
        return;
      }
      const elapsed = performance.now() - revealStartedAt;
      const remaining = Math.max(0, REVEAL_MS + scrollMs + FADE_MS - elapsed);
      if (remaining <= 0) {
        originalRemove();
        return;
      }
      if (removeTimer) clearTimeout(removeTimer);
      removeTimer = setTimeout(() => {
        if (scene.isConnected) originalRemove();
      }, remaining);
    };

    const textObserver = new MutationObserver(syncReason);
    textObserver.observe(sourceReason, { childList: true, characterData: true, subtree: true });

    const classObserver = new MutationObserver(() => {
      if (!revealStarted && trail.classList.contains("revealing")) {
        revealStarted = true;
        revealStartedAt = performance.now();
        layer.classList.add("revealing");
        syncReason();
        startScroll();
      }

      // The original Ban Truck can fade the skid layer after 4.3s.
      // Do not fade the independent message with it; its own lifecycle controls fade.
      if (trail.classList.contains("fading") && !scrollStarted) {
        startScroll();
      }
    });
    classObserver.observe(trail, { attributes: true, attributeFilter: ["class"] });

    syncReason();
  }
})();
