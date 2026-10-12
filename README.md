# Jason Fricano — personal website

The latest implementation is **There’s always more to notice**: a human-first editorial site with an original personal identity, illustrated artwork, revised copy, selected projects and case studies. Jason approved this branding and design direction on September 27, 2026, including the integrated JF mark and its knife-edge terminals. It is the current design baseline. The GitHub Pages workflow described below deploys merged main; a local or feature checkout alone does not establish the currently deployed revision.

## Preview

```sh
npm run dev
```

Open http://127.0.0.1:4175. The identity board is at http://127.0.0.1:4175/branding/personal-v1/index.html.

`npm run check` builds and validates local links, anchors and image alternatives. `npm run build` writes a standalone static site to `dist/`. Node is the only runtime dependency. Rebuild and refresh after edits.

## Source and direction

- `site/`: homepage, eight retained case studies, additional-project gallery, project screenshots and shared CSS.
- `branding/personal-v1/`: The Turn F/J mark, wordmark, favicon, board and usage notes.
- `artwork/`: original generated illustration, compressed delivery image, exact prompt and provenance.
- `docs/creative-direction-v3.md`: creative rationale and role boundaries.
- `docs/personal-copy.md`: copywriter’s source document.
- `docs/fine-art-advisory.md`: identity critique.
- `verification/review.md`: checks performed and limitations.

The existing mockups and design brief remain below as historical context. Product release claims need revalidation before a new publication. Local builds are intentionally marked noindex; production metadata uses the base URL configured in `scripts/prepare-pages.mjs`.

## V1 review candidate

The homepage presents four projects in a 2×2 screenshot grid: Personal Treasury, StreamOtter, GetFit → bellos and Orca Solutions. StreamOtter pairs its flowing-stream front-page visualization with a local Pup Patrol game capture and links to toolkit and game case studies; both retain access to the field-station case. iYosi and the archived StatBatt record appear alongside Vespa Law at `/moreprojects/`. Eight case studies remain in the source, including the retained iYosi and StatBatt URLs. The demo retains `lontra-creek.html` for existing links. Each case study lists its core technologies; the public toolkit and demo are at https://streamotter.dev/. The approved v3 design remains the visual baseline; `mockups/` and the earlier brief are historical references.

`npm run check` validates every shipped HTML page, including the additional-project gallery, identity board and 404 page. The local server returns a styled 404 with a working home link even for nested missing URLs. Choose another port with `PORT=4176 npm run dev` if 4175 is already occupied.

The static output excludes local workflow documents, artwork provenance notes and the full-size original artwork PNG. Source provenance stays in the repository. No analytics, runtime services or external fonts are required.

See `PROJECT_BRIEF.md`, `WORKING_RECORD.md` and `verification/review.md` for scope and evidence. GitHub Pages hosting is configured by the workflow below. Pending feature changes follow the recorded acceptance and merge process. Other static hosts must be configured to use `404.html` for missing pages.

## Anti-library

`site/antilibrary/` is a searchable page of the books, films, TV and albums Jason hasn’t gotten to yet (plus what he has already read, watched or heard that shaped him), served at `/antilibrary/` and linked from the site navigation as Anti-Library. Like `/moreprojects/`, it keeps noindex and stays out of the sitemap. This repository holds only the page: markup, styles, search, sort and filter, owner mode, artist, author and director path pages and the header art slot. The lists, threads, artist, author and director paths, the importer, the link and cover lookups and the progress workflow live in [jfricano/anti-lib](https://github.com/jfricano/anti-lib), whose README is the authoritative description of the data and of what owner mode can change.

The page fetches `lists.json`, one `<id>.json` per list, `paths.json`, `author-paths.json`, `director-paths.json` and `progress.json` from `https://raw.githubusercontent.com/jfricano/anti-lib/main/data/` (the `data-source` attribute on `<main>`), so list changes and finished titles show up without redeploying this site. Links from the data are only used if they are `https:`.

**Browsing.** A visit with no list in the URL opens a random list. Shelves start folded, so a list opens as its table of contents; shelves opened while browsing are remembered in that browser. The filter bar has Search, Shelf, Show (the public tags), Thread and Sort, and every filter in use shows as a removable chip. Picking a thread shows its titles in path order with each stop’s line, whatever the sort. Search, filters, thread and sort are kept in the URL, so a filtered view can be shared as a link. **Pick one for me** chooses a title from the current view. Albums have a Listen on Spotify link that tries the desktop app first. Smooth scrolling is the only motion.

**Artist paths.** `site/antilibrary/artist.html?a=<slug>` (with `path.js`) shows one artist’s listening order: a door record, the steps after it, and a timeline of the records left out. With no `a` it lists every path. Every album by a path artist gets an “Artist path →” button under the artist’s name, and the artist’s name at the top of the path page links to their AllMusic page in a new tab. Not every artist has a path.

**Paths are an aside, not a shelf.** Paths have no rows and no shelf number on any list; each step is a title on its own shelf. A list with paths shows them in one unnumbered Paths aside above its numbered shelves (titled Artist paths, Author paths or Director paths with no number, folded like a shelf, shown only while no search or filter narrows the list): a line on what paths are, a link to the index page, and every name with a path, struck through once the path is fully heard, read or watched. In owner mode, artists marked Start here say so. The aside is configured per list in `PATHS` in `app.js`, so each kind of path (artists, authors, directors) is one entry there and in `KINDS` in `path.js`.

**Author paths.** `site/antilibrary/author.html?a=<slug>` is the same page for books, also run by `path.js` (the `data-kind` attribute on `<main>` picks albums or books): a door book, the reading order after it, and a timeline of the books left out. With no `a` it lists every author with a path. Every book by a path author gets an “Author path →” button under the author’s name, and the author’s name at the top of the path page links to their Goodreads page in a new tab. A step that is a work read inside a collection on the list (Zarathustra in The Portable Nietzsche) shows which book it is in. A step is struck through once its book is crossed off on the list.

**Director paths.** `site/antilibrary/director.html?a=<slug>` is the same page for films (`data-kind="films"`): a door film, the viewing order after it, and a timeline of the films left out. Every film by a path director gets a “Director path →” button under the director’s name, and the director’s name at the top of the path page links to IMDb in a new tab. A step is struck through once its film is crossed off on the films list, and the director counts as fully watched once every step is. There are no checkboxes on the page.

**Owner mode** is not linked anywhere: open `/antilibrary/?owner=on` once and the browser remembers it (Leave owner mode turns it off). It marks and removes titles already on the lists; it never adds them. Each title gets checkboxes grouped as progress, then tags:

- **Fully read**, **Fully watched** or **Fully heard** (by list) crosses a title off. The public only ever sees the strikethrough.
- **Digested** appears on books that have a digest, when the browser holds the digests key (below), with a Read digest link that opens in a new tab. On films, shows and albums a digest doesn’t cross the title off, so it shows as a note instead.
- **Formative** on books is the one tag owner mode can change. Every other tag is edited in the anti-lib source lists.
- **Remove** is a small link; the title leaves the page at once, and Discard brings it back until changes are sent.
- **Heard** boxes on an artist path page mark each album on the path; they are the same marks as Fully heard on those albums’ rows in the list, and go out with the same Send changes issue. The artist counts as fully heard, struck through in the Paths aside, once every album on the path’s main line is heard.
- **Author path pages** have no boxes: books are marked on the books list. The page says how many books on the path are crossed off, and the author counts as fully read once all of them are.

Marks wait in that browser until **Send changes to the site** opens a prefilled issue in jfricano/anti-lib, whose workflow applies issues Jason opens. Digest marks go out separately with **Send digest marks**, to the digests repository. **Hide finished** hides crossed-off titles, and **Export spreadsheet** downloads every list, with status and finish dates, as one XLSX (SheetJS, vendored in `site/antilibrary/vendor/` and loaded only on export). The page holds no credentials.

Header art: `site/antilibrary/art/<list>.jpg`, specs in `docs/antilibrary-artwork.md`.

## Digests

`site/digests/` is Jason’s private reader for digests (long write-ups of single books and films) at `/digests/`, noindex and linked only from the anti-library’s owner-mode bar. The page itself holds nothing private: the digests live in the private repository jfricano/reading-list, and the page reads them through GitHub’s API with a fine-grained read-only key Jason pastes once per browser (kept in that browser’s storage as `digests-token`). Without the key the page shows only a prompt for it. That repository’s README explains how to make the key, and its `docs/FORMAT.md` is the contract between the digests and this page.

The page has Books and Films tabs (reusing the anti-library header art), a Show menu, a Next up list from the digest queue, and per-digest Print/PDF and Word export (`docx.js`, built in the browser and loaded the first time it is used). YouTube links in film digests play as embeds that start at the linked moment. Two marks work like owner mode on the anti-library: **Digested** and **Fully read** (Fully watched for films). They wait in the browser, shared with the anti-library’s owner mode, until Jason sends them as one prefilled issue, which the digests repository’s Marks workflow applies.

## License

This personal website is open source under the [MIT License](LICENSE).

## GitHub Pages hosting

Public destination: https://jfricano.github.io/personal-portfolio/.

The Pages workflow validates PRs and deploys main after successful checks. It builds `dist/`, then runs `node scripts/prepare-pages.mjs` to add production canonical URLs, sitemap, robots.txt and nested-404 recovery. Local preview stays noindex. For a manual redeploy, run the Deploy GitHub Pages workflow against main. Roll back a bad release by reverting its commit on main; the previous content is then rebuilt and redeployed.

## Additional portfolio

`/moreprojects/` is a direct-share collection for work beyond the homepage, including Vespa Law, iYosi, and the archived StatBatt record. It uses two screenshot cards per row on larger screens and one on phones. A card links to the project site or archived case study; its caption lists principal technologies. Add new entries to `site/moreprojects/index.html` and screenshot assets to `site/assets/`.

Local review: http://127.0.0.1:4176/moreprojects/. No homepage or navigation link is added. Production preparation retains noindex metadata on the gallery and `statbatt.html`, and excludes both from the sitemap. The page is unlisted, not access-controlled. The iYosi screenshot and case study now reflect the redesigned iyosi.app landing site.

## GetFit → bellos and archived StatBatt

Selected-work C follows open-source GetFit into bellos, the commercial phone-first version in development. The case study focuses on why the personal app was built, its records and architecture, open-source customization, and the gym use case behind the phone-first design. It does not explain the training method. GetFit’s public repository remains MIT-licensed. Three portrait screenshots show the live v1 app at phone width: a generated workout plan, training calendar, and movement guide. They appear as static images together on the homepage and larger in the case study, stacking on phones. No workout history is shown; the images are explicitly v1 references until a running bellos interface is ready. The existing `getfit.html` route is retained.

StatBatt has no release planned. Its implementation record remains at `statbatt.html` through `/moreprojects/`, without homepage promotion. These archive pages are unlisted and accessible by URL.

Homepage framing retains the entire Personal Treasury dashboard capture, centered with the shared project-card inset. bellos links directly to https://bellos.app/. Direct GetFit v1 app links are removed; its open-source link remains in the case study.

## Pup Patrol on Lontra Creek

`pup-patrol.html` covers the game as another StreamOtter consumer: React subscriptions, a separate TypeScript engine, canvas rendering, and visible stale-state handling. The homepage still has four cards. Its StreamOtter pair shows the toolkit banner beside actual local gameplay, explicitly labeled recording mode. The game uses prerelease React hooks and is not yet hosted at its planned lontracreek.com destination. The field station remains live at StreamOtter.dev and retains its existing case-study URL.

## Delivery workflow

See [the delivery workflow](docs/WORKFLOW.md) for author verification, focused review of high-risk changes and scoped release authority. Existing project behavior and setup commands above remain authoritative.
