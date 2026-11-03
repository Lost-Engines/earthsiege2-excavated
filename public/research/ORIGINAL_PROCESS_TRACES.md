# Complete original-process mission traces

The C++ simulation agrees with the captured state after every tick of forty
controlled v1.1 runs through the documented comparison limits. The first drives and fires through 1,024 ticks, including
an enemy returning fire. The second combines driving, turning, turret twist,
pitch and firing for 512 ticks. At delta 81, these cover 40.5 and 20.25 seconds
of simulation time. They start from the first campaign mission's original shell
handoff, retained in `analysis/missions/captured/new-campaign`.

The third run adds the initial career's three available squadmates using the
original shell's own serializer. It drives, turns the torso and fires for 768
ticks (30.375 seconds), including building destruction and squadmates reversing
out of obstacles. `tools/prepare_squad_trace.py` creates that handoff in
`analysis/missions/captured/four-member-squad`. Its capture also records every
debris piece and the player's firing-line points.

## What runs in the original

`tools/native_tick_probe.c` launches a private copy of DBSIM under Wine and
breaks at entry and return of `Sim_MainTick`. It fixes the timestep at 81 and
supplies a recorded input block after the game's device-input builder. Loading,
terrain, animation, movement, collision, AI, sensors, weapons, damage, rendering
and the rest of the game still execute inside that process. No simulation
subsystem is replaced with a callback. Breakpoint instructions are restored,
single-stepped and rearmed. The separately labelled `training-8-extended`,
`training-5-assault-death-guarded`, `training-5-protected-guarded` and
`training-8-complete-guarded`, `campaign-c2_10-guarded` and
`campaign-2-carried-guarded` runs add one
bounds guard for the confirmed original bug described below.

`tools/trace_original_mission.py` builds the debugger, creates a private install,
selects the supplied handoff and input stream, and starts an isolated display.
It stops only its own Wine prefix. Raw records, node matrices, weapon records,
projectile pool entries, flags and RNG bytes are retained in `ticks.jsonl`.
Completed large traces are stored as `ticks.jsonl.gz`. Compression preserves every
original JSON byte; the complete decoded SHA-256 is checked before deleting its
uncompressed duplicate. `analysis/reference/trace-storage.json` records both
sizes and hashes. Analysis readers accept either form, and frame sidecar names
remain unchanged. Active captures stay uncompressed until completion.

Optional aim, RNG and terrain-ray breakpoints provide instruction-level evidence
when a comparison first diverges. Those logs are independent of the C++ trace.

`tools/compare_mission_traces.py` interprets the raw records and compares them
with the C++ `mission_trace` diagnostic. The regression fixture exporter reads
only the original captures. Its expected values never come from the port.

## Current regression coverage

| Original run | Compared ticks | Snapshots |
|---|---:|---:|
| v1.1 campaign combat | 0-1024 | 1,025 |
| v1.1 movement and turret control | 0-512 | 513 |
| v1.0 shared campaign prefix | 0-328 | 329 |
| v1.1 four-member squad and destruction | 0-768 | 769 |
| v1.1 SARH firing without acquisition | 0-768 | 769 |
| v1.1 SARH acquisition and fire | 0-1024 | 1,025 |
| v1.1 ARH acquisition and fire | 0-1024 | 1,025 |
| v1.1 ARM acquisition and fire | 0-1024 | 1,025 |
| v1.1 EO steering, release and impact | 0-1024 | 1,025 |
| v1.1 Razor flight and squad formation | 0-768 | 769 |
| v1.1 first training mission through success | 0-4341 | 4,342 |
| v1.1 data-link training through success | 0-7689 | 7,690 |
| v1.1 third training mission through success | 0-7317 | 7,318 |
| v1.1 flight training through success | 0-3969 | 3,970 |
| v1.1 flight training through boundary warning | 0-4000 | 4,001 |
| v1.1 defence training before invalid aim read | 0-1936 | 1,937 |
| v1.1 defence training with explicit aim bounds guard | 0-6000 | 6,001 |
| v1.1 assault combat | 0-2400 | 2,401 |
| v1.1 escort failure | 0-5209 | 5,210 |
| v1.1 reconnaissance death | 0-4110 | 4,111 |
| v1.1 reconnaissance with full effect pools | 0-3866 | 3,867 |
| v1.1 long assault before invalid aim read | 0-5923 | 5,924 |
| v1.1 long assault death with aim bounds guard | 0-6055 | 6,056 |
| v1.1 protected assault before invalid aim read | 0-2766 | 2,767 |
| v1.1 protected assault success with aim bounds guard | 0-7317 | 7,318 |
| v1.1 complete defence death with aim bounds guard | 0-7917 | 7,918 |
| v1.1 C2_10 before invalid aim read | 0-890 | 891 |
| v1.1 C2_10 with explicit aim bounds guard | 0-1536 | 1,537 |
| v1.1 C4_10 opening | 0-1536 | 1,537 |
| v1.1 C5_10 lunar finale opening | 0-1536 | 1,537 |
| v1.1 C5_04 deployment through disablement | 0-3349 | 3,350 |
| v1.1 opening campaign patrol through success | 0-10417 | 10,418 |
| v1.1 C1_02 carried campaign before invalid aim read | 0-4173 | 4,174 |
| v1.1 C1_02 carried campaign with aim bounds guard | 0-11533 | 11,534 |
| v1.1 C1_03 recovery after the actual C1_02 failure | 0-5209 | 5,210 |
| v1.1 C1_04 armed Razor reconnaissance | 0-3969 | 3,970 |
| v1.1 C1_05 rescue in the carried Razor | 0-6697 | 6,698 |
| v1.1 hard nighttime Ogre escort | 0-3421 | 3,422 |
| v1.1 C1_08 data-link attempt through disablement | 0-3969 | 3,970 |
| v1.1 C1_06 carried Outlaw through incomplete return | 0-6000 | 6,001 |
| v1.1 C5_10 finale through player death | 0-6369 | 6,370 |
| DEMO1 complete playback | 0-921 | 922 |
| DEMO2 unchanged prefix | 0-669 | 670 |
| DEMO2 complete guarded playback | 0-857 | 858 |
| DEMO3 complete playback, with two documented timer departures | 0-3350 | 3,351 |

Together these 45 cases contain 165,525 snapshots, 192,104,802 named fields and
1,357,011,355 observed integer values.
The complete moving-world comparisons include the documented original bounds
and timer defects; each fixture's provenance records its exact boundary.

The initial `original-missions.bin` fixture checks 43,533 complete snapshots, 28,455,637 named
field observations and 211,794,709 integer values. Repeated fields are stored as
deltas in the fixture, but every observed field is checked on every tick.
The missile and flight runs also retain firing lines and debris. The Razor
adds body/world velocity, angular rates, throttle, inverse transform and bank
rate. The comparisons include actor order, position and orientation, AI state and
timers, every captured HERC node matrix, torso controls, components, shields,
power, weapon supply/refire, locks, selected weapon, radar, contacts, LOS caches
and timers, the projectile pool, all mission flags and the simulation RNG.
The squad run additionally checks firing-line points, debris positions, angles,
velocities, radii, timers, child groups, death effects and pending deletion.

The retained report is [cpp-original-missions.json](../analysis/combat/cpp-original-missions.json).
The full older-build run remains available even though it is not a v1.1 oracle
past its first genuine version difference.

The first training mission also matches its success dialog at tick 4,341
(171.69 simulated seconds) and the exact 80 bytes written to `RESULTS.DAT`.
Data-link training succeeds at tick 7,689 with 92 identical result bytes. The
third training mission succeeds at tick 7,317 with 128 identical result bytes,
including 12 recovered weapons and four credited HERC kills.
The other runs cover specific battle scenarios; additional mission outcomes and
campaign branches still need complete-process comparisons. Two hundred and twenty-three idle, moving, view-change, assault, campaign and death-camera
frames now match exactly, as detailed below. Further battle presentation and map
interactions can extend that coverage. Host audio remains a separate check. Native
subsystem fixtures and broader C++ integration tests cover many of those areas,
but their evidence has different boundaries.

## Corrections found by comparing the whole process

- The live object list puts authored HERCs first, then the player squad, flyers
  and structures. Rendering has its own filing order. Using the rendering order
  for contact and detection changed initial AI jitter and later random draws.
- All HERCs stand on the final flattened terrain at startup, including waiting
  roster entries. The Razor retains its authored ride height. Sampling before
  building-pad flattening put the initial player at the wrong height.
- The energy slider exchanges its quantised value with the weapon after the
  systems pass. A target of 960 becomes 959 after its two dirty flags clear.
  Selection also runs after charging. A separate fixture covers 6,144 gauge
  updates in each retail build, including power changes and unchanged redraws.
- Seeking a torso animation changes its cursor; movement evaluates the pose on
  the following pass. Evaluating it immediately made bullets leave from the
  next pose. The initial evaluation also includes the parked torso channels.
- Component targeting transforms and rounds a point in bone space, then in
  world space. Multiplying the matrices first caused a one-unit aim-point
  difference and a later turret error. The native lead calculation also narrows
  its distance term to a signed 16-bit value before multiplying.

The startup-order and height corrections are reflected in the analysis scene
exports and regenerated C++ scene/frame/movement fixtures.

## Squad, collision and debris corrections

The 768-tick squad run exposed integration errors that the isolated routines
could not reveal with controlled collision replies:

| First observed tick | Correction |
|---|---|
| 170 | Avoidance probes use one ground height sampled beneath the HERC. Structure rays reconstruct their endpoint from the quantised angle and approximate length, then shorten it in object order. The original right-hand hit was 8,695 units; direct endpoint tracing gave 9,333. |
| 213 | Collapsing buildings throw debris from the component's `fire_point` at record offset `+0x0a`. Using `position` at `+0x10` placed this burst 100 units too high and changed its first child burst at tick 274. |
| 226 | A building-volume hit at distance zero is still a hit. Collision presence and distance must be represented separately. |
| 593 | The same applies to terrain: a projectile beginning on the surface can intersect exactly at its starting point. |
| 667 | Avoidance receives the controller's updated backoff timer and reversing flag. Reading the walking state's old copy added a steering bias for one extra tick. |

The firing-line producer is independently checked with 4,096 cases and 62,017
points in each of the four executable families. It is now connected between
player firing and the following tick's squad decisions. Building and terrain
recipient fixtures now include zero-distance intersections explicitly; all four
builds agree on those expanded cases. See [navigation](NAVIGATION.md) and
[hit detection](HIT_DETECTION.md).

## Missile and flight integration

`prepare_missile_trace.py` serializes the original starting squad with the player
carrying an MSL10 on its normal shoulder hardpoint. The four longer runs change
only its ammunition and supplied controls. SARH, ARH and ARM cover acquisition
and unguided fire; EO covers held steering, release to unguided flight, impact
and another launch. `prepare_flight_trace.py` substitutes a repaired Razor with
two wing-mounted Laser 300s. The mission, terrain and other actors stay original.

These captures exposed four further integration mistakes:

- Target commands change the cockpit selection first. The HERC receives it
  after weapon selection and gauge exchange, immediately before drawing.
- Mobile structure-class vehicles retain the base class's all-direction sensor
  arc. Giving them a forward arc skipped visibility rays and changed RNG use.
- Component destruction uses the anchor through a composed bone/world matrix.
  Targeting rounds the two transforms separately. Reusing the aim-point path
  displaced a leg's debris by one unit on each ground axis.
- Formation placement uses the XY portion of the leader's complete rotation,
  including pitch and bank. The authored Z offset remains vertical.

The initial Razor flight cache is identity because it is constructed before
assignment of the mission pose. The first flight-control pass replaces it.

Missile component indices are compared only while a target exists.
`Rocket_Fire` leaves that word untouched for targetless launches, and guidance
never reads it in that state. Reused bullet-pool bytes can appear there. The raw
captures retain those bytes; the semantic fixture omits the unused word.

The supplied controls are already-built device packets. They overwrite the
original device builder's output, after button-latch filtering. The C++ replay
therefore bypasses its device trigger latch too. Effects can still clear the
trigger during that tick. Original device/latch handling has separate fixtures;
these runs test simulation under identical supplied packets.

## First retail version divergence

At tick 329, building type 21 checks its visibility of HERC object 3. The actual
ray captured at the original terrain routine is:

```text
from (2198682, 2392195, 14556)
to   (2215981, 2505102, 25752)
radius 0, mode 0
```

Version 1.0 reports an obstruction without writing an intersection point.
Both v1.1 builds report no obstruction. The April demo agrees with v1.0.
This is the previously identified failed-plane-solve difference, now observed
in an ordinary running mission. It changes building object 34's LOS cache and
radar flag at tick 329. On tick 330, v1.0 makes nine sensor RNG calls while v1.1
makes eight. Later trajectories cannot be compared by assuming the builds are
interchangeable.

`tools/check_original_trace_versions.py` checks the first differing state,
reads the exact endpoints from both process logs, and replays that ray through
all four executable families over the captured campaign terrain. Its
[report](../analysis/combat/native-mission-version-divergence.json) retains the
ray, answers, terrain digest and random-call stacks. The reconstruction follows
the selected v1.1 behaviour. See [terrain collision](TERRAIN_COLLISION.md) for
the underlying instruction difference and wider ray fixtures.

## Reproduction

Run the capture from the analysis directory, using its Python environment:

```sh
PYTHONPATH=tools .venv/bin/python tools/trace_original_mission.py \
  --version cd_v1_1_1997_09_win95_e --name combat-poses --ticks 1024 \
  --handoff analysis/missions/captured/new-campaign \
  --inputs analysis/reference/tick-traces/controls/combat.bin
PYTHONPATH=tools .venv/bin/python tools/export_cpp_mission_traces.py
```

The C++ repository then needs only its bundled data and binary fixture:

```sh
ctest --test-dir build -R '^original_mission$' --output-on-failure
```

## Training route, aliases and result file

`tools/prepare_training_trace.py` asks the original shell to create a new
training pilot and export its launch files. The diagnostic `mission_trace
--route` records ordinary steering packets towards the next waypoint. Both
programs then replay the same saved packets, with no changes to mission content.
The Windows probe presses Tab and Enter once on the success dialog, lets its
original modal loop close, and allows the original shutdown to write results.
It rejects short captures and removes any old result file before launching.

This exposed a missing connection in the port: source group-zero members are
aliases for the squad. `TRAIN1`'s objective resolves HERC reference 0 to the
player's group and route. The first campaign mission uses reference 3 instead.
Resolving only ordinary authored HERCs prevented these objectives completing.
The corrected map matches the original loader, independently checked for 122
compiled previews and five squad sizes in each of four executable families.
See [mission reference mapping](MISSIONS_AND_TERRAIN.md#actor-placement).

The `ES2RUN02` regression retains ending status and the original result bytes,
as well as every simulation snapshot. Expected data comes exclusively from
original process captures. The complete run's result hash is
`c2809312d8c03189402215cbc1d8d58b8ca0c1f6a26b5926d409bfa79bbe0738`.


## Defence training and the destroyed-building aim bug

TRAIN8 uses the original shell handoff with chassis 3 and idle player controls.
Its two Landskimmers exposed two integration mistakes. A flyer's zero-altitude
fallback belongs after its formation offset, leaving the second craft at 400
units rather than 5,400. Formation XY uses the leader's full pitch/roll/heading
matrix; the slot's Z offset remains unrotated. Both corrections are reflected
in the analysis scenes for C4_10, TRAIN5 and TRAIN8.

The unmodified process agrees through tick 1,936. On tick 1,937, object 14 loses
its last live component. `Base_FirstLiveComponent` (0x406868) returns -1;
`Ai_AimAndFire` forwards it to `Base_ComponentPosition` (0x406808), which reads
three signed words 14 bytes before the component array. In this capture those
words are `(0, 0, -2571)`, shifting the aim below the building's origin at
`(1021677, 1099730, 39168)`. The resulting differences are 21 turret observations
and one joint-pose observation. No other captured state differs in 2,048 ticks.

`check_structure_aim_bounds.py` reproduces the unchecked read in all four builds
and changes the returned point by changing the bytes before the supplied array.
Its report is [native-structure-aim-bounds.json](../analysis/combat/native-structure-aim-bounds.json).

The reconstruction retains its bounded lookup and aims at the building origin
when no component remains. To verify that this accounts for the discrepancy,
`trace_original_mission.py --safe-component` guards negative component indices
in a separately named original process. It records the caller, index, invalid
point and replacement origin. In the initial 2,048-tick capture, this guard fires exactly once, at tick 1,937;
all 2,049 states then agree. The regression includes the unmodified prefix and
the longer, explicitly labelled guarded run described below. All raw captures are retained.


## Extended defence battle and update ordering

The `training-8-extended` capture runs 6,000 ticks (237.3 simulated seconds)
with idle player controls and the same explicit negative-component guard.
All 6,001 captured states agree, including further structure collapses,
missile flights, targeting, sensors and the complete simulation RNG. It has
not reached an ending dialog at the end of the capture.

Three integration details became visible beyond the shorter run:

- At tick 2,082, a new missile inherits its proximity-warning latch from a
  pool slot previously occupied by bullets and beam tracers. These constructors
  leave the word at object offset `+6` untouched. The C++ pool now retains that
  latch independently of the current projectile type.
  `check_projectile_pool.py` verifies every shipped bullet, beam and rocket
  constructor in all four executable builds, with three distinct prior values.
- At tick 2,151, firing destroys the current building target. The original
  combat think tests completion after locomotion and aiming/fire. Our earlier
  combined decision tested the pre-fire state and delayed retargeting one tick.
  The six steering functions now have a separate post-fire completion step.
  Forty-eight additional native cases per build change target/self damage flags
  at the aim boundary, including standing squad orders.
- At tick 4,358, a deferred powered shot fires during weapon charging. Native
  RNG call sites `0040b4c8` and `0040b4e4` precede the LOS cache reload at
  `00412638` (v1.1 addresses). Returning shot requests until the whole systems
  pass had finished reversed that order. Live systems updates now deliver
  those shots immediately, before locks and visibility. Six temporary LOS
  timer differences across the 6,000 ticks disappear with that correction.

The debugger runner now saves and compiles a private `probe.c` for each new
capture, and hashes that exact source. Editing the working probe during a long
capture can no longer misidentify the binary that produced its evidence.

## Complete cockpit frame captures

The `cockpit-frames-fixed` capture runs the original first-campaign handoff for
129 ticks. It records the complete 640-by-480 indexed buffer and RGB6 palette
after ticks 1, 2, 16, 64 and 128. Inputs are zero, delta is 81, and the original
coarse-clock function returns `1 + floor(completed_ticks * 81 / 32)` from
simulation-clock initialization onward. All loading, simulation, rendering,
widgets and message processing otherwise run in the original process.

The C++ `original_cockpit` regression runs the live SDL compositor through the
same launch inputs and recorded commands. Five idle, twenty-five movement,
forty-two view-change, thirty-three map-control and thirty-two squad-command
samples match all 42,086,400 captured indices and every palette entry, with no masks or
ignored pixels. The fixture comes only from original
captures. `tools/export_cpp_cockpit_frames.py` exports it, and
[cpp-cockpit-frames.json](../analysis/rendering/cpp-cockpit-frames.json) records
executable, probe, preference, frame and fixture hashes.

The full frames revealed errors not caught by isolated layout and raster tests:

- HUD speed/time label gaps use the scaled two-pixel spacing.
- Weapon and turbo capacitor bars use palette 46/32/34, unlike the reactor bar.
- MFD chrome is clipped to the GAU rectangle, excluding its extra last row and
  column.
- Narrowing the message viewport also moves its translated glyph origin six
  pixels to the right.
- The world projection retains the VUE rectangle's right coordinate of 640.
  Clamping it to 639 before texture clipping changes interpolation inside the
  visible image.
- The original buffer has a 1280-byte pitch for 640 visible pixels. Span writes
  into row padding must not wrap into the next visible row.
- Flat-shaded faces use the original palette ramps; Gouraud faces use the
  separate distance-adjusted raster ramps. Both tables were previously merged
  in the C++ scene renderer and its isolated native harness.
- Constructing an animated building creates and seeks its animation threads but
  does not apply them to its pose yet. The original missile tower remains at
  its initial pose until an update steps a thread.

Optional `--draw-window` captures retain the original buffer before and after
each structure draw, along with detail-level and palette-ramp observations.
Raw frame-state captures also preserve camera/context blocks, message state and
animated structure matrices. These observations located the errors without
adjusting the port by visual trial and error. The movement captures below extend
this check; side-view restoration and view transitions are covered below.


### Movement, throttle and vehicle fog

`cockpit-frames-moving` and `cockpit-moving-details` use the same 512-record
movement input stream. Their duplicate frame captures agree byte for byte.
The exported regression combines their 25 distinct sample ticks, including
turns, turret pitch/twist, reverse travel and consecutive throttle changes.

The original coarse clock is sampled inside `Sim_MainTick` when a footstep or
hit starts. At that point the capture's completed-tick count has not advanced.
The C++ host queues the resulting event, so it must preserve the pre-step clock
instead of stamping it after the simulation step returns. This corrected
one-pixel world offsets at the footstep curve boundaries.

The slider's delay is visible in both instructions and captured state.
`Sim_RenderFrame` calls `CockpitView_PerFrameUpdate` at `0x45fc43`, then
`Player_PerFrameCockpitUpdate` at `0x45fcb3`. The former paints the slider; the
latter calls `ThrottleGauge_SetValues`. At frame 1 its drawn rectangle is
`(268,393,296,405)` while its newly set bottom is 412. At frame 2 the drawn bottom
becomes 412 while the pending bottom is 418. Sixteen full captures, ticks 1-8
and 257-264, match the C++ compositor after retaining this update order.

Ground vehicles also revealed a classification error in scene assembly. The
original object's tag at `+4` is 10, although the vehicle remains in the
structure pool. `ObjList_DrawCellObjects` raises only tags 5 and 7 by their aim
or camera node. At tick 511 the supply transport's render entry is therefore
`(2303036,2184729,11776)`, with distance 125438 and fog bias 8192. Giving it the
building tag added 1500 to Z, reduced the distance to 125063 and selected bias 0.
The 95 affected pixels now match. Native scene-harness classification has also
been corrected and its normal/missile fixtures regenerated.

The per-frame diagnostic now saves the throttle gauge and slider blocks.
`--draw-window` records render-entry position, distance and active fog bias in
addition to the before/after image. These observations remain in the analysis
captures; no original rendering code was replaced to obtain the frame oracle.


### Side views and heads-down transitions

The `cockpit-view-presented` original-process run records 42 displayed frames
while entering and leaving both side glances, the tactical map and the damage
page. The probe captures the last `Screen_PresentFrame` call in each simulation
tick. Transition loops can present several intermediate frames; a buffer read
at the next tick entry can instead contain an unpresented viewport change.
The fixture records this capture boundary in its provenance.

These comparisons established the following details:

- Side-view sky bands use the cockpit canvas origin as well as the projection
  centre. Omitting it left narrow strips of the previous view.
- The shield gauge has a zero-sized rectangle at canvas (0,0). The original's
  inclusive visibility check still updates it on the edge of the left glance,
  but not the right glance or heads-down page. Right-view entry also repaints
  its current shield values; startup values are zeroed by the player's update.
- The tactical map fits the mission box without an extra margin, then invokes
  one zoom-in step. Grid offsets multiply the line number by the projected
  span before shifting by four. Rounding the step first accumulates error.
- Map entry has two repaint phases. Later marker refreshes use a strict
  30-coarse-tick deadline. Repainting on every frame moved a convoy marker
  before the original updated it.
- The MAP/damage title has a black backing. XMIT/CANCEL labels use a 54-by-20
  rectangle offset one pixel upward. Hidden magnifier widgets retain their
  previous pixels outside the damage page's drawing area.
- Computer messages are not painted during a view transition. When a message
  expires, its erasure paints a black box after the world draw for that frame.

The capture inputs use ordinary view commands and leave the mission data
unchanged. All captured indices and palette entries match without masks.
Additional captures below cover map controls and squad orders.


### Map keys, warning prompts and button flashes

A further 33 complete frames in `cockpit-map-controls` match the original after
XMIT with no selected pilot, zooming both ways, panning, recentering, and changing
pages. The warning row starts empty. An invalid XMIT request calls
`HddCommandScreen_SetMessageRow` (`0x44dc44`) with six refresh periods remaining;
`HddCommandScreen_BlinkTick` (`0x44d348`) counts those down. The captured SELECT
PILOT label and its background disappear on the same refresh in both programs.

A keyboard press calls `WidgetRoot_FlashPress` (`0x453078`) with a deadline ten
coarse ticks ahead. The flash service follows widget painting, so the pressed
image appears on the following frame. The arrows, magnifiers and XMIT now keep
that order. Mouse presses still follow the pointer's held state.

Keypad 5 only zeroes the pan offsets in `HddCommandScreen_KeyDispatch`
(`0x44cc40`). It does not request a repaint. Forcing an immediate repaint moved
a convoy marker one frame earlier than the original. The next timed map update
now installs the new offsets. Squad-order selection and transmission are
covered by the next comparison.

### Lost-target timing and salvage order

The third training mission exposed two differences that shorter battles had not
reached. `Player_PerFrameCockpitUpdate` at `0x41b130` arms the 4,500-unit
lost-target timer when the selected target changes to none while automatic
turret tracking remains enabled. It decrements that timer after the input pass
and requests centring for the following input pass. Decrementing it inside
steering instead made the turret start returning one frame early. The corrected
run matches all 7,318 snapshots, including the resulting model-node matrices.

`Mission_TotalSalvage` at `0x423e88` walks the HERC pool backwards. The pool's
allocation links prepend new objects, whereas the live-object array records
creation order. The `training-3-list` original capture retains those links.
Supplying the live-object array directly to a reverse walk changed the order
of recovered weapons despite identical damage and salvage totals. The runtime
now supplies pool order. These corrections use the same v1.0 reference addresses
as the instruction fixtures, mapped to the v1.1 executable by the harness.

### Squad orders and radio portraits

The `cockpit-squad-controls` capture adds 32 exact full frames. Its ordinary
keyboard recording selects Jones and Ortega, designates the player as a defend
target, transmits DEFEND POSITION and SCAN FOR HOSTILES, changes pages during
replies, and returns to the forward cockpit while Ortega is talking. Together
with the earlier captures, the fixture compares 137 frames and 42,086,400
palette indices, plus every RGB6 palette component.

The original instructions explain the differences found in this sequence:

- `HddCommandScreen_Update` (`0x44c960`) caches the map between its timed
  refreshes. Pilot/order selection and Tab do not force a map refresh.
- `HddCommandScreen_DrawMap` (`0x44e30c`) draws the chosen unit's outline after
  all markers. Drawing it beside that unit instead allowed other markers to
  cover the outline.
- The selected order keeps its red hotkey. `RefreshOrders` (`0x44ddec`)
  redraws the labels; the next ordinary update erases the old selection outline
  through the previous-order field. A selected row's plate covers its small
  yellow selection bar where they overlap.
- Portraits use `Bitmap_BlitRotatedUnpacked` (`0x481750`) at twice their native
  size, with colour zero transparent. Its integer texture sampling differs from
  repeating each source pixel in a two-by-two block.
- `CockpitView_PerFrameUpdate` (`0x4327ac`) visits the MFD before the HDD. The
  MFD therefore consumes the preceding published portrait or static frame;
  the HDD shows the newly serviced frame. The message port then sees the new
  speech state, matching the caption's start and end.
- During the heads-down slide, the original restores the old caption background
  and redraws the current caption at a fixed screen position. The C++ slide now
  does the same rather than scrolling or hiding the caption.

Every captured pixel and palette entry matches. The final image of each slide
is part of this comparison; intermediate slide presentations are not yet a
separate pixel fixture.

### Reused mission text files

`FileRWStream_Open` does not truncate existing files. The original shell opens
`DATA/MISSION.STR` with flags `0x8102`, writes a length-prefixed resource, and
leaves any older tail in place. For example, the captured flight-training text
occupies 163 bytes of an 866-byte file. DBSIM reads the declared extent, so the
remaining 703 bytes do not belong to that mission's text.

The C++ mission-text reader now accepts that original handoff. It still checks
that the declared resource is present and complete; a shorter physical file is
rejected. The shared string-bank decoder keeps its strict extent check. A
regression writes a short mission over a longer one and verifies both this tail
handling and rejection of a truncated resource.


### Razor training and cockpit regions

The unmodified fourth training handoff now succeeds at tick 3,969 with every
captured simulation field and result byte matching the original process. A
second input recording flies out of bounds and continues through tick 4,000.
The boundary dialog has one Continue button; the diagnostic helper previously
selected a nonexistent second button. The live game window already handled it
correctly. The two recordings add 7,971 snapshots to the regression fixture.

Eight complete Razor cockpit frames, sampled from tick 1 through tick 3,968,
match every index and palette component. These extend the fixture to 145 frames
and 44,544,000 indexed pixels. The checks exposed several rendering details:

- `Gunsight_PaintAltitudeScale` (`0x43dd70`) paints the aircraft and ground
  markers against the terrain maximum plus 5,000 units. The original clips its
  separate tick tape entirely after translating the drawing context; the port
  preserves the visible result.
- `ThrottleSlider_PaintV` (`0x44819c`) mirrors the lever when its track is right
  of the centre. The Razor uses that arrangement.
- Cockpit masks contain both rectangular and per-row span regions. The 2D sky
  path clips polygons to each rectangle before generating their edges. Span
  regions instead clip the resulting rows. Flattening both into one mask
  changed edge rounding and the rightmost visible column. The 3D polygon path
  retains its separately verified region bounds.
- Original startup blits HB1, then HB0, skipping colour zero. A direct
  `Bitmap_Blit` (`0x48159c`) trace in `razor-startup` confirms that sixteen
  transparent pixels along the bottom retain the preceding canopy artwork.
- Ammunition rows keep a separate display accumulator in 256ths of a round.
  The mount's gauge exchange moves it towards the live magazine count; the
  assault comparison below verifies that rolling display against the original.
- Computer messages keep the event's timestamp from inside `Sim_MainTick`,
  before elapsed time is committed. Using the following clock value delayed
  the waypoint message's scroll.

Addresses above refer to the v1.0 Win95 reference and are mapped to v1.1 for
process captures. Fixed timing removes presentation-clock drift from this
comparison. Input recordings enter after native device and trigger-latch
filtering; the C++ diagnostic uses the same boundary. Ordinary input retains
its normal latch handling. These samples cover flight, scenery, messages and
ammunition readouts; they do not establish all battle-effect ordering.


### Assault, escort and reconnaissance training

The fifth training recording now matches all 2,401 simulation snapshots. The
sixth recording reaches the escort failure at tick 5,209, with all 5,210 snapshots
matching. Reconnaissance reaches the player-death ending at tick 4,110, with
all 4,111 snapshots and the result file matching. These comparisons exposed
several integration errors that the isolated
subsystem checks could not catch:

- `Mech_GetViewMounts` (`0x4155c4`) reads the second aiming pair at file offsets
  102 and 104. The in-memory type record has a two-byte prefix; the tower adapter
  previously used 104 and 106 and fired from the wrong muzzle position.
- `Flyer_ComponentDamageWrite` (`0x421bb4`) installs the aircraft velocity pointer
  at `0x4a96e4` only during its component-destruction cascade. Subsequent impact
  sparks must not inherit that velocity.
- Damage during movement can clear a dying HERC's radar. The AI adapter must
  refresh shared fields before publishing the newly installed state, or its
  cached radar setting undoes the destruction update.
- `Flyer_GetSpeed` (`0x421584`) returns its stored forward-speed word scaled by
  1000 in Q10. Both HERC and tower prediction now use that nominal speed for
  flyer targets, independently of the aircraft's current movement velocity.
- The disabled player still runs `Mech_BehaviourInertThink` (`0x41e554`) before
  the separate input pass. Dispatching every player-owned HERC through the
  normal player-state path skipped one deceleration step.

The cockpit comparison also establishes the following ordering:

- Weapon rows paint their saved gauge values before
  `Player_PerFrameCockpitUpdate` exchanges the next values. Selection, readiness,
  charge and displayed ammunition therefore belong to that saved row state.
- `WeaponMount_PushAmmoGaugeState` (`0x40f330`) moves the 32-bit accumulator at
  mount `+0x7d` towards `rounds << 8`, subtracting the integrated rate 250 and
  clamping at the actual count. The display reads `accumulator >> 8`. Both retail
  builds agree on 3,072 additional instruction-level counter updates, including
  zero deltas, rapid consumption and replenishment.
- `ConsoleButton_Paint` (`0x442c88`) uses the DARK font on a lit TRACK button.
- `Mech_AiEnemySighted` (`0x412800`) keeps one report latch per enemy and a shared
  rate limiter. The limiter advances per call-in, including calls that produce
  no announcement. Detection previously emitted an event without connecting
  this radio handler.

All thirteen `training-5-panels` frames now match every pixel and RGB6 palette
entry. Their presentation RNG also agrees. Moving target brackets retain the
previous aim block and use the rebuilt camera-angle matrix. The HUD arrow
requires winding detection; its generated triangle otherwise disappeared.
The last differences were two patches of missing HERC shadows, now connected
to the cell-based ground-shape draw pass. See [ground shapes](GROUND_SHAPES.md).

The reconnaissance comparison also distinguishes death from a disabled HERC.
`Sim_ProcessPlayerInput` (`0x460764`) gates pilot control on object `+0x39`, not
its destroyed byte. `Sim_UpdateDeathCamera` (`0x45f978`) changes input routing
on the following tick: device axes go to the camera, but the pilot still runs
with zero axes and the stored throttle. Later collision can clear that
throttle, which must stay cleared despite held device input. Skipping the
pilot update or continuing to send it live axes gives different wreck motion.

`cpp-original-training.json` records the three additional processes:
11,722 snapshots, 9,531,602 named fields and 52,139,195 values. Together with the
main process fixture, coverage is 55,255 snapshots and 263,933,904 values.
The two result-producing recordings match all `RESULTS.DAT` bytes. They cover
failure and death outcomes; successful assault, escort and reconnaissance
completion remain separate targets for wider coverage.


## Explosion and fire pool captures

The optional `--effect-pools` probe records both pools before the render-phase
flush, retaining raw objects, cell frames, shape radius and pending deletions.
The `training-7-effect-pools` capture contains 3,867 snapshots through lethal
player damage. It matches every previously interpreted gameplay field and all
new explosion/fire fields: owner, position, render class, radius, animation
frame, timer, effect type, fire loop count and pending removal.

The final EXPLOS.DAT type word selects class 8 when nonzero and class 2 when
zero, as `Explosion_Construct` explicitly writes at object offset +4. The C++
code previously used the raw flag as the class; that mapping is corrected.

`original-effects.bin` retains these independent expected values. Together with
`original-missions.bin` and `original-training.bin`, the corpus covers 21 runs
(20 v1.1 and the existing v1.0 prefix), 59,122 snapshots, 40,535,703 field
observations and 279,168,059 values. The new capture repeats a reconnaissance
scenario with more state exposed; it does not add a distinct mission.


## Full recorded-demo processes

The three retail TAP recordings now add 5,801 snapshots, 11,030,867 fields and
93,992,696 values through the live mission window. Their original process
builds its own inputs and uses the tape's variable delta. Live preferences,
KEYJOY and absent joystick hardware are held equal. Ending dialogs are
acknowledged explicitly. DEMO2 has an unchanged prefix and a separately guarded
complete run for the existing negative component-index bug.

Across the fixed-input and recorded-demo fixtures, the retained corpus now has
64,923 snapshots, 51,566,570 field observations and 373,160,755 values. Two
DEMO3 rocket timers deliberately differ from native pointer-derived garbage;
the fixture preserves the original values and verifies the documented safe
values separately. All other observed fields agree. This is 25 capture cases,
including the v1.0 prefix and repeated scenarios with different probe scope.
See [recorded demos](REPLAYS.md#complete-original-demo-comparisons) for the
outcomes, instruction findings and exact exception.


## Long assault through death

A separately planned ordinary input stream drives TRAIN5 through sustained
combat and its final death dialog. The original destroys the player on tick
5,809 and ends on tick 6,055. Both programs write the same 184-byte result file
(SHA-256 `5a82bcc685058ef01d5ea4f98e38855947ad0a99c97bd9ab191df3b0f7ab407e`).
The planner had predicted success before the collision correction; the retained
capture is named for its actual death outcome. Planning is independent of the
native expectations and never supplies expected gameplay values.

This run exposed the live building collision state and distinct AI probe
filters described in [hit detection](HIT_DETECTION.md#live-destruction-changes-collision-eligibility).
It also showed that the cockpit republishes its retained target after the
player's destruction clears the HERC's target field.

The unchanged original agrees through tick 5,923. On tick 5,924 it reaches the
already documented destroyed-building component under-read: component -1 reads
local `(0, 0, -2571)` before the array. Sixteen turret observations on ticks
5,924-5,939 consequently differ; every other interpreted field agrees throughout
the complete run, and the turret state converges again on tick 5,940.

`training-5-assault-death-guarded` repeats the same input stream with only that
invalid lookup replaced by the building origin. The guard logs calls on ticks
5,869 and 5,924; the earlier call produces no observable difference in captured
state. All 6,056 snapshots match. The regression keeps both the unchanged
5,924-snapshot prefix and the complete guarded run, totaling 11,980 snapshots,
12,244,101 named fields and 62,892,401 values in `original-outcomes.bin`.

The current combined totals are listed in the coverage table above. Two
documented DEMO3 rocket timers remain explicit safe departures. The guarded
assault agrees in all fields and preserves the original result file. Reports:
[unchanged assault](../analysis/combat/cpp-training-5-assault-death.json),
[guarded assault](../analysis/combat/cpp-training-5-assault-death-guarded.json),
[fixture provenance](../analysis/combat/cpp-original-outcomes.json).


### Assault success and actual debrief records

The fifth training mission now has a complete successful run as well. The
original VSHELL creates its handoff with the normal training invulnerability
option enabled. Ordinary movement, targeting and firing inputs were planned
separately, then replayed unchanged by the original v1.1 simulator. Both runs
reach success on tick 7,317 and write the same 212-byte RESULTS.DAT:
`bb22c96a840d9e3cd8f56eb8b580fc2528adfafdfdc766517026df855ab41a01`.

The unmodified original differs only while actor 8 briefly aims at two destroyed
buildings. Its turret and posed nodes differ at ticks 2,767-2,794 and 6,792-6,809:
78 field observations in total. Both calls pass component -1 to the existing
out-of-bounds position getter and read local Z=-2571 before the component array.
Every other captured field agrees, including RNG, damage, projectiles and all
effect pools. The separately labelled guarded original run matches all 7,318
snapshots. It also observes invalid reads at 5,595 and 5,629 that produce no
captured state difference. No original result values are replaced in the fixture.
The unmodified regression prefix ends at tick 2,766; the guarded run is retained
in full. The outcome fixture now contains four cases and 22,065 snapshots.

`tools/export_played_debriefs.py` carries the actual result files and mission
flags from eleven completed original battles into the original shell. It recreates
and checks each launch handoff first, then captures the complete post-battle save
and shell RNG. These cases cover four initial training victories, assault death,
protected assault success, escort failure, reconnaissance death, defence death and
campaign C5_04 disablement and the opening campaign patrol victory. C++ produces
identical saves and RNG in every case. File transport and shell presentation are
harness boundaries. The older 100-mission shell journeys retain their separate
scope: their outcomes are supplied rather than played battles.

The retained reports are `analysis/combat/cpp-training-5-protected.json`,
`analysis/combat/cpp-training-5-protected-guarded.json` and
`analysis/campaign/native-played-debriefs.json`. Together with the earlier cases,
the regression corpus contains 30 captures, 94,906 snapshots, 83,568,542 fields
and 532,716,112 observed values. The two original DEMO3 timer defects and the
explicit bounds guards remain documented separately.


### Complete defence outcome and aircraft destruction

`training-8-complete-guarded` replays ordinary radar, targeting, weapon-change,
movement and firing inputs through the death dialog on tick 7,917. It uses the
same explicit negative building-component guard established by the earlier
unmodified TRAIN8 capture. All 7,918 snapshots and the 112-byte RESULTS.DAT
match after two integration corrections:

- `Flyer_ComponentDamageWrite` (`00421bb4` in v1.0) installs the dead behaviour
  during the damage call. Our aircraft adapter had waited for its next tick.
  This changed the descriptor and its counters on the destruction tick only.
  Death now also clears emissions and stops a latched flyby sound immediately.
- The headless input adapter accepted R after the death camera opened. The
  original disables its cockpit widget handler outside; W and nearest-target
  remain global commands. The interactive C++ window already had this gate.

`tools/check_flyer_death.py` independently checks 48 destruction cases in each
of the four executable families, including the ordered reporting, defeat action,
behaviour installation and sound stop. Its component-damage answer and external
effect/report sinks are explicit boundaries. The complete defence capture
separately exercises the joined game. Expected values come from original memory.

The 34,231,759-byte `original-defence.bin` adds 9,233,367 named field observations
and 43,375,858 integer values. Its result hash is
`a55c6f18dcc27bc5b23fb6365359cb33e06f6881548d3d4086f9561693902648`.
The original shell also consumes these results in the ninth played-debrief case.
Reports: [whole-process comparison](../analysis/combat/cpp-training-8-complete-guarded.json),
[fixture provenance](../analysis/combat/cpp-original-defence.json),
[death endpoint](../analysis/combat/native-flyer-death.json).


## Later campaign openings

`tools/prepare_campaign_trace.py` advances the original shell through the career
with supplied successful results, then exports C2_10, C4_10 and C5_10. The earlier
battles were not played. Each new original simulator process receives a retained
1,536-packet control stream. These checks cover the mission openings, not their
complete objectives or a complete played campaign.

The captures exposed two integration differences:

- Animated structures also use the shared `Base_GetAimNodeTransform` getter.
  C2_10's radar mast at (385058, 368678, 13056) tests a transport with aim height
  1000. Both ray endpoints receive that height, giving source Z 14056. The port
  incorrectly used the mast's own 1500 because it had animation threads.
  `tools/check_structure_sight.py` now checks all five class vtables against
  all 65 authored aim heights in each of four builds, 325 cases per build.
- The original initializes both message-history values to -1. C4_10 and C5_10
  start on the strict mission-box boundary. Starting the history at zero made
  the port raise a modal boundary warning at tick 129. Native timer/history
  capture confirms the original repeatedly posts the spoken warning without
  raising that panel. The port now uses the original initialization.

C2_10 also reaches the existing negative building-component read: the probe
records component -1 with local coordinates (0, 0, -2571) at ticks 891 and 1535.
The unmodified regression ends at tick 890; the separately labelled guarded run
checks every tick through 1536. The guard returns the building origin only for
that invalid lookup. The other two executables run unchanged.

The new fixture adds 5,502 snapshots, 6,989,972 fields and 43,247,838 values.
All 34 process cases together cover 100,408 snapshots, 90,558,514 fields and
575,963,950 values. Reports retain the original discrepancies as well as the
corrected comparisons.

Thirteen additional complete cockpit frames match all indices and palette
entries, bringing that corpus to 187 frames and 57,446,400 pixels. Two more
frames, both at tick 128, show the already documented native full-queue message
corruption. They remain recorded as deliberate departures, outside the exact
fixture. No image uses a pixel mask. See
[frame provenance](../analysis/rendering/cpp-late-campaign-frames.json) and
[queue evidence](../analysis/rendering/cpp-late-campaign-message-departures.json).


## Lunar base deployment through campaign debrief

`campaign-c5_04-deployment` starts from the original shell's C5_04 handoff.
`prepare_campaign_trace.py` reaches it after 43 supplied successful outcomes.
Those earlier battles are setup, not additional played-game evidence. The handoff
retains 61 live actors and 12 groups. A separately generated control plan supplies
ordinary route inputs; expected state comes only from the original process.

The unmodified simulator activates enemy groups 1 and 5 on ticks 612 and 1,238.
Group 8, the approached base, activates on tick 1,154. Three other waiting bases
are not reached. The player is disabled on tick 3,349. All 3,350 snapshots,
6,232,881 fields and 48,224,053 values match C++. Both programs write the same
80 result bytes, SHA-256
`d3758102441d33113f4ac4671f92eb71d3bb327a030e4c3fe50ff33483a103f3`.
No negative-component guard or other gameplay patch is needed for this run.

Frames 600, 1,153, 1,154 and 2,500 match in full, including their palettes.
These bring the exact cockpit corpus to 191 frames and 58,675,200 pixels. The
overall gameplay corpus now contains 35 cases, 103,758 snapshots, 96,791,395
fields and 624,188,003 values.

The played-debrief capture recreates the same prior shell progression, checks
each supplied result hash, and verifies the final launch handoff before applying
the actual C5_04 result and mission flags. Its complete saved state and RNG match
C++, including 44 recorded player missions. This is the tenth played-debrief
case and the first in campaign mode. `ES2POST2` therefore records that mode in
each fixture case; the earlier nine training cases still compare unchanged.

Reports: [gameplay comparison](../analysis/combat/cpp-campaign-c5_04-deployment.json),
[fixture provenance](../analysis/combat/cpp-original-deployment.json),
[full frames](../analysis/rendering/cpp-deployment-frames.json),
[debriefs](../analysis/campaign/native-played-debriefs.json).

## Sanitizer coverage

The retained AddressSanitizer and UndefinedBehaviorSanitizer runs cover nine
complete gameplay fixtures, 203 exact cockpit frames, twelve played-debrief
cases and both positional-sound comparisons, with leak detection enabled.
These are selected integration checks recorded over several revisions, not a
sanitizer run of the whole suite. Original-demo playback was not included.
The latest checks cover the continued campaign, sound-enabled patrol and silent
death camera. Two frame checks exceeded their release-speed CTest limits; direct
reruns completed with the same instrumented binaries. The retained
[report](../analysis/verification/cpp-sanitizers.json) records build flags,
revisions, binary hashes, boundaries and both attempts.


## Opening campaign patrol through victory

The initial career's three available squadmates join the player through the
original shell's squad assignment and mission export. No earlier battle results
are supplied. A separate route-following plan supplies ordinary controls; the
player does not fire or use invulnerability. Expected states come from the
original simulator, which reaches success on tick 10,417 with all four squad
members alive. The player reaches the final waypoint before the mission succeeds; the squad
is still engaged during the intervening ticks.

All 10,418 snapshots, 17,920,495 named fields and 149,729,811 integer values match
C++. The complete 308-byte RESULTS.DAT also matches, SHA-256
`5ef2c605997e7c50da2809ea65b5f561e1a5cde68e0ba9bbd1190580c1170555`.
The original uses no component-lookup guard or gameplay patch in this capture.
Frames 1,000, 3,100, 6,000 and 10,400 match every pixel and palette entry.

Returning these actual results and final flags to the original shell produces
an identical 4,698-byte C++ save and RNG state. The save hash is
`eddb9762ea4be74f413d1c071374c271481bd2a718e255c7423be27aecf54654`.
This is the eleventh actual-battle debrief fixture. The earlier 100-mission shell
journeys remain separate checks with supplied battle outcomes.

The combined corpus now covers 36 process cases, 114,176 snapshots,
114,711,890 named fields and 773,917,814 integer values. The 195 exact full-frame
comparisons cover 59,904,000 pixels, alongside two separately documented
message-queue departures. Both new patrol checks and the updated eleven-outcome
debrief check pass. Together with the preceding passes, all 159 configured
checks have passed. No gameplay changes were needed for the patrol.

Reports: [whole-process comparison](../analysis/combat/cpp-campaign-1-squad-success.json),
[fixture provenance](../analysis/combat/cpp-original-patrol.json),
[full frames](../analysis/rendering/cpp-patrol-frames.json) and
[debriefs](../analysis/campaign/native-played-debriefs.json).


## Two consecutive campaign battles

`campaign-2-carried` starts C1_02 by returning the actual C1_01 patrol result
and flags to the original shell, accepting its debrief and launching the next
mission with the same four-member squad. The saved handoff and preceding result
hashes are checked. No earlier success, ammunition use or damage is invented.
The retained squad records happen to start this mission with the same ammunition
and condition values as the first launch.

The unchanged original reaches the known negative building-component lookup
on tick 4,174. Its local component coordinates come from bytes before the array,
so its later aiming and battle outcome cannot be used as an oracle for the
port's documented bounds repair. The regression retains that unchanged prefix
through tick 4,173 and a separately labelled guarded original process. The guard
only substitutes the building origin for that invalid component lookup.

The guarded mission reaches failure alert 6 on tick 11,533. The two fixtures
compare 15,708 snapshots, 28,072,959 named fields and 227,100,324 integer values.
The complete guarded capture also writes the same 300 result bytes, SHA-256
`28c4367dbae1e2efd33a45f4136987499ec7ef7de5567c0cdd7bac5ac297ce28`.
Frames 1,000, 4,000, 8,000 and 11,000 match in full, including their palettes.
Returning that result and the final flags to the original shell produces the
same 4,716-byte save and RNG state as C++, with two recorded player missions.
The save SHA-256 is
`ed2690cd17b082a20e89ce13247aa13f1a25553da3ac340c1ad9e14be1196c2b`.

This exposed an integration error in contact damage. The walking controller
calculated collisions at the attempted step position, but damage still read
the actor's preceding position. Five shield observations therefore selected
the wrong front/rear side. The original walking routine writes the trial pose
before invoking contact response. C++ now publishes that pose at the same
boundary and refreshes the damage position before applying the blast. The
walking caller publishes the final pose again after any rejected-step rollback.
The correction removes all five differences without changing the observations.

At that checkpoint the gameplay corpus contained 38 cases, 129,884 snapshots, 142,784,849 named
fields and 1,001,018,138 integer values. This includes 33 fixed-input v1.1 cases,
one v1.0 prefix and four recorded-demo cases. Twelve actual battle debriefs
compare complete saves and RNG; these remain separate from the broader shell
journeys that supply synthetic battle outcomes.

Reports: [fixture provenance](../analysis/combat/cpp-original-campaign-continuation.json),
[pre-fix shield differences](../analysis/combat/cpp-campaign-2-carried-guarded.json),
[full frames](../analysis/rendering/cpp-campaign-continuation-frames.json) and
[played debriefs](../analysis/campaign/native-played-debriefs.json).


## Sound-enabled campaign patrol

`original_sound_patrol` replays 10,416 ticks of the same four-member opening
patrol with sound enabled in the original process. It stops one tick before the
already verified victory dialog. All 5,612 positional calls match their order,
IDs, source positions, listener transforms and transformed points. Four complete
frames and palettes at ticks 1,000, 3,100, 6,000 and 10,400 match exactly, along
with the full presentation RNG at those boundaries. This adds four independent
sound-enabled frame observations, bringing the complete-frame total to 203
and 62,361,600 indexed pixels. The two message-queue departures remain separate.

Three adapter errors emerged from this longer capture and the existing silent
regressions:

- Explosion table sound indices start after the catalogue's ten music slots.
  The original constructor adds ten at v1.1 `0x4080c5`, then consumes its existing
  bounded-50 presentation RNG draw before calling positional playback. The port
  omitted that offset, requesting an explosion instead of the ricochet at the
  first observed mismatch.
- A missing original sound device bypasses sound-variation RNG. Category mute
  does not. Both retail entrypoints confirm this distinction. The port now
  skips catalogue playback when no device exists, retaining the explosion
  constructor's separate RNG draw. This also preserves the original `-s`
  death-camera frames.
- Footstep range checks use the camera position retained by the preceding view
  update, including the chassis eye offset. Recomputing the current animated
  joint position admitted a neighbouring HERC one tick early at the 15,000-unit
  threshold. The movement adapter now receives the same saved camera position
  used by other simulation consumers.

The fixture stores every observed call and both original/world transforms.
Its test supplies the final sample-output boundary without playing PCM, and
reports no voices still playing. It checks the game-facing requests and selected
render/RNG results; it does not compare HMI mixing, voice duration or resampling.
The separate 68-event view-changing fixture still checks the documented repair
for the heads-down map leaking its camera into sound placement.


## Continued campaign: recovery and the Razor loan

The four-mission sequence now carries the actual C1_01 success, C1_02 failure,
C1_03 success and C1_04 success through the original shell. C1_03 finishes on
tick 5,209; C1_04 finishes on tick 3,969. The last two captures use no gameplay
guard. Their 9,180 states and six full cockpit frames match C++, as do both
complete result files, debrief saves and final RNG states.

The C1_04 Razor is initially unarmed. Before launching it, the original fitting
routine installs the two earned plasma cannons in slots 4 and 5, matching
`ARM_RAZR.DAT` socket ids 6 and 7. The original launch guards accept the result.
Both fitting operations also have full-save C++ comparisons. This preserves the
actual inventory rather than substituting the training loadout.

The first diagnostic launch accidentally omitted that fitting step. The normal
shell would have rejected it. With that check bypassed, the original attempted
to paint the weapon console before any weapon gauge had loaded `PWEAPONS` and
faulted at v1.1 `00442cf8`, before tick zero. That attempt is explicitly excluded
in `campaign-4-razor-recon/excluded.json`. Its log is retained losslessly; no
production workaround was introduced for it.

Reproduction:

```sh
PYTHONPATH=tools .venv/bin/python tools/prepare_played_campaign_trace.py \
  --prior campaign-1-squad-success campaign-2-carried-guarded campaign-3-after-loss \
  --name campaign-c1_04-armed --fit 4 25 --fit 5 25
PYTHONPATH=tools .venv/bin/python tools/plan_mission_trace.py \
  --handoff analysis/missions/captured/campaign-c1_04-armed \
  --name campaign-4-armed-razor-recon --ticks 14000 --recon
PYTHONPATH=tools .venv/bin/python tools/trace_original_mission.py \
  --version cd_v1_1_1997_09_win95_e --name campaign-4-armed-razor-recon \
  --handoff analysis/missions/captured/campaign-c1_04-armed \
  --inputs analysis/reference/control-plans/campaign-4-armed-razor-recon/controls.bin \
  --ticks 3969 --fixed-clock --effect-pools --presented-frames \
  --capture-frames 1000 2000 3900 --accept-alert
```

`export_cpp_mission_traces.py` and `export_cpp_cockpit_frames.py` accept named
captures through `--capture`, with a separate `--fixture` output name. The
reconnaissance planner generates ordinary inputs; all expectations come from
the independently captured original. The new reports are
[states](../analysis/combat/cpp-original-campaign-recovery.json),
[frames](../analysis/rendering/cpp-campaign-recovery-frames.json),
[weapon fits](../analysis/campaign/native-played-loadouts.json) and
[debriefs](../analysis/campaign/native-played-debriefs.json).

Current totals are 40 cases, 139,064 snapshots, 150,880,588 named fields and
1,051,040,653 integer values. There are 209 complete exact frames and fourteen
actual battle debriefs. The first four campaign missions now have one consecutive
played history; other branches and player choices remain open to further checks.


## Rescue victory and difficult nighttime escort

The actual campaign now reaches C1_05 through five consecutive played battles.
Its rescue succeeds on tick 6,697 with the original pilot and armed Razor intact.
All 6,698 snapshots, 11,057,749 fields and 91,626,018 values agree, along with
the complete 80-byte result and the subsequent 4,766-byte shell save and RNG.
Frames 1,200, 4,000 and 6,600 match every index and palette entry. The original
needs no gameplay guard for this capture.

A separate practice escort uses the Ogre, difficulty 3, night conditions and
the original AI squadmate. It ends in player death on tick 3,421. Its 3,422
snapshots, 2,795,191 fields, 15,144,678 values, 156 result bytes and complete
debrief save match. The three frames at ticks 300, 1,600 and 3,300 also match
without masks or an original-code guard.

The crew fixture now retains a legal switch from the loaned Razor to the
existing Outlaw using the original crew-screen assignment routine. Both saves
around the change agree with C++. The earlier two earned plasma-cannon fits
remain in the same fixture. Only the crew-label refresh is a supplied boundary.

These additions bring the retained process corpus to 42 cases and 149,184
snapshots, with 215 exact complete frames and sixteen actual-battle debriefs.
This includes prefixes and repeated missions under different conditions.

Reports: [rescue states](../analysis/combat/cpp-original-campaign-rescue.json),
[rescue frames](../analysis/rendering/cpp-campaign-rescue-frames.json),
[night escort states](../analysis/combat/cpp-original-hard-night-escort.json),
[night escort frames](../analysis/rendering/cpp-hard-night-escort-frames.json),
[debriefs](../analysis/campaign/native-played-debriefs.json).

The trace exporter now scans large original captures twice instead of retaining
all decoded snapshots in memory. Field ordering, observation counts and stored
values are unchanged. Raw captures are losslessly compressed only after their
decompressed SHA-256 is checked.


## Broader campaign and difficulty verification

Five further captures extend the earlier 40-case corpus: C1_05 rescue, hard
nighttime Ogre escort, C1_08 through disablement, C1_06 through an incomplete
return and C5_10 through player death. All captured states and result bytes
agree; fourteen additional full images match every indexed pixel and palette
entry. The debrief fixture now contains nineteen actual battle outcomes.

The complete C1_06 comparison exposed an interrupted pivot-stop rate error. The
finale exposed incorrect Arachnitron blast exclusion, attacker identity and
publication of its limbo position. The disabled C1_08 cockpit exposed a missing
offline gauge branch. Each correction follows the original instructions;
[the detailed report](BROADER_GAMEPLAY_VERIFICATION.md) gives the first differing
ticks, addresses, fixture boundaries and remaining useful coverage.
