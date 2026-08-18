using System;

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
        int stackScalePercent = CPH.GetGlobalVar<int?>(StackScalePercentKey, true) ?? 33;
        int maxDocked = CPH.GetGlobalVar<int?>(MaxDockedKey, true) ?? 4;
        bool alwaysShowStack = CPH.GetGlobalVar<bool?>(AlwaysShowStackKey, true) ?? true;
        int stackVisibilityDuration = CPH.GetGlobalVar<int?>(StackVisibilityDurationKey, true) ?? 10;
        bool showStackWhenItemLeaves = CPH.GetGlobalVar<bool?>(ShowStackWhenItemLeavesKey, true) ?? true;
        bool showKeyAnimation = CPH.GetGlobalVar<bool?>(ShowKeyAnimationKey, true) ?? true;
        int edgeOffset = CPH.GetGlobalVar<int?>(EdgeOffsetKey, true) ?? 28;
        int stackGap = CPH.GetGlobalVar<int?>(StackGapKey, true) ?? 18;

        stackScalePercent = Math.Max(10, Math.Min(100, stackScalePercent));
        maxDocked = Math.Max(1, Math.Min(25, maxDocked));
        stackVisibilityDuration = Math.Max(1, Math.Min(60, stackVisibilityDuration));
        edgeOffset = Math.Max(0, Math.Min(200, edgeOffset));
        stackGap = Math.Max(0, Math.Min(100, stackGap));

        CPH.SetArgument("banWidgetStackScalePercent", stackScalePercent);
        CPH.SetArgument("banWidgetMaxDocked", maxDocked);
        CPH.SetArgument("banWidgetAlwaysShowStack", alwaysShowStack);
        CPH.SetArgument("banWidgetStackVisibilityDuration", stackVisibilityDuration);
        CPH.SetArgument("banWidgetShowStackWhenItemLeaves", showStackWhenItemLeaves);
        CPH.SetArgument("banWidgetShowKeyAnimation", showKeyAnimation);
        CPH.SetArgument("banWidgetEdgeOffset", edgeOffset);
        CPH.SetArgument("banWidgetStackGap", stackGap);

        // Twitch User Timed Out supplies the moderator/creator as
        // createdByUsername, createdByDisplayName and createdById.
        string initiatorName = FirstArg(
            "timeoutInitiatorName",
            "createdByDisplayName",
            "moderatorDisplayName",
            "moderatorName",
            "initiatorName",
            "performedByName",
            "senderName"
        );
        string initiatorUsername = FirstArg(
            "timeoutInitiatorUsername",
            "createdByUsername",
            "moderatorUsername",
            "moderatorLogin",
            "initiatorUsername"
        );
        string initiatorId = FirstArg(
            "timeoutInitiatorId",
            "createdById",
            "moderatorId",
            "initiatorId"
        );
        string initiatorAvatar = FirstArg(
            "timeoutInitiatorAvatar",
            "initiatorAvatar",
            "moderatorAvatar",
            "moderatorProfileImageUrl",
            "performedByAvatar",
            "senderAvatar"
        );

        // The Twitch timeout trigger always provides createdById. Prefer the
        // ID lookup because it is unambiguous and returns ProfileImageUrl.
        if (string.IsNullOrWhiteSpace(initiatorAvatar))
        {
            try
            {
                var initiator = !string.IsNullOrWhiteSpace(initiatorId)
                    ? CPH.TwitchGetExtendedUserInfoById(initiatorId)
                    : null;

                if (initiator != null)
                {
                    initiatorAvatar = initiator.ProfileImageUrl;
                    if (string.IsNullOrWhiteSpace(initiatorName))
                        initiatorName = initiator.UserName;
                    if (string.IsNullOrWhiteSpace(initiatorUsername))
                        initiatorUsername = initiator.UserName;
                    if (string.IsNullOrWhiteSpace(initiatorId))
                        initiatorId = initiator.UserId;
                }
            }
            catch (Exception ex)
            {
                CPH.LogWarn($"Ban Widget: unable to resolve timeout initiator avatar by id: {ex.Message}");
            }
        }

        // Fallback to login lookup if the event did not provide a usable ID.
        if (string.IsNullOrWhiteSpace(initiatorAvatar) && !string.IsNullOrWhiteSpace(initiatorUsername))
        {
            try
            {
                var initiator = CPH.TwitchGetExtendedUserInfoByLogin(initiatorUsername);
                if (initiator != null)
                {
                    initiatorAvatar = initiator.ProfileImageUrl;
                    if (string.IsNullOrWhiteSpace(initiatorName))
                        initiatorName = initiator.UserName;
                    if (string.IsNullOrWhiteSpace(initiatorId))
                        initiatorId = initiator.UserId;
                }
            }
            catch (Exception ex)
            {
                CPH.LogWarn($"Ban Widget: unable to resolve timeout initiator avatar by login: {ex.Message}");
            }
        }

        CPH.SetArgument("timeoutInitiatorName", initiatorName ?? "");
        CPH.SetArgument("timeoutInitiatorUsername", initiatorUsername ?? "");
        CPH.SetArgument("timeoutInitiatorId", initiatorId ?? "");
        CPH.SetArgument("timeoutInitiatorAvatar", initiatorAvatar ?? "");

        CPH.TriggerEvent("BanWidget", true);
        return true;
    }

    private string FirstArg(params string[] names)
    {
        foreach (string name in names)
        {
            if (CPH.TryGetArg<string>(name, out string value) && !string.IsNullOrWhiteSpace(value))
                return value;
        }

        return null;
    }
}
