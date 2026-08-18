# Streamer.bot V4 rebuild

## OBS

Use `index.html` as a local Browser Source.

Recommended:
- 1920x1080
- 60 FPS
- Transparent background
- Keep the `assets` directory beside `index.html`

## Streamer.bot actions

Use separate actions for the two moderation behaviours:

- `duhbuh - Ban - Timeout Widget` → `streamerbot/TimeoutWidget.cs`
- `duhbuh - Ban - Ban` → `BanWidget`
- `duhbuh - Ban - Settings` → `streamerbot/SetupSettings.cs`

The timeout and ban behaviours intentionally remain separate. The browser Custom Event remains named `BanWidget` for compatibility with the existing overlay path.

## Custom event payload

Timeout:

```json
{
  "action":"timeout",
  "id":"twitch-user-id",
  "username":"viewer",
  "displayName":"Viewer",
  "avatar":"https://...",
  "duration":600,
  "reason":"BACKSEAT GAMING",
  "banWidgetStackScalePercent":33,
  "banWidgetMaxDocked":4,
  "banWidgetEdgeOffset":28,
  "banWidgetStackGap":18
}
```

Ban:

```json
{
  "action":"ban",
  "id":"twitch-user-id",
  "username":"viewer",
  "displayName":"Viewer",
  "avatar":"https://..."
}
```

### Avatar

For reliable avatars, keep the existing Streamer.bot Get User Info for Target step and pass its profile image URL into the Custom Event payload as `avatar`.

The browser cannot magically infer a Twitch profile image from a username without either:
- Streamer.bot supplying the profile image URL, or
- a separate Twitch API lookup.

The existing Streamer.bot route is preferred.

## WebSocket

The widget subscribes to:

- General.Custom
- Twitch.UserTimedOut
- Twitch.UserBanned
- Twitch.UserUntimedOut

## Settings

The settings action stores:

- `duhbuh.banwidget.stackScalePercent` — 10–100, default 33
- `duhbuh.banwidget.maxDocked` — 1–4, default 4
- `duhbuh.banwidget.edgeOffset` — 0–200 px, default 28
- `duhbuh.banwidget.stackGap` — 0–100 px, default 18

`TimeoutWidget.cs` reads these persisted globals and forwards them with the `BanWidget` Custom Event. `assets/script.js` applies them to the runtime/CSS layout.

## Tests

`index.html?test=timeout`

`index.html?test=stack`

`index.html?test=long`

`index.html?test=ban`

V4 uses a single transparent PNG for the jail bars (`assets/cell_bars_v4.png`). Streamer.bot does not need to provide or manipulate the bars.

The timeout cell is moved as the same DOM element into the stack. No second stack cell is created, and no `.docked` child layout overrides are used.
