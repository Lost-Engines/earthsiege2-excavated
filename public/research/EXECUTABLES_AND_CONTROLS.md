# Executables, development clues and controls

The [executable browser](../analysis/executables/index.html) exposes original C++
class metadata, inheritance, source-file strings and imports for each supplied
binary. The machine-readable [PE survey](../analysis/executables/survey.json)
records hashes, section layouts, imports and retained development strings.

## Build and runtime

The main programs are 32-bit x86 Windows PE executables. The Windows 3.1 edition
also uses 32-bit code through Win32s, with WinG presentation in place of the
Windows 95 build's DirectDraw path. The programs contain the banner
`Borland C++ - Copyright 1995 Borland Intl.` and import `cw3220.DLL`, including C
runtime functions and Borland exception support. The linker header reports 2.25
in the principal Win95 programs. Those fields identify the toolchain family;
they do not establish a complete original compiler command line or project file.
PE timestamps are retained as raw evidence, rather than used to date releases.

This is demonstrably C++. The simulator has 251 distinct class descriptors and
four plain-struct descriptors; the shell has 122 classes and five structs.
Examples include `MECH`, `ACTOR`, `ROCKET`, `HeightGrid`, `TSContext`,
`ObjPool<MECH>`, `ARRAY<GUN_STATE *>` and the shell's `EventHandler`.
Vtables, multiple inheritance, member destruction lists and template instances
remain visible. Borland exception imports and local-array construction are also
used by code exercised in our harness. The containers observed here are named
custom templates; there is no basis for describing them as the modern C++ STL.

The shared runtime includes 3Space model/rendering classes, palette and bitmap
libraries, streams, volume mounting and a custom memory pool. Assertions retain
paths such as `src32\GL_FONT.CPP`, `src\volrstrm.cpp`, `d:\include\ptrarray.h`,
`WORLD.CPP`, `APPINPUT.CPP`, `rocket.cpp` and `mechsys.cpp`. These expose source
module boundaries without supplying the source itself.

The Win95 simulator imports Win32, GDI, DirectDraw, WinMM and Video for Windows.
Both game programs resolve HMI SOS entry points by name through `LoadLibrary` /
`GetProcAddress`; the strings include `sos9503.dll`, `sos32s03.dll`, digital-sample
controls and MIDI functions. A middleware API name alone does not establish that
ES2 uses every supported feature. The supplied game's observed sound and CD
paths are described in [audio and video](AUDIO_AND_VIDEO.md).

## Reading the class records

`tools/borland_types.py` scans packed records, validates their flags and follows
all base/member links. Each record provides a name, object size, vtable-pointer
offset, class flags and relative offsets to its lists. Destructor-bearing
records place the name at `+0x30`; other class names start at `+0x20`.

Two details matter when interpreting these lists:

- Base-class entries are twelve bytes: descriptor pointer, subobject offset and
  inheritance flags. The virtual-base lists in these builds are empty.
- Destructible-member entries are **eight** bytes: descriptor pointer and member
  offset, followed by a zero pointer terminator. They are not base-class entries.
  A member can name a fixed-array descriptor: `PLAYER_GUNLIST`, for example,
  contains `ARRAY<short>[3]`, and `TSTransformState` contains `TSContext[10]`.
  The array descriptor supplies the element type and element count; the decoded
  element sizes agree with its total size.

The pinned Herculan notes provided the initial layout leads. Our scan extends
the class/member coverage and corrects the member-list stride for these files.
All linked descriptors resolve in every supplied simulator and shell family.
Vtable candidates are reported with their evidence, without guessing a table's
length from whatever address happens to follow it.

## Launcher and process flow

`ES.EXE` supervises the two large programs. `VSHELL.EXE` handles menus, pilot
careers, briefing, armory and debriefing. It writes the mission handoff and exits
with code 2. The launcher then runs `DBSIM.EXE`. A completed mission returns 3,
which brings the shell back for debriefing. Code 5 starts a recorded demo and
code 6 returns from it. Code 0 quits.

The normal launcher supplies the private `-eggplant` token to both children.
Starting `DBSIM` directly still requires the files under `DATA`, especially the
compiled mission and player squad. The comparison installs preserve those files;
our original-run capture tools use an isolated Wine prefix and display.

Useful launcher options, with exact case:

| `ES.EXE` option | Purpose |
| --- | --- |
| `-s` | Toggle sound off/on for both children |
| `-a` | Toggle shell movies off/on |
| `-L` | Pass low-memory mode to the simulator |
| `-r<stem>` | Record missions to an input tape |
| `-SPRUNKNOWN` | Developer mode: shell mission picker and simulator debug controls |
| `-X` after `-SPRUNKNOWN` | Run the existing simulator mission repeatedly, bypassing the shell |

The reference launcher passes the installed language to its children. The older
v1.0 launcher does not, even though its language configuration can select a
translated manual. It also passes a simulator launch counter for CD selection.

## Simulator switches

These are the original programs' switches, not proposed native-game options.
The parser takes the first character after `-` and is case-sensitive. Numeric
values follow the letter directly. `tools/check_command_line.py` executes 34
controlled argument lists in each of four builds and verifies their stores.
The [native results](../analysis/executables/native-command-line.json) include
all initial values, cases and resolved field addresses.

| `DBSIM.EXE` option | Effect |
| --- | --- |
| `-eggplant` | Required direct-launch token |
| `-v0` | 320-by-240 mode |
| `-v1` | 640-by-480 view with mixed-resolution artwork |
| `-v2` / `-v3` | 640-by-480 mode with high-resolution cockpit art |
| `-Z1` | Fullscreen; `-Z0` or bare `-Z` selects a window |
| `-s` | Toggle sound; repeated occurrences toggle it back |
| `-R<n>` | Set the CD selection counter |
| `-F` / `-G` | French / German resources |
| `-E` | Spanish resource suffix; the supplied voice archive is absent |
| `-l` | Load cockpit artwork on demand |
| `-C<name>` | Override the cockpit type by an internal chassis name |
| `-t<n>` | Override the first squad comm portrait |
| `-r<stem>` | Record an input tape |
| `-p<stem>` | Play a tape; its bundled handoff replaces live mission files |
| `-D` | Choose an attract-mode tape |
| `-d` | Open the associated state-checkpoint file |
| `-SPRUNKNOWN` | Toggle developer keys |
| `-B` | Enable the `Ctrl+B` debugger break |
| `-b` | Disable the scrolling-window presentation path |
| `-m` | Enable the external `DARKMONO.VXD` debugging path |

Use lowercase `-eggplant`. Although an uppercase comparison string also exists,
`-EGGPLANT` enters the uppercase `E` case and sets the Spanish suffix instead;
it does not set the launch-token flag. The native parser checks reproduce this
in v1.0, v1.1 Win95, v1.1 Win3.1 and the downloadable demo. Likewise lowercase
`-sprunknown` is an `s` option and toggles sound rather than enabling debug mode.

The Win3.1 window parser has an extra `-31` branch which copies `VER31` into its
platform-path buffer. This changes its dispatch structure relative to Win95.
Options `-S`, `-P`, `-T<n>`, `-V<n>`, `-W<n>`, `-a` and `-c` write fields whose
use is absent or ineffective in the surveyed paths. `-X<n>` writes startup state
that the mission loop clears. They are retained in the parser evidence rather
than presented as functioning gameplay features.

## Shell switches

`VSHELL -eggplant -@` exposes the mission-name dialog that a normal career load
clicks past. The user can accept the default mission or enter a source mission
name. `ES -SPRUNKNOWN` enables this through the normal launcher.

Other shell switches are `-s` for sound off, `-a` for movies off, `-f` / `-g` for
language, `-k` to omit its keyboard producer, and `-X<n>` for the return state.
The shell accepts slash-prefixed switches and generally ignores letter case;
its `@` and uppercase `X` cases are special. Its `-r` startup assignment is
subsequently overwritten. A separate simulator argument builder survives in the
shell without a located caller; the normal launcher builds its own argument list.

## Developer keys

The following controls are gated by `-SPRUNKNOWN`. This table follows the
original dispatch routines and the pinned research. Normal game controls are covered in
the [exported manuals](../literature/index.html).

| Keys | Action |
| --- | --- |
| Alt+S | Toggle simulation freeze; also available while a tape records or plays |
| Alt+keypad + | Run one simulation step, then freeze again |
| Ctrl+N / Ctrl+P | View the next / previous eligible object |
| Ctrl+F | Cycle views while following the selected object |
| Ctrl+T | Give movement inputs to the camera |
| Ctrl+Alt+, / Ctrl+Alt+. | Select damage component 0-29 |
| Ctrl+Alt+D | Apply 300 damage to that component of the viewed object |
| Ctrl+Alt+N | Apply 32000 damage to component 0 of the first nearby deployed Cybrid |
| Alt+Up / Alt+Down | Move the viewed HERC along its local forward axis |
| Alt+Left / Alt+Right | Move it along its local sideways axis |
| Ctrl+Left / Ctrl+Right | Adjust its yaw |
| Ctrl+Alt+1 through 9 | Select movement/angle steps: 500, 1000, 1500, 2000, 3000, 4500, 6000, 7500, 9000 |

The freeze skips simulation pools and mission systems, but the input pass still
runs. The player can move controls or fire a pending shot while frozen. A modal
panel stops more of the game than this debugging freeze does. Modified arrow
keys also reach the held-axis handling, so their ordinary steering effect can
coexist with the debug movement.

Addresses in the v1.0 simulator: command parsers `0x45e6b0` / `0x45e73c`, main
command dispatcher `0x45fdac`, HERC handler `0x4157c8`. The HERC's default movement
and turn step is 2000. The `Ctrl+B` debugger trap belongs to the separate `-B`
mode and executes an `INT3`; it is not a gameplay cheat.


The independent developer-control harness now runs 6,144 command events in each
of the two retail Win95 simulators. Both builds agree on freeze/step latches,
component limits, damage receivers, nearby-Cybrid selection and the HERC's local
movement and yaw changes. It includes dead and waiting objects, distance
boundaries, disabled developer mode and tape playback/recording gates.
`tools/check_developer_controls.py` retains the report in
`analysis/cockpits/native-developer-controls.json`. UI handling and final damage
delivery are supplied boundaries. All these commands are now connected in the
C++ window. Its separate live test checks three 44-tick sessions for disabled
commands, freeze/single-step, persistent movement, yaw, step size and damage.

The original selector permits component 29, but HERC component arrays have 29
entries, indexed 0-28. `Herc_ApplyDamage` (`0x417de4`) loads the active array and
indexes it at `0x417e1d` without checking its count. The port ignores out-of-range
diagnostic damage, without consuming RNG. This bounds fix is documented in its
README. The ordinary valid-component path retains the original damage logic.

The base/ground-vehicle command method at `0x411a6c` returns zero, as does the
flyer method at `0x4215c0`. Their vtables therefore ignore the HERC-specific
movement shortcuts. These addresses were checked in the v1.1 live object list.
