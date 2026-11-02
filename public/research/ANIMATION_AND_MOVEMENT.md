# Animation and movement

The [model browser](../analysis/models/index.html) uses an independently implemented animation-thread state machine. `tools/check_animation.py` executes the original code over the same resources; `tools/check_animation_browser.py` compares the browser implementation to the resulting thread state, local poses and root transforms.

All four comparison executables agree on **27,487 snapshots each**, covering 29 runtime animation lists and 6,547 scenarios. These include every authored frame at several offsets, fractional seeks, forward and reverse rates, transition requests, stopping on arrival and reseeding root motion between simulation steps.

## The authored animation system

A thread plays a sequence and blends from its current frame to its next frame. Every frame has its own duration. A cyclic sequence wraps; a one-shot sequence holds its last frame. These are different resource classes, with different original virtual methods.

A request for another sequence waits for an authored transition. The transition names a source frame, destination sequence/frame, duration and a separate movement keyframe. Reverse playback searches and traverses these links in the opposite direction. A request can stop on arrival. An unconnected sequence request does not invent a blend.

A pose interpolates its six 16-bit rotation/translation components using a rounded Q10 fraction. Rotation differences wrap as signed 16-bit angles. The sequence's column zero is excluded from pose writes because it carries ground movement. Part hierarchies then compose the local transforms using the original Q14 matrix math.

The original can play several threads on a shape, usually locomotion, torso twist and aim pitch. Lower priority numbers win when two threads write the same joint. Registration order breaks ties until a priority change reorders the slots. The model browser currently exposes one thread at a time. Native multi-thread scheduling remains a separate check.

## Root motion

The model's +Y axis points forward. A walking frame contains both a pose and an increment of ground movement. Reading the root at a fractional frame scales that increment using integer multiplication followed by signed division. A completed frame commits the entire increment; reverse playback removes it.

The simulator seeds the root with the identity transform before a step and reads back the change afterwards. This moves the machine in the world. It also supplies camera bob through the animated cockpit joint. Replacing this with constant forward speed would remove the footstep rhythm and alter collisions.

The browser's “Show root motion” option displays the accumulated displacement. It is off initially so a walking model stays in its inspection area. Camera framing remains fixed during animation. The transition panel exposes the current and next sequence/frame, pending request and root transform.

## Clock rate

The simulation timer uses 256 counts per 125 ms. Animation receives `(simulation_delta * 100) >> 8`, then multiplies that by its Q8 playback rate. Rate 256 is authored speed; walking and turning controllers choose other rates.

At a 40 ms simulation step, the two integer conversions produce 81 timer counts and then 31 animation ticks. The browser now uses this nominal 25 Hz cadence, giving 775 animation ticks per second at 1x. The idealised unrounded rate is 800. Its earlier `2.048 * elapsed_ms` playback was too fast because it applied the simulation timer scale directly to animation time.

The separate explosion/fire viewer has its own lifetime rules. Its intervals are not ANSequence durations.

## Chassis normalization and throttle

`tools/check_movement_inputs.py` executes the type-loader arithmetic and throttle-input routine in all four builds. Each passes 21 complete normalized chassis records, 11,466 input cases and 189 speed-readout cases.

Non-flying chassis speeds are scaled at load time using their stride numerator and denominator. Raw file values therefore differ from the runtime values used for forward/reverse speed and gait thresholds. Both sets are exported in the model/combat profile data. File offset 108 is the reverse walk/run threshold, not an animation index.

Throttle tests cover absolute-axis and incremental input, forward/reverse selection, dead zones, crossing zero, steering reversal and dispatch to the movement controller. They observe that controller's call boundary. Full locomotion, terrain collision and flight integration need their own comparisons.

## Evidence

Addresses below are DBSIM 1.0; reports retain matched addresses for the other builds.

| Function | Address |
| --- | --- |
| Set sequence / seek | `0x4791a0` / `0x479238` |
| Request sequence / set rate | `0x479570` / `0x4795cc` |
| Advance thread | `0x479614` |
| Evaluate local poses | `0x4799a4` |
| Read / seed root | `0x478fa8` / `0x479088` |
| Commit / uncommit frame movement | `0x478e60` / `0x478ee8` |
| Throttle input | `0x4160dc` |
| Speed readout | `0x415498` |

Reports: [native animation](../analysis/models/native-animation.json), [browser comparison](../analysis/models/browser-animation.json), [movement inputs](../analysis/combat/native-movement-inputs.json). Layout and call-site leads came from the pinned Herculan research credited in [reference_sources](../reference_sources/README.md); the local fixtures execute the retained original binaries.

[World movement and contacts](WALKING_AND_CONTACTS.md) now verify how those
root transforms move a HERC and how blocked steps restore playback state.
