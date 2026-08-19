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
    private const string BanMessageArrivalStyleKey = "duhbuh.banwidget.banMessageArrivalStyle";
    private const string BanMessageAnimationTypeKey = "duhbuh.banwidget.banMessageAnimationType";
    private const string BanMessageScrollSpeedKey = "duhbuh.banwidget.banMessageScrollSpeed";
    private const string BanVanSizeKey = "duhbuh.banwidget.banVanSize";
    private const string BanVanVerticalOffsetKey = "duhbuh.banwidget.banVanVerticalOffset";
    private const string BanMessageVisibilityKey = "duhbuh.banwidget.banMessageVisibility";
    private const string BanMessageSizeKey = "duhbuh.banwidget.banMessageSize";
    private const string BanMessageVerticalOffsetKey = "duhbuh.banwidget.banMessageVerticalOffset";

    public bool PrepareTimeout() => PrepareBanWidget("timeout");
    public bool PrepareBan() => PrepareBanWidget("ban");

    private bool PrepareBanWidget(string action)
    {
        int stackScalePercent = CPH.GetGlobalVar<int?>(StackScalePercentKey, true) ?? 33;
        int maxDocked = CPH.GetGlobalVar<int?>(MaxDockedKey, true) ?? 4;
        bool alwaysShowStack = CPH.GetGlobalVar<bool?>(AlwaysShowStackKey, true) ?? true;
        int stackVisibilityDuration = CPH.GetGlobalVar<int?>(StackVisibilityDurationKey, true) ?? 10;
        bool showStackWhenItemLeaves = CPH.GetGlobalVar<bool?>(ShowStackWhenItemLeavesKey, true) ?? true;
        bool showKeyAnimation = CPH.GetGlobalVar<bool?>(ShowKeyAnimationKey, true) ?? true;
        int edgeOffset = CPH.GetGlobalVar<int?>(EdgeOffsetKey, true) ?? 28;
        int stackGap = CPH.GetGlobalVar<int?>(StackGapKey, true) ?? 18;
        string banMessageAnimationType = CPH.GetGlobalVar<string>(BanMessageAnimationTypeKey, true) ?? "Departure";
        string banMessageScrollSpeed = CPH.GetGlobalVar<string>(BanMessageScrollSpeedKey, true) ?? "Medium";
        string banVanSize = CPH.GetGlobalVar<string>(BanVanSizeKey, true) ?? "Large";
        int banVanVerticalOffset = CPH.GetGlobalVar<int?>(BanVanVerticalOffsetKey, true) ?? 0;
        string banMessageVisibility = CPH.GetGlobalVar<string>(BanMessageVisibilityKey, true) ?? "Visible";
        string banMessageSize = CPH.GetGlobalVar<string>(BanMessageSizeKey, true) ?? "Large";
        int banMessageVerticalOffset = CPH.GetGlobalVar<int?>(BanMessageVerticalOffsetKey, true) ?? 0;

        if (!string.Equals(banMessageAnimationType, "Arrival", StringComparison.OrdinalIgnoreCase)) banMessageAnimationType = "Departure";
        if (!string.Equals(banMessageScrollSpeed, "Slow", StringComparison.OrdinalIgnoreCase) && !string.Equals(banMessageScrollSpeed, "Fast", StringComparison.OrdinalIgnoreCase)) banMessageScrollSpeed = "Medium";
        if (!string.Equals(banVanSize, "Medium", StringComparison.OrdinalIgnoreCase) && !string.Equals(banVanSize, "Small", StringComparison.OrdinalIgnoreCase) && !string.Equals(banVanSize, "Extra Small", StringComparison.OrdinalIgnoreCase)) banVanSize = "Large";
        if (!string.Equals(banMessageVisibility, "Hidden", StringComparison.OrdinalIgnoreCase)) banMessageVisibility = "Visible";
        if (!string.Equals(banMessageSize, "Medium", StringComparison.OrdinalIgnoreCase) && !string.Equals(banMessageSize, "Small", StringComparison.OrdinalIgnoreCase) && !string.Equals(banMessageSize, "Extra Small", StringComparison.OrdinalIgnoreCase)) banMessageSize = "Large";

        stackScalePercent = Math.Max(10, Math.Min(100, stackScalePercent));
        maxDocked = Math.Max(1, Math.Min(25, maxDocked));
        stackVisibilityDuration = Math.Max(1, Math.Min(60, stackVisibilityDuration));
        edgeOffset = Math.Max(0, Math.Min(200, edgeOffset));
        stackGap = Math.Max(0, Math.Min(100, stackGap));
        banVanVerticalOffset = Math.Max(-200, Math.Min(200, banVanVerticalOffset));
        banMessageVerticalOffset = Math.Max(-200, Math.Min(200, banMessageVerticalOffset));

        CPH.SetArgument("banWidgetStackScalePercent", stackScalePercent);
        CPH.SetArgument("banWidgetMaxDocked", maxDocked);
        CPH.SetArgument("banWidgetAlwaysShowStack", alwaysShowStack);
        CPH.SetArgument("banWidgetStackVisibilityDuration", stackVisibilityDuration);
        CPH.SetArgument("banWidgetShowStackWhenItemLeaves", showStackWhenItemLeaves);
        CPH.SetArgument("banWidgetShowKeyAnimation", showKeyAnimation);
        CPH.SetArgument("banWidgetEdgeOffset", edgeOffset);
        CPH.SetArgument("banWidgetStackGap", stackGap);
        CPH.SetArgument("banWidgetBanMessageArrivalStyle", string.Equals(banMessageAnimationType, "Arrival", StringComparison.OrdinalIgnoreCase));
        CPH.SetArgument("banWidgetBanMessageAnimationType", banMessageAnimationType);
        CPH.SetArgument("banWidgetBanMessageScrollSpeed", banMessageScrollSpeed);
        CPH.SetArgument("banWidgetBanVanSize", banVanSize);
        CPH.SetArgument("banWidgetBanVanVerticalOffset", banVanVerticalOffset);
        CPH.SetArgument("banWidgetBanMessageVisibility", banMessageVisibility);
        CPH.SetArgument("banWidgetBanMessageSize", banMessageSize);
        CPH.SetArgument("banWidgetBanMessageVerticalOffset", banMessageVerticalOffset);

        string sourceName = CPH.GetSource().ToString();
        string eventTypeName = CPH.GetEventType().ToString();
        string platform = NormalizePlatform(sourceName);
        CPH.SetArgument("banWidgetPlatform", platform);
        CPH.SetArgument("banWidgetSource", sourceName);
        CPH.SetArgument("banWidgetEventType", eventTypeName);
        CPH.SetArgument("banWidgetAction", action);

        string targetId = FirstArg("banWidgetTargetId", "userId", "targetUserId");
        string targetUsername = FirstArg("banWidgetTargetUsername", "userName", "targetUserName", "username", "userLogin", "login");
        string targetDisplayName = FirstArg("banWidgetTargetName", "user", "targetUser", "displayName", "userName", "username", "userLogin", "login");
        string targetAvatar = FirstArg("banWidgetTargetAvatar", "targetUserProfileImageUrl", "profileImageUrl", "profilePicture", "avatar", "userProfileImageUrl", "userProfilePicture", "broadcastUserProfileImage");

        if (platform == "twitch")
        {
            if (string.IsNullOrWhiteSpace(targetAvatar) && !string.IsNullOrWhiteSpace(targetId))
            {
                try { var target = CPH.TwitchGetExtendedUserInfoById(targetId); if (target != null) { targetAvatar = target.ProfileImageUrl; if (string.IsNullOrWhiteSpace(targetUsername)) targetUsername = target.UserName; if (string.IsNullOrWhiteSpace(targetDisplayName)) targetDisplayName = target.UserName; } }
                catch (Exception ex) { CPH.LogWarn($"Ban Widget: unable to resolve Twitch target avatar by id: {ex.Message}"); }
            }
            if (string.IsNullOrWhiteSpace(targetAvatar) && !string.IsNullOrWhiteSpace(targetUsername))
            {
                try { var target = CPH.TwitchGetExtendedUserInfoByLogin(targetUsername); if (target != null) { targetAvatar = target.ProfileImageUrl; if (string.IsNullOrWhiteSpace(targetId)) targetId = target.UserId; if (string.IsNullOrWhiteSpace(targetDisplayName)) targetDisplayName = target.UserName; } }
                catch (Exception ex) { CPH.LogWarn($"Ban Widget: unable to resolve Twitch target avatar by login: {ex.Message}"); }
            }
        }

        CPH.SetArgument("banWidgetTargetId", targetId ?? "");
        CPH.SetArgument("banWidgetTargetUsername", targetUsername ?? "");
        CPH.SetArgument("banWidgetTargetName", targetDisplayName ?? "");
        CPH.SetArgument("banWidgetTargetAvatar", targetAvatar ?? "");

        string initiatorName = FirstArg("timeoutInitiatorName", "createdByDisplayName", "moderatorDisplayName", "moderatorName", "initiatorName", "performedByName", "senderName");
        string initiatorUsername = FirstArg("timeoutInitiatorUsername", "createdByUsername", "moderatorUsername", "moderatorLogin", "initiatorUsername", "createdByUserName", "moderatorUserName");
        string initiatorId = FirstArg("timeoutInitiatorId", "createdById", "moderatorId", "initiatorId");
        string initiatorAvatar = FirstArg("timeoutInitiatorAvatar", "initiatorAvatar", "moderatorAvatar", "moderatorProfileImageUrl", "moderatorProfilePicture", "createdByProfileImageUrl", "createdByProfilePicture", "performedByAvatar", "senderAvatar");

        if (platform == "twitch")
        {
            if (string.IsNullOrWhiteSpace(initiatorAvatar) && !string.IsNullOrWhiteSpace(initiatorId))
            {
                try { var initiator = CPH.TwitchGetExtendedUserInfoById(initiatorId); if (initiator != null) { initiatorAvatar = initiator.ProfileImageUrl; if (string.IsNullOrWhiteSpace(initiatorName)) initiatorName = initiator.UserName; if (string.IsNullOrWhiteSpace(initiatorUsername)) initiatorUsername = initiator.UserName; } }
                catch (Exception ex) { CPH.LogWarn($"Ban Widget: unable to resolve Twitch initiator avatar by id: {ex.Message}"); }
            }
            if (string.IsNullOrWhiteSpace(initiatorAvatar) && !string.IsNullOrWhiteSpace(initiatorUsername))
            {
                try { var initiator = CPH.TwitchGetExtendedUserInfoByLogin(initiatorUsername); if (initiator != null) { initiatorAvatar = initiator.ProfileImageUrl; if (string.IsNullOrWhiteSpace(initiatorName)) initiatorName = initiator.UserName; if (string.IsNullOrWhiteSpace(initiatorId)) initiatorId = initiator.UserId; } }
                catch (Exception ex) { CPH.LogWarn($"Ban Widget: unable to resolve Twitch initiator avatar by login: {ex.Message}"); }
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

        CPH.SetArgument("banWidgetDuration", FirstArg("duration", "timeoutDuration", "banDuration") ?? "");
        CPH.SetArgument("banWidgetReason", FirstArg("reason", "timeoutReason", "banReason", "message") ?? "");
        CPH.TriggerEvent("BanWidget", true);
        return true;
    }

    private static string NormalizePlatform(string source)
    {
        if (string.Equals(source, "Twitch", StringComparison.OrdinalIgnoreCase)) return "twitch";
        if (string.Equals(source, "Kick", StringComparison.OrdinalIgnoreCase)) return "kick";
        if (string.Equals(source, "YouTube", StringComparison.OrdinalIgnoreCase)) return "youtube";
        return (source ?? "").Trim().ToLowerInvariant();
    }

    private string FirstArg(params string[] names)
    {
        foreach (string name in names) if (CPH.TryGetArg<string>(name, out string value) && !string.IsNullOrWhiteSpace(value)) return value;
        return null;
    }
}
