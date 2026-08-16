# Ban Widget V4 — Rebuild from the exact reference

This version deliberately starts over with one core rule:

**There is one timeout cell DOM element. The same element is moved from center to the side stack.**

There is no second "stack cell" and no second cell asset generated when it docks.

## Asset architecture

- `assets/cell_frame.png` — outer metal/hazard frame, with dynamic areas cleared.
- `assets/cell_bars.png` — the bars extracted from the desired locked reference.
- The Twitch avatar is a live `<img>` behind the bars.
- Timer and reason are live HTML.
- The same layers remain together while the cell moves.

This means the stack view is literally the same cell that was initially created.

## Twitch avatar

The HTML does support a Twitch profile image, but the URL must be supplied by Streamer.bot in the event payload.

Recommended custom payload:

{
  "action":"timeout",
  "id":"twitch-user-id",
  "username":"viewer",
  "displayName":"Viewer",
  "avatar":"https://...",
  "duration":59,
  "reason":"BACKSEAT GAMING"
}

The included native Twitch WebSocket path also accepts `targetUser.profileImageUrl` when present.

If the avatar URL is missing, the cell will still render, but the avatar area will be blank/dimmed.

## Animation

1. Create one cell.
2. Avatar appears behind the cell bars.
3. Bars drop.
4. Lock appears.
5. Timer counts down.
6. The SAME DOM node gets `.docked` and moves to the bottom-right.
7. On timeout/untimeout, the bars lift and the avatar escapes.
8. The cell disappears in its current position.

## Tests

- `index.html?test=timeout`
- `index.html?test=stack`
- `index.html?test=long`
- `index.html?test=ban`

Keep `assets/` next to `index.html`.


## Bar rendering fix

The previous `cell_bars.png` extraction was discarded. It produced transparent/incorrect bar pixels.

V4 now renders seven solid metal bars directly in HTML/CSS:
- fully opaque
- independent of the frame artwork
- start above the visible cell
- descend over the avatar
- extend to the lower sill
- lift back out on release

This also makes the bars reliable in OBS Browser Source instead of depending on transparency extracted from a screenshot.


## Bar positioning fix

The bars now animate using `transform: translateY()` from above into a fixed opening-sized bar container. The previous `top` animation was leaving the bars physically above the cell. Use `?test=instant` to inspect the fully lowered state without waiting for the animation.


## Final bar visibility correction

The bar container is now clipped to the actual jail opening (`overflow:hidden`).

This is intentional: the bars may animate from above internally, but **no part of a bar can render outside the cell opening**. The visible result is the bars dropping down from the top rail into the cell rather than appearing in the transparent area above the cell.


## Final bar animation architecture

The bars no longer translate vertically at all.

Each bar is permanently positioned inside the jail opening and animates with:

`transform: scaleY(0) -> scaleY(1)`

using `transform-origin: top center`.

This makes the bars visually descend from the top rail while guaranteeing they can never exist above the cell or cover the outside area. The timer was also corrected so it stays centered at the top in the docked state.


## Stack correction

The stack uses the exact same 331x310 cell dimensions and coordinate system as the center cell. The timer remains centered at the top after docking; it no longer inherits the reason-sign positioning.


## Geometry lock

The center and stack now use exactly the same 331x310 internal coordinate system.

The stack state changes only `left/top/right/bottom`; it does not override timer, avatar, bars, or reason positions.

Reference geometry:
- timer: centered, top 9%, 108x38
- avatar: 18% / 19%, 64% x 62%
- bars: 22% / 13%, top 17%, height 72%
- reason: existing centered bottom sign


## Important V4 architecture correction

There are **no `.bar` CSS elements** in this build.

The jail bars are a single real image asset:

`assets/cell_bars_v4.png`

The HTML contains one `<img class="bars">`, positioned in the same 331x310 coordinate system as the cell. The animation moves that single PNG as a unit.

This was done specifically to avoid the recurring CSS-bar geometry/offset problem.

The timeout cell remains one DOM element. Center -> stack changes only the cell's screen position.


## V4 correction: preserve the locked cell when docking

The bars are HTML/CSS again because that produced the correct locked appearance.

The critical fix is that `.docked` contains **no child-style overrides**. It only changes the position of the existing `.cell`.

Therefore the exact locked state seen in the center is the exact locked state seen in the stack:
- same avatar
- same bars
- same bar positions
- same timer position
- same reason position
- same cell dimensions

Only `right` and `bottom` change when the cell docks.


## Critical bar-state fix

The previous version had this as the base rule:

`transform: scaleY(0)`

That was the bug.

When `.locking` was removed during the move to the stack, the animation disappeared and the bars reverted to the base `scaleY(0)`, making them invisible.

The corrected state machine is:

- new cell: bars hidden
- `.locking`: bars animate from 0 → 1
- `.locked`: bars remain at 1
- `.docked`: only position changes; `.locked` remains
- `.releasing`: bars animate from 1 → 0

There is no docked-state bar transform.
