# Anti-library header art

Each list on `/antilibrary/` shows its illustration small, beside the headline, with the two intro paragraphs underneath. On phones it sits under the headline, with all the text below it. It changes with the selected tab and crossfades in when its file exists in `site/antilibrary/art/`; a list without a file shows no picture.

| List   | File         |
|--------|--------------|
| Books  | `books.jpg`  |
| Films  | `films.jpg`  |
| TV     | `tv.jpg`     |
| Albums | `albums.jpg` |

- **Size:** the current set is 1536 × 1024 px (3:2). The slot shows the whole image, never cropped, at 3:2: up to 440 px wide beside the headline on desktop and full width on phones. Its edges are feathered into the paper with a radial mask, so keep the subject inside the middle three-quarters of the frame.
- **Format:** JPEG, sRGB. The page's paper color is `#f5f0e7`, and the image is multiplied onto it, so a cream background blends in.
- **No text in the image**, since the list name is already in the tab above it.

Originals and generation prompts are in `artwork/antilibrary/`. To replace an image, put the new file in `site/antilibrary/art/` and open a PR; nothing else needs to change.

## General landing illustration

`site/antilibrary/art/general.jpg` is the 1536 × 1024 (3:2) combined-media illustration for the general anti-library landing view. It is supplied as an asset for page-team integration; the existing tab-specific loader continues to use the four medium-specific images. Original and prompt: [artwork/antilibrary/general-prompt.md](../artwork/antilibrary/general-prompt.md).
