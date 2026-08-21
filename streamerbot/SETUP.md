# Streamer.bot setup

## OBS

Use `index.html` as a local Browser Source.

Recommended:
- 1920x1080
- 60 FPS
- Transparent background
- Keep the `assets` directory beside `index.html`

## Shared RTS UI DLL

The settings UI uses the shared `RtsUI.dll` library. The DLL must be available in the Streamer.bot `dlls` directory before the settings code is executed.

The imported action set should contain a separate C# action named:

`RTS - UI DLL Check`

Use `streamerbot/RtsUiDllCheck.cs` for that action. **Do not add an `RtsUI.dll` reference to this checker.** It must be able to compile and run when the DLL is missing.

The checker:

1. Resolves the Streamer.bot installation directory.
2. Checks `dlls/RtsUI.dll`.
3. Downloads the DLL from the latest RTS-UI-Dll GitHub release when it is missing.
4. Reads the installed assembly version without loading the DLL into the action.
5. Checks the latest published RTS UI release and offers to update an older installed DLL.
6. Leaves the existing DLL untouched if a download or validation fails.

The settings action should run the DLL check before opening the RtsUI settings window. If the check returns `false`, the remaining settings sub-actions must not run.

The checker currently requires **RtsUI.dll 0.1.0 or newer**, matching the first published RTS UI DLL release. When an extension requires a newer API, update `MinimumRtsUiVersion` in `RtsUiDllCheck.cs` and the extension release metadata together.

## Streamer.bot actions

Use separate actions for the moderation behaviours:

- `RTS - Ban - Timeout Widget` → `streamerbot/TimeoutWidget.cs`
- `RTS - Ban - Ban` → existing BanWidget path
- `RTS - Ban - Settings` → `streamerbot/SetupSettings.cs`
- `RTS - Ban - Show Stack` → `streamerbot/ShowStack.cs`
- `RTS - UI DLL Check` → `streamerbot/RtsUiDllCheck.cs`

The `BanWidget` Custom Event remains the browser communication contract. Keep the separate `duhbuh - Ban - Event Trigger` action with its Custom trigger named `BanWidget`; C# code fires it with `CPH.TriggerEvent("BanWidget", true)`.

## Timeout C# action

The `TimeoutWidget.cs` Execute C# Code now exposes:

```csharp
public bool PrepareBanWidgetTimeout()
```

`Execute()` calls that method, so the existing Timeout action continues to work unchanged. The method is also intended to be callable from Streamer.bot's **Execute C# Method** sub-action when platform-specific actions are added later. Streamer.bot requires the Execute C# Code sub-action to have a Name before its public parameterless `bool` method can be selected by Execute C# Method.

A recommended code-action name is:

`duhbuh - BanWidget - Timeout`

## Normalized BanWidget payload

Timeout events now add platform-neutral fields while retaining the existing arguments for compatibility:

```json
{
  "banWidgetPlatform":"twitch",
  "banWidgetSource":"Twitch",
  "banWidgetEventType":"TwitchUserTimedOut",
  "banWidgetAction":"timeout",
  "banWidgetTargetId":"twitch-user-id",
  "banWidgetTargetUsername":"viewer",
  "banWidgetTargetName":"Viewer",
  "banWidgetTargetAvatar":"https://...",
  "banWidgetInitiatorId":"moderator-id",
  "banWidgetInitiatorUsername":"moderator",
  "banWidgetInitiatorName":"Moderator",
  "banWidgetInitiatorAvatar":"https://...",
  "banWidgetDuration":600,
  "banWidgetReason":"BACKSEAT GAMING"
}
```

`banWidgetPlatform` is normalized to `twitch`, `kick`, or `youtube` when Streamer.bot reports those sources. The original source and event type are retained in `banWidgetSource` and `banWidgetEventType` for diagnostics and platform-specific behaviour.

## Target avatar

The timeout C# code now resolves the timed-out Twitch user's profile image directly with `TwitchGetExtendedUserInfoById` when needed, using the `userId` supplied by the Twitch User Timed Out trigger. It falls back to a login lookup when necessary.

The existing `Twitch Add Target Info (%userName%)` sub-action should remain in place for the first verification test. Once the C# path is confirmed to supply the target avatar correctly, remove that sub-action and test again. It is intended to become unnecessary.

## Settings

The settings action stores:

- `duhbuh.banwidget.stackScalePercent` — 10–100, default 33
- `duhbuh.banwidget.maxDocked` — 1–25, default 4
- `duhbuh.banwidget.alwaysShowStack` — default true
- `duhbuh.banwidget.stackVisibilityDuration` — 1–60 seconds, default 10
- `duhbuh.banwidget.showStackWhenItemLeaves` — default true
- `duhbuh.banwidget.showKeyAnimation` — default true
- `duhbuh.banwidget.edgeOffset` — 0–200 px, default 28
- `duhbuh.banwidget.stackGap` — 0–100 px, default 18

## WebSocket architecture

The browser should consume the `BanWidget` Custom Event rather than reconstructing Twitch moderation events itself. The current overlay still contains legacy helper scripts for key and stack behaviour; those will be consolidated into `assets/script.js` in the next refactor stage without changing the working timeout animation.

## Tests

`index.html?test=timeout`

`index.html?test=stack`

`index.html?test=long`

`index.html?test=ban`
