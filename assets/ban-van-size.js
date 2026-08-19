(() => {
  const root = document.documentElement;
  const originalApplySettings = window.applyOverlaySettings;
  const vanScales = { "Large": 1, "Medium": 0.85, "Small": 0.70, "Extra Small": 0.60 };
  const messageScales = { "Large": 1, "Medium": 0.85, "Small": 0.70, "Extra Small": 0.60 };

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

  function setViewportPosition(variable, percent, elementHeight, scale, originBottom) {
    const p = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 50;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const scaledHeight = elementHeight * scale;
    let top = (viewportHeight - scaledHeight) * (p / 100);
    if (originBottom) top -= elementHeight * (1 - scale);
    root.style.setProperty(variable, `${Math.round(top)}px`);
  }

  function updateVerticalPositions() {
    const vanPosition = Number(root.dataset.banVanPosition ?? 50);
    const messagePosition = Number(root.dataset.banMessagePosition ?? 50);
    const vanScale = Number(root.style.getPropertyValue("--ban-van-scale")) || 1;
    const messageScale = Number(root.style.getPropertyValue("--ban-message-scale")) || 1;
    setViewportPosition("--ban-van-top", vanPosition, 320, vanScale, true);
    setViewportPosition("--ban-message-top", messagePosition, 32, messageScale, false);
  }

  function applySettings(d) {
    if (!d || typeof d !== "object") return;
    if (Object.prototype.hasOwnProperty.call(d, "banWidgetBanVanSize")) applyVanSize(String(d.banWidgetBanVanSize));
    if (Object.prototype.hasOwnProperty.call(d, "banWidgetBanVanVerticalPosition")) {
      const value = Number(d.banWidgetBanVanVerticalPosition);
      root.dataset.banVanPosition = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 50;
      updateVerticalPositions();
    }
    if (Object.prototype.hasOwnProperty.call(d, "banWidgetBanMessageVisibility")) {
      root.dataset.banMessageVisibility = String(d.banWidgetBanMessageVisibility).toLowerCase() === "hidden" ? "Hidden" : "Visible";
    }
    if (Object.prototype.hasOwnProperty.call(d, "banWidgetBanMessageSize")) applyMessageSize(String(d.banWidgetBanMessageSize));
    if (Object.prototype.hasOwnProperty.call(d, "banWidgetBanMessageVerticalPosition")) {
      const value = Number(d.banWidgetBanMessageVerticalPosition);
      root.dataset.banMessagePosition = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 50;
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
  root.dataset.banMessageVisibility = "Visible";
  root.style.setProperty("--ban-van-top", "0px");
  root.style.setProperty("--ban-message-top", "0px");
  updateVerticalPositions();
  window.addEventListener("resize", updateVerticalPositions);
})();
