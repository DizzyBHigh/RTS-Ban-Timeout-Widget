using System;

public class CPHInline
{
    public bool Execute()
    {
        // The preceding "Get User Info for Target" sub-action supplies the avatar.
        // Streamer.bot's Twitch moderation event supplies the target and duration.
        //
        // The browser overlay listens for the Custom Event named "BanWidget".
        // The current argument stack is forwarded into that Custom Event.

        CPH.TriggerEvent("BanWidget", true);

        return true;
    }
}
