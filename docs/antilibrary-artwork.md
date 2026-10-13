# Anti-library header art

The page shows one combined still life, `site/antilibrary/art/general.jpg`, beside the headline on every tab, with the two intro paragraphs underneath. On phones it sits under the headline, with all the text below it. Each list's own illustration shows at the start of the tab row, to the left of the medium selector; it changes with the selected tab and swaps in without motion once its file exists in `site/antilibrary/art/`. A list without a file shows no small picture. The `/digests` page follows the same pattern with its own `site/digests/art/digests.jpg` beside its headline and the per-list files by its tabs, so those file names stay fixed.

| List   | File         |
|--------|--------------|
| Books  | `books.jpg`  |
| Films  | `films.jpg`  |
| TV     | `tv.jpg`     |
| Albums | `albums.jpg` |

- **Size:** the current set is 1536 × 1024 px (3:2). The slot shows the whole image, never cropped, at 3:2: up to 440 px wide beside the headline on desktop and full width on phones; the per-list picture by the tabs is about 175 px wide on desktop and up to 230 px on phones (beside the tabs when they leave room, otherwise on its own line under them), so its subject must read at thumbnail size. Its edges are feathered into the paper with a radial mask, so keep the subject inside the middle three-quarters of the frame.
- **Format:** JPEG, sRGB. The page's paper color is `#f5f0e7`, and the image is multiplied onto it, so a cream background blends in.
- **No text in the image**, since the list name is already in the tab above it.

Originals and generation prompts are in `artwork/antilibrary/`. To replace an image, put the new file in `site/antilibrary/art/`, run `python3 scripts/art-sizes.py` (needs Pillow) to remake its smaller copies, and open a PR. The page loads those copies (`<name>-480.jpg` by the tabs, `general-960.jpg` and `general-1536.jpg` beside the headline, `lavender-thread-600.jpg` by a thread), which are a tenth to half the size of the originals; `npm run check` fails until they match the new original.

## Where each image is used

| Image | Where it shows | Original and prompt |
|-------|----------------|---------------------|
| `site/antilibrary/art/general.jpg` | Beside the `/antilibrary` headline on every tab; under the headline on phones | [artwork/antilibrary/general-prompt.md](../artwork/antilibrary/general-prompt.md) |
| `site/digests/art/digests.jpg` | Beside the `/digests` headline, including the locked view | [artwork/digests/README.md](../artwork/digests/README.md) |
| `site/assets/lavender-thread.jpg` | Beside the heading of an open thread on `/antilibrary` (Paths menu or the Threads block); above the heading on phones | [artwork/thread/README.md](../artwork/thread/README.md) |
| `site/antilibrary/art/{books,films,tv,albums}.jpg` | At the start of the tab row, left of the tabs, on `/antilibrary`, and by the Books and Films tabs on `/digests`; also `books.jpg` as the anti-library's social preview image | [artwork/antilibrary/README.md](../artwork/antilibrary/README.md) |

Each image has one copy in the repo. The two headline images came from the Codex art PRs (#55 and #56); Jason chose them and #57 placed them. Keep a new image's generation prompt next to its original in `artwork/`.
