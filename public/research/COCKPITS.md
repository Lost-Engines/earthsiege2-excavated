# Cockpit artwork and layout

The [cockpit browser](../analysis/cockpits/index.html) assembles the nine playable
HERC cockpits, with forward, heads-down and both side views. It offers the
original low, mixed and high resolution modes, world palettes, viewport masks
and labeled gauge rectangles. All 108 HERC/view/mode combinations render in
the browser check.

The browser assembles the static art and layout, with adjustable energy, shield
and throttle previews in the forward view. The live C++ instruments,
targeting and widget tree now have independent original-code fixtures and
174 complete cockpit-frame comparisons. See [interface integration](INTERFACE_INTEGRATION.md)
for those checks; the browser remains a static artwork inspection tool.

## Palette binding

The HERC DAT record's signed word at byte 80 selects its cockpit scheme.
The live palette keeps the selected WORLD palette and replaces entries 42-65
with 24 entries starting at `32 + 24 * scheme` in COCKPIT.DPL.

| Scheme | HERC |
|---|---|
| 0 | Apocalypse |
| 1 | Colossus |
| 2 | Samson |
| 3 | Maverick |
| 4 | Ogre |
| 5 | Outlaw |
| 6 | Raptor II |
| 7 | Razor |
| 8 | Tomahawk |

The original palette range installer matches all 90 world/scheme combinations
in each of four builds. [native-palette.json](../analysis/cockpits/native-palette.json)
records the routines and cases. Colors in captured original Outlaw artwork
agree with this binding; instrument overlays must be excluded before a full
pixel comparison of the underlying art is meaningful.

## Files and views

HB0/HB1/HB2 contain high resolution front, heads-down and side art; DB0/DB1/DB2
are the low resolution counterparts. The other side is a mirrored view.
Side glances extend the image plane rather than rotating the world camera.
The VUE file has four records containing viewport bounds, a negated projection
center and canvas origin. The original front/HDD composition can overlap six
rows; the browser presents each view separately.

HD and ED files carry the high and low resolution clipping regions. Their
rectangles store inclusive Y bounds followed by horizontal start and length
as consumed by the renderer. Row blocks then store inclusive span endpoints.
The extraction parses all 74 clip files to their final sentinel. The browser's
optional checkerboard shows the area made available to the 3D renderer.

GAU files are 1,700-byte cockpit layout records. Decoded fields locate weapon
readouts, link and tracking controls, energy, shields, MFD, throttle, heading,
target and attitude displays, messages and the heads-down controls. The
catalogue preserves every word alongside named regions so unidentified fields
remain available for later consumer tracing. Layout rectangles do not by
themselves specify widget behavior.

## Reproduction

`tools/build_cockpits.py` parses the files and checks palette binding.
`tools/check_cockpit_browser.py` exercises all views, resolutions and chassis.
The original Win95 simulator screenshots are retained under
`analysis/reference/first-simulation/`, together with the actual mission
handoff. Consumer and format leads are attributed in
[the research sources](../reference_sources/README.md).

## Instrument previews

The forward view exposes supplied energy, front/rear shield charge and throttle
values. These let the artwork be inspected independently of a running mission.
They do not simulate a HERC or its power-management feedback.

`tools/check_gauges.py` executes the original consumers in all four simulator
families. Each build matches 324 complete LED frames, 234 throttle positions
and 2,049 shield palette updates. The JavaScript calculations independently
match those retained results. See [native-gauges.json](../analysis/cockpits/native-gauges.json)
and [browser-gauges.json](../analysis/cockpits/browser-gauges.json).

The master energy display uses alternating palette indices 98 and 97 on even
and odd device columns, with index 16 behind them. Its fill endpoint is inclusive,
so zero energy still draws the first column. Positions come from a Q16 division
of the layout width by 1024; repainting retains the same device-pixel stripes.

Shields recolour six palette entries, 66-71, rather than painting new rings.
Three nested bands per shield have different thresholds and slopes. Charge
0-1024 builds their green intensity; 1025-2048 shifts them toward yellow. The
ring order is opposite to the order in which the thresholds are evaluated.
The original colour writer is `0x4438f0` in v1.0 Win95.

Throttle positions use the full height of the knob bitmap when calculating the
available travel. The base slider clamps input to -1024 through 1024 and uses
Q16 arithmetic over that travel. Both original bitmap sizes and every cockpit
track have fixtures. This covers the base slider's geometry, not the complete
throttle widget's input callback, bitmap blitter or machine feedback loop.

## Compass, damage diagrams and presentation clocks

`tools/check_hud.py` compares 2,048 compass positions, 2,048 damage tint choices,
2,048 dropout transitions, 2,048 power-up updates and 128 complete diagram
recolour frames per executable. All four families agree. The native functions
run unchanged; wall time, sprite-sequencer answers and deferred paint callbacks
are supplied boundaries. [Results](../analysis/cockpits/native-hud.json).

The compass is nine sliding bitmaps, not separately drawn ticks and text. A
120-pixel low-resolution window moves over pairs of 128-pixel frames; high
resolution doubles both. The caller negates the simulation heading, which
increases counterclockwise, before selecting the tape position. The browser's
compass control uses ordinary clockwise compass degrees.

Damage diagrams recolour indexed pixels within authored regions. Most modes
replace only the region's key colour, preserving the outline. Mode 2 adds the
tint to every non-background pixel with byte wrap. Condition bands use the
integer intact percentage: at least 90, 74, 51 or 1 percent, then destroyed.
Mode 1 keeps the authored key through the first three bands and only changes
at severe damage and destruction. Treating it like the other modes loses the
intended internal-system colours. The combat browser's damage control now
exercises these rules at an explicitly supplied damage fraction.

The presentation clock is `GetTickCount() >> 4`, separate from mission delta.
The energy and turbo startup values rise by 25 per coarse tick until elapsed
is greater than 50, when they take the actual value. Shields rise by one per
tick independently and finish when both have reached their actual charges.
The Razor skips the cockpit startup sequence.

Damaged-screen dropouts use a separate random generator. The active interval
is tested with strict `now > deadline`; a screen not updated for some time
advances once when it is visited again. The interval draw uses an unsigned
16-bit random result, unlike the mission generator's usual 15-bit bounded
draw. Fixed-duration intervals consume no random value. An optional sprite
sequence completes the wipe before visibility flips. The original condition
zero arm forces darkness when this helper is called; healthy-screen callers
normally bypass it.

`tools/check_hud_browser.py` checks 2,048 browser calculation sets and 64 complete
recolour frames, then renders 252 HERC/diagram/resolution/condition combinations.
[Browser report](../analysis/cockpits/browser-hud.json). These previews supply
values directly; the whole cockpit's input and repaint lifecycle is described
in [interface integration](INTERFACE_INTEGRATION.md).
