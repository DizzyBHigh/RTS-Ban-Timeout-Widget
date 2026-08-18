# Ban Widget Settings — first integration milestone

This milestone proves the settings round trip with `duhBuhUI.dll` using one setting: `Stack Scale (%)`.

## Architecture

```text
Streamer.bot
    ↓
Setup Settings C# action
    ↓
duhBuhUI.dll
    ↓
Save
    ↓
Persisted global: duhbuh.banwidget.stackScalePercent
    ↓
BanWidget C# action
    ↓
Custom Event: BanWidget
    ↓
Browser WebSocket
    ↓
assets/script.js
    ↓
--stack-scale
```

## 1. Add the DLL

The `duhBuhUI` project targets .NET Framework 4.8 and builds `duhBuhUI.dll` as a library. Add the compiled DLL as a custom assembly reference in the Streamer.bot C# editor using **Find Refs** / the custom DLL reference mechanism.

The public settings entry point is the `DuhBuhUI` class.

## 2. Create the setup action

Create a Streamer.bot action named something like:

`duhbuh - Ban - Settings`

Add an **Execute C# Code** sub-action and use:

`streamerbot/SetupSettings.cs`

The action opens the `duhBuhUI` settings window.

## 3. Save the setting

The settings window contains:

- `Stack Scale (%)`
- Range: 10–100
- Default: 33

Saving writes the persisted Streamer.bot global variable:

`duhbuh.banwidget.stackScalePercent`

Streamer.bot persisted globals survive application restarts.

## 4. Keep the existing BanWidget action

The existing timeout/ban action should continue to call the `BanWidget` Custom Event.

`streamerbot/BanWidget.cs` now reads the persisted stack-scale setting and places it into the event arguments as:

`banWidgetStackScalePercent`

The existing `CPH.TriggerEvent("BanWidget", true)` path remains unchanged.

## 5. Overlay behaviour

`assets/script.js` reads `banWidgetStackScalePercent` when a WebSocket Custom Event arrives.

It clamps the value to 10–100, converts it to a CSS scale, and updates:

`--stack-scale`

The existing `updateStackSize()` function then recalculates the stack height.

If the event does not contain the setting, the overlay keeps its existing default of approximately one-third scale.

## Test

1. Open the Ban Widget settings action.
2. Change `Stack Scale (%)` from 33 to another value.
3. Click **Save & Exit**.
4. Confirm the persisted global exists in Streamer.bot.
5. Trigger a timeout through the existing `BanWidget` action.
6. Confirm the timeout cell docks at the new scale.
7. Trigger a second timeout to confirm stacking still works.

Do not change the ban/timeout animation architecture as part of this test.
