# Missions and terrain

Open [the mission browser](../analysis/missions/index.html). It shows compiled
mission states, terrain, equipped actors, bases, routes and briefing text. It
works from a local `file://` URL. The short role descriptions in the list are
editorial summaries of the briefings in `tools/mission_descriptions.json`.
They are not original mission titles; the full original text remains alongside
the scene.

## From mission source to simulator

The shell reads `.MSN` source records and language-specific `.ENG`, `.FRE` or
`.GER` text. The sources contain conditions, alternatives and references by ID.
It evaluates them against the campaign's persistent flags and random stream,
then writes a compact `data/script.dat` and `data/mission.str`. DBSIM reads those
compiled files, rather than the source mission.

There are 62 reference `.MSN` resources. All 61 intact files compile using the
original VSHELL 1.1 instructions in our isolated x86 harness. `DEMO2.MSN` stops
42 bytes short of its first 58-byte objective record. It is retained as an
incomplete leftover, not silently padded or presented as a playable mission.

`tools/native_shell.py` maps the original PE image and runs its parser,
condition evaluator, random generator, reference remapper and writers. Python
supplies memory allocation, CRT byte operations and stream transport. Unknown
imports and reads beyond a resource's end fail explicitly. Borland exception
setup and the original stream vtables remain in place. This is an analysis
oracle, not code intended to ship as the native game implementation.

The source format has 17 tables; the compiled format has 13. The bounded readers
in `tools/mission_formats.py` retain record offsets and all raw words alongside
the fields currently given semantic names. Source versions with different
hashes are retained independently under `analysis/missions/source-versions`.

Compiled files can have stale data after their last declared record. The
original shell reuses `SCRIPT.DAT` and `MISSION.STR` without truncating an older,
longer file. Those bytes belong to the preceding mission. Consecutive original
shell captures retain the physical size and consumed extent separately; both
simulators stop at the declared records. For example, flight training uses 163
bytes of an 866-byte `MISSION.STR`, leaving 703 old bytes behind. This is distinct
from the separately retained material-table trailer described below.

## Which launch state the browser shows

`C1_01` defaults to a capture from the running original game: a newly registered
Rookie pilot. Its squad is read from the corresponding `player.mec`. The
captured script and briefing match the isolated original compiler byte for
byte. The comparison found the generator 170 draws past its initial table
immediately before campaign flags 4-6 were seeded. This includes startup
and pilot-generation draws. Other launch histories can reach a different state.

Files and proof are in
[`analysis/missions/captured/new-campaign`](../analysis/missions/captured/new-campaign/),
with the screenshot sequence in `analysis/reference/new-campaign`.

Other missions currently offer two controlled previews. Each explicitly sets
its chapter and mission, uses a successful previous outcome except at the
start, clears other persistent flags, selects difficulty 1 and daytime, and
advances the native generator by either zero or one draw before seeding the
mission's random flags. These are reproducible inputs for inspection, not
complete saved campaign histories. The browser states that distinction. A
full campaign continuation can choose different branches.

56 of the 61 intact sources produce different compiled bytes between these two
states. A difference can be a loadout, branch or other record; it does not
necessarily move the terrain or every actor. The simulator's separate random
stream starts from a fixed table, so its initial ground-material scatter is
repeatable. The shell and simulator must not share one inferred random state.

## Actor placement

A record in a roster does not by itself put an object into the mission. Groups
activate roster members. Their own coordinates take precedence over group
coordinates; an unset group coordinate falls back to its first order's route.
An unset group heading comes from that route's first leg. Headings use model
+Y as forward. Positions and heading math are checked through the original
simulator routines.

The formation slot is the member's position in the group's 20 reference slots.
The first slot has no offset. The other offsets rotate with the leader's
heading. `MFORMS.DAT` contains five seven-slot HERC formations; `FFORMS.DAT`
contains five three-slot flyer formations. `BFORMS.DAT` has 17 variable-sized
base formations, including per-member heading adjustments.

Group zero is the player's squad anchor. The squad itself comes from
`player.mec`; its listed source roster members are reference aliases, not an
inventory of machines to draw. Controlled previews therefore show its spawn
and route without inventing a saved squad. The captured scene includes the
actual one-machine starting squad.

The loader assigns ordinary live HERCs consecutive pool indices, then maps
source group-zero member slot *k* to squad member *k*. It also appends each squad
member after the source HERC roster. Orders, actions and objectives resolve
through that same map. In `TRAIN1`, HERC reference 0 is the player; in `C1_01`,
reference 3 is the player and reference 4 is the first wingman. A listed alias
past the actual squad size has no machine to resolve.

`tools/check_mission_roster.py` executes the original map-writing instructions
from `0x424f5e` to `0x425091`, with supplied activation flags and squad sizes
zero through four. All 122 compiled previews agree in all four executable
families: 610 cases per build. None shares a squad alias with another group's
member list. Ten distinct missions use squad references in their objectives:
`C1_01`, `C2_06`, `C4_08`, `C4_09`, `C5_02`, `C5_04`, `C5_08`, `C5_09`, `TRAIN1`
and `TRAIN3`. The [retained report](../analysis/campaign/native-roster-aliases.json)
records the exact sites and objective references. These aliases must be connected
to the objective interpreter as well as understood by the scene browser.

Groups waiting on a deployment action are initially hidden, unsimulated and
non-solid. Their stored coordinates are placeholders. The optional waiting
reinforcement overlay is useful for inspecting records, but is not a prediction
of their eventual arrival point.

Two controlled mission sets share a HERC between groups: `C1_07` and `C5_10`.
`Mech_AttachToGroup` writes the new owner at object `+0x45` and slot at `+0x49`
unconditionally, but only supplies heading and position while their unset
sentinels remain. Consequently the later group owns the same object at its
existing pose. The browser retains both memberships and draws one actor.
Reference v1.0 addresses: `DBSim_BuildGroupRecord` `0x423b34`,
`Mech_AttachToGroup` `0x417aa8`.

## Terrain and base sites

The 39 terrain zones pair a four-int header with an indexed bitmap. Pixel bytes
are heights, not palette indices. Image rows run from high world Y to low Y.
The loader derives the dimensions from the bitmap: `ZONE7000` has a stale
128-by-128 header, while its bitmap is 256 by 256. We follow the loader.

Each terrain cell stores a raw height, two fixed-point normals, two shade bytes
and a packed diagonal/material byte. The diagonal follows the four heights.
The normal uses the original integer magnitude approximation. A fixed sun at
`(-3104, -1472, -2228)`, intensity 256, produces the shade. Terrain lighting is
baked at load, with another surface rebuild after base sites are flattened.
Colour lookup uses the theater's original `.DPL` and `.RMP` tables.

The ten `.WLD` files describe five environments with day/night variants. Their
terrain banks are urban, snow, volcanic, ice and moon. Each bank has the two
ordinary terrain frames plus the formation-pad art. `MAT0.DAT` maps material
IDs to texture frames and tiling shifts. The live material table occupies 108
bytes. Its remaining 136 bytes parse as a count of 11 followed by eleven
material/X/Y triples. The original terrain loader ignores them: its count and
read loop consumes exactly 108 bytes, then loads the heightmap and closes the
material stream. `check_material_extent.py` executes that loop in all four
builds with the complete file, the 108-byte prefix and a changed trailer. All
produce identical tables and read extents. The triples' historical authoring
purpose remains unknown; they are exported separately and do not place scenery.
See [the original read-loop report](../analysis/resources/native-material-extent.json).

Eleven base formations carry a terrain pad. The engine moves the formation's
anchor to a fraction of its tile, paints that tile with its material, and marks
occupied cells using the formation's mask. Individual structures also mark
their footprints. Connected marked regions are averaged, including the forced
east/north/northeast samples needed to form a flat top. Buildings are settled
onto the rebuilt surface afterward. The mask controls flattening; the pad's
visible outline is in its texture.

`tools/check_terrain.py` verifies these operations against original x86:

- 65,536 height and material cells match in each of four executable families.
- 2,052 sampled surface records match per family, including normals and shades.
- All eleven mapped formations match pad painting and footprint flattening at
  both shipped cell sizes, giving 22 checks.

The families are v1.0 Win95, v1.1 Win95, v1.1 Win3.1 and the downloadable demo.
Addresses and results are recorded in
[`native-terrain.json`](../analysis/missions/native-terrain.json).

## Inspection renderer limits

The scene browser uses a depth buffer and GPU triangle coverage. It displays
the full map, static actor poses and optional route overlays. It is not yet a
pixel-exact recreation of the original software rasterizer, visibility radius,
animated environment, combat effects or moving mission state. Camera panning
keeps its pivot on the ground. Changing launch state or display options preserves
the view; choosing a different mission resets it.

## Prior work and reproducibility

Format and consumer leads came from the pinned MIT-licensed
[Herculan project](../reference_sources/README.md). Our parsers are independently
walked over the supplied media, with the original executable harnesses providing
local verification. Addresses above use v1.0 notation; the harness locates the
matching v1.1 routines and records those mappings.

Run, in order:

```
.venv/bin/python tools/build_missions.py
.venv/bin/python tools/check_terrain.py
.venv/bin/python tools/build_scenery.py
```

The campaign capture check requires the original new-career files before it
runs; it must not overwrite the retained capture with an unrelated later game.
