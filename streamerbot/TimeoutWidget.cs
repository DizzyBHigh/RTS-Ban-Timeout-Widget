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
        return PrepareBanWidgetTimeout();
    }

    // Shared entry point for Execute C# Method.
    // Other platform-specific moderation actions can call this method after
    // placing their platform event arguments on Streamer.bot's argument stack.
    public bool PrepareBanWidgetTimeout()
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

        var eventSource = CPH.GetSource();
        var eventType = CPH.GetEventType();
        string sourceName = eventSource.ToString();
        string eventTypeName = eventType.ToString();
        string platform = NormalizePlatform(sourceName);

        CPH.SetArgument("banWidgetPlatform", platform);
        CPH.SetArgument("banWidgetSource", sourceName);
        CPH.SetArgument("banWidgetEventType", eventTypeName);
        CPH.SetArgument("banWidgetAction", "timeout");

        string targetId = FirstArg(
            "banWidgetTargetId",
            "userId",
            "targetUserId",
            "timeoutTargetUserId",
            "timedOutUserId"
        );
        string targetUsername = FirstArg(
            "banWidgetTargetUsername",
            "userName",
            "targetUserName",
            "username",
            "login",
            "timeoutTargetUserName",
            "timedOutUserName"
        );
        string targetDisplayName = FirstArg(
            "banWidgetTargetName",
            "user",
            "targetUser",
            "displayName",
            "userName",
            "username",
            "login",
            "timeoutTargetUserDisplayName",
            "timedOutUser"
        );
        string targetAvatar = FirstArg(
            "banWidgetTargetAvatar",
            "targetUserProfileImageUrl",
            "profileImageUrl",
            "avatar",
            "userProfileImageUrl"
        );

        if (string.IsNullOrWhiteSpace(targetAvatar) && !string.IsNullOrWhiteSpace(targetId))
        {
            try
            {
                var target = CPH.TwitchGetExtendedUserInfoById(targetId);
                if (target != null)
                {
                    targetAvatar = target.ProfileImageUrl;
                    if (string.IsNullOrWhiteSpace(targetUsername))
                        targetUsername = target.UserName;
                    if (string.IsNullOrWhiteSpace(targetDisplayName))
                        targetDisplayName = target.UserName;
                }
            }
            catch (Exception ex)
            {
                CPH.LogWarn($"Ban Widget: unable to resolve timed-out user avatar by id: {ex.Message}");
            }
        }

        if (string.IsNullOrWhiteSpace(targetAvatar) && !string.IsNullOrWhiteSpace(targetUsername))
        {
            try
            {
                var target = CPH.TwitchGetExtendedUserInfoByLogin(targetUsername);
                if (target != null)
                {
                    targetAvatar = target.ProfileImageUrl;
                    if (string.IsNullOrWhiteSpace(targetId))
                        targetId = target.UserId;
                    if (string.IsNullOrWhiteSpace(targetDisplayName))
                        targetDisplayName = target.UserName;
                }
            }
            catch (Exception ex)
            {
                CPH.LogWarn($"Ban Widget: unable to resolve timed-out user avatar by login: {ex.Message}");
            }
        }

        CPH.SetArgument("banWidgetTargetId", targetId ?? "");
        CPH.SetArgument("banWidgetTargetUsername", targetUsername ?? "");
        CPH.SetArgument("banWidgetTargetName", targetDisplayName ?? "");
        CPH.SetArgument("banWidgetTargetAvatar", targetAvatar ?? "");

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

        CPH.SetArgument("banWidgetInitiatorName", initiatorName ?? "");
        CPH.SetArgument("banWidgetInitiatorUsername", initiatorUsername ?? "");
        CPH.SetArgument("banWidgetInitiatorId", initiatorId ?? "");
        CPH.SetArgument("banWidgetInitiatorAvatar", initiatorAvatar ?? "");

        CPH.SetArgument("banWidgetDuration", FirstArg("duration", "timeoutDuration") ?? "");
        CPH.SetArgument("banWidgetReason", FirstArg("reason", "timeoutReason", "message") ?? "");

        CPH.TriggerEvent("RTS-BanWidget", true);
        return true;
    }

    private static string NormalizePlatform(string source)
    {
        if (string.Equals(source, "Twitch", StringComparison.OrdinalIgnoreCase))
            return "twitch";
        if (string.Equals(source, "Kick", StringComparison.OrdinalIgnoreCase))
            return "kick";
        if (string.Equals(source, "YouTube", StringComparison.OrdinalIgnoreCase))
            return "youtube";

        return (source ?? "").Trim().ToLowerInvariant();
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
