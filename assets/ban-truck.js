(function () {
  const CFG = { host: "127.0.0.1", port: 8080, reconnectMs: 3000 };
  let pendingBan = null;

  function normalize(d) {
    if (!d || typeof d !== "object") return d;
    let x = { ...d };
    if (x.data && typeof x.data === "object") x = { ...x, ...x.data };
    if (x.args && typeof x.args === "object") x = { ...x, ...x.args };
    if (x.payload && typeof x.payload === "object") x = { ...x, ...x.payload };
    return x;
  }

  function isBan(d) {
    const x = normalize(d || {});
    const name = String(x.eventName || x.triggerCustomEventName || "").toLowerCase();
    if (name && name !== "banwidget") return false;
    const action = String(x.banWidgetAction || x.action || x.actionName || x.name || "").toLowerCase();
    return action === "ban" || action.includes("ban - ban") || action.endsWith(" - ban");
  }

  function rememberBan(d) {
    d = normalize(d);
    if (isBan(d)) pendingBan = d;
  }

  function setupScene(scene) {
    if (scene.dataset.truckSequence === "custom") return;
    const d = pendingBan;
    if (!d) return;

    scene.dataset.truckSequence = "custom";
    scene.dataset.platform = d.banWidgetPlatform || scene.dataset.platform || "unknown";

    const windowEl = scene.querySelector(".truck-window");
    const targetAvatar = scene.querySelector(".truck-avatar");
    if (!windowEl || !targetAvatar) return;

    const kicker = document.createElement("img");
    kicker.className = "ban-kicker-avatar";
    kicker.alt = "";
    kicker.src = d.banWidgetInitiatorAvatar || d.timeoutInitiatorAvatar || "";
    kicker.onerror = () => (kicker.style.opacity = ".12");

    const kicked = document.createElement("img");
    kicked.className = "ban-kicked-avatar";
    kicked.alt = "";
    kicked.src = d.banWidgetTargetAvatar || targetAvatar.src || "";
    kicked.onerror = () => (kicked.style.opacity = ".12");

    const doors = document.createElement("div");
    doors.className = "ban-doors";
    doors.innerHTML = '<div class="ban-door left"></div><div class="ban-door right"></div>';

    scene.append(kicker, kicked, doors);
    windowEl.classList.add("custom-window");

    setTimeout(() => {
      if (scene.isConnected) scene.classList.add("doors-opening");
    }, 1850);

    setTimeout(() => {
      if (scene.isConnected) scene.classList.add("kick-start");
    }, 2050);

    setTimeout(() => {
      if (scene.isConnected) scene.classList.add("kick-impact");
    }, 2700);

    setTimeout(() => {
      if (!scene.isConnected) return;
      scene.classList.add("target-in-window", "doors-closing");
    }, 3000);

    setTimeout(() => {
      if (scene.isConnected) scene.classList.add("door-slam");
    }, 3350);

    setTimeout(() => {
      if (!scene.isConnected) return;
      scene.classList.add("custom-driving-off", "custom-trail-reveal");
    }, 3650);
  }

  const observer = new MutationObserver(() => {
    document.querySelectorAll(".ban-scene").forEach(setupScene);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  function connect() {
    const ws = new WebSocket(`ws://${CFG.host}:${CFG.port}/`);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        request: "Subscribe",
        id: "ban-widget-truck-sequence",
        events: { Custom: ["Event"] },
      }));
    };
    ws.onmessage = (e) => {
      try {
        const m = JSON.parse(e.data);
        if (String(m.event?.source || "").toLowerCase() === "custom" && String(m.event?.type || "").toLowerCase() === "event") {
          rememberBan(m.data);
        }
      } catch {}
    };
    ws.onclose = () => setTimeout(connect, CFG.reconnectMs);
    ws.onerror = () => ws.close();
  }

  connect();
})();
