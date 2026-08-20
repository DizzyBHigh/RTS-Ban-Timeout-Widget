(() => {
  // Keep timeout initiator data long enough for the timeout cell and key animation
  // to meet, even when Streamer.bot delivers the related websocket messages apart.
  const initiators = new Map();
  const originalWebSocket = window.WebSocket;
  let showKeyAnimation = true;

  function flatten(value) {
    if (typeof value === "string") {
      try { value = JSON.parse(value); } catch { return value; }
    }
    if (!value || typeof value !== "object") return value;
    let x = { ...value };
    for (const key of ["data", "args", "payload"]) {
      if (typeof x[key] === "string") {
        try { x[key] = JSON.parse(x[key]); } catch {}
      }
      if (x[key] && typeof x[key] === "object") x = { ...x, ...x[key] };
    }
    return x;
  }

  function applySettings(data) {
    const d = flatten(data);
    if (!d || typeof d !== "object") return;
    if (d.banWidgetShowKeyAnimation !== undefined) {
      showKeyAnimation = d.banWidgetShowKeyAnimation === true ||
        String(d.banWidgetShowKeyAnimation).toLowerCase() === "true";
    }
  }

  function remember(data) {
    const d = flatten(data);
    if (!d || typeof d !== "object") return;

    const target = d.targetUser && typeof d.targetUser === "object" ? d.targetUser : {};
    const id = String(
      d.banWidgetTargetId || d.timeoutTargetUserId || d.timedOutUserId ||
      d.userId || d.targetUserId || target.id || ""
    );
    const login = String(
      d.banWidgetTargetUsername || d.timeoutTargetUserName || d.timedOutUserName ||
      d.userName || d.username || d.targetUserName || target.login || ""
    ).toLowerCase();
    const display = String(
      d.banWidgetTargetName || d.timeoutTargetUserDisplayName || d.timedOutUser ||
      d.displayName || d.user || target.name || ""
    ).toLowerCase();

    const initiatorName = d.timeoutInitiatorName || d.banWidgetInitiatorName ||
      d.createdByDisplayName || d.moderatorDisplayName || d.moderatorName || "";
    const initiatorAvatar = d.timeoutInitiatorAvatar || d.banWidgetInitiatorAvatar ||
      d.initiatorAvatar || d.moderatorAvatar || d.moderatorProfileImageUrl || "";
    const initiatorId = d.timeoutInitiatorId || d.banWidgetInitiatorId ||
      d.createdById || d.moderatorId || "";
    const initiatorUsername = d.timeoutInitiatorUsername || d.banWidgetInitiatorUsername ||
      d.createdByUsername || d.moderatorUsername || d.moderatorLogin || "";

    if (!initiatorName && !initiatorAvatar) return;

    const info = {
      name: String(initiatorName || initiatorUsername),
      username: String(initiatorUsername || ""),
      id: String(initiatorId || ""),
      avatar: String(initiatorAvatar || ""),
      expires: Date.now() + 15000,
    };

    if (id) initiators.set(`id:${id}`, info);
    if (login) initiators.set(`name:${login}`, info);
    if (display) initiators.set(`name:${display}`, info);
  }

  function isBanWidgetData(data) {
    const d = flatten(data);
    if (!d || typeof d !== "object") return false;
    const action = String(d.banWidgetAction || "").toLowerCase();
    const eventType = String(d.banWidgetEventType || "").toLowerCase();
    return action === "timeout" || eventType === "twitchusertimedout" ||
      Boolean(d.timeoutInitiatorName || d.banWidgetInitiatorName);
  }

  function handleMessage(raw) {
    try {
      const message = flatten(raw);
      applySettings(message);

      // Streamer.bot custom events may put the variables directly on the
      // websocket payload, under data, args, payload, or one level deeper.
      const candidates = [message, message?.data, message?.args, message?.payload];
      for (const candidate of candidates) {
        const d = flatten(candidate);
        if (isBanWidgetData(d)) {
          applySettings(d);
          remember(d);
        }
      }

      // Also retain the previous event-based compatibility path.
      const source = String(message?.event?.source || "").toLowerCase();
      const type = String(message?.event?.type || "").toLowerCase();
      if (source === "twitchusertimedout" || type === "usertimedout") {
        remember(message?.data || message);
      }
    } catch {
      // Ignore non-JSON websocket messages.
    }
  }

  if (originalWebSocket) {
    class KeyWebSocket extends originalWebSocket {
      set onmessage(handler) {
        if (typeof handler !== "function") {
          super.onmessage = handler;
          return;
        }
        super.onmessage = (event) => {
          handleMessage(event.data);
          addPendingKeys();
          handler(event);
        };
      }
    }

    KeyWebSocket.CONNECTING = originalWebSocket.CONNECTING;
    KeyWebSocket.OPEN = originalWebSocket.OPEN;
    KeyWebSocket.CLOSING = originalWebSocket.CLOSING;
    KeyWebSocket.CLOSED = originalWebSocket.CLOSED;
    window.WebSocket = KeyWebSocket;
  }

  function findInitiator(cell) {
    const name = String(cell.querySelector(".nameplate span")?.textContent || "").toLowerCase();
    const id = String(cell.dataset.userId || "");
    if (id && initiators.has(`id:${id}`)) return initiators.get(`id:${id}`);
    if (name && initiators.has(`name:${name}`)) return initiators.get(`name:${name}`);
    return null;
  }

  function addKey(cell) {
    if (!showKeyAnimation) return false;
    if (!cell || !cell.classList.contains("cell") || cell.querySelector(".timeout-key")) return true;

    const initiator = findInitiator(cell);
    if (!initiator) return false;

    const key = document.createElement("div");
    key.className = "timeout-key";
    key.innerHTML =
      '<div class="timeout-key-head"><img alt=""></div>' +
      '<div class="timeout-key-shaft"></div>' +
      '<div class="timeout-key-tooth"></div>' +
      '<div class="timeout-key-label"></div>';

    const image = key.querySelector("img");
    const label = key.querySelector(".timeout-key-label");
    image.src = initiator.avatar || "";
    image.alt = initiator.name ? `Timeout by ${initiator.name}` : "Timeout initiator";
    image.onerror = () => (image.style.opacity = "0.15");
    label.textContent = initiator.name || "";
    if (!initiator.name) label.hidden = true;

    cell.appendChild(key);
    cell.dataset.timeoutInitiatorName = initiator.name;
    cell.dataset.timeoutInitiatorId = initiator.id;
    cell.dataset.timeoutKeyAdded = "1";
    return true;
  }

  function addPendingKeys() {
    if (!showKeyAnimation) return;
    const stage = document.getElementById("stage");
    if (!stage) return;
    stage.querySelectorAll(".cell:not([data-timeout-key-added])").forEach(addKey);
  }

  function observe() {
    const stage = document.getElementById("stage");
    if (!stage) {
      requestAnimationFrame(observe);
      return;
    }

    const observer = new MutationObserver(() => addPendingKeys());
    observer.observe(stage, { childList: true, subtree: true });
    addPendingKeys();
    setInterval(addPendingKeys, 100);

    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of initiators) {
        if (value.expires < now) initiators.delete(key);
      }
    }, 5000);
  }

  observe();
})();
