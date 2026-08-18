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

        ui.AddTitle("Overlay Settings", "Ban Widget");

        ui.AddSlider(
            "Stack Scale (%)",
            "Controls the size of timeout cells after they move into the bottom-right stack.",
            "Ban Widget",
            StackScalePercentKey,
            10,
            100,
            33
        );

        ui.AddSlider(
            "Max Docked",
            "Controls how many timeout cells can remain in the bottom-right stack.",
            "Ban Widget",
            MaxDockedKey,
            1,
            25,
            4
        );

        ui.AddToggleSwitch(
            "Always Show Stack",
            "Keep the bottom-right stack permanently visible. When disabled, the stack can be shown temporarily.",
            "Ban Widget",
            AlwaysShowStackKey,
            true
        );

        ui.AddSlider(
            "Temporary Show Duration (sec)",
            "How long the stack remains visible when temporarily shown.",
            "Ban Widget",
            StackVisibilityDurationKey,
            1,
            60,
            10
        );

        ui.AddToggleSwitch(
            "Show Stack When Item Leaves",
            "Temporarily show the stack when a timeout card leaves the stack, but only when Always Show Stack is disabled.",
            "Ban Widget",
            ShowStackWhenItemLeavesKey,
            true
        );

        ui.AddToggleSwitch(
            "Show Key Animation",
            "Show the timeout key animation as the cell locks. The lock sound and bars are unaffected when disabled.",
            "Ban Widget",
            ShowKeyAnimationKey,
            true
        );

        ui.AddSlider(
            "Edge Offset (px)",
            "Controls the distance from the bottom and right edges of the overlay.",
            "Ban Widget",
            EdgeOffsetKey,
            0,
            200,
            28
        );

        ui.AddSlider(
            "Stack Gap (px)",
            "Controls the vertical gap between timeout cells in the bottom-right stack.",
            "Ban Widget",
            StackGapKey,
            0,
            100,
            18
        );

        ui.ShowUI();
        return true;
    }
}
