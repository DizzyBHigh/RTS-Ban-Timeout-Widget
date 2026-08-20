(() => {
  // The timeout event can reach the overlay and create the cell on a different
  // WebSocket tick from the one that records the initiator. Keep the data long
  // enough for both sides to meet, and retry cells briefly after creation.
  const initiators = new Map();
  const originalWebSocket = window.WebSocket;
  let showKeyAnimation = true;

  function flatten(value) {
    if (typeof value === "string") {
      try { value = JSON.parse(value); } catch { return value; }
    }
    if (!value || typeof value !== "object") return value;
    let x = { ...value };
    if (x.data && typeof x.data === "string") {
      try { x = { ...x, data: JSON.parse(x.data) }; } catch {}
    }
    if (x.data && typeof x.data === "object") x = { ...x, ...x.data };
    if (x.args && typeof x.args === "string") {
      try { x = { ...x, args: JSON.parse(x.args) }; } catch {}
    }
    if (x.args && typeof x.args === "object") x = { ...x, ...x.args };
    if (x.payload && typeof x.payload === "string") {
      try { x = { ...x, payload: JSON.parse(x.payload) }; } catch {}
    }
    if (x.payload && typeof x.payload === "object") x = { ...x, ...x.payload };
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
    const login = String(
      d.banWidgetTargetUsername || d.timeoutTargetUserName || d.timedOutUserName ||
      d.userName || d.username || d.targetUserName || target.login || "",
    ).toLowerCase();
    const display = String(
      d.banWidgetTargetName || d.timeoutTargetUserDisplayName || d.timedOutUser ||
      d.displayName || d.user || target.name || "",
    ).toLowerCase();
    const id = String(
      d.banWidgetTargetId || d.timeoutTargetUserId || d.timedOutUserId ||
      d.userId || d.targetUserId || target.id || "",
    );

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

  function findInitiator(cell) {
    const name = String(cell.querySelector(".nameplate span")?.textContent || "").toLowerCase();
    const id = cell.dataset.userId || "";
    const direct = id && initiators.get(`id:${id}`);
    if (direct) return direct;
    if (name) return initiators.get(`name:${name}`) || null;
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

  if (originalWebSocket) {
    class KeyWebSocket extends originalWebSocket {
      set onmessage(handler) {
        if (typeof handler !== "function") {
          super.onmessage = handler;
          return;
        }
        super.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            const payload = flatten(message.data || message);
            applySettings(payload);
            const source = String(message?.event?.source || "").toLowerCase();
            const type = String(message?.event?.type || "").toLowerCase();
            if (source === "twitchusertimedout" || type === "usertimedout") remember(payload);
            if (source === "custom" && type === "event") {
              const d = flatten(message.data || {});
              applySettings(d);
              const action = String(d.actionName || d.name || "").toLowerCase();
              if (action.includes("timeout") || d.timeoutInitiatorName || d.createdByUsername) remember(d);
              addPendingKeys();
            }
          } catch {
            // Ignore non-JSON websocket messages.
          }
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

  function observe() {
    const stage = document.getElementById("stage");
    if (!stage) {
      requestAnimationFrame(observe);
      return;
    }

    const observer = new MutationObserver(() => addPendingKeys());
    observer.observe(stage, { childList: true, subtree: true });
    addPendingKeys();

    // The timeout cell and initiator event arrive over separate WebSockets.
    // Retry briefly so their arrival order cannot prevent the key animation.
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
