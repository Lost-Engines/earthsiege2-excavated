# Landskimmer profile

`SKIMMER.DAT` is a 46-byte aircraft profile. It is identical in all five supplied
resource sets. Only nominal speed, maximum bank and the target name have found
consumers in Earthsiege 2. The other numeric words survive from an older profile
layout; some had active movement uses in Earthsiege 1.

## File fields

Offsets are decimal; numeric fields are signed little-endian 16-bit integers.

| Offset | Value | Earthsiege 2 use | Earlier use where established |
|---|---|---|---|
| 0 | 800 | No reader found | Pitch approach step in ES1 |
| 2 | 1000 | No reader found | Bank rate in ES1 |
| 4 | 1000 | Nominal forward speed, copied into the actor at construction | Forward displacement per movement dispatch in ES1 |
| 6 | 300 | No reader found | Unlabelled |
| 8 | 150 | No reader found | Bank acceleration in ES1 |
| 10 | 4 | No reader found | Bank-to-yaw shift in ES1 |
| 12 | -1 | No reader found | Unlabelled |
| 14 | 14000 | Maximum bank, in 65536 units per turn (about 76.9 degrees) | Maximum bank in ES1 |
| 16 | 1500 | No reader found | Unlabelled |
| 18-29 | `Landskimmer`, NUL padded | Target-status name | Added by the ES1 expansion |
| 30-45 | Eight zero shorts | No reader found | Retained tail |

The retail ES1 profile has 34 bytes. Its expansion already has this 46-byte
layout with the display name. The expansion and ES2 files differ in just two
words: bank rate 1500 becomes 1000 and bank acceleration 250 becomes 150. Both
words lack ES2 consumers. This makes them misleading tuning controls if edited
without checking the code. ES2 drives pitch/bank motion through `SKIMMER.FM`
and the shared flight model, also used by the player's Razor.

The earlier labels come from ES1's independently checked movement routines,
documented in [Actors](../../earthsiege-reverse/docs/ACTORS.md). They are historical
labels, not additional ES2 settings. The retained report includes all prequel
file hashes and exact differences.

## Original instructions and tests

`tools/check_flyer_profile.py` runs the constructor and pitch, altitude, bank,
formation and attack controls in v1.0 Win95, v1.1 Win95, v1.1 Win3.1 and the April
demo. For each build it mutates each of the fifteen other words to -32768, -1,
1 and 32767, one word at a time. All 60 mutations preserve the constructed actor
and all nine sets of control observations. Positive checks change the two active
numeric fields and confirm observable differences.

Memory-read hooks over the 46-byte file region record only:

- `004216f5`: constructor copies byte 4's short to actor `+0x233`.
- `00422326`: steering reads byte 14's bank limit.

Those instruction addresses are identical in the four tested builds. The target
status path adds 18 to the profile pointer and formats its name. Its add
instruction is `0043b0bf` in v1.0, `0043b0dc` in v1.1 Win95, `0043b134` in
v1.1 Win3.1 and `0043b0d3` in the April demo.

The static audit retains every direct reference to the flyer type table and
actor `+0x1fa` in executable sections, with following instructions for review.
References to `+0x1fa` in HERC damage code belong to a different class layout.
The flyer movement routine loads its type pointer into a local but never
uses it. No extra numeric file reader appears in the audited references.

Constructor base-object, registration, damage and behaviour initialization are
supplied boundaries. Control calls use the existing explicit terrain, speed,
flight-command and projectile boundaries. These checks establish field use in
those routines; the static audit checks the remaining direct references. They
do not recover the unknown author's original field names or prove the absence
of every conceivable indirect access.

[Retained report](../analysis/resources/native-flyer-profile.json)

## File bytes versus runtime record

`00422ed0` reads exactly 46 bytes into a 112-byte runtime type record. It then
loads these separate resources:

| Runtime offset | Source |
|---|---|
| `+0x2e` | Damage pointer from `SKIMMER.DMG` |
| `+0x32` | Collision pointer from `SKIMMER.COL` |
| `+0x36` | Model pointer from `SKIMMER.DTS`, bound to the ENEMY texture bank |
| `+0x3a` | 54 bytes from `SKIMMER.FM`; the loader recomputes its coefficient at FM `+0x0e` |

These appended fields are active, but none is an unlabelled word inside the DAT
file. The C++ implementation already reads both active numeric fields and the
name and uses the separate flight, damage, collision and model resources. This
audit found no missing DAT-driven gameplay behaviour.
