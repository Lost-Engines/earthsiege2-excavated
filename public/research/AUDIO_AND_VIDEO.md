# Sound, speech and movies

The [sound browser](../analysis/audio/index.html) includes 638 distinct PCM
recordings, captions where the game supplies them, the twelve animated pilot
portraits and both CD soundtrack sets. The [movie browser](../analysis/movies/index.html)
contains 97 distinct clips and links the briefing films to their missions.

## Samples and voices

All extracted WAV resources are ordinary RIFF PCM. The distinct payloads comprise
411 mono 22,050 Hz 8-bit samples, 222 mono 11,025 Hz 8-bit samples and five mono
22,050 Hz 16-bit samples. FLAC exports use compression level 8 and encoder
verification. Source paths and hashes remain in the catalogue.

The browser distinguishes platform, release, language and purpose. Most of the
Windows 3.1 computer announcements run at 11,025 Hz; their Windows 95 equivalents
run at 22,050 Hz. The three pilot voice banks are associated with twelve faces,
four faces per bank. A face's three possible names are separate from its voice.

The localized volumes are not complete voice translations. All 147 pilot
recordings and all 65 training recordings in each localized reference set are
byte-identical to the English recordings. Of the 66 computer announcements,
57 French and 53 German recordings differ. Text captions come from the game's
string tables; they are not transcriptions generated from the audio.

The original WAV loader subtracts 44 bytes from the data-chunk size even though
its sample pointer already skips the 44-byte header. This cuts 44 PCM bytes from
every retained recording, about 1-4 milliseconds depending on its format.
`tools/check_wave_loader.py` independently executes the descriptor construction
for all 638 recordings and 21 boundary inputs in each of four executable builds.
All 2,636 observations confirm the subtraction. Raw input keeps its full length
and defaults to unsigned 8-bit mono at 11,025 Hz; malformed WAV lengths below
44 wrap to a large unsigned size.

The C++ player and inspection exports keep the complete PCM payload. Removing
valid samples serves no purpose, and this original bug is now a documented
intentional difference. The check supplies the already loaded buffer and a
zeroed descriptor, with `memcmp` as its only called host boundary. File I/O,
allocation and HMI playback are outside it. See
[native-wave-loader.json](../analysis/audio/native-wave-loader.json). The original
function and subtraction were first identified in the pinned Herculan research.


## Portrait animation

There are 556 SNC scripts. Each begins with a 32-bit length followed by pairs
of signed bytes: portrait frame and delay. Frame IDs are 0 through 23. The
native clock is `(GetTickCount() - base) >> 4`: a tick is 16 milliseconds.
The advance routine consumes records until the supplied time is no greater
than its accumulated delay. At an exact boundary, the previous frame remains;
a finished script returns frame -1.

`tools/check_speech_sync.py` calls the original advance routine at 10,394
boundary cases in each of four executable families, with only the external
clock supplied by the harness. Every frame agrees. Addresses and results are
in [native-speech-sync.json](../analysis/audio/native-speech-sync.json).

Portrait artwork contains 28 frames per face. Offset files generally contain
27 records; PILOT9 has a spare 28th record, while the loader reads 27. The
browser positions the head and mouth pieces using those original offsets.
It uses WORLD0 for inspection; scene-specific palette composition is separate.

## CD audio

Both mixed-mode discs carry six audio tracks. Content correspondence is:

| Reference v1.1 track | v1.0 December disc track |
|---|---|
| 2 | 4 |
| 3 | 2 |
| 4 | 3 |
| 5 | 5 |
| 6 | 6 |
| 7 | 7 |

For the first five pairs, alignment gives about 91-94% exactly equal stereo
sample frames, with gain close to 1. Differences are concentrated in the
remaining samples. This establishes the same musical content, but does not
establish which disc preparation or ripping step caused the differences.

Track 7 is more substantial. The December copy retains roughly the opening
3.8 seconds, then jumps ahead by 1,972,320 sample frames, or 44.7238 seconds.
Its final nonzero sample is followed by 47.6442 seconds of silence. Both FLAC
sets are retained so the supplied releases remain auditionable. The reference
v1.1 disc supplies the uninterrupted version.

[The comparison report](../analysis/audio/content-comparison.json) records
alignment offsets, exact PCM counts and the bounded location of that jump.
`tools/compare_cd_audio.py` finds correspondence; `tools/analyse_cd_differences.py`
adds the full aligned comparisons and discontinuity measurements. Audio is
44,100 Hz, signed 16-bit stereo; extraction starts at each cue's INDEX 01.

## Movies

The 97 distinct video files use 84 Indeo 3 streams, six Microsoft Video 1,
four Microsoft RLE, two Cinepak and one Indeo 4 primary streams. The localized
French and German introductions are separate resources. All three retail
collections share the English AVI payloads.

The original shell contains an 86-entry movie path table. The catalogue keeps
those IDs and the briefing references found in compiled missions. Seven AVI
files are outside that table: ALPHA, BRAVO, DELTA, OMICRON, ESTAB2, ES2CREDC and
ES2DROP3. Their absence from this table alone does not prove they are unused.

Browser copies use lossless VP9 in RGB. Every decoded RGB frame has been hashed
against FFmpeg's decoded RGB of the original movie; all 97 streams match.
Converting through RGB24 before VP9 is necessary to keep that comparison exact.
Five Microsoft Video 1 files also contain an auxiliary AASC stream; the browser
shows the primary video and retains the original AVI link.

87 clips have audio. Their original PCM is exported separately as FLAC at level
8. The WebM player uses an Opus preview; use the FLAC link for the original
samples. These checks verify the conversion relative to FFmpeg, not the legacy
Windows codec's decoding implementation or frame scheduling.

## Reproduction and attribution

Run `tools/build_audio.py`, `tools/check_speech_sync.py`, `tools/check_wave_loader.py`, `tools/build_movies.py`
and `tools/check_media_browsers.py` with the project virtual environment.
Movie conversion uses FFmpeg and local source files; it is cached by input hash.
Format and original consumer leads came from the pinned
[Herculan research](../reference_sources/README.md). Local evidence above
identifies which conclusions have also been tested against original code.

## C++ playback integration

The C++ application streams the original English AVI files through FFmpeg and
plays their PCM alongside the shell's recorded WAV music and UI sounds. Its
independent CLI comparison covers 93 files, 15,323 decoded source RGB frames
and 178,935,528 bytes of stereo 44,100 Hz PCM. The export script explicitly uses
`-fps_mode passthrough`: otherwise FFmpeg inserts duplicate frames into movies
with timestamp gaps, including `ES2CREDC.AVI`. The player holds the prior frame
through those gaps. RGB24 conversion is shared with the analysis exports because
some YUV-to-packed-32-bit paths round differently. Legacy Windows codec output
and exact device scheduling have not been established by these comparisons.


## Native battle-audio checks and C++ integration

The C++ mission now plays weapons, impacts, footsteps, local controls, startup,
fire loops and the Razor engine. It uses the normal HMI bank. The earlier
provisional tone path used HMX and restarted each repeated sample; the new path
preserves overlapping copies, five-play warnings and live pitch/pan/volume.
Only the newest copy remains attached to a catalogue resource handle.

`tools/native_sound.py` executes original catalogue placement and play routines.
`tools/export_cpp_sound.py` compares both retail builds and exports 8,192 requests,
with full presentation RNG snapshots. The supplied view-space transform and
recorded SFX calls are the harness boundaries. The original distance, angle,
variation and integer volume calculations execute unchanged. See
[cpp-sound.json](../analysis/audio/cpp-sound.json).

`tools/native_speech_slots.py` runs original speech acquisition and playback;
4,096 requests cover cache hits, LRU eviction and timestamp ties in both builds.
The five-slot pool can interrupt a clip that is still playing. The original SNC
constructor copies the handle at +0x3e into +0, resolving the ambiguous duplicate
handle fields in the reference notes. File/SFX operations are supplied boundaries.
[cpp-speech-slots.json](../analysis/audio/cpp-speech-slots.json) records the fixture.

`tools/native_music.py` runs the original mission music-selection block and
mute/focus routines. 360 cross-build cases verify device, training and preference
gates. ES.EXE's per-process simulator launch count selects tracks 2-6 cyclically;
training missions are silent, and the simulator never selects track 7. Mute and
focus loss save the position; unmute and focus return resume it. Ordinary pause
panels do not suspend sound. Native results and operation traces are in
[cpp-music.json](../analysis/audio/cpp-music.json).

The C++ repository includes all six reference FLACs and streams one selected
track with a bounded buffer. Its decoder output matches the complete original
INDEX 01 PCM sectors. Loop continuity, mute, focus resume and decoder-thread
shutdown have additional tests. Battle mixing uses a host PCM implementation;
HMI device resampling and the original voice limit remain separate work.
Positional sounds use the preceding rendered world camera, as verified below.
The application still plays complete WAV payloads, as the analysis player does.


## Positional sound and the heads-down map

`trace_original_mission.py --sound-camera` enables original sound and records
raster-camera installations, positional calls and the coordinates computed by
`Sound_Place`. Its 300-tick moving/firing run includes cockpit view changes.
All 68 calls reach an initialized original sound device. The file
[native-sound-camera.json](../analysis/audio/native-sound-camera.json) retains the
raw transform records, source hashes and one original defect.

Sound calls inside `Sim_MainTick` normally use the preceding render's world
camera. C++ had advanced its listener after the new simulation tick. The first
shot exposed that difference: (-1, 500, 275) instead of (-1, 493, 315).
Updating the listener with the world draw makes all ordinary placements exact.

At completed tick 190, the map installs its overhead camera from v1.1
`HddCommandScreen_DrawMap` call site `0x44e452`. It does not restore the previous
camera. Sound 18 in the next simulation tick consequently transforms to
(-158830, 1332031, 1155). Re-executing the original placement instructions gives
volume zero and no playback start. The preceding world camera would give
(-522, 967, -2), volume 89 and pan 22456, followed by a start request.

The port keeps the world listener across map redraws. Its new regression runs
the live C++ window with the recorded ordinary inputs and verifies 68 ordered
sound events and positions: 67 exact original placements and the one explicit
repair. Both transforms and both outcomes remain in the fixture. This comparison
covers scheduling and placement, not the final host mixer or sample timing.


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

The retained reports cover [all patrol sound calls](../analysis/audio/native-sound-patrol.json),
[the original explosion index adjustment](../analysis/audio/native-explosion-sound-index.json)
and [the device/RNG gate](../analysis/audio/native-sound-device-gate.json).
