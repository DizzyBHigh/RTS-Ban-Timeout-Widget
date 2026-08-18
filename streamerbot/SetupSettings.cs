using System;

// Streamer.bot C# action: open the Ban Widget settings window.
// Requires duhBuhUI.dll to be available as a custom assembly reference.
public class CPHInline
{
    private const string StackScalePercentKey = "duhbuh.banwidget.stackScalePercent";
    private const string MaxDockedKey = "duhbuh.banwidget.maxDocked";
    private const string AlwaysShowStackKey = "duhbuh.banwidget.alwaysShowStack";
    private const string StackVisibilityDurationKey = "duhbuh.banwidget.stackVisibilityDuration";
    private const string ShowStackWhenItemLeavesKey = "duhbuh.banwidget.showStackWhenItemLeaves";
    private const string ShowKeyAnimationKey = "duhbuh.banwidget.showKeyAnimation";
    private const string EdgeOffsetKey = "duhbuh.banwidget.edgeOffset";
    private const string StackGapKey = "duhbuh.banwidget.stackGap";
    private const string BanMessageAnimationTypeKey = "duhbuh.banwidget.banMessageAnimationType";
    private const string BanMessageScrollSpeedKey = "duhbuh.banwidget.banMessageScrollSpeed";

    public bool Execute()
    {
        var ui = new DuhBuhUI(
            "DuhBuh Ban Widget",
            "1.0.0",
            (key, persisted) => CPH.GetGlobalVar<bool?>(key, persisted),
            (key, persisted) => CPH.GetGlobalVar<int?>(key, persisted),
            (key, persisted) => CPH.GetGlobalVar<string>(key, persisted),
            (key, persisted) => CPH.GetGlobalVar<object>(key, persisted),
            (key, value, persisted) => CPH.SetGlobalVar(key, value, persisted),
            message => CPH.LogInfo(message)
        );

        // Ban Widget tab
        ui.AddTitle("Ban Settings", "Ban Widget");

        ui.AddRadioGroup(
            "Ban Animation Type",
            "Departure - Ban message appears once the jail truck has stopped and starts driving away. Arrival - Ban message appears when the jail truck enters the screen.",
            "Ban Widget",
            BanMessageAnimationTypeKey,
            new[] { "Departure", "Arrival" },
            "Departure"
        );

        ui.AddRadioGroup(
            "Ban Message Scroll Speed",
            "Speed the Ban message scrolls.",
            "Ban Widget",
            BanMessageScrollSpeedKey,
            new[] { "Slow", "Medium", "Fast" },
            "Medium"
        );

        // Timeout Widget tab
        ui.AddTitle("Timeout Settings", "Timeout Widget");

        ui.AddToggleSwitch("Always Show Stack", "Keep the bottom-right stack permanently visible. When disabled, the stack can be shown temporarily.", "Timeout Widget", AlwaysShowStackKey, true);
        ui.AddSlider("Temporary Show Duration (sec)", "How long the stack remains visible when temporarily shown.", "Timeout Widget", StackVisibilityDurationKey, 1, 60, 10);
        ui.AddToggleSwitch("Show Stack When Item Leaves", "Temporarily show the stack when a timeout card leaves the stack, but only when Always Show Stack is disabled.", "Timeout Widget", ShowStackWhenItemLeavesKey, true);

        ui.AddSlider("Stack Scale (%)", "Controls the size of timeout cells after they move into the bottom-right stack.", "Timeout Widget", StackScalePercentKey, 10, 100, 33);
        ui.AddSlider("Max Docked", "Controls how many timeout cells can remain in the bottom-right stack.", "Timeout Widget", MaxDockedKey, 1, 25, 4);
        ui.AddSlider("Edge Offset (px)", "Controls the distance from the bottom and right edges of the overlay.", "Timeout Widget", EdgeOffsetKey, 0, 200, 28);
        ui.AddSlider("Stack Gap (px)", "Controls the vertical gap between timeout cells in the bottom-right stack.", "Timeout Widget", StackGapKey, 0, 100, 18);
        ui.AddToggleSwitch("Show Key Animation", "Show the timeout key animation as the cell locks. The lock sound and bars are unaffected when disabled.", "Timeout Widget", ShowKeyAnimationKey, true);

        ui.ShowUI();
        return true;
    }
}
