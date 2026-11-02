# Analysis status and implementation handoff

The supplied media and named resources are characterized, the main viewers are
working, and the C++26 reconstruction joins the shell, simulation, cockpit,
recorded demos and mission audio. Thirty-five controlled v1.1 mission runs now agree
with the original process after every captured simulation tick. The three shipped
demos now have full-process comparisons too, with two documented departures
from an original pointer-derived rocket timer. Two hundred and nine complete
cockpit frames also match every pixel and palette entry, covering idle, walking,
turning, reversal, turret motion, side glances, both heads-down pages, Razor
flight, assault combat, later campaign environments, delayed lunar deployment, four consecutive campaign battles, sound-enabled combat and the death camera. Further missions can extend this coverage.

The definitive target is the English Win95 v1.1 installation from
`cd_v1_1_1997_09`. The older retail build, Win3.1 build and April demo remain
comparison oracles. Disc mastering dates do not determine executable age.

## Analysis and implementation coverage

| Area | Inspectable result and evidence |
|---|---|
| Media | Sector/file hashes, audio correspondence, distinct variants, ten comparison installs and an original Wine launch path. [Media](INSTALL_MEDIA.md) |
| Resources | 2,841 distinct name/hash pairs audited; 2,754 structurally decoded, 86 retained partials, one truncated leftover and no unidentified type. [Coverage](RESOURCE_COVERAGE.md) |
| Models | 57 libraries, 540 roots, loadouts, LOD, animation, scenery and variant thumbnails. Original BSP, transform, polygon/sprite and equipped-model comparisons. [Animation](ANIMATION_AND_MOVEMENT.md) |
| Missions | 61 intact sources, original compiler output, explicit campaign inputs, terrain generation/flattening and a 3D mission browser. [Missions](MISSIONS_AND_TERRAIN.md) |
| Campaign | Flags, grants, promotions, objectives, salvage, save round trips, consecutive shell/debrief histories and eight joined data-link missions. [Campaign](CAMPAIGN.md), [actions](MISSION_ACTIONS.md) |
| Simulation | Walking, contacts, flight, AI, navigation, ramming, armed structures, convoys, deployment and ending rules. Independent instruction fixtures and joined mission tests. [Foundations](SIMULATION_FOUNDATIONS.md) |
| Combat | Sensors, target selection, weapon systems, bullet/rocket/beam flight, hit geometry, shields, component damage and destruction. [Combat](COMBAT_RESOURCES.md) |
| Rendering | Indexed clipping/raster paths, ramps, sky, terrain, equipped models, LOD and scene filing. Eleven normal and eleven missile-view scene frames match original drawing code. [Rendering](ENVIRONMENT_AND_RENDERING.md), [ground shapes](GROUND_SHAPES.md) |
| Interface | Interactive shell, MFD/HDD pages, targeting pod, preferences, input/joystick, status panels, startup/dropouts, external/developer cameras, freeze/single-step and diagnostic movement/damage, cockpit shake and impact palettes. [Interface](INTERFACE_INTEGRATION.md) |
| Audio/video | Lossless samples, portraits, CD tracks, movies, captions and manuals. Original sound requests, speech-cache and CD-selection rules are connected; final host mixing is separate. [Audio/video](AUDIO_AND_VIDEO.md) |
| Recorded demos | All 7,060 input packets, modal queue consumption, real-window launch/abort checks and 5,801 full-process snapshots. Three complete playback outcomes agree, with a labelled DEMO2 component guard and two documented pointer-derived timer departures in DEMO3. [Replays](REPLAYS.md) |
| Complete original processes | 139,064 tick snapshots compare actor/AI/pose/combat/sensor/projectile state, squad firing lines, debris, explosion/fire pools, all four missile types, Razor flight, flags and RNG. The first four training missions reach success on the same ticks and write identical results. The long assault reaches death on tick 6,055, and a separate run using the original training invulnerability option reaches success on tick 7,317, both with identical result bytes; defence training reaches death on tick 7,917 with identical result bytes. Escort failure and reconnaissance death add further outcomes. The opening campaign patrol reaches success on tick 10,417 with all four squad members alive and a byte-exact debrief. The actual C1_01 result carries into C1_02, whose guarded run reaches failure on tick 11,533 with exact states, results and debrief. C1_03 then succeeds on tick 5,209 and the loaned Razor completes C1_04 on tick 3,969; their original weapon fits, complete results and debriefs also match. Lunar C5_04 matches through disabled-player ending on tick 3,349, followed by a byte-exact original campaign debrief. The v1.0 prefix ends at a verified terrain-visibility difference. Defence training and the long assault each retain an unmodified prefix and a separately labelled bounds-guarded original capture. [Process traces](ORIGINAL_PROCESS_TRACES.md) |

The [native comparison index](../analysis/verification/index.html) links the
retained reports. Each describes its boundaries. The complete-process traces
run the original game under Wine, while most subsystem fixtures execute
original instructions with explicit input/output boundaries. Neither kind of
comparison alone covers every possible mission.

## Remaining work

The [gameplay coverage table](GAMEPLAY_COVERAGE.md) separates exercised combinations
from the next useful full-mission checks.

- Extend complete original-process comparisons to additional missions,
  further deployment branches and mission outcomes. Continue campaign coverage
  from those verified live outcomes.
- Extend the 209 exact cockpit captures to further battles and tactical-map
  interactions. The death-camera sequence now matches. Assault frames include
  moving target brackets, weapon changes, contact reports and ground shadows.
- Extend presentation scheduling checks where separate RNG consumers interact.
  A sound-enabled patrol matches 5,612 positional calls and four complete frames
  with presentation RNG. The separate 68-event view-changing capture includes
  the documented repair for the original heads-down map camera leak. HMI
  device mixing is not emulated sample for sample. The
  original WAV loader's 44-byte truncation is verified and deliberately fixed;
  see [audio analysis](AUDIO_AND_VIDEO.md).
- Retain and investigate low-priority unknowns: BND words without an established
  reader, the ES2 STYLES consumer, the unused-looking
  MAT0 material/coordinate trailer and the unclassified artwork fragments. The terrain loader's
  disregard for the MAT0 trailer is now verified; its authoring purpose remains
  unknown. The recovered artwork is now in the [leftovers gallery](../analysis/artwork/tails/index.html);
  a 16-byte gap and the fragments' authoring history remain unexplained. None
  blocks inspection of the shipped game content. The [SKIMMER.DAT audit](FLYER_PROFILE.md)
  now separates its three live fields from fifteen numeric words with no found
  consumer; four original builds agree under field mutations.

The model and mission browsers use modern display conveniences. Pixel evidence
comes from independent software-renderer comparisons. Discoveries during C++
work are reflected in the analysis tools and exports.

## Repository policy

The analysis tree stays uncommitted for manual inspection. The reconstruction
lives in `../earthsiege2-cpp`, targets C++26 and is committed and pushed in working
increments. Linux CI now builds with GCC 16 and runs the complete original-fixture and
integration suite on pushes and pull requests. All 166 checks pass on the current
pushed revision; the [CI report](../analysis/verification/cpp-linux-ci.json) retains
the run links, complete logs and source revision. The redundant original source containers
have now been removed after rechecking every retained member and sector
representation. Working media and resource contents retain their provenance.
