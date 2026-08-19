(() => {
  const root = document.documentElement;
  const originalApplySettings = window.applyOverlaySettings;
  const vanScales = {
    "Large": 1,
    "Medium": 0.85,
    "Small": 0.70,
    "Extra Small": 0.60,
  };
  const messageScales = {
    "Large": 1,
    "Medium": 0.85,
    "Small": 0.70,
    "Extra Small": 0.60,
  };

  function applyVanSize(value) {
    const size = Object.prototype.hasOwnProperty.call(vanScales, value) ? value : "Large";
    root.dataset.banVanSize = size;
    root.style.setProperty("--ban-van-scale", String(vanScales[size]));
  }

  function applyMessageSize(value) {
    const size = Object.prototype.hasOwnProperty.call(messageScales, value) ? value : "Large";
    root.dataset.banMessageSize = size;
    root.style.setProperty("--ban-message-scale", String(messageScales[size]));
  }

  function applySettings(d) {
    if (!d || typeof d !== "object") return;
    if (Object.prototype.hasOwnProperty.call(d, "banWidgetBanVanSize")) applyVanSize(String(d.banWidgetBanVanSize));
    if (Object.prototype.hasOwnProperty.call(d, "banWidgetBanVanVerticalOffset")) {
      const value = Number(d.banWidgetBanVanVerticalOffset);
      root.style.setProperty("--ban-van-y-offset", `${Number.isFinite(value) ? Math.max(-200, Math.min(200, value)) : 0}px`);
    }
    if (Object.prototype.hasOwnProperty.call(d, "banWidgetBanMessageVisibility")) {
      root.dataset.banMessageVisibility = String(d.banWidgetBanMessageVisibility).toLowerCase() === "hidden" ? "Hidden" : "Visible";
    }
    if (Object.prototype.hasOwnProperty.call(d, "banWidgetBanMessageSize")) applyMessageSize(String(d.banWidgetBanMessageSize));
    if (Object.prototype.hasOwnProperty.call(d, "banWidgetBanMessageVerticalOffset")) {
      const value = Number(d.banWidgetBanMessageVerticalOffset);
      root.style.setProperty("--ban-message-y-offset", `${Number.isFinite(value) ? Math.max(-200, Math.min(200, value)) : 0}px`);
    }
  }

  if (typeof originalApplySettings === "function") {
    window.applyOverlaySettings = (d) => {
      originalApplySettings(d);
      applySettings(d);
    };
  }

  applyVanSize("Large");
  applyMessageSize("Large");
  root.dataset.banMessageVisibility = "Visible";
  root.style.setProperty("--ban-van-y-offset", "0px");
  root.style.setProperty("--ban-message-y-offset", "0px");
})();
