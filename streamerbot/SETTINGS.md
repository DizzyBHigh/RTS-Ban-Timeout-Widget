# Ban Widget Settings — stack layout milestone

This milestone expands the `duhBuhUI.dll` settings round trip from one setting to the complete timeout-stack layout configuration.

## Architecture

```text
Streamer.bot
    ↓
Setup Settings C# action
    ↓
duhBuhUI.dll
    ↓
Persisted globals
    ↓
TimeoutWidget C# action
    ↓
Custom Event: BanWidget
    ↓
Browser WebSocket
    ↓
assets/script.js
    ↓
CSS/runtime stack layout
```

## Settings

| Setting | Persisted global | Range | Default |
|---|---|---:|---:|
| Stack Scale (%) | `duhbuh.banwidget.stackScalePercent` | 10–100 | 33 |
| Max Docked | `duhbuh.banwidget.maxDocked` | 1–4 | 4 |
| Edge Offset (px) | `duhbuh.banwidget.edgeOffset` | 0–200 | 28 |
| Stack Gap (px) | `duhbuh.banwidget.stackGap` | 0–100 | 18 |

Streamer.bot persisted globals survive application restarts.

## Streamer.bot actions

The timeout action is now:

`duhbuh - Ban - Timeout Widget`

Its C# source is:

`streamerbot/TimeoutWidget.cs`

The banning action remains separate:

`BanWidget`

The Custom Event name remains `BanWidget`; this is intentionally separate from the timeout action filename/name.

## Settings action

Create/use:

`duhbuh - Ban - Settings`

with `streamerbot/SetupSettings.cs` as its Execute C# Code sub-action.

The settings window exposes all four stack-layout controls.

## Event payload

`TimeoutWidget.cs` reads the persisted values and forwards them with the existing Custom Event:

```json
{
  "banWidgetStackScalePercent": 33,
  "banWidgetMaxDocked": 4,
  "banWidgetEdgeOffset": 28,
  "banWidgetStackGap": 18
}
```

The existing moderation arguments remain in the same argument stack.

## Overlay behaviour

`assets/script.js` normalizes the Custom Event payload and applies any supplied settings.

- `banWidgetStackScalePercent` updates `--stack-scale` and recalculates `--stack-h`.
- `banWidgetMaxDocked` updates the runtime maximum used when a cell docks.
- `banWidgetEdgeOffset` updates `--edge`.
- `banWidgetStackGap` updates `--stack-gap`.

Values are clamped in the overlay as well as in the Streamer.bot action so malformed event data cannot produce extreme layout values.

Changing the maximum does not immediately destroy existing cells. The new maximum is enforced on subsequent docking operations, preserving the current visible stack until the normal stack lifecycle changes it.

## Test

1. Open `duhbuh - Ban - Settings`.
2. Change all four stack-layout settings.
3. Click **Save & Exit**.
4. Confirm the four persisted globals exist in Streamer.bot.
5. Trigger a timeout through `duhbuh - Ban - Timeout Widget`.
6. Confirm the timeout cell uses the new scale and edge offset.
7. Trigger multiple timeouts and confirm the new stack gap and maximum are respected.
8. Change Max Docked downward while cells are already visible and confirm the existing cells remain intact.
9. Trigger another timeout and confirm the new maximum is enforced.
10. Trigger a ban and confirm the separate ban animation still works.
