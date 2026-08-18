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
    private const string BanMessageArrivalStyleKey = "duhbuh.banwidget.banMessageArrivalStyle";

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

        // Stack Layout
        ui.AddSlider(
            "Stack Scale (%)",
            "Controls the size of timeout cells after they move into the bottom-right stack.",
            "Stack Layout",
            StackScalePercentKey,
            10,
            100,
            33
        );

        ui.AddSlider(
            "Max Docked",
            "Controls how many timeout cells can remain in the bottom-right stack.",
            "Stack Layout",
            MaxDockedKey,
            1,
            25,
            4
        );

        ui.AddSlider(
            "Edge Offset (px)",
            "Controls the distance from the bottom and right edges of the overlay.",
            "Stack Layout",
            EdgeOffsetKey,
            0,
            200,
            28
        );

        ui.AddSlider(
            "Stack Gap (px)",
            "Controls the vertical gap between timeout cells in the bottom-right stack.",
            "Stack Layout",
            StackGapKey,
            0,
            100,
            18
        );

        // Stack Visibility
        ui.AddToggleSwitch(
            "Always Show Stack",
            "Keep the bottom-right stack permanently visible. When disabled, the stack can be shown temporarily.",
            "Stack Visibility",
            AlwaysShowStackKey,
            true
        );

        ui.AddSlider(
            "Temporary Show Duration (sec)",
            "How long the stack remains visible when temporarily shown.",
            "Stack Visibility",
            StackVisibilityDurationKey,
            1,
            60,
            10
        );

        ui.AddToggleSwitch(
            "Show Stack When Item Leaves",
            "Temporarily show the stack when a timeout card leaves the stack, but only when Always Show Stack is disabled.",
            "Stack Visibility",
            ShowStackWhenItemLeavesKey,
            true
        );

        // Animations
        ui.AddToggleSwitch(
            "Show Key Animation",
            "Show the timeout key animation as the cell locks. The lock sound and bars are unaffected when disabled.",
            "Animations",
            ShowKeyAnimationKey,
            true
        );

        ui.AddToggleSwitch(
            "Ban Message Arrival Style",
            "When enabled, BANNED: appears on the left as the truck drives in and the message/skids animate across the screen. When disabled, use the current departure style.",
            "Animations",
            BanMessageArrivalStyleKey,
            false
        );

        ui.ShowUI();
        return true;
    }
}
