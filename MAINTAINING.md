# Maintaining Earthsiege 2 Excavated

Use Node 22 or newer; CI uses Node 24. The ordinary build needs only this checkout and the pinned npm dependencies. `dist/`, `node_modules/` and `.test-output/` are ignored. `public/` contains the display data, and `src/imported/` holds the adapted viewer markup.

## Refresh the snapshot

```sh
python3 scripts/import-analysis.py ../earthsiege2-reverse
npm run build
npm run check
```

The importer copies model and animation data, relevant bitmap banks and palettes, compiled mission scenes, tape data and original terrain captures. It excludes the truncated mission source from the public list. It keeps both random variants, captured starts and campaign situations so the viewer's launch choices retain their stated context. No game executables or installation archives are copied.

Recovered mathematics and geometry stay unchanged. Public labels and markup are adapted in the importer; keyboard access, URL navigation and laptop panning live in `src/viewers.js`. `data-provenance.json` records each analysis input's hash. Research notes have rendered pages and Markdown downloads. Links between published notes and viewers are resolved; references to other capture files remain text. The raw downloads retain their original workspace-relative links.

## Illustrations

`python3 scripts/prepare-images.py` uses Pillow and the retained original framebuffer captures in the sibling workspace. It converts palette indices to RGB without rescaling. `npm run capture` runs Playwright against the public viewers and saves their canvases for the article. Both scripts record provenance. Run `python3 scripts/social-card.py` to make the social card from the original capture. It uses the system DejaVu fonts.

Use `CHROMIUM_PATH=/usr/bin/chromium` for an installed browser, or `npx playwright install chromium`. These tools are for maintainers and are not public build requirements.

## Check the public build

```sh
npm run build
npm run check
CHROMIUM_PATH=/usr/bin/chromium npm run check:browser
```

The browser check starts a local server under `/earthsiege2-excavated/`, exercises the real viewer controls and checks desktop/mobile layout and navigation. The static checker validates local links, images and script URLs, including case-sensitive paths. Keep the article readable with JavaScript disabled.

For manual inspection, `SITE_PREFIX=/earthsiege2-excavated npm run preview` serves the site at `http://127.0.0.1:4182/earthsiege2-excavated/`. Omit the prefix to serve at `/`.

## Publishing

Pushes to `master` build and validate the snapshot, then deploy `dist/` through GitHub Pages. Pull requests validate without deploying. Pages uses GitHub Actions as its source. All internal URLs are relative so the project path works unchanged.

## Writing

Introduce the game before the implementation. Use concrete observations and tell readers where to see them. Keep caveats next to the finding they qualify. Credit Herculan and the earlier format research. Avoid claiming a first discovery without checking. No em dashes, promotional filler or repeated statements about what the work is not.

Update the coverage numbers only from retained reports. A complete campaign walkthrough and the game's audio device output have not been established by the current comparisons. The C++ repository was checked at publication and is private; link it once it is public.

## Initial validation

The initial snapshot passed all local links and dependency checks across 25 HTML files, 57 model libraries and 61 missions. Chromium passed 58 checks covering playback, equipment, launch changes, camera preservation, cockpit instruments, sky and texture fade, original frame filters, tape input inspection, four viewport widths, dark mode and the article with JavaScript disabled. Test captures and the run summary are in ignored `.test-output/`.
