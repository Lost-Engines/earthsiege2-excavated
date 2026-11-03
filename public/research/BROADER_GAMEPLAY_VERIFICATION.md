# Broader gameplay verification

The extended comparisons found three errors in the reconstruction: a turning
animation could leave its stop transition running at the wrong speed, Arachnitron
self-destruction used the wrong blast and attacker rules, and disabled weapons
kept parts of their normal cockpit gauges. All three are corrected from the
original instructions. A separate omission in the headless replay adapter made
it continue cockpit target validation after the death camera opened; the live
window already handled that transition correctly.

## Added battles

| Capture | Launch and outcome | Snapshots | Exact full images |
|---|---|---:|---:|
| `campaign-5-razor-carried` | C1_05 rescue in the Razor carried from C1_04; success at 6,697 | 6,698 | 3 |
| `training-6-ogre-hard-night` | Ogre escort at difficulty 3, at night, with the original AI squadmate; player death at 3,421 | 3,422 | 3 |
| `campaign-c1_08-datalink` | Outlaw approaches its data-link objective but is disabled at 3,969 | 3,970 | 3 |
| `campaign-6-outlaw-return` | Actual C1_05 result, original crew reassignment to the owned Outlaw, then Q and an incomplete return at 6,000 | 6,001 | 3 |
| `campaign-c5_10-full` | Final lunar mission through combat and player death at 6,369 | 6,370 | 2 |

These are separate original Wine processes, using ordinary recorded device
packets, a fixed simulation delta of 81 and a controlled presentation clock.
They execute the original movement, AI, terrain, collision, weapons, damage and
drawing code. None of these five captures needs the building-component bounds
guard used in some earlier cases. Every retained state and final `RESULTS.DAT`
byte agrees with C++; their actual results and flags also pass back through the
original shell, with exact debrief saves and RNG states.

C1_05 and C1_06 extend one actual history to six consecutive battles. The next
original C1_07 launch, with two squad members, is retained in
`analysis/missions/captured/campaign-after-six-played`; its battle is not yet
part of the comparison corpus. C1_08 and
C5_10 instead start from original shell histories with supplied earlier outcomes.
The C1_08 link was not completed and C5_10 ended in death, so their campaign
victory paths remain useful further comparisons. A requested finale image at
7,000 was never reached because the original had already ended at 6,369; the
frame exporter records that reason instead of treating it as a missing image.

Process fixture reports:
[rescue](../analysis/combat/cpp-original-campaign-rescue.json),
[nighttime escort](../analysis/combat/cpp-original-hard-night-escort.json),
[data-link attempt](../analysis/combat/cpp-original-campaign-datalink.json),
[incomplete return](../analysis/combat/cpp-original-campaign-return.json),
[finale](../analysis/combat/cpp-original-campaign-finale.json).
The [debrief report](../analysis/campaign/native-played-debriefs.json) retains
result, flag and save hashes. The
[hangar report](../analysis/campaign/native-played-loadouts.json) contains two
original crew assignments and two weapon fits, with complete saves on both sides.

## Interrupted pivot stops

C1_06 first diverged in a stationary AI HERC's animation rate on tick 4,083.
The original restored +100; C++ retained +43. Root heading then differed on tick
4,084 and that changed later aiming and combat.

The original code at `0x4172a0..0x4172d6` checks whether a stop animation is already
requested. If it is, it skips only the duplicate request. It still restores the
exit rate to +100 or -100. C++ had placed both operations inside the test. A HERC
that briefly resumed turning while its earlier stop remained pending could
therefore keep the slower pivot rate on its next stop.

The same review found that the original writes zero back to its turn-input stack
argument at `0x416d2e` during pivot acceleration. The extracted C++ helper had
received that value by copy. Passing the reference preserves the suppression
for the rest of the control update.

`tools/export_cpp_pivot_stops.py` now captures 13,400 original steps across all
twenty walking chassis, alternating short turns, stops and renewed movement.
It compares the control state, animation thread and root transforms. The fixture
fails against the earlier implementation and passes with the correction. The
full C1_06 run then matches all 6,001 snapshots, its result and three images.
See [native pivot-stop evidence](../analysis/gameplay/native-pivot-stops.json).

## Arachnitron detonation

At C5_10 tick 2,243 an Arachnitron enters `Mech_RamMove`'s detonation path. Its
original body disappears below the map at Z=-100,000; the old reconstruction kept
it at Z=23,838. Debris and simulation RNG diverged during the same update.

`Mech_RamMove` starts at `0x41e488`. The detonation branch at `0x41e506` makes a
radius-3,000, damage-2,000 area blast that explicitly excludes the rammer. It then
walks all 29 component slots. Every remaining active slot receives 32,000 damage,
with the rammer itself as attacker. The C++ adapter had included it in the blast
and then applied anonymous component damage, consuming different random draws
and altering the destruction sequence.

The Arachnitron's profile also sends its destroyed body into limbo. That health
transition already set the correct hidden position, but movement retained the
old position and wrote it back during synchronization. The state-change handler
now publishes the limbo position to movement immediately. The resulting battle
matches every captured field through death on tick 6,369, including the effect
pools and simulation RNG.

## Offline weapon gauges

C1_08's last retained cockpit image, tick 3,800, initially differed by 1,106
pixels, all within the disabled weapon rows. The earlier images were already
exact.

The native `ChainedWeaponSelectGadget` paint path starts at `0x4426e8`; its disabled
branch at `0x442772` selects PWEAPONS frame 6 and the grey font. It expands the
label rectangle to the right edge of the gauge and centres OFFLINE across it.
The ammunition and charge widgets are disabled. `WeaponSlider` checks that state
at `0x442b7b` before drawing. C++ had kept the normal ready lamp and meter layout.

The correction reproduces those branches. All three complete images now agree,
including every palette entry, with no ignored pixels. The
[initial difference report](../analysis/rendering/cpp-datalink-frame-difference.json)
and its [images](../analysis/rendering/datalink-frame-difference/) retain the
pre-fix evidence; the
[current frame fixture](../analysis/rendering/cpp-campaign-datalink-frames.json)
is checked by `original_campaign_datalink_frames`.

## Headless death view

Once the detonation matched, the final mission's only remaining discrepancy was
its selected target at tick 6,144, after the player had died. The window had
already switched to the locked outside camera. The headless driver omitted that
change and continued checking whether the target qualified for a cockpit display.
It cleared a target that the original outside view retained.

The headless adapter now applies the window's post-tick visibility gate before
the display-state update. No gameplay rule changed for this correction. The
complete final-mission fixture and exact 80-byte result then agree.

## Evidence and current totals

The addresses above belong to the reference Win95 English v1.1 `DBSIM.EXE`, SHA-256
`8561aa47e5bb1bf1f837044b08e5d807e8de492784331708a7ddeabf6d44c4ad`.
The [instruction extract](../analysis/gameplay/broader-verification-instructions.txt)
retains the relevant bytes and disassembly.

The process corpus now contains 45 cases: 40 controlled v1.1 cases, one v1.0 prefix
and four demo cases. It compares 165,525 snapshots, 192,104,802 named fields and
1,357,011,355 integer values. Separate full-image comparisons cover 223 frames,
68,505,600 pixels and all RGB6 palette entries. Nineteen actual battle outcomes
have matching original debriefs. Prefixes and repeated missions are included in
those case counts. The two earlier message-queue image departures remain
separately documented.

Next useful additions are another continuation of the actual campaign history,
a completed campaign data link, alternative late-mission outcomes, and more
loadout/difficulty combinations. The [coverage table](GAMEPLAY_COVERAGE.md)
distinguishes those from the scenarios already exercised.

All 177 local CTest checks pass on C++ commit `78ff259`. The
[verification report](../analysis/verification/cpp-broader-verification.json)
retains the per-test results, log hashes and source revision.
