# RTS — Ban / Timeout Widget

**Version 1.0.0**

RTS — Ban / Timeout Widget is a Streamer.bot extension and OBS browser overlay that turns moderation events into visible stream moments.

It provides two independent moderation presentations:

- **Ban events** are handled by their own FIFO event queue. A queued ban is held as data until the previous ban scene has completely finished. The truck, message, skid marks, sounds and animation therefore start together when the ban reaches the front of the queue.
- **Timeout events** use their own timeout-cell queue. Timeout cells can run and stack independently while ban events are waiting or playing.

The two systems deliberately do not share a queue or busy flag.

## What it does

### Ban events

A ban is presented as a complete animated event. The target's avatar and moderation reason can be displayed on the ban vehicle, followed by the vehicle's departure and skid-mark effect.

Ban events are processed in **first-in, first-out (FIFO)** order.

Most importantly, a queued ban does **not** create its visual scene, start timers, play sounds or begin animation before it is its turn. Each ban starts from the beginning when delivered.

### Timeout events

Timeouts appear as animated cells. The same timeout cell that is created in the centre of the overlay is moved into the stack when it locks; a second stack-cell DOM element is not created.

Timeout cells can stack up to the configured limit and operate independently from the ban queue.

The timeout presentation can show:

- Twitch profile/avatar image when supplied by the event
- Viewer name
- Timeout reason
- Countdown timer
- Locking/releasing animation
- Audio effects

## Streamer.bot events

The overlay listens for Streamer.bot WebSocket custom events.

The overlay accepts ban and timeout data using the `banWidget*` fields used by the extension, including:

- `banWidgetAction`
- `banWidgetEventType`
- `banWidgetPlatform`
- `banWidgetTargetId`
- `banWidgetTargetUsername`
- `banWidgetTargetName`
- `banWidgetTargetAvatar`
- `banWidgetReason`

For timeout events, duration is supplied as `duration`.

For integrations that provide profile images, the overlay also accepts the standard avatar/profile-image fields used by the event payload.

## Overlay settings

The overlay receives its persistent settings from the Streamer.bot extension. The following settings control the visual presentation.

### Ban Van Size

Controls the scale of the ban vehicle.

| Value | Scale |
|---|---:|
| **Large** | 100% |
| **Medium** | 85% |
| **Small** | 70% |
| **Extra Small** | 60% |

This changes the size of the ban vehicle while preserving its calibrated positioning.

### Ban Van Vertical Position

Controls where the ban vehicle appears vertically in the viewport.

- `0` places it at the top of the available range.
- `50` is the default centre position.
- `100` places it at the bottom of the available range.

Values are constrained to the range **0–100**.

### Ban Message Visibility

Controls whether the ban reason/message is displayed.

- **Visible** — show the ban message.
- **Hidden** — suppress the ban message.

### Ban Message Size

Controls the scale of the ban message.

| Value | Scale |
|---|---:|
| **Large** | 100% |
| **Medium** | 85% |
| **Small** | 70% |
| **Extra Small** | 60% |

### Ban Message Vertical Position

Controls where the ban message appears vertically in the viewport.

- `0` places it at the top of the available range.
- `50` is the default centre position.
- `100` places it at the bottom of the available range.

Values are constrained to **0–100**.

### Ban Message Arrival Style

Controls whether the ban message uses the arrival-style presentation during the ban vehicle's entrance.

When enabled, the existing calibrated trail/message reveal is synchronised with the vehicle's arrival.

### Timeout Stack Scale

Controls the size of timeout cells after they move into the stack.

The setting is expressed as a percentage. The default is **33%**.

Values are constrained to **10–100%**.

### Maximum Docked Timeouts

Controls how many timeout cells can remain in the stack at once.

The setting is constrained to **1–25** cells. When the limit is reached, the oldest docked timeout is removed to make room for the new one.

### Timeout Stack Edge Offset

Controls the distance between the timeout stack and the relevant edge of the overlay.

The setting is expressed in pixels and is constrained to **0–200 px**.

### Timeout Stack Gap

Controls the vertical gap between timeout cells in the stack.

The setting is expressed in pixels and is constrained to **0–100 px**.

## Timeout cell behaviour

A timeout follows this sequence:

1. Create one timeout cell.
2. Display the viewer avatar behind the bars.
3. Animate the bars into place.
4. Lock the cell.
5. Run the countdown.
6. Move the **same DOM element** into the timeout stack.
7. Keep the locked state while docked.
8. On timeout or untimeout, release the bars and remove the cell.

The stack therefore contains the same timeout cell that was originally created rather than a separate copy.

## Testing the overlay

The overlay includes development test query strings:

```text
index.html?test=timeout
index.html?test=stack
index.html?test=long
index.html?test=ban
index.html?test=instant
```

These are intended for testing the overlay presentation without waiting for live moderation events.

## Installation

The extension is distributed as a Streamer.bot import package together with the overlay.

The overlay can be used in two ways:

1. **Hosted overlay** — use the Road to Somewhere hosted overlay URL as an OBS Browser Source.
2. **Local overlay** — download the overlay ZIP, extract it and point an OBS Browser Source at `index.html`.

The extension's settings UI requires the **Road to Somewhere UI DLL**. The DLL is a shared dependency and is installed separately rather than bundled with this extension.

See the Road to Somewhere website for the current installation instructions, hosted overlay URL and release downloads.

## Asset architecture

The timeout cell uses a layered visual architecture:

- `assets/cell_frame_final.png` — cell frame artwork.
- Live HTML elements provide the avatar, bars, timer, name and reason.
- The same timeout cell remains intact while moving from the centre position into the stack.

The ban presentation uses the vehicle artwork and calibrated CSS positioning/animation, with the event lifecycle controlled by the ban queue.

## Release

**RTS — Ban / Timeout Widget v1.0.0** is the first completed release.

Future releases will be versioned independently and distributed through The Road to Somewhere.
