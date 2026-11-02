# Environment and drawing rules

The [environment browser](../analysis/environment/index.html) shows the original
sky backdrop, terrain texture banks, palette shading and distance colour ranges.
Its sky rasterizer is checked against the original executable's framebuffer
output. The mission and model browsers still use WebGL for inspection; their
pixel coverage and depth ordering are separate from these software checks.

## Worlds and skies

`WORLD0.WLD` through `WORLD9.WLD` form five day/night pairs: urban, snow,
volcanic, ice and Moon. A compiled mission selects `2 * theater + time_of_day`.
Each descriptor contains horizon parameters, two lists of distance thresholds,
start/end palette-index ranges, distance offsets and five resource names.
`tools/world_formats.py` consumes every byte and retains the unused fields.

The sky is a run of flat palette fills. Its zenith starts at index 208. Worlds
0, 2 and 6 use sixteen colours through index 223; the others use fifteen through
222. Bands are six screen pixels high at both original resolutions, so the
640-by-480 gradient occupies a smaller proportion of the display. The backdrop
below the horizon uses the horizon colour, before terrain paints over it.
The ground-colour fields in the descriptor feed another branch that the normal
scene draw does not select.

Pitch, roll, focal shift and projection centre produce two integer horizon
endpoints. Side and heads-down views lengthen that line to cover their displaced
viewports. The trigonometry uses the original Q14 cosine table and angle rounding.
The level view uses rectangle fills. Any nonzero roll switches to polygon bands
with a different first-band offset; the gradient moves by five rows at the
transition with the supplied settings. At exactly 180 degrees of roll the ground
outline crosses itself. These quirks are visible in the original routine output
and are preserved in this analysis viewer.

All world descriptors contain the name `clouds2`. The loader reads it into a
buffer that the next name replaces. The normal horizon path does not use a
texture. A bitmap-strip loader and drawing routine exist, but no caller has been
located in the surveyed executable. The browser therefore shows the verified
banded backdrop. It does not infer animated clouds from that filename.

## Texture fade and colour ranges

The `.RMP` files contain a table for each shade level and depth slice. The supplied
world ramps have 32 shade levels and 12 depth slices. A texture pixel selects
another palette index through one of those tables. This retains the authored
per-colour behaviour throughout the fade.

Fade starts at half the visibility range. The remaining half selects successive
depth slices, ending at slice 11. The distance is view-space depth. Terrain uses
the nearest corner of the cell for the entire cell; deferred objects use their
own render-entry depth. Fullbright texture faces bypass this lookup.

Contour-shaded model faces also use raster colour ranges that change with
distance. Flat-shaded faces retain the original DPL ramps and then apply the
RMP fog row; they do not use these mutable ranges. The WLD start/end ranges expand into sixteen bands for each of eleven
columns. The expansion interpolates both first and last indices in 8.8 fixed
point, with a `+1` in each numerator and an exact final row. This differs from a
floating-point interpolation of the first index and count. `SHADES.DAT` assigns
these columns to selected ramps for each object type.

The browser's texture panel shows an individual lookup. Its range table shows
the separate object-colour bands against the tagged-object distance thresholds.
The distance control uses an explicit visibility range of 114688 original units
for the range table; an actual scene derives visibility from its terrain detail
setting and cell scale. It is an inspection control, not a simulated mission.

## Original-code comparisons

Addresses below refer to the v1.0 Win95 English `DBSIM.EXE`. The harness locates
corresponding instructions in v1.1 Win95, v1.1 Win3.1 and the April 1996 demo.
All drawing executes in mapped original code with an owned linear framebuffer.
The environment harness supplies thread stack metadata for Borland's local-array
constructor. It does not replace the sky, clipper, scan converter or fill routines.

| Routine | Address | Evidence |
| --- | --- | --- |
| Polygon clipper | `0x48422c` | 1024 convex outlines and clip rectangles per build |
| Polygon scan converter | `0x484614` | 1024 outlines per build |
| Solid polygon dispatch | `0x4841af` | 256 complete 320-by-240 indexed frames per build, both windings |
| Horizon construction and draw | `0x42ec08`, `0x42ec68` | 120 complete frames per build, both resolutions, rolls, pitches, side offsets and cropped viewports |
| Sky and ground fills | `0x42ee88`, `0x42f0b0` | Included in the complete backdrop comparisons |
| Palette range expansion | `0x430d08` | All ten world descriptors per build |
| Depth fade and shade row | `0x467fec`, `0x468054` | 1024 varied distances, table dimensions and shade inputs per build |

Results:

- [Solid raster checks](../analysis/rendering/native-solid.json).
- [Environment checks](../analysis/environment/native-environment.json).
- [JavaScript browser checks](../analysis/environment/browser-check.json).

The independent Python calculations match the original indexed bytes. The
JavaScript rasterizer is separately compared with all 120 retained original
backdrop fixtures. Texture interpolation and model painter ordering have separate native checks below.
One hundred and five complete simulator frames now match exactly, including actors and
cockpit widgets during idle, movement and side/heads-down view changes. See
[complete-process captures](ORIGINAL_PROCESS_TRACES.md#complete-cockpit-frame-captures).

Format and address leads came from the pinned Herculan research described in
[research sources](../reference_sources/README.md). The implementations and
native comparisons here provide independent checks against our supplied builds.

## Textured polygons and model draw order

`tools/check_texture_raster.py` checks the screen-linear texture path in four
original simulator builds. Each build matches 1,024 polygon clips and edge
walks, plus 256 complete 320×240 frames. Fixtures cover unshaded, constant-shade
and interpolated-shade modes, both opaque and colour-key requests. UVs are Q8
at vertices and Q16 along edges and rows. The reciprocal table truncates
`65536 / length`; those truncations are visible in the resulting texel choices.
The interpolated-shade writer ignores the transparency request, whereas the
other two modes skip source index zero when colour-keying is enabled.

There is a separate original boundary defect. If a clipped final edge begins
exactly at the bottom bound, the edge builder can skip its last row. The
opposite edge can still cause that row to be drawn with stale table contents.
Five of the 1,024 fixtures expose an unwritten edge row in every build. Their
coordinates and affected rows are retained in `native-texture.json`; comparisons
of edge values cover the rows actually written. The 256 full-frame fixtures do
not hit this defect. `texture_math.py` provides complete, defined edges for its
standalone image calculation rather than introducing stale memory on purpose.
The perspective path is covered below. Arbitrary scanline masks remain separate work.

All 586 BSP-part trees were exercised from sixteen eye positions, with both
painter and depth-order flags: 18,752 native walks per build. Transformed planes
use the original Q14 inverse rotation and signed 32-bit distance. Browser
traversal also matches all 9,376 painter-order fixtures. Fifteen trees leave
stored children unreachable, including a Pitbull LOD, Hyperion LOD, rocket
exhaust and several building variants. The evidence records every omitted
child. The original topology and its use of transform IDs were described in
the pinned Herculan research; these fixtures independently execute it.

The model browser now draws in this order, selecting polygon sides from their
stored normal and centre. Weapon shapes replace their hardpoint placeholders
inside the same traversal. Authored outline colours are retained. This also
lets decals draw over their support face when their vertices sit slightly
behind it, as they do in the original. Raster coverage is still provided by
WebGL in the inspection browser. The mission browser retains a depth buffer
for the assembled scene while following the same BSP child selection.


## Perspective texture path

`tools/check_perspective_raster.py` matches 256 complete frames in each of four
builds: 192 at 320 by 240, and 64 at 640 by 480. The fixtures exercise near-plane
crossings, screen clipping, all three shade modes, colour-key transparency and
the optional quadratic edge fit. The report retains the input geometry, UVs,
shades, viewport and output hash for every case.

The near renderer (`0x46865c`) carries UV-over-depth in 64-bit edge accumulators
and reciprocal depth in 32 bits. It divides at the ends of short horizontal
runs, interpolating within each run. Run length depends on the reciprocal-depth
difference across the span. The quadratic option adjusts the first and final
UV endpoints using a fitted edge curve. The intermediate divisions and shifts
must be retained to reproduce its pixels.

A perspective span excludes its right endpoint, while the screen-linear writer
includes it. The near writer always uses a constant shade row. Mode 1 updates
that row; modes 0 and 2 reuse the previous value, even though mode 2 has prepared
per-vertex shades. Normal textured terrain selects mode 1.

The original near-plane intersection bypasses the projection scale. It treats a
crossing vertex as having reciprocal depth 1 and adds its unscaled coordinates
to the screen centre. This agrees with the normal projection at focal length
256 and near distance 256. The 640-by-480 view uses focal length 512 with the
same near distance, so crossings can distort the polygon. In one retained
fixture this produces a non-monotone edge: the edge writer overwrites some
rows, counts them twice, and the span loop then reads nine old rows from the
static workspace. The independent comparison retains that workspace across
polygons and reproduces the resulting pixels. Degenerate polygons draw zero
rows and leave an unused top-row field unchanged.

These are original behaviors, not proposed requirements to emulate unsafe
memory access in C++. They identify where a corrected implementation may
legitimately differ. The camera/near-plane inconsistency is also described in
the pinned Herculan rendering research; the complete frame comparisons here
check its consequences in all supplied executable families.

## Complete ground and backdrop frames

The [rendering gallery](../analysis/rendering/index.html) contains sixty native
frames: six camera views in each of the ten day/night environments, using both
320-by-240 and 640-by-480 output and all three terrain-detail settings.
`tools/check_scene.py` executes the original camera, frustum, cell walk, surface
selection and drawing code. Object queues are empty in these fixtures, so the
images contain terrain and backdrop without buildings or vehicles.

An independent calculation projects every submitted polygon and composites its
indexed pixels in the original order. The complete frames, visited cells and
draw commands agree in all four executable families. Material indices and UV
corners are also checked directly against MAT0 and the mission terrain, so a
shared error in capture setup cannot pass solely through matching raster math.
The retained commands include each polygon's source cell, texture, UVs, shade,
projection path and fade offset.

The gallery opens directly from disk. Its browser check loads all sixty views.
These are controlled camera fixtures over compiled mission terrain; they do not
claim validation of object queues, cockpit composition or a running mission.

## Model outlines, contours and lighting

`tools/check_model_raster.py` compares 256 full contour-shaded triangle frames
and 512 clipped lines in each original build. Gouraud faces are subdivided into
flat bands of palette indices. The interpolation walks each edge with integer
division, so using an ordinary GPU colour gradient changes the band boundaries.
The Windows linear line writer uses centred Bresenham stepping; Earthsiege 1's
unmasked VGA writer used a different endpoint accumulator.
[Contour and line fixtures](../analysis/rendering/native-model-raster.json).

`tools/check_model_lighting.py` compares 1,024 combinations of light positions,
model transforms, face normals and point positions in each build. It covers
ambient, directional and point lights, including their fixed-point overflow,
attenuation and maximum-intensity clamp. Face and point responses both agree.
[Light fixtures](../analysis/rendering/native-model-lights.json).

There is an original defect in saved-node lighting. The save and restore loops
advance through the saved copies but repeatedly address light-list entry zero.
Restoring a node therefore restores the sun, which occupies that entry, while
additional effect lights retain their last transformed positions and directions.
A subsequent part can be lit as though it occupied another node's frame. The
native fixture saves one model transform, installs another, restores the first
and checks every light. All four builds show this behaviour. The pinned Herculan
research identified the loop defect; these checks independently reproduce it.

## Complete model and sprite frames

The [original model gallery](../analysis/rendering/models.html) contains 483
polygon-model views and 599 sprite cells. All 1,082 frames agree byte for byte
across the 1.0, 1.1 Win95, 1.1 Win3.1 and April demo executables. Independent
calculations also reproduce their pixels.

For polygon models, the original hierarchy selects the commands. The comparison
then checks the composed node/view transforms, transformed sun, per-face light
response, texture projection and indexed raster output. It covers every raw
shape without billboards, using all ten environment palettes and all three
texture-shading settings. These fixtures retain each root's stored pose and
unfitted weapon placeholders. Equipped HERCs have separate fixtures below. Scene queues and cockpit overlays
remain separate consumers.

Sprite checks cover every cell in all 56 roots with a known bitmap-bank binding.
The remaining `METEOR.DTS` sprite root has no identified bank and is recorded as
unbound. Its polygons are included in the model comparison. Each sprite cell
uses a different camera/model pose to exercise projection and rotation; those
poses are test inputs, not the game's animation sequence.

The sprite renderer is not a simple camera-facing rectangle. It projects the
model's vertical axis, rotates the bitmap to match it, and adjusts the height
between the bitmap's width and height according to the projected axis length.
The length uses the engine's approximate 2D magnitude. A zero horizontal axis
component forces zero rotation, including when the projected axis is inverted.
The vertical hotspot is an **unsigned** byte, then scaled and wrapped to eight
bits; the horizontal hotspot is signed. The interactive browser previously used
a signed vertical hotspot, which misplaced fire images. It now uses the correct
anchor and view-dependent geometry.

The rotated-bitmap raster is checked separately with 512 cropped and rotated
quads per build, including both flip axes. Transparent mode skips index zero;
the remapped mode maps zero along with the other indices. Edges exclude their
bottom row, spans include both endpoints, and texture samples use rounded Q16
coordinates. These details differ from the polygon texture writers.

Reports: [model frames](../analysis/rendering/native-model-scenes.json),
[sprite frames](../analysis/rendering/native-billboards.json),
[bitmap raster](../analysis/rendering/native-bitmap-polygons.json).
The WebGL inspection browser still uses GPU pixel coverage; the gallery shows
the original indexed output. All 540 interactive roots pass the browser check.


## Equipped HERCs and detail selection

The original-model gallery also offers an **Equipped HERCs** filter with one
example for each of the 21 chassis. `tools/check_actor_draw.py` compares 420
complete frames per executable: each chassis bare and equipped, at ten camera
ranges and detail/shading settings. All four builds produce identical pixels.
The independent raster reproduces all 1,680 frames.

The game remaps each detail level onto the first root's animation nodes. It then
replaces the hardpoint parts with configured weapon shapes and stamps those
shapes with the hardpoint's joint index. Weapon point lists receive a mount-side
translation, but only vertices referenced by supported polygon classes are
translated. Shared or alias-only points do not automatically receive that
translation. The fixtures check 16,540 remapped fields and 27,315 translated
points per build, before comparing the final drawing.

Chassis and weapon textures share a packing context. Packing them independently
can overwrite atlas pages and make an otherwise correctly assembled model show
the wrong textures. The comparison retains the complete shared bank.

Detail selection uses the engine's approximate 3D magnitude, model radius and
integer screen-size scale. Starting at a biased detail level still starts the
threshold walk at the first threshold; bias does not advance both cursors.
The original draw routine temporarily selects a root and restores root zero.

The gallery records the weapon fit used for each example. These are inspection
fits drawn from the stored starting fits where available, with representative
weapons for the other chassis. They are not asserted to be the fit used by every
mission instance. The tests execute the original actor/shape draw consumers;
world draw queues are checked below. [Complete original cockpit frames](ORIGINAL_PROCESS_TRACES.md)
now also check the joined world and interface compositor.

[Equipped frame evidence](../analysis/rendering/native-actors.json).

## Scene filing and object order

`tools/check_scene_order.py` now checks the full object-submission pass and the
per-cell draw queues in all four builds: 2,048 cell picks and 256 submissions
per build, containing 6,671 cell buckets, 772 ground-shape draws and 6,339 sorted
object draws. [Native report](../analysis/rendering/native-scene-order.json).
Terrain visibility answers and final drawing are explicit boundaries; filing,
class-specific range limits, owner-cell inheritance and sorting run natively.

Objects are filed into their terrain cells, with a possible one-cell adjustment
towards the viewer when their radius crosses the edge. That adjustment is
undone if the supplied face is invisible or it leaves the permitted region.
Attached effects inherit their owner's cached cell. Objects without a valid
cell use the separate outside bucket.

The terrain cell is drawn first, then its ground shapes in submission order,
then its other entries from farthest to nearest. **Equal-distance entries use
reverse submission order.** Ground shapes bypass the ordinary object gate.
Other entries use class-specific limits derived from the terrain range; exact
range equality still draws. Changing these to one global distance sort would
change the original overlap rules.


## Texture packing and the C++ renderer

The texture allocator at Win95 v1.0 `0x469d10` scans existing 256 by 256 pages
from top to bottom. It tries a shared left edge across all rows covered by the
bitmap, then a shared right edge. Each occupied row loses the bitmap width from
its available span. A new page is allocated only if no existing span fits.
Frames are packed in file order. The loader computes the largest remaining
frame dimensions, but those values do not affect placement. Pixel zero marks a
texture as transparent. Chassis and fitted-weapon banks share the allocator.

`analysis/rendering/native-atlas.json` records 20 original packing layouts,
including the shared chassis/weapon banks. The C++ allocator matches all 872
descriptors and all bytes in their 47 pages.

Texture shading mode 2 derives four corner intensities from the face light:
`[light, min(255, light + light/2), light, light/2]`. These are synthesized
values, rather than vertex normals stored in the textured polygon. The original
setup is at `0x474e9c` and `0x4750fd`. Back-face vertex reversal leaves that
intensity order in place.

The initial C++ renderer now matches every pixel of the 483 complete polygon
model fixtures and 599 billboard-cell fixtures. The latter include the original
rotation and camera-dependent sprite stretching. Equipped actors, scene queues
and a full running mission are the next integration layers.


## Terrain shade overflow

The C++ terrain comparison exposed a missed signed overflow in the analysis
exporter. At ZONE1700 cell (100, 113), for example, the near normal is
`(1396, 511, 1489)`. Its dot product with the mission sun, multiplied by 256,
crosses the signed 32-bit limit. The original multiplies with wrapping `IMUL`,
then arithmetic-shifts and stores the result as a byte. Its shade is **1**;
using an unrestricted integer product incorrectly produced 255.

The exporter now preserves that wrapping arithmetic. Terrain fixture generation
also checks every overflow candidate in all 39 zones against the original
executable, alongside the regular surface and height samples.


## C++ terrain comparison and harness correction

The C++ renderer matches 60 complete original ground frames, with 11,622
commands compared before rasterization. Its visible regions and ordered cell
visits match independently. The frustum uses the difference between inclusive
clip edges, without adding one; this affects the last cell on some boundaries.

During this comparison, the native harness was found to be missing three
`HeightOffsetTable_Ctor` fields: the count of 256 entries, the validity-byte
array and the cached-vector array. The missing count prevented the normal
per-view cache clear, allowing heights transformed for one camera angle to be
reused at the next angle. `native_terrain.py` now supplies all constructor
allocation fields. The ground reports and captures were regenerated. This was
a harness defect, not behaviour to reproduce in the game.

`native-ground-cpp-frames.json` records the fresh v1.1 captures. Ground command
construction, shading, texture projection and final indexed pixels are checked
separately, so a matching final checksum cannot conceal a different cell walk.

## Object distance bands in the C++ integration

`tools/check_distance_bands.py` checks the original band selector (`0x42e878`)
plus the exact palette-range replacement requests (`0x42e8e8`). All four builds
match 8,580 cases apiece: ten worlds, eleven object tags, both sides of the
5000-unit structure-radius threshold and distances around each stored boundary.
Small and large structures use different WLD distance offsets. Tags without
bindings leave the existing ramps alone.

[Native distance-band results](../analysis/rendering/native-distance-bands.json).

## Invalid distant building BSP references

Four roots of `DTS/BASES_AN.DTS` contain stale transform indices in their distant
levels of detail. Roots 0 and 4 have two pose slots but refer to slots 2, 3 and 4.
Roots 3 and 7 have three pose slots but refer to slots 3 and 4. There are eighteen
invalid BSP-plane records in total. No other supplied model has this particular
out-of-range reference.

The original reader retains these indices, and the BSP walk uses them without
checking the pose-array extent. `tools/check_invalid_bsp.py` places an unmapped
page immediately after the actual pose array. Five of twelve controlled views
fault in each of the four original executable builds. Nearer detail levels can
hide the defect, which is why the earlier individual model frames did not expose
it.

The C++ scene loader treats only these out-of-range plane references as `-1`,
the existing object-space-plane sentinel. The stored model files and all valid
references are retained. All twelve repaired views complete in every build.
This is a deliberate repair of undefined memory access; the distant ordering
can differ from a particular original run's accidental adjacent memory.

[Guard-page results and affected records](../analysis/rendering/native-invalid-bsp.json).

## Palette ramps and raster ramps are separate

Complete original-process cockpit captures exposed a mistaken assumption in the
assembled-scene harness. `Palette_ShadeRampLookup` (`0x430e34`) reads the DPL
object's original ramp table at `palette+0x10`. `Palette_SetRampsToRange`
(`0x430518`) modifies a separate table reached through `0x49b034`, then installs
that table in the rasterizer. It does not alter the DPL table. These function
addresses are unchanged between the two Win95 retail builds.

Consequently, flat-shaded model faces and untextured terrain use the original
DPL ranges before the RMP lookup. Gouraud faces use the mutable raster ranges
and no RMP lookup. The previous joined harness replaced both tables, so its
old scene fixtures could not reveal this integration error. The harness now
changes only the raster table; both eleven-frame scene corpora were regenerated
from original instructions. The full-process comparison independently confirms
the correction on the distant radar and missile towers.


## Ground vehicles in the render queue

A GroundVehicle uses tag 10, while ordinary buildings use tag 5. Both occupy the
structure pool. Tag 10 does not add the building aim-point height when measuring
render distance and does not use the building-specific ramp offsets. This was
verified from live render entries in `cockpit-moving-distance`, including a
supply transport at a fog-slice boundary. See [the process comparison](ORIGINAL_PROCESS_TRACES.md#movement-throttle-and-vehicle-fog).


## Clipped texture edges and multiple lights

The equipped-model lighting fixture compares 108 complete indexed frames from
both retail Win95 executables. It varies Outlaw and Samson, bare and fitted
hardpoints, standing/walking/death poses, three headings and one to three
lights. Both executables produce identical fixture bytes. The original model
traversal, saved-node state, lighting and raster routines execute; resource
storage, camera, pose and light inputs are supplied.

The comparison exposed an edge-table lifetime detail. Both chains write their
rows even when the right chain extends past the count returned by the left
chain. The current polygon may never draw those extra rows, but a subsequent
clipped polygon can read them. Truncating the saved table to the returned count
changed nine pixels in the standalone Outlaw view. The Python and C++ texture
writers now retain every written row. The C++ test is `model_lights`;
[the native report](../analysis/rendering/cpp-model-lights.json) records its
inputs and hashes.


## Shared mission textures and shape visibility

`tools/export_cpp_scene_textures.py` runs the original atlas packer in both retail
executables. All ten worlds agree on 4,400 frame descriptors and 290 complete
page checksums. A live-process startup trace independently establishes the order:
BASETEX, VEHTEX, BULLETS, BEAMTEX, WPNTEX, LIGHT, MEDIUM, HEAVY, ENEMY, APOCATEX,
RAZORTEX, NEWHERCS, the world's terrain bank, then FLAT2. Banks fill gaps in pages
already allocated by earlier banks. Raw billboard banks stay outside this atlas.
The original-process snow-world descriptors and a captured live texture page
match the isolated original-code reconstruction byte for byte.

This resolved fifteen pixels along the bottom edge of the reconnaissance death
camera. The edge tables and sampling arithmetic already matched; a clipped
building face was sampling a neighbouring bank through a retained edge row.
The C++ mission renderer and `NativeJoined` now share the original packing order.

The remaining forty-pixel sprite fragment was caused by a missing shape-level
visibility test. `TSBounds_ScreenVisibility` at v1.0 `0x47613c` projects the root's
centre and radius before visiting its parts. It adds three pixels around the
projected square and rejects disjoint bounds or a sphere wholly before the near
plane. A zero-radius explosion root can therefore be rejected even when a corner
of its billboard would reach the screen. `tools/export_cpp_model_bounds.py`
retains 990 original results covering near-plane equality, zero radii, negative
depth and viewport boundaries. Both retail executables agree.

The full sixteen-frame death-camera comparison now has zero differing pixels
and palette components. It is retained in `cpp-death-camera-frames.json`, with
original executable, probe, control-stream and frame hashes.
