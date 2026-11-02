# Earthsiege 2 media and reference version

The main reference is **version 1.1, Windows 95, English**, from the disc mastered on 11 September 1997. Its `VERSION.TXT` identifies it as 1.1; `SIERRA.INF` calls the package `110 Gamer's Pack`. A later mastering date does not imply a newer game executable.

| Media directory | Game | What is retained |
|---|---|---|
| `cd_v1_1_1997_09` | 1.1 | Seven-track mixed-mode CD, Windows 95 and Win32s executables, English/French/German speech |
| `cd_v1_0_1997_12` | 1.0 | Seven-track mixed-mode CD; older game code despite December mastering |
| `cd_v1_0_data_only` | 1.0 | Undated data-only BIN/CUE; same game executables, different setup and literature, extra Spanish/Italian manuals |
| `demo_1996_04` | Playable demo | Self-extracting download and extracted payload; original README dated April 1996 |

The data-only disc has no mastering timestamp or volume name. It also contains a Windows swap file. These facts suggest a reconstructed disc, but do not establish who made it or when. Its unique setup and documents are preserved.

## Duplicates

The DIC RAR's seven tracks match the September disc byte for byte. Its unsplit `.img` is precisely those tracks concatenated. Descrambling the data sectors in its `.scm` also produces the same bytes. Its logs and subchannel/C2 metadata are retained under `analysis/media/provenance`.

The standalone `Earthsiege2.iso` exactly matches the user-data sector prefix of the December disc. All 542 extracted files match too. The duplicate extractions, original compressed containers and standalone ISO have
now been removed. A fresh check verified all 42 ordinary archive members against
the retained tracks, original CUE files and dump metadata. It also recreated the
DIC concatenated image, scrambled image and ISO sector prefix. The four removed
containers occupied 2,389,878,095 bytes. Their original hashes and the verification
proof remain in `analysis/media/retained-container-recheck.json`.

Original filenames, hashes and sizes are in `analysis/media/original-inputs.json`; sector and file comparisons are in `duplicate-audit.json` and the per-disc filesystem manifests. Normalized CUE files retain the original track indices and pregaps.

## Installs

`tools/build_installs.py` follows each disc's `SIERRA.INF` maximum-install selection and writes the path/language files normally produced by `BATCH.EXE`. Each install has a manifest. The interactive installer has not yet been exercised.

The 1.1 disc has separate Windows 95 and Windows 3.1/Win32s builds. All three language selections are prepared for each. Version 1.0 has English comparison installs for both media variants. The demo is installed separately.

Earthsiege 2 requires Windows. DOSBox without Windows cannot run these PE executables. Original executable testing uses a private Wine prefix; the Win32s launcher will require a suitable Windows 3.1 environment for a complete historical launch test. The presence of an install directory alone does not establish successful runtime validation.

Short `D:\` (disc) and `I:\` (install) paths avoid spaces and the original program's small fixed path buffers. Saves and generated files live only in the install, separate from the retained disc files.

## Second demo on the Earthsiege disc

The retained Earthsiege 1 disc contains a distinct ES2 demo. It shares 28 files
with the downloadable demo, but `ES.EXE` and `DATA/RESULTS.DAT` differ and it has
an additional `DEMO2.VOL` at the directory root. The download instead includes
`DDRAW.DLL`. Unique payloads are in `install media/demo_cd_1996_10`; its extracted
payload shares identical files with the download through symlinks. Its writable
install is a full separate copy. The date label identifies the host CD, not the
build date of the demo executable. `PROVENANCE.json` records the source and hashes.

## Running a comparison install

Run `./run_earthsiege2.py` from a graphical Linux session to choose a Win95
installation or either demo. With no terminal input it prints the choices.
`--list` lists them explicitly. Each installation gets its own interactive
32-bit Wine prefix, separate from automated reference captures, and uses the original windowed display preference. An 800 x 600 Wine desktop
is available with `--wine-desktop`. The script follows the original supervisor's shell
and simulator handoff. `--program shell` and `--program simulator` select the
individual program for targeted inspection.

`--no-sound`, `--no-movies` and `--developer` are optional inspection controls;
the default enables the original presentation. `--dry-run` prints the exact
command and drive mappings. Wine's directory-backed D: mapping supplies game
files but is not a mounted Red Book audio CD, so original CD playback needs
separate drive support. The extracted FLACs remain available in the audio browser.

## Original-game launcher on current Linux

`run_earthsiege2.py` lists the comparison installs by default. The default run
uses the original VSHELL/DBSIM process sequence, including language, return
codes and the CD selection counter. The script supervises those unmodified
binaries because ES.EXE's old memory check rejects this Wine host. Use
`--program original-launcher` to exercise ES.EXE itself.

Each install has its own 32-bit Wine prefix. A Wine desktop keeps the game
inside a window when `--wine-desktop` is selected. The default leaves desktop
management to Wine and retains the game's own display preference. Forcing its
fullscreen option failed to create a usable DirectDraw surface under this
host's Xvfb configuration; windowed mode was used for the successful check.
Direct Wine launches preserve the child's exit status. `wine explorer
/desktop=... program` returns Explorer's status, which cannot drive this loop.
The script can complete an interrupted prefix bootstrap with the host Wine
package's own i386 zlib and Winsock DLLs; it does not download replacements.

The reference install completed main menu -> practice briefing -> original
simulator -> quit mission -> main menu through this script. Captures and the
`VSHELL -X1`, `DBSIM -X2 -R0`, `VSHELL -X3` handoff log are retained in
`analysis/reference/interactive-launcher`. Wine's Explorer emitted a host D-Bus
assertion during startup; the game sequence completed despite that message. Mounted extracted directories still
do not expose the CD's audio tracks as a physical Red Book device.
