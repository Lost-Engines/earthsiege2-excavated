# Gameplay combination coverage

The reconstruction is ready for playtesting. The current original-process corpus
contains 45 cases and 165,525 snapshots, alongside 223 complete exact cockpit
frames and nineteen debriefs from actual battles. These counts include prefixes
and repeated missions under different conditions. Linux CI runs the retained
fixtures on every code change.

## What has been combined

| Combination | Original-game evidence | Boundary |
|---|---|---|
| Training instructions, controls and successful exit | Training 1-4 reach their original success ticks and write identical results | One retained control stream per outcome |
| Assault combat with and without protection | Death and protected victory, full states and results | Original training protection option; labelled captures apply the documented building-component guard where needed |
| Squad navigation, firing, damage and campaign return | Opening patrol succeeds with four squad members; the following battle fails | Actual results pass through the shell between missions |
| Loss, recovery, rescue and chassis changes | C1_02 failure, C1_03 recovery, C1_04 Razor reconnaissance, C1_05 rescue and C1_06 incomplete return in the owned Outlaw | Six consecutive actual battle outcomes and original shell transitions |
| Earned inventory, weapon fitting and flight | Both plasma cannons move from stock onto the Razor; launch checks pass; reconnaissance completes | Exact saved states around each fit, then independent flight and debrief captures |
| Reinforcements, armed bases and lunar conditions | C5_04 delayed deployment through a disabled-player ending; later campaign openings | Earlier shell history in these cases uses supplied outcomes |
| Difficulty and nighttime conditions | Ogre escort at difficulty 3 through player death, with the original AI squadmate | One retained practice run |
| Arachnitron contact and self-destruction | C5_10 through player death, including the full blast, component destruction and debris sequence | Prior shell progression uses supplied successes; final victory remains unplayed |
| Data-link attempt and disabled cockpit | C1_08 through disablement, including three exact images and its debrief | Link completion is separately covered in training and joined objective fixtures |
| Missile acquisition and guidance | All four missile ammunition types, including EO steering and release | Controlled mission runs, not every possible target or loadout |
| Cockpit interaction during simulation | Side views, heads-down map, squad orders, radio portraits, damage pages, flight, combat and death camera | Complete indexed images and palettes at retained frame boundaries |
| Sound during squad combat | 5,612 positional requests and four complete frames in the opening patrol | Game-facing calls, camera and selected presentation RNG; host mixing is separate |
| Dense effects and deletion | Original debris, explosion and fire state is captured every tick; defence runs reach debris capacity | Full fire-pool replacement is covered by separate instruction fixtures, not a naturally saturated campaign recording |

The [latest pass](BROADER_GAMEPLAY_VERIFICATION.md) found and fixed an interrupted
pivot-stop animation, Arachnitron self-destruction ordering and disabled weapon
gauge rendering. The [process report](ORIGINAL_PROCESS_TRACES.md) identifies the exact runs,
original guards and deliberate bug fixes. Two message-queue images remain
separate documented departures, with no masked pixels counted as exact.
[Campaign analysis](CAMPAIGN.md) distinguishes actual played outcomes from the
two fifty-mission shell histories that supply their battle results.

## Next useful combinations

1. Continue the actual history beyond C1_06, retaining equipment, damage,
   repairs, spending and pilot changes. C1_06 ended with an incomplete return;
   the original debrief and following C1_07 launch have already consumed and
   verified that outcome.
2. Complete more later campaign objectives, especially alternative success and
   failure paths around deployment, escorts and the final campaign missions.
   C5_10 now has a full death outcome. Its victory and a completed campaign
   data link remain useful additions.
3. Exercise different difficulty, loadout and squad choices together during
   complete missions. The component fixtures cover these separately, but a
   single retained history cannot establish every interaction.
4. Add selected cockpit/map and sound observations to those battles as useful
   checkpoints. Prefer new gameplay situations over near-identical timing
   samples.

The method remains the same: prepare a legal launch through the original shell,
record ordinary controls, replay them in the original executable, and compare
states and results against C++. Captured expectations never come from the C++
control planner. If the original fails, retain the failing run and establish its
cause before making a separately labelled guarded capture.
