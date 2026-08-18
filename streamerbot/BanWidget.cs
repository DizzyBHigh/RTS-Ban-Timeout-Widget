using System;

public class CPHInline
{
    private const string StackScalePercentKey = "duhbuh.banwidget.stackScalePercent";

    public bool Execute()
    {
        // The preceding "Get User Info for Target" sub-action supplies the avatar.
        // Streamer.bot's Twitch moderation event supplies the target and duration.
        //
        // The browser overlay listens for the Custom Event named "BanWidget".
        // The current argument stack is forwarded into that Custom Event.
        //
        // The persisted setting is copied into the event arguments so the browser
        // overlay can apply the current configuration when it receives the event.
        int stackScalePercent = CPH.GetGlobalVar<int?>(StackScalePercentKey, true) ?? 33;
        stackScalePercent = Math.Max(10, Math.Min(100, stackScalePercent));
        CPH.SetArgument("banWidgetStackScalePercent", stackScalePercent);

        CPH.TriggerEvent("BanWidget", true);

        return true;
    }
}
