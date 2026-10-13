# Anti-library page: what the toolbar has, and what was taken out

The list page (`site/antilibrary/`) once had a full filter bar. On 2026-10-13 Jason cut it back: "let's get rid of all the tags, the dropdown for tags. we don't need 'em … save the setup if we ever change our mind … search and sort, the rest handles itself." This file records what came out, why, what stayed, and how to bring any of it back.

## What the page has now

- **Search** and **Sort**, nothing else, on every list and on phones too (no Filters button; on phones the two simply stack).
- Shelves fold and unfold from their headings, with Collapse all / Expand all beside the count. The Author, Artist and Director paths asides and the Threads aside sit above the shelves, and each path and thread has its own page.
- **Pick one for me**, the crossed-off strikethrough, owner mode (Fully read/watched/heard, Digested, Formative, Remove, Hide crossed off, Save changes, Export spreadsheet) and the path link under a creator's name ("Author path →") all work as before.
- Links that narrow the list still work, with no menu behind them: `?shelf=04` or `?part=…`, `?only=core` (the core shelf link in the intro uses it, and its chip says "Core shelf ×"), and old `?thread=` links. "Clear filters" beside the count takes them off.

## What was removed (2026-10-13)

| Removed | Where it lived | Why it could go |
| --- | --- | --- |
| Tag labels on every title (Core shelf, On my shelf, Vonnegut frequency, Respectful fringe, Formative; Start here in owner mode) and the clickable tags that applied a filter | `itemHtml` in `app.js` (`<ul class="al-tags">`), the 150 px tag column in `.al-item`, the `.al-tag-*` colours in `antilibrary.css` | Jason didn't want them. The flags stay in the data (see below). |
| The **Tags** menu (checklist of public tags with counts, chips for each tag in use) | `#al-show-menu` in `index.html`, `renderMenus` in `app.js` | Same. |
| The **Shelves** menu (checklist grouped by part) | `#al-shelf-menu`, `renderMenus` | Folding shelves already does this job. |
| The **Paths** menu (threads plus artist, author and director paths) | `#al-thread`, `renderMenus` and its change handler | The Paths and Threads asides above the shelves already list every path and thread. |
| The phone **Filters and sort** button | `#al-filters-toggle`, `.al-filters-toggle` CSS | Two controls don't need folding away. |
| Escape closing an open menu | `keydown` handler in `app.js` | No menus left. "/" still jumps to Search. |
| On path pages, the **The door** and **Heard** labels | `stepHtml` in `path.js`, `.ap-tag-door` | The door already sits on the lavender band and is "Door" in the timeline; a heard album is now struck through like everything else, which also keeps the rule that the public only sees strikethrough. |

Owner mode's Digested note on films, shows and albums (a digest that doesn't cross the title off) moved from the tag column to a small note beside the Fully watched box.

## What was kept

- **The data.** Every flag is still in the anti-lib source lists and in `data/<list>.json` (`f` on each title), with `flags`, `privateFlags`, `privateFilters` and `toggles` in `data/lists.json`. Owner mode still edits Formative; the spreadsheet export still has a column per tag. Nothing in anti-lib changed except its docs.
- **The tag styles the digests page uses** (`.al-tags`, `.al-tag`, `.al-tag-done`, `.al-tag-start`), since `site/digests/` shares `antilibrary.css` and shows Draft, Digested and Fully read as tags.

## How to bring it back

Everything removed is in one commit, `1eb164b` ("Antilibrary: just Search and Sort, no tags", jfricano/personal-portfolio, 2026-10-13), which also updated the README. The last main with the full toolbar is `4c36d95` plus the lag fix from #75.

- **All of it:** `git revert 1eb164b` on a branch, then rebuild. It reverts cleanly as long as nothing since has rewritten the same lines; otherwise resolve against the old version with `git show 1eb164b^:site/antilibrary/app.js`.
- **Only the tags on titles:** restore the `tags` list in `itemHtml`, the `<ul class="al-tags">` at the end of the row, the fourth `.al-item` column (`150px`, area `tags`, and `"cover . tags"` / `"cover tags"` in the 1000 px and phone rules) and the `.al-tag-*` colours. `shownFlags()` decided which flags a visitor sees.
- **Only one menu:** restore its block in `index.html`, its part of `renderMenus` (with `box`, `option`, `keepFocus` and `toggleIn`), its change handler, and its CSS (`.al-menu*`, the five-column `.al-controls` grid, and `#al-thread-field` rules for Paths).

The menus and tags are described as they were in the README's Browsing paragraph at `4c36d95`, and the reasoning behind them in the project's earlier records (filters shipped in #25, special-tag filters with anti-lib #8, Shelves and Tags checklists in #59 and #62).
