# Recorded demos and input tapes

The main menu's View Demo uses three input recordings, not movies. Open
[the replay browser](../analysis/replays/index.html) to inspect their controls,
extract their bundled starting files, or view their missions with the recorded
squad. The nine copies on the three retail media sets reduce to three identical
payloads. Neither retail revision replaced these recordings.

## Which missions were recorded

| Tape | Campaign mission | Squad size | Input records | Simulation records through the closing panel's opening | Simulated seconds |
|---|---|---:|---:|---:|---:|
| DEMO1 | C2_05 | 1 | 1499 | 1016 | 133.9536 |
| DEMO2 | C3_10 | 4 | 1901 | 1588 | 244.5493 |
| DEMO3 | C5_02 | 1 | 3660 | 3350 | 384.2183 |

The mission identification compares the actual compiled tables. Points,
headings, routes, areas, actions and timers match these missions exactly.
Other mission candidates score far below them. The recorded difficulty is 3.

The complete compiled files are not identical to our controlled seed-0
previews. Those previews differ in random choices and previous results, and
some recorded equipment differs from the supplied mission sources. For example,
DEMO3's type-10 actor carries weapons `23, 0, 0`; the two type-10 templates in
retail C5_02 carry `3, 3, 6` and `23, 23, 10`. DEMO1 also retains the nonzero
C2_05 group word changed in v1.1. The browser preserves the recording itself
rather than recompiling it with current defaults.

All three `restore.dat` files name `msn\s2_rad01.MSN` and its English text.
That name cannot identify these three different missions. Each SCRIPT.DAT is
13,520 bytes long, with respectively 3,966, 5,808 and 4,410 unused trailing
bytes after its tables. Both are examples of retained state in the original
file workflow. Full files and parser boundaries remain available.

## Bundle and frame layout

A TAP begins with seven unsigned 32-bit lengths and their file contents, in
this order: `script.dat`, `player.mec`, `mission.var`, `prefs.cfg`, `restore.dat`,
`object.str`, `keyjoy.cfg`. Then come eight joystick capability bytes and a
stream of records. The three capability blocks are `01 00 04 00 00 01 10 00`.

| Frame offset | Field |
|---|---|
| 0 | Signed 16-bit command word, including release events |
| 2 | Four signed 16-bit axes |
| 10 | Signed 16-bit simulation delta, in 125/256 milliseconds |
| 12 | Four button bits followed by north/south/west/east hat bits |
| 13 | Eight raw joystick button bits |
| 14 | Trigger in bit 0 |
| 15 | Zero in the retail tapes |
| 16 | Unsigned 32-bit mouse-event count |
| 20 | Unsigned 32-bit queued-command count |
| 24 | Mouse records, then command words |

Each mouse record is 14 bytes: signed 32-bit X/Y, unsigned 16-bit buttons and
signed 32-bit timestamp. Queued commands are signed 16-bit values. The bounded
reader consumes every file exactly and writes it back byte for byte.

The tape does not include input-block pointer coordinates or buttons 5-8.
Those remain zero on playback. It does include mouse events for cockpit widgets.

## Original-code validation

`tools/check_replay_inputs.py` executes the complete original
`Input_BuildPlayerDevice` (`0045a7f4` in Win95 v1.0). File reads, live-device
polling and outgoing UI dispatch are supplied by the harness. The unpacking,
command masking, axis post-processing and latches execute unchanged.

All 7,060 records match in Win95 1.0, Win95 1.1, Win32s 1.1 and the April demo.
The checks compare the complete 48-byte input block, every queued command and
every mouse event. Each build also passes 1,024 synthetic button/hat, reverse
steering and latch cases, five live-abort cases, and end-of-file restoration.
Reports are in `analysis/replays/native-inputs.json`.

The playback latch defect is confirmed: if the first button's latch and stored
value are both set, body steering and throttle remain zero. Playback skips the
live-input loop that would release the latch. Reverse steering still applies
after playback and comes from the live `Backturn` option. Demo abort and Ctrl+E
read the live command, not the command recorded in the tape.

## Timing and comparison limits

Modal panels consume records too. Their repeated delta does not advance the
mission. The table above uses the closing-panel boundaries established in the
original input/modal-loop analysis; adding every record's delta would inflate
the duration. The recorded simulation rate is only about 6.5 to 8.7 updates per
second, and long updates reach the 450-unit clamp. The browser plots records,
not a continuously advancing mission clock.

Original playback also uses seven preferences from the live install and reads
its live KEYJOY.CFG, despite unpacking a copy from the tape. Hardware capability
queries can overwrite the recorded joystick capabilities. Mission text is not
bundled. These dependencies and the latch defect prevent treating a TAP as a
self-contained deterministic save state. The controlled full-process comparisons below retain those dependencies
explicitly and now compare the resulting mission trajectories.

The format, panel boundaries and playback pitfalls were already described in
[Herculan's retail notes](../reference_sources/README.md). Our extraction adds
identification against the supplied mission tables, recorded starting scenes,
and the cross-build native input checks.

## C++ input implementation

The C++ TAP reader preserves all seven bundled files, capabilities, input records,
mouse events and queued commands. The three tapes round-trip byte for byte.
`tools/export_cpp_input.py` captures 8,084 original v1.1 device blocks: all 7,060
recorded inputs and 1,024 synthetic backturn/latch cases. The C++ decoding matches
every block. Live abort and EOF handling have separate checks. The C++ main menu now runs
the tapes through the joined simulator, and `--demo FILE` selects one directly.
Starting files stay in memory, so replay cannot overwrite the current campaign.
The shell restores live preferences on return.


## Joined playback and modal focus

The shared playback cursor now reaches mission commands, cockpit mouse events,
button actions and the modal panels. Only simulation records advance world time.
The main command executes after group updates, before player movement/firing;
the queued commands and mouse events execute earlier in the input builder.
Seven live preferences and live KEYJOY behavior remain deliberate dependencies.

`tools/check_replay_panel_focus.py` executes original AlertPanel_SetFocus at
00454c7c. Its 36 checks establish that only focus -1 with a pointer device reads
another input record. AlertPanel_Enter calls that path before registering the
new widget root; the modal loop then explicitly focuses button 0. Tab, joystick
focus changes and explicit button focus do not each consume another record.
The report is `analysis/replays/native-panel-focus.json`.

C++ checks cover every recorded packet and use DEMO1's actual closing-panel
clicks in an SDL dialog. Separate cases exercise nested preferences/controls,
EOF and live abort. `tools/check_cpp_demos.py` verifies two actual menu launches,
unchanged menu pixels after return, and unchanged preferences, KEYJOY and saved
campaign sentinel files. Captures are in `analysis/cpp/live-demos`.

The recordings also exposed a C++ laser-raster validation bug: fullbright affine
draws were incorrectly required to supply a shading table. A complete beam-draw
regression covers the fix, alongside the original ribbon and raster comparisons.

## Complete original demo comparisons

The three shipped tapes now run through the live C++ mission path against
complete v1.1 DBSIM captures. The original loads each tape itself; this probe
supplies neither gameplay inputs nor a fixed simulation delta. The live
preferences and KEYJOY file are retained, and both sides have no joystick.
Ending dialogs are acknowledged with Tab/Enter so an earlier death cannot
leave playback waiting for a recorded click intended for a later screen.

| Tape | Simulation ticks | Records consumed | Time units | Ending |
|---|---:|---:|---:|---|
| DEMO1 | 921 | 952 | 240941 | Player death, status 2 |
| DEMO2, component guard | 857 | 889 | 262068 | Player death, status 2 |
| DEMO3 | 3350 | 3660 | 786879 | Q mission exit, status 4 |

Time units are 125/256 milliseconds and include simulation updates only.
These are controlled retail-playback outcomes. The historical panel positions
in the tape analysis describe the recording, whose first two battles outlast
these retail playbacks. They are not interchangeable with these measured runs.

DEMO2 reaches the known destroyed-building component-index bug on tick 670.
Its unmodified regression stops at tick 669. A separate original capture bounds
that one read and continues to death at tick 857. The guard also fires on ticks
701, 717, 762 and 857; all other simulation instructions remain unchanged.
DEMO1 and DEMO3 need no component guard.

`original_demos` retains 5,801 snapshots, 11,030,867 field observations and
93,992,696 values across the three complete runs and DEMO2's unmodified prefix.
Actor order, positions, flight state, AI, components, shields, weapon state,
sensors, projectile/debris/explosion/fire pools, flags, input packets and RNG
agree except for two explicitly recorded timer departures described below.
The fixture retains the original values and checks each permitted replacement;
it does not omit those fields or accept arbitrary differences.

The first-divergence traces established several missing connections:

- Shield allocation buttons latch until the cockpit update, after recharge.
  Front takes priority when both directions are pending.
- Releasing an owner's fire marks its entries for the draw-phase deletion
  pass. Moon-filtered fire also occupies a pending slot until that pass.
- A direct hit on an already dead flyer creates literal explosion type 10,
  rather than entry 10 in the projectile's effect table. The impact fixture now
  uses non-identity effect tables, which expose that distinction.
- Combat steering reads a gun tower's turret direction through the same
  virtual getter used for a HERC's torso. The geometry fixture now includes
  the real building getter.
- Pending cockpit views affect target validation before drawing. Camera input
  ownership changes after the current player-input update. Applying Tab or a
  view transition early diverted one frame of Razor steering.
- Q can end the mission, but `Sim_PollPlayerInput` still finishes the current
  control update before returning that decision. The dispatcher stores the
  decision at `0x460799` and returns it at `0x460f96`.

### Pointer-derived rocket animation timer

At DEMO3 tick 2,959, two new rockets inherit timer 246 from recycled homing
bullet slots. Rocket timer `+0x5d` overlaps the upper half of the bullet target
pointer at `+0x5b`. The preceding bullets point to `0x00f6a539`, and the rocket
constructor never initializes this timer. All four executable families reproduce
that alias in 120 bullet-to-rocket constructor combinations per build.

The C++ pool initializes a rocket's timer to zero after a non-rocket occupant.
It retains a previous rocket's timer and the separately established warning
latch. This avoids an animation delay determined by native heap addresses.
The regression records both original 246 values and requires zero in C++.
The next update expires both timers and all later observations agree. This
particular recording therefore shows no later simulation divergence from the fix.

The capture report is `analysis/replays/cpp-original-demos.json`; raw captures
are under `analysis/reference/tick-traces/cd_v1_1_1997_09_win95_e/demo*-*playback`.
`demo_trace`, `compare_demo_traces.py` and `export_cpp_demo_traces.py` reproduce
the comparison. `demo_trace_departures.py` identifies the permitted alias from
its actual previous pool occupant and target pointer, rather than allowing a
particular number at an arbitrary tick. The constructor evidence is retained
in `analysis/combat/native-projectile-pool.json`.
