# Retail version differences

The reference is the supplied **1.1 Win95 English** build. Its September 1997
CD was mastered before the supplied December 1997 CD carrying version 1.0;
mastering dates do not put the executable revisions in order. The comparison
installs retain both. Media identities and duplicates are in
[INSTALL_MEDIA.md](INSTALL_MEDIA.md).

## Mission edits

Seven mission sources and five English text resources differ. The
[semantic comparison](../analysis/missions/version-changes.json) retains every
changed source table and text record, excluding offsets that only move because
earlier records changed size. `tools/check_mission_versions.py` rebuilds it.

| Resource | Change from 1.0 to 1.1 |
|---|---|
| C2_05 | Group 188's source word at +8 changes from 25 to 0. It survives compilation as group word 1. Its runtime purpose remains unidentified. |
| C2_06 | Point 34 moves from (137720, 511184, 0) to (157376, 516916, 0), a displacement of (+19656, +5732, 0) in world units. |
| C5_05 | The conduit, hangar, listening post and missile tower on flags 821, 823, 825 and 827 always start intact. The older source can carry their destruction forward. |
| C2_03 | Twelve extra conditions and another copy of the loss debrief line. The added tests repeat the existing loss-line conditions. |
| DEMO_01 | Two orders change route 46 to 47. |
| DEMO_02 | Two orders change route 29 to 30. |
| TRAIN1 | Adds two values, GUID 68 = 6 and GUID 71 = 37; no other record names them. |
| C2_01 English | Corrects “You patrol zone” to “Your patrol zone”. |
| C2_04 English | Corrects “an pair” to “a pair”. |
| C3_03 English | Removes the sentence allowing destruction of the listening post after downloading its data. |
| C4_09 English | Removes the briefing's final sentence. |

The lunar change is verified with the original compiler in both shells, using
no prior destruction, each flag individually and all eight together: twenty
compilations. Both produce 31 structures. In 1.0, flags 821-828 independently
change the corresponding structure's starting condition from 100 to 0. In 1.1,
only the four even-numbered flags do so. The check changes no mission files.

The two complete campaign histories in
[the campaign browser](../analysis/campaign/index.html) have identical career
state across builds. Their regular mission payload differences are C2_05 and
C2_06 above. The fixtures retain actual payload hashes and explicitly
canonicalize only those two known edits for the cross-build assertion. Stale
bytes beyond a parsed SCRIPT.DAT are recorded separately.

These mission edits were previously identified by the credited
[Herculan research](../reference_sources/README.md). Our comparisons establish
their presence in these supplied copies, and the lunar fixtures exercise their
original consumers.

## Other retained differences

The complete [resource comparison](../analysis/resources/version-differences.json)
records changed and unique payloads, including language resources, extended
fonts and the patch volume. The original executables are retained for native
comparisons; checking one subsystem does not imply that all executable behavior
is identical.

Both CD audio sets are retained. Five corresponding tracks agree after alignment
apart from small sample differences. The older final track has a 44.7238-second
skip near its beginning and ends with 47.6442 seconds of silence; it is not a
substitute for the reference track. See [audio and video](AUDIO_AND_VIDEO.md).

## Radar and contact consequences

The terrain-ray changes also affect detection. Complete sensor fixtures over a
ridge produce different radar flags and shared contacts even with matching
object positions, headings and random state. Version 1.1 Win95 and Win3.1 agree;
v1.0 and the April demo agree. The detector itself follows the same instructions.
See [sensor analysis](SENSORS_AND_TARGETING.md) and its selectable build traces.

The same difference is now captured during the first campaign mission. At tick
329, v1.0 falsely blocks a building-to-HERC visibility ray; v1.1 sees through it.
The next tick consumes nine sensor random draws in v1.0 and eight in v1.1.
[Complete process traces](ORIGINAL_PROCESS_TRACES.md) retain the exact ray and
its replay through all four executable families.
