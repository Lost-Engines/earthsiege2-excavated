This site is a selection from the Earthsiege 2 analysis workspace. The public viewers include their own data and work without an installation of the game. The model hangar and mission atlas use WebGL for inspection. The software-rendering gallery contains captures from original executable routines.

## Reading further

These working notes include addresses, field layouts and the boundaries of individual tests. Each has a Markdown download; references to capture files refer to the analysis workspace.

- **[What carries over from ES1](EARTHSIEGE1_OVERLAP.md)**: identical models, converted recordings, recoloured portraits and shared engine machinery. The [comparison data](es1-overlap.json) contains the individual hashes and mappings.
- **[Executables and controls](EXECUTABLES_AND_CONTROLS.md)**: Borland C++ metadata, class layouts, launch switches and developer keys.
- **[Missions and terrain](MISSIONS_AND_TERRAIN.md)**: compilation, campaign inputs, material selection and ground flattening.
- **[Animation and movement](ANIMATION_AND_MOVEMENT.md)**: sequences, transitions, pose blending and root motion.
- **[Environment and rendering](ENVIRONMENT_AND_RENDERING.md)**: sky bands, palettes, texture interpolation and original-code comparisons.
- **[Cockpits](COCKPITS.md)**: artwork, colour schemes, viewport masks and instruments.
- **[Recorded demos](REPLAYS.md)**: tape contents, identified missions, playback dependencies and the rocket-timer defect.
- **[Sound and movies](AUDIO_AND_VIDEO.md)**: voices, portrait animation, soundtrack differences and playback rules.
- **[Media](INSTALL_MEDIA.md)** and **[version differences](VERSION_DIFFERENCES.md)**: which copies were retained and why v1.1 is the reference.
- **[Flyer profile](FLYER_PROFILE.md)**: active and unused fields in the inherited SKIMMER data.
- **[Simulation foundations](SIMULATION_FOUNDATIONS.md)** and **[complete-process traces](ORIGINAL_PROCESS_TRACES.md)**: arithmetic, random state and mission-by-mission comparisons.
- **[Coverage at publication](ANALYSIS_STATUS.md)**: what has been exercised and which comparisons remain useful.

## Sources and earlier work

Kevin Foley's [Herculan](https://github.com/kevinfoley/Herculan) supplied valuable format and executable leads. We used revision `efaf7b1e25b1dd0536730d789ab6c3f677430603` and checked the relevant behaviour in our own copies of the original programs. Its [MIT notice](HERCULAN-LICENSE.txt) is retained here. The original WAV-loader truncation and several tape-format details were already described in that research.

Our volume and 3Space readers came from the [Earthsiege 1 investigation](https://lost-engines.github.io/earthsiege-exhumed/), where their format vocabulary had been checked against [Open Siege](https://github.com/open-siege/open-siege). The source provenance for this snapshot is recorded in [data-provenance.json](../data-provenance.json); illustration sources are in [images/provenance.json](../images/provenance.json).

Developer switches and debug keys also appear in earlier community research. The article follows the evidence in our supplied builds without claiming a first discovery.

## About the exhibits

The model gallery exposes equipment combinations for inspection. Its fitting controls do not enforce the game's armory rules. The mission atlas shows compiled starting positions with a choice of recorded or controlled launch state. Neither viewer runs the combat simulation.

Sky controls reproduce the checked integer backdrop calculations. Cockpit controls supply example instrument values. The terrain gallery displays original-code captures. Screenshot captions distinguish those from browser captures.

Original game artwork, models and recordings remain the work of Dynamix and their respective rights holders. This is an independent Lost Engines investigation. See [content and attribution](../rights/).
