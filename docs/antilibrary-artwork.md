# Anti-library header art

Each list on `/antilibrary/` shows its illustration in the intro, beside the headline, the way the home page shows its still life. It changes with the selected tab and crossfades in when its file exists in `site/antilibrary/art/`; a list without a file shows no picture.

| List   | File         |
|--------|--------------|
| Books  | `books.jpg`  |
| Films  | `films.jpg`  |
| TV     | `tv.jpg`     |
| Albums | `albums.jpg` |

- **Size:** the current set is 1536 × 1024 px (3:2). The slot shows the whole image, never cropped, at 3:2: about half the content width on desktop and full width on phones. Its edges are feathered into the paper with a radial mask, so keep the subject inside the middle three-quarters of the frame.
- **Format:** JPEG, sRGB. The page's paper color is `#f5f0e7`, and the image is multiplied onto it, so a cream background blends in.
- **No text in the image**, since the list name is already in the tab above it.

Originals and generation prompts are in `artwork/antilibrary/`. To replace an image, put the new file in `site/antilibrary/art/` and open a PR; nothing else needs to change.
