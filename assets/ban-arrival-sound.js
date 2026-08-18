(() => {
  const SOUND = "assets/audio/395920__locontrario23__closing-door.wav";
  const arrivalSound = new Audio(SOUND);
  arrivalSound.preload = "auto";
  arrivalSound.volume = 0.85;

  function playArrivalSound() {
    arrivalSound.currentTime = 0;
    const p = arrivalSound.play();
    if (p) p.catch(() => {});
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        const scene = node.matches(".ban-scene")
          ? node
          : node.querySelector?.(".ban-scene");
        if (!scene) continue;
        window.setTimeout(() => {
          if (scene.isConnected) playArrivalSound();
        }, 1800);
      }
    }
  });

  const stage = document.getElementById("stage");
  if (stage) observer.observe(stage, { childList: true });
})();
