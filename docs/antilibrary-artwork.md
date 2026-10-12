# Anti-library header art

Each list on `/antilibrary/` shows a header image between the list tabs and the search bar when its file exists in `site/antilibrary/art/`. Until then the slot stays hidden.

| List   | File         |
|--------|--------------|
| Books  | `books.jpg`  |
| Films  | `films.jpg`  |
| Albums | `albums.jpg` |
| TV / streaming | `tv.jpg` |

- **Size:** the current set is 1536 × 1024 px (3:2). The slot shows the whole image, never cropped: up to 340 px tall on desktop, and at 3:2 on phones.
- **Format:** JPEG, sRGB. The page's paper color is `#f5f0e7`, and the image is multiplied onto it, so a cream background blends in.
- **No text in the image**, since the list name is already in the tab above it.

Originals and generation prompts are in `artwork/antilibrary/`. To replace an image, put the new file in `site/antilibrary/art/` and open a PR; nothing else needs to change.
