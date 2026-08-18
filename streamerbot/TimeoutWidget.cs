using System;

public class CPHInline
{
    private const string StackScalePercentKey = "duhbuh.banwidget.stackScalePercent";
    private const string MaxDockedKey = "duhbuh.banwidget.maxDocked";
    private const string AlwaysShowStackKey = "duhbuh.banwidget.alwaysShowStack";
    private const string StackVisibilityDurationKey = "duhbuh.banwidget.stackVisibilityDuration";
    private const string ShowStackWhenItemLeavesKey = "duhbuh.banwidget.showStackWhenItemLeaves";
    private const string EdgeOffsetKey = "duhbuh.banwidget.edgeOffset";
    private const string StackGapKey = "duhbuh.banwidget.stackGap";

    public bool Execute()
    {
        int stackScalePercent = CPH.GetGlobalVar<int?>(StackScalePercentKey, true) ?? 33;
        int maxDocked = CPH.GetGlobalVar<int?>(MaxDockedKey, true) ?? 4;
        bool alwaysShowStack = CPH.GetGlobalVar<bool?>(AlwaysShowStackKey, true) ?? true;
        int stackVisibilityDuration = CPH.GetGlobalVar<int?>(StackVisibilityDurationKey, true) ?? 10;
        bool showStackWhenItemLeaves = CPH.GetGlobalVar<bool?>(ShowStackWhenItemLeavesKey, true) ?? true;
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
        CPH.SetArgument("banWidgetEdgeOffset", edgeOffset);
        CPH.SetArgument("banWidgetStackGap", stackGap);

        CPH.TriggerEvent("BanWidget", true);

        return true;
    }
}
