# Anti-library header art

Each list on `/antilibrary/` shows a header image between the list tabs and the search bar when its file exists in `site/antilibrary/art/`. Until then the slot stays hidden.

| List   | File         |
|--------|--------------|
| Books  | `books.jpg`  |
| Films  | `films.jpg`  |
| Albums | `albums.jpg` |

- **Size:** 2640 × 880 px (3:1), which covers the 1320 px content width on high-density screens.
- **Phones:** the same image is cropped to 2:1 around the center, so keep the main subject inside the middle 1760 × 880 px.
- **Format:** JPEG, sRGB, about 300 KB or less. The page's paper color is `#f5f0e7` if the art should bleed into it.
- **No text in the image**, since the list name is already in the tab above it.

Put the files in `site/antilibrary/art/` and open a PR; nothing else needs to change.
