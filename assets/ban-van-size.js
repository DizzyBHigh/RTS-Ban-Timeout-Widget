(() => {
  const root = document.documentElement;
  const originalApplySettings = window.applyOverlaySettings;
  const scales = {
    "Large": 1,
    "Medium": 0.85,
    "Small": 0.70,
    "Extra Small": 0.60,
  };

  function apply(value) {
    const size = Object.prototype.hasOwnProperty.call(scales, value) ? value : "Large";
    root.dataset.banVanSize = size;
    root.style.setProperty("--ban-van-scale", String(scales[size]));
  }

  if (typeof originalApplySettings === "function") {
    window.applyOverlaySettings = (d) => {
      originalApplySettings(d);
      if (d && typeof d === "object" && Object.prototype.hasOwnProperty.call(d, "banWidgetBanVanSize")) {
        apply(String(d.banWidgetBanVanSize));
      }
    };
  }

  apply("Large");
})();
