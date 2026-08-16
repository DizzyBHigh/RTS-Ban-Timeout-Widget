# Streamer.bot V4 rebuild

## OBS

Use `index.html` as a local Browser Source.

Recommended:
- 1920x1080
- 60 FPS
- Transparent background
- Keep the `assets` directory beside `index.html`

## Custom event payload

Timeout:

{
  "action":"timeout",
  "id":"twitch-user-id",
  "username":"viewer",
  "displayName":"Viewer",
  "avatar":"https://...",
  "duration":600,
  "reason":"BACKSEAT GAMING"
}

Ban:

{
  "action":"ban",
  "id":"twitch-user-id",
  "username":"viewer",
  "displayName":"Viewer",
  "avatar":"https://..."
}

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

## Tests

`index.html?test=timeout`

`index.html?test=stack`

`index.html?test=long`

`index.html?test=ban`


V4 uses a single transparent PNG for the jail bars (`assets/cell_bars_v4.png`). Streamer.bot does not need to provide or manipulate the bars.


The timeout cell is moved as the same DOM element into the stack. No second stack cell is created, and no `.docked` child layout overrides are used.
