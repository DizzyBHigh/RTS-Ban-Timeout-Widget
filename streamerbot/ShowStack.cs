using System;

// Streamer.bot C# action: temporarily show the Ban Widget stack.
// The browser overlay must receive the BanWidgetShowStack Custom Event.
public class CPHInline
{
    private const string DurationKey = "duhbuh.banwidget.stackVisibilityDuration";

    public bool Execute()
    {
        int durationSeconds = CPH.GetGlobalVar<int?>(DurationKey, true) ?? 10;
        durationSeconds = Math.Max(1, Math.Min(60, durationSeconds));

        CPH.SetArgument("banWidgetStackVisibilityDuration", durationSeconds);
        CPH.TriggerEvent("BanWidgetShowStack", true);

        return true;
    }
}
