# Dark-theme illustration set

Jason supplied these eight dark-theme versions of the site's illustrations on October 13, 2026. They are the same compositions as the light originals, cut out on a transparent background so they sit straight on the dark theme's charcoal page instead of on a cream mount. The light theme keeps the original light pictures.

| Original here | Replaces, in the dark theme | Delivered as |
| --- | --- | --- |
| `general.png` | `site/antilibrary/art/general.jpg` (beside the anti-library headline) | `site/antilibrary/art/dark/general.webp`, 960 px |
| `books.png`, `films.png`, `tv.png`, `albums.png` | `site/antilibrary/art/<list>.jpg` (by the tabs on /antilibrary and /digests) | `site/antilibrary/art/dark/<list>.webp`, 480 px |
| `digests.png` | `site/digests/art/digests.jpg` (beside the digests headline) | `site/digests/art/dark/digests.webp`, 960 px |
| `thread.png` | `site/assets/lavender-thread.jpg` (the spool on a thread) | `site/assets/dark/spool.webp`, 600 px |
| `hero.png` | `artwork/attention-still-life.jpg` (the home page still life) | `site/assets/dark/hero.webp`, full 1122 × 1402 |

The delivery files are WebP (quality 84), because JPEG has no transparency; each is sized to about twice the largest slot it fills. `site/theme-art.js` swaps each picture by file name when the theme is dark, so pages keep naming the light files. To replace one, overwrite the PNG here, remake its WebP at the width above, and open a PR.

## Generation prompts

Not supplied with the files yet. Add the prompt the image model was given for each piece here when Jason has it.
