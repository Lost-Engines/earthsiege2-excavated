# Campaign state and mission rules

The [campaign browser](../analysis/campaign/index.html) connects the five
chapters, unlocks, 227 source-referenced flags and a retained original career
save. Mission sources contain alternatives; a listed flag use does not imply
that every launch includes that record.

## Progression

The six stages in CAREER.DAT are a practice/demo list followed by five chapters
of ten missions. Stage 0 contains eight training missions and three demos.
Campaign stages 1-5 are Alpha, Delta, Omicron, Bravo and the Moon.

The original advance routine increments the mission position before testing
success. A failed ordinary mission can continue to the next mission. Failure
at a chapter boundary, or anywhere in the final chapter, ends the war. Winning
the last mission completes the campaign. On the continuing path, entering
stage 1 mission index 3 transfers the player to bay 4, and entering index 6
withdraws a Razor from the hangar. Those indices are zero-based.

`tools/check_campaign_rules.py` runs all 100 campaign-position/outcome pairs in
both retail shells. The position, returned state and special calls match the
independent rule calculation. Debrief loading/text construction, bay transfer
and chassis removal are observed boundaries in this check; their internal
operations are not covered by the advancement comparison.

## Unlocks and rewards

Four chassis and eight weapons have campaign unlock tests. They compare an
exact flag value, not a minimum. While an item remains locked, its flag is
cleared after the test even if the value was wrong. An already unlocked item
leaves its flag unchanged. The campaign browser lists the required values and
the missions containing their writers. These rules passed 204 cases per retail
shell, including negative, matching and overshot counters.

The unit-grant loop reads flags 21-49. Its valid weapon table only covers 21-42;
43-49 extend into adjacent executable data. Native checks observe those invalid
arguments at the unit-insertion boundary, without letting them corrupt the
armory. None of the 69 distinct supplied mission payloads writes flags 43-49.
This is a dormant bounds error, not seven additional hidden weapon rewards.
116 loop cases per shell verify the number and identity of insertion calls.

The original promotion routine uses divisibility, with no positive-kill test.
The routine has divisors of 20 kills for position 0 and 10 for other
positions, but its caller suppresses skill changes for the player. The player
keeps the difficulty chosen at registration; squadmates can gain skill below
Elite when their cumulative HERC-plus-flyer kills are divisible by 10. Rank uses missions flown, with divisors 10 for the player and
15 for squadmates. Both increases are limited to one level per call. Zero is
divisible too, so a squadmate with no kills can gain skill at debrief. 11,264
promotion cases per retail shell cover the boundaries and both counters.

[Native campaign results](../analysis/campaign/native-rules.json) retain the
addresses, cases and explicitly replaced boundaries.

## Objective decisions and counter operations

Objective conditions are checked again on every evaluation. Their counter
writes are applied once, on the first satisfied evaluation. A failure condition
takes precedence over success. While the player is still in contact with the
enemy, both success and failure return status 10 instead of a final result.
With no contact, failure returns 6 and all required objectives satisfied returns
9. An incomplete mission returns 4 in contact and 5 when clear. The first unmet
required objective supplies the failure text.

Counter operation numbers depend on the consumer:

| Consumer | Operations |
|---|---|
| Objective | 4 set to 1; 5 clear; 6 increment; 7 decrement |
| Mission action | 5 clear; 6 increment |
| Object/group out-of-action report | 1 clear; 2 increment; 13-16 store 1-4 |

The objective and object-report consumers were exercised in four original
simulators: 640 objective cases, 270 counter cases, 16 mixed-objective cases
and 675 out-of-action cases per build. Tests include signed 16-bit wraparound,
one-shot behavior and first-failure selection. Threat, route and group aggregate
queries are supplied as controlled inputs; their actual spatial/AI logic still
needs separate verification. Results are in
[native-objectives.json](../analysis/campaign/native-objectives.json).

Six authored object/group writes use operations with no handler in that layer.
They are exposed in the flag browser. Examples include the intended scouting
report in C1_04, intelligence from C2_06 and two ENRG grants in C3_05. A source
record alone is insufficient evidence that a reward can occur.

## Saved state and launch files

The shell writes campaign saves; the simulator reads a compiled mission and
PLAYER.MEC instead. MISSION.VAR is the 1,000-word campaign flag array, passed
in both directions. RESULTS.DAT carries the outcome, salvage, damage and pilot
statistics back to the shell. The launcher alternates the two processes.

A save holds armory units, build queue, career text references, 36 generated
pilots, player, sparse hangar records, chassis availability, salvage, all flags,
game state and a 20-byte retained block. The stream writer does not truncate,
so readers must tolerate stale bytes after the parsed payload. The retained
new-career fixture is 4,680 bytes with no stale tail; our parser writes it back
byte for byte. It records four Outlaws and a part-built Razor. Construction
percentage is separate from component condition.

PLAYER.MEC has a player index, entry count and one record per active machine:
pilot name index, skill, chassis, weapons/ammunition and 33 condition words.
The shell adds 33 weapon-unlock bytes at the end. The extracted demos and
captured reference handoff parse to their ends. The first campaign's compiled
script and briefing also match a captured original launch byte for byte, as
documented in [missions and terrain](MISSIONS_AND_TERRAIN.md).

## Complete shell checks

`tools/check_shell_handoff.py` now runs the complete original save/load and
debrief paths in both retail Win95 shells. Its files live in a private in-memory
filesystem. The original concrete stream classes and serialization instructions
run unchanged over that transport.

- Thirty-three stock-order fixtures each contain distinct weapon conditions.
  Loading reverses each stock list; writing and loading a second time restores
  its order. The original writer also preserves the supplied 37-byte stale tail.
- Eight independently checked squad exports cover one to four machines and
  sparse hardpoints. An empty mount exports weapon 0 and ammo type 5.
- The slot-10 autosave correctly selects GAME_T in training and GAME_R in a
  campaign.
- Forty-four debrief cases cover training, outcomes, player and squadmate damage,
  the scrap threshold, salvage, purchases, unlocks and chapter/campaign endings.
  Their saved states match between builds.

The calls replaced here are file/CRT transport and presentation: report widgets,
text assembly, movies, palettes and queued window events. Damage, armory lists,
repair billing, build progress, pilot replacement, flag grants and advancement
remain original code. The outcomes are supplied fixture inputs; these checks do
not claim to have played the battles.

`tools/check_campaign_journeys.py` adds two complete fifty-mission histories per
build, one all-successful and one with permitted ordinary mission losses. Every
next mission is compiled by the original loader, carrying the previous debrief's
save state and RNG forward. After the scripted Razor loan, the fixture answers
the equipment choice by selecting the retained Outlaw through the original bay
setter. The player keeps the chosen skill throughout; missions and rank advance.

Mission-file hashes cover the parsed payload. The physical lengths and stale
tails are recorded separately. Reusing SCRIPT.DAT can leave a previous mission's
bytes after the new mission's final record, exactly as with saves.

### Training squad assembly

Thirty-three original training launches cover all eight practice missions,
every selectable chassis, all four difficulties and the time/ammo/damage
options. A training mission builds its squad from group 0. The last wingman is
built in the hangar but never marked on strength, so the export omits it. The
updater runs before the new member has a position and receives a member index
where a position is expected. Our fixtures reproduce the defect in both shells;
it was already identified in the pinned Herculan research.

The campaign browser's **Mission returns** tab exposes the consecutive saves,
training exports and individual debrief results. Raw evidence is in
[native-handoff.json](../analysis/campaign/native-handoff.json) and
[native-journeys.json](../analysis/campaign/native-journeys.json).

## Evidence still to extend

The accounting fixtures above use supplied outcomes. They are now supplemented
by complete original mission runs and ten debriefs using the original battle's
actual RESULTS.DAT and MISSION.VAR. Those debriefs match complete saved state and
shell RNG. Nine use training mode; C5_04 adds campaign mode, with 43 earlier
career outcomes supplied to reach that mission and its actual disabled-player
result returned to the shell. The original shell handoffs are recreated and checked before applying
the results. Window, movie and report presentation remain outside this accounting
fixture. Broader played campaign histories can extend the existing 100 consecutive
shell-mission checks, which deliberately use supplied battle outcomes.

Campaign layout and function leads came from the pinned
[Herculan research](../reference_sources/README.md), including its campaign
continuity and save-format notes. Local checks above reproduce selected rules
in our supplied builds; the source cross-references come from our own parser.

## Carrying earlier results forward

The mission browser's **Earlier mission results** choices expose 34 controlled
histories. Each starts with the actual mission compiler, feeds selected events
through the original simulator's flag writers, and carries the resulting flags
and RNG state into later compiler calls. The event itself is supplied explicitly;
these fixtures do not simulate the battle that caused it.

- C1_01 scout kills reduce C1_02 reinforcements by up to three HERCs.
- Losing the Razor trial adds three enemy HERCs to C1_05.
- Completing the C1_08 data download produces four friendly HERCs in C1_10.
  That flag survives both the listening post's subsequent destruction and a
  loss in C1_09.
- Losing C2_02 adds three defenders in C2_03.
- Neutralising the C2_06 patrol removes three attackers from C2_07. The group
  writes flag 401; the unused flag 402 is not silently substituted for it.

Other fixtures show changes to briefing or persistent state without changing
actor counts. Every selection retains its inputs, event writes and compiled
records alongside the scene. Changing selections preserves the camera.

Rebuild with `tools/build_campaign_branches.py` after the ordinary mission and
scenery builders. `tools/check_campaign_browser.py` checks all 34 selections.

## Simulator results and salvage

`tools/check_simulator_results.py` exercises the simulator's complete result
writer in four builds: 420 cases per build, spanning every 29-component chassis,
five damage levels, satisfied/incomplete objectives and clear/engaged states.
The files match an independent byte calculation. Original objective evaluation,
component readouts, group iteration and stream serialization run unchanged;
only the threat query and private CRT file transport are supplied.

The writer evaluates objectives again at shutdown. A newly satisfied objective
can therefore apply its reward before MISSION.VAR is written. Only status 9 is
saved as success. The 33 condition words use an arithmetic shift to turn Q8
damage into percentage condition. Three kill tallies follow: HERCs, buildings
and flyers. The fourth tally, ground vehicles, is not exported.

`tools/check_salvage.py` adds, per build, 420 chassis-value cases, 180 recovered
weapon cases and nine complete results with enemy wrecks. It confirms:

- Only off-side machines that are destroyed or immobilised contribute.
- The object list is walked backwards, which determines recovered-weapon order.
- A weapon is recovered only below Q8 damage 128, strictly below 50% damage.
- The chassis multiplier is halved when the front cockpit and its dependents
  read fully destroyed. Pre-broken/unsalvageable machines are excluded entirely.
- Weighted armour remaining drops a component's contribution at raw damage 150.
  This is an absolute stored-damage threshold, not 150% or a Q8 fraction.
- Final salvage is `Q10(2500, total wreck value) + 25000 * counter[20]`.

The original recovered-weapon list has room for fifty pairs and no append
bounds check. These fixtures remain inside that capacity; they do not model
whatever adjacent memory a large salvage haul might overwrite.

Finally, `tools/check_simulator_shell_loop.py` connects the two original
programs directly: eight controlled squad/outcome cases in each retail build.
The simulator's result bytes and flags are given unchanged to the shell, which
performs its full debrief and save. Saved states agree across both builds. The
incoming reward counter remains in the saved flag array at this point; the
shell does not itself clear counter 20 during debrief.

Evidence: [result files](../analysis/campaign/native-simulator-results.json),
[salvage](../analysis/campaign/native-salvage.json), and
[complete result/debrief connection](../analysis/campaign/native-full-loop.json).

## C++ campaign integration

The reconstruction now matches sixteen complete fresh-career states at four
startup seeds and all four difficulty choices. Pilot rosters, hangar and armory,
mission compilation, briefing and squad export all match original shell bytes.
It also matches 33 save restorations, eight sparse squad exports, 420 campaign
decision cases and 11,264 promotions. Fixtures are generated by
`tools/export_cpp_campaign.py` and `tools/export_cpp_campaign_rules.py`.

A precise detail of pilot generation matters for repeatable rosters:
`Util_Shuffle` at `0x40f95c` fills the selected empty slot with each successive
value. It consumes one bounded draw for every slot, including the last. An
ordinary swap-based Fisher-Yates produces a different permutation from the same
random draws. The C++ code follows the original instruction order.

Armory insertion at `0x411efd` prepends each new unit. File reading therefore
reverses stock order; fitting pops the most recently returned or delivered unit.
The serializer retains file order and the runtime restoration step performs
that reversal explicitly.

The C++ post-mission path now matches eighty complete debrief saves and final
RNG states from the original v1.1 shell. The additional cases exercise asymmetric
component damage, recovered weapons of different conditions, manual/automatic
repairs and construction, and insufficient or negative salvage budgets. Two
consecutive fifty-mission histories also match all compiled mission payloads and
post-mission saves. Battle outcomes remain explicit test inputs.

Practice assembly matches 36 original launches, including the three instant
action missions with the original instant-action flag set. The training
assignment order and missing final wingman are retained in these comparisons.
The fixture generators are `tools/export_cpp_debrief.py` and
`tools/export_cpp_journeys.py`. The latter can regenerate just the launch cases
with `--training-only` while retaining the already captured campaign histories.

## Live C++ results and a fixture correction

The results adapter now connects the simulator to the shell. Its 968 complete
result files match original v1.1 output, including 128 mixed squads and enemy
wreck lists. The shooter credit and squad messages match another 2,048 native
cases. These are recorded in `analysis/campaign/cpp-mission-results.json` and
`cpp-combat-scoring.json`. Direct-hit weapon loss has 2,048 cases in
`analysis/combat/cpp-mount-loss.json`; 26 of those paths newly lose a mount.

While building these fixtures, the old native salvage harness was found to load
the raw DAT profile two bytes too early. The runtime record has a two-byte
header: file offset 82 is the salvage multiplier, accessed at runtime +0x54.
File offset 84 is the separate mount-destruction gate at runtime +0x56. The C++
live profile reads were correct. The harness and the independent salvage
expectation were corrected, and both original result/salvage reports regenerated
across all four simulator builds. Chassis multipliers now come from the right
field, rather than the neighbouring gate. The formula above is unchanged.

The interactive return now includes the mission report, next briefing, death and
war-loss replay, terminal-game alert, training return and victory movie queue.
A replay uses the saved layout and hangar alongside counters from the failed
attempt. The original mission loader then clears slot 10 and slots 20-42; the
C++ runtime now does so too. Joined integration tests cover those boundaries.
Further campaign branches and native shell UI frames remain open to comparison. Captures are in `analysis/cpp/mission-return`.


## Six consecutive played missions

The original-process history now reaches the return from C1_06. It carries the
opening patrol's success into the next mission, then continues after that mission
fails. C1_03 succeeds using the surviving state. The shell loans the Razor, and
C1_04 reconnaissance succeeds after its two plasma cannons are fitted from owned
inventory. That Razor then completes C1_05 rescue. Before C1_06 the pilot moves
back to the owned Outlaw through the original crew screen and eventually returns
with the objective unfinished. Each actual result goes through the original
debrief, with complete saves, mission flags and RNG compared against C++.

| Mission | Outcome | Last tick |
|---|---|---:|
| C1_01 | Success | 10,417 |
| C1_02 | Failure; documented original building-component guard | 11,533 |
| C1_03 | Success | 5,209 |
| C1_04 | Reconnaissance success in the armed Razor | 3,969 |
| C1_05 | Rescue success in the same Razor | 6,697 |
| C1_06 | Return with the objective unfinished, in the owned Outlaw | 6,000 |

The fitting comparisons check both whole saved states and original stock order.
Weapons occupy sockets accepted by the Razor layout, and the original launch
checks pass. The crew fixture retains both an earlier alternative assignment
and the actual C1_06 assignment. The initial save, prior result/save hashes and
prelaunch actions are retained in each handoff's `scenario.json`.

This supplements the fifty-mission shell journeys, whose battle outcomes are
supplied, with six consecutive actual simulator outcomes. The later C1_08 and
C5_10 battle captures start from supplied earlier outcomes and remain separate
from this history.

See [the broader verification report](BROADER_GAMEPLAY_VERIFICATION.md) and
[native fitting evidence](../analysis/campaign/native-played-loadouts.json).
