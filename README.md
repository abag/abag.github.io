# Andrew Baggaley: personal website

Static site built with [Hugo](https://gohugo.io/) and deployed to GitHub Pages by GitHub Actions.

## First-time setup

1. **Create the repository.** For the address `https://USERNAME.github.io`, name the repository
   exactly `USERNAME.github.io`. Any other name also works and gives `https://USERNAME.github.io/REPONAME/`;
   the site adapts automatically.
2. **Copy your papers and figures from wikidot** (needs `curl`; run from this folder):
   ```bash
   bash scripts/fetch-assets.sh
   ```
   It downloads 72 files (58 paper PDFs, 9 figures, your CV and 4 sets of course notes) into `static/`.
   It reports any failures; re-running skips files you already have. `bash scripts/fetch-assets.sh --check`
   lists anything still missing without downloading.
3. **Push:**
   ```bash
   git init -b main
   git add .
   git commit -m "New website"
   git remote add origin https://github.com/USERNAME/REPONAME.git
   git push -u origin main
   ```
4. **Turn on Pages:** on GitHub, open the repository's Settings > Pages and set *Source* to **GitHub Actions**.
   The *Actions* tab shows the build; the site is live a minute or so later.

## Previewing locally

Install Hugo extended (0.165 or newer; on a Mac `brew install hugo`), then run `hugo server` and open
http://localhost:1313. Pages reload as you edit.

## Everyday edits

| To change | Edit |
|---|---|
| Publications | `data/publications.yaml`. Add an entry at the top; `selected: true` puts it on the home page; `theme: qf` or `theme: bio` files it under a research theme. Put the PDF in `static/papers/`. |
| News | `data/news.yaml`. Newest first; the home page shows the first four. |
| Research group | `data/group.yaml` |
| About text | `content/_index.md` |
| Research pages | `content/research/*.md` |
| Teaching, CV | `content/teaching/_index.md`, `content/cv/_index.md`; replace `static/files/CV.pdf` for a new CV |
| Email, phone, address, ORCID, Google Scholar, GitHub | `hugo.toml`, under `[params]` |
| "Last updated" in the footer | `updated` in `hugo.toml` |

Commit and push; the site rebuilds itself.

## Images and PDFs

The site expects these files. Any that are missing are simply left out of the page, and the build log
(locally, or the *Actions* tab on GitHub) prints a `Missing image` or `Missing PDF` warning naming the exact path.

| File | Used on |
|---|---|
| `static/img/portrait.jpg` | home page portrait (included in the repository) |
| `static/img/quantum-turbulence/cascade.png` | home page and research theme card; Kelvin-wave highlight |
| `static/img/quantum-turbulence/NPNfj.jpg` | quantum fluids intro (rotating BEC) |
| `static/img/quantum-turbulence/smooth.png` | coherent structures highlight |
| `static/img/quantum-turbulence/CF_tangle.png` | acceleration statistics highlight |
| `static/img/quantum-turbulence/quasi.png` | ³He visualisation highlight |
| `static/img/math-biology/Tree_snap.png` | home page and research theme card; tree disease highlight |
| `static/img/math-biology/Sirio_snap.png` | stem cell highlight |
| `static/img/math-biology/spinflock.png` | flocking highlight |
| `static/img/math-biology/Neo_snap.png` | Neolithic highlight |
| `static/files/CV.pdf` | CV page |
| `static/files/teaching/*.pdf` | course notes on the teaching page |
| `static/papers/*.pdf` | PDF links on publications (file names as in `data/publications.yaml`) |

To use a different picture, either replace the file keeping its name, or put a new file anywhere under
`static/img/` and change the path: `image:` at the top of `content/research/*.md` for theme cards,
`img="..."` in the `{{< finding >}}` blocks for highlights, and `layouts/index.html` for the portrait.
File names are case-sensitive on GitHub (`Tree_snap.png` is not `tree_snap.png`).

## Animations

`assets/js/hero.js`, plain JavaScript on a canvas, no libraries.

- **Point vortices in a disc.** Each vortex has an image vortex of opposite circulation at R²z/|z|², so the wall
  is a streamline; positions are integrated with RK4 and a small core softening. The mutual friction slider adds
  the dissipative term −α s ẑ×V (normal fluid at rest, α′ = 0), so dipoles annihilate and lone vortices spiral
  out. Grey dots are passive tracers.
- **Tree disease.** A stochastic SIR model on a lattice: each site is planted with probability ρ (the slider);
  infected trees infect susceptible trees within about two sites with probability 0.08 e^{−(d−1)/0.5} per step
  and are removed after 8 steps. The critical density is close to 60%.

- **Diffusion model.** A schematic of learning a spatially varying transmission field from sparse outbreak
  snapshots. A hidden smooth field β(x) drives a stochastic SI outbreak on a 48×48 grid; only 160 surveyed sites
  (infected or healthy) are shown. A reverse diffusion process (cosine schedule, DDIM-style updates with η = 0.6,
  80 steps) turns white noise into a sample of β, and the true field is then revealed with the correlation.
  The trained network is replaced by a stand-in: its prediction of the clean field is a kernel posterior from the
  survey, informative where the outbreak has been and close to the prior elsewhere, plus smooth sample-specific
  variation scaled by the posterior uncertainty. Early in the reverse process it predicts the posterior mean;
  late in the process it commits to one sample. A second sample is drawn from the same data before the
  landscape changes; "New sample" draws another.

Parameters are at the top of each object in the file. Animations pause when off-screen, and start paused for
visitors who have asked their system to reduce motion.

## Things to check

- `data/news.yaml` was drafted from your CV; check the dates and wording.
- The Journal of the Royal Society Interface paper is in News but not yet in `data/publications.yaml`, which
  has a ready-made template for it at the top.
- The 2019 PNAS reconnections paper has no page number: the CV and old site listed "174501", which belongs to
  the PRL ferrofluid paper.
- Corrected from the old site: the 2020 counterflow paper listed Baggaley twice; the JLTP 2012 reconnection-models
  paper carried another paper's arXiv number; the CV gave PRB 90, 224514 the PoF bundles title.
- Recent papers without a PDF or arXiv link only have a DOI where it could be derived reliably. Adding a `doi:`
  line to any entry links its title.
- Fonts load from Google Fonts. To self-host instead, put the font files in `static/fonts/` and replace the
  `<link>` in `layouts/partials/head.html` with an `@font-face` rule.
