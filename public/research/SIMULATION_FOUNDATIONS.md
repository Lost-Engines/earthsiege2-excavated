# Simulation arithmetic and timing

The original executable is used as an oracle for the small rules that affect
movement, collision, damage and animation. Independent Python implementations
are in `tools/simulation_math.py`; `tools/check_simulation_math.py` compares them
with unchanged x86 routines in v1.0 Win95, v1.1 Win95, v1.1 Win3.1 and the April
demo. Every checked case agrees in all four builds.

## Tick units and integer arithmetic

A nominal 125 ms is 256 simulation time units. The main loop caps updates at
25 per second; 40 ms converts to 81 units after truncation. The timestep is
bounded to 64 through 450. Rate integration multiplies a signed 16-bit rate
by that delta, shifts by eight and clamps to -32767 through 32767.

Other routines use signed Q8, Q10, Q14 and Q16 products. The Q14 helper takes
a signed 16-bit second operand. Products are signed 64-bit intermediates, with
the shifted result reduced to 32 bits. Replacing these with unconstrained
floating point changes rounding and overflow at boundary cases.

The common distance approximations are not Euclidean lengths. With magnitudes
ordered largest first, the 2D helper returns `a + (b >> 1)`; the 3D helper is
`a + (b >> 2) + (b >> 4) + (b >> 5) + (c >> 2)`. The separate shifts matter.
Timer countdown and approach-to-target helpers retain their original signed
word/dword wrap before clamping.

Per build, the [comparison report](../analysis/combat/native-simulation-math.json)
covers 512 distance vectors, 2,048 fixed-point products, 66 integrations,
72 countdown cases and 1,024 approach-to-target cases.

## Collision and difficulty

The ray-versus-sphere helper works in a ray-aligned frame with Y forward. It
rejects points behind the ray or at/past its current length, then uses the 2D
approximation on X/Z against the radius plus the configured allowance. The
boundary is outside. A hit can shorten the ray to `Y - (radius - distance)`,
clamped at zero. This is a conservative integer hit volume, not an analytic
sphere intersection. 2,464 boundary and random cases per build agree.

The damage difficulty helper multiplies side 0 by 3500, 2800, 2100 or 1400,
and other sides by 300, 600, 800 or 1000, then shifts by ten. Its destination
is a signed 16-bit value, with wrap rather than saturation. 288 cases per
build cover all four difficulties and signed boundaries. The enclosing hit
path determines which side is passed; these factors alone do not describe a
complete weapon hit.

## Explosion cadence

Explosion type tables store interval 1. It is a raw countdown value, not a
whole 125 ms unit. Every legal simulation delta expires it, so an explosion
advances one cell frame per simulation update and finishes when it wraps.
The fire timer reload of 64 also expires at the minimum timestep.

`tools/check_effect_timing.py` executes 176 complete explosion lifecycles per
build, covering 22 types, both artwork sets and four deltas. The
[timing report](../analysis/combat/native-effect-timing.json) records every
frame. This verifies frame advancement and termination without attached light
or terrain effects. The browser defaults to 25 frames/s for inspection and
plays explosions once; fire previews repeat.

## Scope

These checks establish arithmetic, timer and collision primitives. They do not
by themselves verify complete HERC movement, shield arbitration, component
cascade, projectile guidance or AI decisions. Those consumers are analysed
separately before they are used in the native reconstruction. The pinned
Herculan research provided address and format leads; the comparisons run
against the supplied executables and use independent calculations.


## Target aspect and armed buildings

Combat geometry asks the target's virtual turret-direction getter regardless
of class. HERCs return torso twist; armed buildings use `Base_GetTurretAngle`
(`0x403594`) and object word +0x20f. Flyers return zero. Ignoring a gun tower's
aim changes the attacker's steering even when range, position and heading agree.
DEMO2 first exposes this at tick 707. The 4,912-case tactical fixture now invokes
the real building getter and covers this path in all four executable families.
