(() => {
  const root = document.documentElement;
  const originalApplySettings = window.applyOverlaySettings;
  const DESIGN_HEIGHT = 1080;
  const MESSAGE_GAP = 16;
  const TRAIL_MESSAGE_OFFSET = -19;
  const vanScales = { "Large": 1, "Medium": 0.85, "Small": 0.70, "Extra Small": 0.60 };
  const messageScales = { "Large": 1, "Medium": 0.85, "Small": 0.70, "Extra Small": 0.60 };
  const messagePositionModes = new Set(["Below Van", "Above Van", "Manual"]);

  function applyVanSize(value) {
    const size = Object.prototype.hasOwnProperty.call(vanScales, value) ? value : "Large";
    root.dataset.banVanSize = size;
    root.style.setProperty("--ban-van-scale", String(vanScales[size]));
    updateVerticalPositions();
  }

  function applyMessageSize(value) {
    const size = Object.prototype.hasOwnProperty.call(messageScales, value) ? value : "Large";
    root.dataset.banMessageSize = size;
    root.style.setProperty("--ban-message-scale", String(messageScales[size]));
    updateVerticalPositions();
  }

  function applyMessagePositionMode(value) {
    const mode = messagePositionModes.has(value) ? value : "Below Van";
    root.dataset.banMessagePositionMode = mode;
    updateVerticalPositions();
  }

  function clampPercent(value) {
    return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 50;
  }

  function updateVerticalPositions() {
    const vanPosition = clampPercent(Number(root.dataset.banVanPosition ?? 50));
    const messagePosition = clampPercent(Number(root.dataset.banMessagePosition ?? 50));
    const mode = root.dataset.banMessagePositionMode || "Below Van";
    const vanScale = Number(root.style.getPropertyValue("--ban-van-scale")) || 1;
    const messageScale = Number(root.style.getPropertyValue("--ban-message-scale")) || 1;

    // The truck's CSS transform uses left-bottom as its transform origin.
    // Therefore the visual top is different from the unscaled CSS top.
    const vanHeight = 320 * vanScale;
    const vanTop = (DESIGN_HEIGHT - vanHeight) * (vanPosition / 100);
    const trailTop = vanTop + 279;
    const messageHeight = 32 * messageScale;

    let messageTop;
    if (mode === "Above Van") {
      const visualVanTop = vanTop + 320 - vanHeight;
      messageTop = visualVanTop - messageHeight - MESSAGE_GAP;
    } else if (mode === "Manual") {
      messageTop = (DESIGN_HEIGHT - messageHeight) * (messagePosition / 100);
    } else {
      // Below Van: keep the message in the existing skid-mark/message lane,
      // but derive it from the van position so it follows every van size.
      messageTop = trailTop + TRAIL_MESSAGE_OFFSET;
    }

    root.style.setProperty("--ban-van-top", `${Math.round(vanTop)}px`);
    root.style.setProperty("--ban-trail-top", `${Math.round(trailTop)}px`);
    root.style.setProperty("--ban-message-top", `${Math.round(messageTop)}px`);
  }

  function applySettings(d) {
    if (!d || typeof d !== "object") return;
    if (Object.prototype.hasOwnProperty.call(d, "banWidgetBanVanSize")) applyVanSize(String(d.banWidgetBanVanSize));
    if (Object.prototype.hasOwnProperty.call(d, "banWidgetBanVanVerticalPosition")) {
      root.dataset.banVanPosition = clampPercent(Number(d.banWidgetBanVanVerticalPosition));
      updateVerticalPositions();
    }
    if (Object.prototype.hasOwnProperty.call(d, "banWidgetBanMessageVisibility")) {
      root.dataset.banMessageVisibility = String(d.banWidgetBanMessageVisibility).toLowerCase() === "hidden" ? "Hidden" : "Visible";
    }
    if (Object.prototype.hasOwnProperty.call(d, "banWidgetBanMessageSize")) applyMessageSize(String(d.banWidgetBanMessageSize));
    if (Object.prototype.hasOwnProperty.call(d, "banWidgetBanMessagePositionMode")) {
      applyMessagePositionMode(String(d.banWidgetBanMessagePositionMode));
    }
    if (Object.prototype.hasOwnProperty.call(d, "banWidgetBanMessageVerticalPosition")) {
      root.dataset.banMessagePosition = clampPercent(Number(d.banWidgetBanMessageVerticalPosition));
      updateVerticalPositions();
    }
  }

  if (typeof originalApplySettings === "function") {
    window.applyOverlaySettings = (d) => { originalApplySettings(d); applySettings(d); };
  }

  applyVanSize("Large");
  applyMessageSize("Large");
  root.dataset.banVanPosition = "50";
  root.dataset.banMessagePosition = "50";
  root.dataset.banMessagePositionMode = "Below Van";
  root.dataset.banMessageVisibility = "Visible";
  updateVerticalPositions();
})();
