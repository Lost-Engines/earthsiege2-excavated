# What Earthsiege 2 reuses from Earthsiege 1

Earthsiege 2 carries forward much of ES1's 3Space foundation and a substantial
collection of assets. ES1's expansion is an important intermediate step: some
sequel content was already present there.

This comparison uses the reference ES2 Win95 v1.1 archives, ES1's October 1994
retail archives, and the two retained ES1 expansion sets. It excludes the ES2
demo bundled on later ES1 media, which would otherwise inflate the overlap.

## Assets that are exactly the same

Of **2,596 distinct named ES2 resource payloads**, **622 are byte-identical to
ES1 retail files**, about 24%. The expansions add **26 further matches**.
These are archive members after ES2's override rules, deduplicated across shell
and simulator by name and hash. Loose movies and CD tracks are outside this
count. It measures complete-file identity, including retained unused files.

The count is dominated by **548 of 556 portrait-animation SNC scripts**. A large
number of tiny animation records does not mean a quarter of the game's artwork
or source code is unchanged. Conversely, resampled audio and recoloured images
can be reused without matching whole-file hashes.

| ES2 asset | Matching earlier asset |
|---|---|
| `COLOSSUS.DTS` | ES1 `COLOSSUS.DTS` |
| `STINGRAY.DTS` | ES1 `SCORPION.DTS` |
| `MIRIMAC.DTS`, `SPIDER.DTS`, `SKIMMER.DTS` | Same-named ES1 models |
| `SMOKE.DTS` and `SMOKE.DBA` | ES1 smoke model and sprite bank |
| `DIABLO.DTS`, `HEADHUNT.DTS` | ES1 expansion models |
| `FLAT2.DTS` | ES1 expansion ground-effect model |

That is **nine of the 55 reference DTS libraries** unchanged, including the
expansion matches. Complete DTS identity includes their stored
hierarchies, detail levels and animation data. Textures and palettes are separate,
so an unchanged model can still look different.

Other models received small edits. `MONGOOSE.DTS` changes just **one byte** out
of 76,332, at file offset `0x2d04`; `RAMSES.DTS` changes 172 bytes out of 61,938.
Outlaw and Samson retain byte-identical collision files under their new filenames,
matching ES1's `GUNSLING.COL` and `HERCULES.COL`. Ten other collision files and
eight weapon-mount GL files also match retail ES1 payloads.

Other exact carryovers include `ROCKETS.DAT`, HERC/flyer formation tables
`MFORMS.DAT` and `FFORMS.DAT`, `TEX.DAT`, cursor images and all twelve portrait
placement OFS files. `STYLES.DAT` is also identical, although no ES2 reader has
been established for it.

## Reuse hidden by conversion

**123 of the 147 English pilot voice files** preserve the complete ES1 recording
in every second sample of the ES2 22,050 Hz WAV, starting at zero-based index 1.
ES1 stores those
recordings as raw 11,025 Hz PCM. Another 22 same-named clips have the corresponding
length and differ at only one to four of those sample positions; two have different
lengths. Seven sound effects also pass the exact alternating-sample check.
This establishes substantial recording reuse, without assuming which resampler
produced the intervening samples. The French and German pilot banks repeat the
English recordings and are not counted as additional voices here.

**Seven complete portrait bitmap banks** reproduce all corresponding ES1 pixels
after a consistent palette-index remap. Each contains 28 frames. Their file
hashes differ, and this does not imply identical displayed RGB colours. The
other banks need different-sized-frame or artwork comparisons before making
the same claim about them.

## Engine and code continuity

- **3Space resources and animation:** the tagged model hierarchy, BSP groups,
  LOD, cell animation, sequence transitions, root motion and bitmap/palette
  families continue. Our `three_space.py` reader is currently identical in both
  analysis projects. The VOL reader was also carried forward.
- **Random-number generator:** the same 56-word seed table occurs in both games'
  shell and simulator executables. The verified generator keeps the same taps,
  24 and 55, wrapping 16-bit addition and bounded-draw rule.
- **Shell/simulator organisation:** both compile missions in the shell and pass
  `SCRIPT.DAT`, `PLAYER.MEC` and `MISSION.VAR` to `DBSIM`. ES2 extends the formats
  and rules; the files are not generally interchangeable.
- **HMI SOS audio:** both use this middleware family. ES2 uses its Windows paths
  and recorded/CD music, rather than ES1's HMP music and DOS synthesizer drivers.
- **Retained earlier machinery:** ES2's `SKIMMER.DAT` follows the expansion's
  layout, including old flight fields whose jobs moved into `SKIMMER.FM`.
  Unused lift-start/death-flash paths also survive from ES1.

The Windows renderer, height-field terrain, flight integration and mission rules
have significant differences. Even familiar operations need fresh checking:
line rasterization and some fixed-point rounding differ. These findings support
engine continuity, but do not establish a percentage of original source reused.
We have not completed a cross-game function-by-function binary comparison.

## Evidence

[Full comparison report](../analysis/resources/es1-overlap.json), including hashes,
file mappings, PCM observations, palette remaps and seed-table file offsets.
Regenerate it with:

```sh
PYTHONPATH=tools .venv/bin/python tools/compare_es1_assets.py
```

Further detail: [flyer profile](FLYER_PROFILE.md),
[ES2 executable evidence](EXECUTABLES_AND_CONTROLS.md),
[ES1 build evidence](../../earthsiege-reverse/docs/BUILD_EVIDENCE.md), and
[resource-reader provenance](../reference_sources/README.md).
