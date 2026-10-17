# V1 working record — September 27, 2026

## Workflow adoption — October 9, 2026

Practical workflow v3.0: one delivery owner, proportionate author verification, focused review for high-risk behavior/concrete concerns and delta-based evidence reuse. Existing product requirements, configured signing, recorded permissions and repository protections are preserved. Dated verification/history below retains its original scope; it does not impose a blanket review gate on new routine work. No application merge, deployment or provider acceptance is established by this documentation update.

Stage: implementation and verification on codex/personal-portfolio-v1; base f87e5d3. Lead owns integration. Existing uncommitted approved v3 material preserved.

Actual delegated work: /root/case_studies owns only three new case-study HTML files. /root/v1_review provides independent read-only review. Lead owns navigation, static build/server, checks and delivery.

Decisions: retain dependency-free HTML/CSS and Node tooling. Exclude local agent workflow references from Git, not project design records. Keep provenance/original art in source but exclude Markdown and PNG originals from the branding/artwork build. Maintain noindex until separate publication acceptance.

PR dependency: no Git remote was configured at intake; asked owner for destination. GitHub CLI authentication works outside sandbox. No new services or charges.

Pending: integrated checks, browser verification, final independent review, commit/push/PR once destination supplied. Public deployment remains unapproved.

Integrated outcome: four linked case studies completed; honest status labels and approved design retained. Styled nested 404 recovery added. All workflow references requested are ignored and remain local. Public proof destinations checked without credentials (200); npm registry reachable.

Verification: npm run check passed 94 assertions across 7 pages; automated installed Chrome passed 30 content-page/viewport combinations, image loading, keyboard skip, Work navigation, reduced motion and nested 404 recovery. Independent reviewer found no material UI blocker after repairs. See verification/review.md for limits and reproduction.

Local candidate: http://127.0.0.1:4176 (npm server running); original 4175 process left intact. Restart with PORT=4176 npm run dev. Recovery: rebuild from source with npm run build; no live deployment to roll back.

Stage: review-ready locally; PR creation awaits repository destination. No remote exists; jfricano/personal-portfolio returned 404. Do not create a repository or select exposure without the owner's destination input. No publication or merge performed.

Follow-up: owner approved source links for every project, explicitly including proprietary iYosi. Added homepage source destinations for StreamOtter, Lontra and all three iYosi repositories; Treasury already linked. Added API/iOS/Android source links to iYosi case study. All three iYosi URLs returned 200 without authentication. Repository licensing/visibility unchanged.
Follow-up validation: npm run check (94 references/7 pages), git diff --check, and Chrome's 30 page/viewport combinations all passed after source-link additions.

Repository publication authorized: Jason requested a new public GitHub repository named personal-portfolio with the MIT license. Preparing main plus codex/personal-portfolio-v1 for a reviewable PR containing the approved site and five case studies. Website deployment and PR merge are not part of this publication action.

Orca integration complete: preserved design commits 70bcf8b and 05e7811, added homepage source link, synchronized scope and extended browser checks. All 36 viewport/page combinations and Orca round-trip navigation passed. PR #1 is the integrated review unit; this task owns the V1 branch. Design task will use separate worktrees. Local preview rebuilt on 4176. No merge or website deployment authorized.

GitHub Pages deployment preparation: isolated codex/github-pages worktree based on merged main e35ed92; original development checkout untouched. Added build/check and Pages deployment workflow, production canonical metadata/sitemap, and an absolute project base for nested 404 recovery. User explicitly authorized deployment; this includes integrating the bounded hosting configuration into main. Live verification follows the Actions deployment.

Copy refinement: based on latest main including design PR #4's section-00 numbering. Removed repeated attorney introduction and “also”; replaced agentic-process ending with a collaborator-focused promise of clarity and confidence. Removed repository source links from homepage Work only; case studies retain them. Updated copy source. Static checks (110/eight pages), browser checks (36 combinations and navigation) and diff whitespace checks passed. Prepared as a separate review PR; no merge/deploy performed by this task.

Section 03 now uses the shared aside-label/index markup: rust italic numeral, separate uppercase label, no slash. Mobile spacing applies to the whole label group. npm run check and git diff --check passed.

Section 02 external project links now open in a new tab with noopener/noreferrer; all five local case-study links retain same-tab navigation. Four external links updated. Static check passed 110 references/eight pages and git diff --check passed. Follow-up branch created from main after PR #5 merged.

Project labels changed from 01–05 to A–E in homepage section 02 (Treasury, StreamOtter, Lontra, iYosi, Orca), per owner request. Section numbering remains unchanged. npm run check and git diff --check passed.

Contact invitation updated at owner request to “A project, a question, a new theory of quantum gravity.” Homepage and copy source synchronized; static checks and diff whitespace checks passed. Local preview rebuilt.

Footer founder credit now links Orca Solutions to the owner-specified GitHub organization. Destination returned HTTP 200. Static and whitespace checks passed; included in contact-copy PR #7.

## Four-project revision — October 2, 2026

State: local candidate on existing `codex/contact-quantum-gravity` checkout. Preserved the pre-existing uncommitted custom-domain edits in PROJECT_BRIEF.md, README.md, WORKING_RECORD.md and scripts/prepare-pages.mjs. No commit, push, merge or deployment for this revision.

Authority: Jason’s October 2 request approves the bounded grouping and UX change. Implemented a four-entry A–D grid (Personal Treasury, StreamOtter, iYosi, Orca Solutions), with the original first-row treatment extended to the second row. Desktop has two columns; phones have one. StreamOtter has separate Toolkit case study and Demo site case study links. Retained `lontra-creek.html` for compatibility, changed its public title/label to StreamOtter demo site, and made both case-study return links target the combined card. Core technology lists appear on all five case studies. Superseding direction is in PROJECT_BRIEF.md and docs/creative-direction-v3.md; copy source and historical brief status are synchronized.

Public evidence: CUA inspected https://streamotter.dev/ and its guided field station. Both reached connected/live states with changing gauge revisions; hosted state supersedes the older sibling README’s “not yet hosted” note. Package remains 0.1.0-rc.3 / release candidate. Original iYosi and Orca GitHub Pages links redirected to https://iyosi.app/ and https://orcasolutions.dev/ and showed the matching sites; used those destinations. Captured public screenshots into site/assets/{streamotter-site,streamotter-demo,iyosi-site,orca-site}.jpg. iYosi imagery is explicitly a landing preview with illustrative places, not a released mobile app. Treasury’s existing fictional-data screenshot retained.

Technology evidence: sibling Treasury package.json and Tauri Rust target; StreamOtter workspace/gateway/client manifests and schema source; Lontra site/field-station manifests and deploy configuration; iYosi API requirements/README, iOS README and Android Gradle source; Orca static implementation and Node tooling. No sibling files edited; their product test suites were not run.

Verification: `npm run check` passed 116 local references/anchors/image alternatives across eight HTML pages. `git diff --check` and `node --check verification/browser-check.cjs` passed. CUA inspected six content pages at six widths (320, 390, 640, 768, 1440, 1920), totaling 36 combinations: no horizontal overflow, one H1 per page, readable technology lists, and no broken loaded images. Explicit keyboard traversal confirmed all four homepage screenshots load. Clicked both StreamOtter case-study routes and their #streamotter return links, Orca round trip to #orca, Work navigation, first-tab skip link with solid outline, and nested missing-page homepage recovery. Local browser logs contained no errors. Grid geometry confirmed two columns on tablet/desktop and one column below 700px. Native 200% zoom and screen-reader testing were not performed; reduced-motion CSS remains unchanged and was source-reviewed. Updated the reusable browser harness for the four-card grid and both StreamOtter routes; it was syntax-checked, not executed, because browser verification used CUA. The sandbox blocks local server sockets; the local preview was started via an approved escalation at http://127.0.0.1:4176/. A sandboxed curl status probe could not connect; HTTP status was not independently measured for this revision, although browser recovery succeeded.

Independent review: actual agent `/root/revision_review` performed read-only source, screenshot-asset, technology-source and documentation review; all 84 source link/anchor checks passed, no blocking or material findings. Final independent inspection of the rendered desktop grid, mobile homepage and mobile demo case study also found no blocking or material findings. Reviewer did not reproduce interactive checks, live connections, screen readers or native zoom; those limits remain explicit. Lead owns integration. Self-checks are not independent review.

Review artifacts: verification/previews/four-projects-desktop.jpg and verification/previews/streamotter-case-mobile.jpg. Local use: open http://127.0.0.1:4176/#work; rebuild after edits with `npm run build`. Restart with `PORT=4176 npm run dev`. Release acceptance is pending. No new costs, hosting changes, release action or monitoring initiated. Recovery: revert only this revision’s bounded changes while preserving the earlier custom-domain preparation, then rebuild.

Screenshot refresh — October 2, 2026: at Jason’s request, replaced only the two StreamOtter screenshot assets with fresh captures of https://streamotter.dev/ and its connected/live guided field station. Homepage capture now includes the full otter illustration. Both assets are 1265×712; updated the homepage image’s intrinsic width to match. `npm run check` passed 116 checks/eight pages; `git diff --check` passed. CUA confirmed both images load at their expected dimensions in the local portfolio with no horizontal overflow. No copy, layout, deployment or unrelated asset changes in this follow-up; earlier evidence images remain snapshots of the prior review. Local preview rebuilt/refreshed.

PR preparation — October 2, 2026: Jason accepted the revised candidate and explicitly requested commit/push/PR so he can merge for redeployment. Fetched origin/main at 955ec91; the prior contact PR #7 is already merged and its tree matches this checkout baseline. Creating codex/portfolio-four-projects from current main and publishing the accepted grid, case studies, technology lists and refreshed screenshots. Pre-existing custom-domain implementation and its earlier documentation remain unstaged in this working tree. User retains merge/deployment initiation; no merge or direct deployment performed.

PR publication — October 2, 2026: accepted revision committed as 9b28795 on codex/portfolio-four-projects and pushed to origin. Opened ready-for-review PR #8: https://github.com/jfricano/personal-portfolio/pull/8 and attached it to this Codex chat. Verified GitHub reports OPEN, non-draft and MERGEABLE with the expected 21 changed files; no domain script or workflow changes. Initial Pages build check was in progress. Local checks passed before commit. Merge remains with Jason; main’s existing workflow will redeploy on merge. Four earlier custom-domain files still have their original unstaged edits; no merge or deployment performed.

## iYosi and additional portfolio — October 2, 2026

Branch: codex/iyosi-portfolio-archive from merged main 158ff18. Preserved the four pre-existing custom-domain edits. Refreshed site/assets/iyosi-site.jpg from the public redesign; corrected alt/intrinsic dimensions on its homepage card; added the current screenshot and design narrative to iyosi.html, retaining pilot and fictional-sample distinctions. Landing source has HTML/CSS/JavaScript; screenshot captured at 1425×891.

Created portfolio.html with Vespa Law first/only supplied entry, linked screenshot (1265×712), HTML/CSS/JavaScript caption grounded in sibling vespa-law/mockup/README.md and source. Fictional law-firm concept identified. Shared personal branding and responsive two-column gallery become one column at ≤700px. No incoming site link added. Production preparation preserves noindex and omits this page from the sitemap; it is direct-share, not authenticated.

Verification: npm run check passes 130 local-reference/anchor/image checks across nine HTML pages; git diff --check passes. Production artifact assertions confirm gallery noindex, sitemap exclusion and no incoming homepage link, while ordinary pages retain publication metadata. CUA inspected iyosi.app and Vespa public pages; web tool could not access those URLs. Six gallery widths (320, 390, 640, 768, 1440, 1920) confirmed one/two columns as appropriate, loaded images and no overflow. Phone gallery and iYosi rendered; gallery return-to-selected-work navigation succeeds and keyboard focus is visible. Independent source/asset review by /root/v1_review found no unresolved material findings; corrected a transient unrelated Orca dimension edit before delivery. Reviewer did not repeat live browser interactions. Native zoom/screen-reader testing not performed.

Review screenshot: verification/previews/portfolio-archive-desktop.jpg. Preview server running at http://127.0.0.1:4176/portfolio.html. Prepare review PR; no merge/deploy initiated. Existing custom-domain base change and earlier associated record edits must remain unstaged.

PR publication: committed iYosi/gallery candidate as 1e9d290 and opened https://github.com/jfricano/personal-portfolio/pull/9. Verified OPEN and MERGEABLE; initial build check in progress. Original four custom-domain edits remain unstaged. User retains merge; no deployment performed by this task.

Gallery route correction: owner clarified jasonfricano.com/moreprojects, with existing GitHub Actions deployment; Vespa is only the law-firm-demo entry. Replaced portfolio.html with nested source site/moreprojects/index.html; recursive build normalizes shared asset references, and local preview serves directory indexes with safe same-origin redirects preserving queries. Vespa link already uses target=_blank with noopener/noreferrer; CUA click verified a separate tab. Gallery return navigation and assets load at the clean route. Production keeps gallery noindex/out of sitemap. npm run check (130/nine pages), redirect/asset/404 HTTP assertions and git diff --check passed. Independent follow-up review fixed encoded-slash redirect before delivery and found no remaining material issues. PR #9 updated; owner merges for existing Actions redeployment. No DNS, company site, Vespa site or hosting setting edits.

## StatBatt gallery addition — October 2, 2026

Added StatBatt second, beside Vespa, at /moreprojects/. Public destination verified in CUA: https://orca-solutions.github.io/stat-batt/. Fresh 1250×704 screenshot shows the landing site and illustrative sample panel. Caption Swift / SwiftUI / SQLite is grounded in sibling app README, Package.swift, SwiftUI imports and SQLite persistence source. Current macOS-app/in-development status retained; no download or finished charging-control claim introduced.

Branch codex/moreprojects-statbatt from merged main 40a8c6d. npm run check passed 132 references across nine pages; git diff --check passed. Browser inspection at 320, 390, 768, 1440px confirms mobile stacking and desktop side-by-side cards without overflow. All images loaded; clicking StatBatt opened a separate tab while the gallery stayed at /moreprojects/. Review capture: verification/previews/moreprojects-statbatt-desktop.jpg. Bounded source self-review only; unchanged gallery framework already independently reviewed. Native app test suites were not run because no app code changed. Existing domain preparation remains unstaged. Owner merges the review PR to trigger existing Actions deployment.

## StatBatt / iYosi placement swap — October 2, 2026

Owner superseded the preceding gallery placement: StatBatt now occupies selected-work C; iYosi is beside Vespa at /moreprojects/. Reused current screenshots, added a concise Mac-app description and illustrative-reading caption, and retained in-development status. iYosi gallery technology caption is SwiftUI / Java / FastAPI / PostGIS, grounded in the previously inspected native clients and API source. Existing iYosi case study remains available.

Verification: npm run check passed 131 local references/anchors/image alternatives across nine pages; git diff --check passed. CUA inspected both affected grids at 320, 390, 768 and 1440px: one/two columns as appropriate, loaded screenshots, no horizontal overflow. Clicks confirmed separate tabs for the StatBatt main-card destination and iYosi gallery destination. Viewport override reset. Evidence: verification/previews/statbatt-selected-work.jpg and moreprojects-iyosi.jpg. Source/visual self-review found no material issue; no independent follow-up review claimed for this bounded card swap. Native zoom, screen readers and app tests were not run.

Branch codex/moreprojects-statbatt; update existing review PR #10. Preserve the four pre-existing custom-domain edits unstaged. Owner retains acceptance and merge for Actions deployment.

## StatBatt case study — October 2, 2026

Added site/statbatt.html and a same-tab Case study link on homepage entry C. Existing case-study typography, facts, technology list, screenshot, three-step overview and five story sections frame the project around context, honest missing readings, local history and bounded charging actions. Claims grounded in stat-batt/apps/statbatt/README.md, Package.swift, docs/IMPLEMENTATION_STATUS.md and the latest build7/build8 WORKING_RECORD entries. Current native80/100 app-path success on one configuration supersedes the older public landing FAQ; no broad hardware compatibility, cutoff, custom-control or public-download claim made. No sibling files changed or private source link published.

Verification: npm run check passes146 references across10pages; git diff --check passes. CUA inspected320/390/768/1440px with no overflow and loaded screenshots. Phone workflow diagram stacks; desktop uses three columns. Homepage to case study and return to #statbatt confirmed in the same tab; landing CTA opens another tab. Viewport reset, preview left at the introduction. Screenshots: verification/previews/statbatt-case-{desktop,mobile,intro}.jpg. Native zoom, screen readers and native app tests were not run for this content-only change.

Independent read-only review by actual agent /root/v1_review found no material findings, verified12source references/anchors and dimensions, and checked claims against current app records. Reviewer performed no browser, app or hardware checks.

PR #10 was already merged at84561e3. New branch codex/statbatt-case-study starts at that main baseline. The four earlier custom-domain edits remain unstaged. Prepare a fresh PR for owner acceptance; no merge, deployment, new cost or monitoring initiated.

## Anti-library editorial art — October 11, 2026

Branch `codex/antilibrary-art`, based on PR #21's `claude/antilibrary-page` at `729f07d`. Added three original gouache illustrations derived stylistically from the existing attention still life: books, film reel, and vinyl record. The existing tab-specific image loader selects the new JPEGs. The art slot now contains the full composition, capped at 340px tall on desktop and 3:2 on mobile. Original PNGs and prompts are retained in [artwork/antilibrary/README.md](artwork/antilibrary/README.md); originals stay out of the deployment build.

Verification: `npm run check` passed 202 checks across 13 pages. Browser inspection confirmed all three tab selections load the correct 1536×1024 image, full compositions on desktop/mobile, and no horizontal overflow at 390px and 320px. Screenshot: [films preview](verification/previews/antilibrary-art.jpg). No application logic or data changed; native screen-reader/zoom testing was not performed. Source is prepared for review, not deployed. This PR targets the PR #21 branch to keep artwork separate from the page implementation. Jason retains merge authority. The shared checkout and its unrelated changes were untouched.

## TV / streaming artwork — October 11, 2026

Jason requested one matching illustration and explicitly directed delivery to `claude/antilibrary-page` as `site/antilibrary/art/tv.jpg`. Added the 1536×1024 JPEG and original `artwork/antilibrary/tv.png`; prompt and provenance are in the artwork README. The built-in generator used the existing film illustration as its style reference. Existing `art/<list>.jpg` loading requires no code change; the page team owns the TV list/tab integration. Visually inspected the generated composition and verified JPEG dimensions. `npm run check` and `git diff --check` passed. No TV tab runtime check claimed because this asset-only change does not add one. Commit uses Jason’s configured SSH signature; direct push to the page feature branch is specifically authorized.

## Anti-library and digests documentation — October 12, 2026

Jason asked for the documentation to be brought up to date after launch. The README’s Anti-library section now describes the live page (navigation link, folded shelves, Thread filter, artist path pages, owner mode’s current checkboxes and its mark-and-remove-only scope) and a new Digests section describes `/digests/` and its private data source. PROJECT_BRIEF.md gained a dated note on what changed since launch. Artist path Heard boxes (PR #40, merged during this pass) are described as live. Matching updates went to jfricano/anti-lib (README, list conventions, a guide for the future Anti-Library Builder) and jfricano/reading-list in their own PRs.

Verification: compared each statement with the current `site/antilibrary/` and `site/digests/` source on main including PR #40; `git diff --check` passed. Documentation only; no page behavior changed. Jason merges.

## General anti-library illustration — October 12, 2026

Created the requested combined-media gouache still life for the anti-library landing view, matching the existing set's 1536×1024 (3:2) dimensions, palette and texture. Books, vinyl record, television and film reel share one composition; a rust ribbon continues toward the edge to suggest undiscovered knowledge. Built-in image generation used `books.png` as its style reference. Original: `artwork/antilibrary/general.png`; web derivative: `site/antilibrary/art/general.jpg` at JPEG quality 84. Exact prompt/provenance linked from the artwork README and header-art guide.

Asset-only delivery on `codex/antilibrary-general-art` from main `cb65b36`; PR #21 was already merged. Page integration remains with the page team, preserving medium-specific views. Author visually inspected the output and checked dimensions, build inclusion and whitespace. `npm run check` passed; no page rendering change or deployed acceptance claimed. Signed commit and review PR prepared for Jason; merge uses existing deployment workflow.

## Digests header illustration — October 12, 2026

Replaced the reused medium-specific header imagery with one dedicated gouache folio, note card and pencil illustration representing a concise brief and the thought worth keeping. Original and exact prompt: `artwork/digests/`; delivery: `site/digests/art/digests.jpg`, 1536×1024 (3:2), JPEG quality 84. The header initializes before the private-data load, displays on the locked view, stays stable across medium changes, and retains image-error hiding. No credential or private-data logic changed.

Author verification: `npm run check` passed 258 checks across 17 pages; `node --check site/digests/digests.js` and `git diff --check` passed. CUA confirmed the new image loads at desktop and 390px mobile with no horizontal overflow and fits the existing feathered mask. Screenshot: `verification/previews/digests-art-desktop.jpg`. Private digest content and authenticated tab interaction were not exercised; visual verification used the locked page. Signed review PR on `codex/digests-art`; Jason retains merge, which triggers existing deployment.

## Headline art and medium art by the tabs — October 12–13, 2026

Jason asked for one combined still life beside the anti-library headline on every tab, the notebook still life beside the digests headline, and each list's own illustration moved small to the end of the tab row next to the medium selector. The headline figures became static markup; the tab rows gained a wrapper holding a small figure that swaps with the selected tab, with no motion. Phones keep the picture directly under the headline with the text together, and hide tab counts so all four tabs fit beside the small picture.

The two headline images Jason supplied are byte-for-byte the Codex originals from #55 (`artwork/antilibrary/general.png`) and #56 (`artwork/digests/digests.png`). To keep one copy of each, the pages use those files (`site/antilibrary/art/general.jpg`, `site/digests/art/digests.jpg`), and #56 was merged into this branch with this branch's digests script kept, so its prompt, provenance and record entry land unchanged. Where every image shows is tabulated in `docs/antilibrary-artwork.md`.

Verification: `npm run check` passed 262 checks across 17 pages; `node --check site/digests/digests.js` and `git diff --check` passed. Playwright screenshots of the built site confirmed both headline images load at desktop and phone widths. Jason merges.

## Lavender thread illustration — October 12, 2026

Created the requested dusty lavender spool with one long continuous thread, matching the gouache set at 1536×1024 (3:2). Original and exact built-in generation prompt: `artwork/thread/`; optimized delivery: `site/assets/lavender-thread.jpg`. Standalone asset; page placement is not assigned. Visually checked the spool, single continuous strand, palette and margins; verified dimensions. `npm run check` and `git diff --check` passed. Prepared a signed asset PR for Jason; no rendered-page behavior changed.

## Thread art — October 13, 2026

Jason supplied a spool-of-thread illustration for the within-list thread view. Design compared two placements: beside the open thread's heading, or swapped into the small picture by the tabs. The tab-row slot shrank the thread to an unreadable line, so the picture sits beside the thread heading (about 300 px wide, feathered into the paper like the other art), and above the heading on phones. It hides itself if the file fails to load.

Verification: `npm run check` passed; Playwright screenshots of a films thread at 1440 px and 390 px confirmed placement. Jason merges.

The spool image is byte-for-byte the Codex original from #60, so the page now uses that copy (`site/assets/lavender-thread.jpg`, prompt in `artwork/thread/README.md`), and the duplicate that #64 added is gone.

## Phone size for the list picture — October 13, 2026

Jason kept the list picture left of the tabs and asked for a moderate phone size: the 150–230 px picture from #66 read too big against the tab text. On phones it is now a fixed 140 px, beside the tabs when they fit (around 540 px wide) and on its own line just above them otherwise. A design trial that moved it into the list view above the first shelf (#68) was closed unmerged at Jason's call.

Verification: `npm run check` passed; Playwright screenshots of books and albums at 360, 390 and 540 px, with no sideways scroll. Jason merges.

## Site-wide dark theme — October 12, 2026

Jason requested a full dark color theme while keeping the images. Implemented on `codex/dark-mode` from main `11dbdb0`: shared early theme bootstrap and stylesheet included in all 16 site HTML pages, including nested anti-library paths, digests, gallery, case studies and 404. Auto/Light/Dark native select has an accessible label, keyboard support, persistent explicit preferences, live OS following in Auto, cross-tab synchronization and graceful storage denial. The masthead measures its height so sticky filters and anchor offsets follow the mobile wrapping. The historical identity board remains an unchanged brand artifact.

Dark direction: warm charcoal #24211f, cream #f1e9dd, copper #edaa89, muted lavender panels #40384d. Input/menu/highlight/code colors use shared tokens. Original images stay unmodified and are presented on cream paper; the navigation mark becomes white through CSS. Digest print palette resets to light. No authentication, data or hosting behavior changed.

Verification: `npm run check` passed 294 references/anchors/image checks across 17 pages. Four Node regression tests passed for OS changes, explicit preference/Auto, blocked storage and cross-tab changes. JavaScript syntax and whitespace checks passed. Browser verified desktop homepage, anti-library header and filters, Orca case-study header, and 320px homepage/light return and locked digests, with no horizontal overflow in measured mobile views. Preference survives reload and cross-page navigation. Dark ink/muted/copper contrast against paper, surface, lavender and highlight backgrounds ranges from 5.59:1 to 13.29:1. Screenshot: `verification/previews/dark-home.jpg`. Private digest content, native print preview and screen-reader execution were not tested; print rules were inspected. Author verification sufficient for this reversible presentation change. Jason retains merge; existing deployment runs on merge.

## Headline picture balanced in its space — October 13, 2026

Jason asked for the still life beside the headline to sit balanced in the white space, like the path-page photos (#72). It hugged the right edge and sat about 18 px above the headline's middle. The headline column now sizes to the headline (capped at 7.4em so it breaks after "haven't"), the picture is centred in the rest of the row at up to 400 px, and it drops 36 px so its middle lines up with the headline's. `/digests` shares these styles and gets the same treatment. Phones are unchanged.

Verification: `npm run check` passed; Playwright measurements and screenshots of both pages at 1100, 1290, 1440, 1600 and 390 px. Picture and headline centres match within 1 px, with no sideways scroll. Jason merges.

## Theme switch in the masthead — October 13, 2026

Jason found the Theme menu amateur next to the rest of the site and asked for a smarter switch between the name and Home. Critique of the old control: a boxed native select with a "Theme" caption read as a form field in a typographic masthead, sat after "Say hello" (stealing its last-link underline) and forced the phone header onto two crowded rows. Four placements were mocked in both themes: a disc beside the name, centred LIGHT/DARK words, a disc before Home, and LIGHT/DARK words before Home. Chosen: the disc before Home behind a hairline, which keeps the long quiet space between name and links and groups the switch with the other controls; centred words gave the switch more weight than the name, and a disc floating mid-header looked lost.

Behaviour: one button flips light and dark. The device setting is the default; a choice that differs from the device is remembered, and flipping back to the device's own setting forgets it, so "Auto" needs no third state. `aria-label="Dark theme"` with `aria-pressed`, a title naming what a press does, rust focus ring, 36 px hit area, no motion. Phones above 480 px keep one row; narrower phones put the disc at the right of the name's line and the links underneath. `antilibrary/thread.html` (added in #74 while #73 was open) now loads `theme.js` and `theme.css` like every other page.

Verification: `node --test scripts/theme.test.mjs` (6 tests) and `npm run check` passed. Playwright at 1440, 1000, 700, 481, 480, 430, 390, 360 and 320 px across home, anti-library, thread, digests, a case study and more projects: switch present, no sideways scroll, masthead 96 px desktop, 73 px from 481–700 px, 102–105 px below. Keyboard: third Tab stop, Enter flips and persists across pages; flipping back clears storage. Screenshots: `verification/previews/theme-switch-*.jpg`. Jason merges.

## Dark-theme artwork — October 13, 2026

Jason supplied dark-theme versions of all eight illustrations: the anti-library headline still life, the four list pictures, the digests notebook, the thread spool and the home page still life. All eight matched a picture on the site; none were missing. They are transparent cut-outs, so in the dark theme they sit straight on the charcoal page in place of the light originals on a cream mount. The light theme keeps the original pictures, as Jason preferred.

How: originals are in `artwork/dark/` (README maps each one); the page gets WebP copies (JPEG has no transparency) sized to about twice their slots. A small `site/theme-art.js`, loaded on the home, anti-library, digests and thread pages, swaps any picture whose file name matches a light illustration when the theme is dark, including pictures scripts set later (a list's picture on a tab change, a thread's spool) and back again when the theme turns light. It keys off the `data-theme` that `theme.js` sets before paint, so it works unchanged with the new theme switch (#78) and with the smaller light copies (#75, whose `-480`/`-960` names it also matches). Until swapped, a light picture is hidden in the dark theme, so the light art never flashes; no animation.

Verification: `npm run check` and `node --test scripts/theme.test.mjs` passed. Playwright in both themes at 1440 and 390 px on home, anti-library (Books, Films, switching to Albums) and digests: dark pages show only the dark files, light pages only the originals, and flipping the theme on an open page swaps every picture both ways. The thread page has no theme switch until #78 lands. In the dark theme the static pictures still start downloading the light file before the swap. Generation prompts for the dark set were not supplied yet. Jason merges.

## Just Search and Sort — October 13, 2026

Jason asked to drop all the tags and the Tags menu, and most of the toolbar: "search and sort, the rest handles itself", keeping the setup recoverable and documented. The list page now has only Search and Sort, on desktop and phones. Removed: tags on titles (and the tag column), the Tags, Shelves and Paths menus, the phone Filters button, and the The door and Heard labels on path pages (a heard album is struck through instead, as on the list). Kept: folding shelves, the Paths and Threads asides, path and thread pages, Pick one for me, strikethrough, owner mode with Formative as a checkbox, and links that narrow the list (`?shelf=`, `?only=core` from the intro, old `?thread=`). The tag data stays in anti-lib. `docs/antilibrary-page.md` lists every removed piece and how to restore it. Supersedes #77 (Start here as a plain tag). Built on #75 (lag fix).

Verification: `npm run check` passed; Playwright at 320–1920 px with live data: core shelf link narrows to 12 with its chip, old thread and shelf links, Pick one for me, "/", search, sort, owner Formative toggle and Hide crossed off, no tags on list, thread, author or director pages, no sideways scroll, no page errors. Before and after screenshots in the PR. Jason merges.

## Weekly gallery upkeep — October 14, 2026

Corrected the iYosi gallery technology caption from Java to Kotlin and Jetpack Compose, matching the Android README and build configuration. SwiftUI, FastAPI and PostGIS remain supported by their client/API source documentation. The three-entry gallery, public destinations, pilot/concept status, screenshots and StatBatt archived/no-release record remain current. No featured-project changes.

Author verification sufficient: bounded caption correction. Current-main baseline 5e368325ed97dc06b241577e0d7605a748e58d81; static check passed 323 references across 18 pages; both external gallery destinations returned HTTP 200. Rendered at 320 and 1440 pixels: caption wraps without overflow and all project images load. Production preparation retains gallery/StatBatt noindex and sitemap exclusion. No merge or deployment performed. Current local operating policy v3.1.4 was consulted; the automation’s historical v1.3 reference was unavailable.

## bellos phone screenshot refresh — October 17, 2026

Captured the running app in Safari at 390 × 844 CSS pixels / 2×: planned chest-and-biceps workout, future training block, and Dead Bug movement guidance. Cropped browser chrome only; retained actual interface pixels and no workout history, account details or entered notes. No sets logged or workout completed. Temporary Safari developer-menu setting restored and capture tab closed. Replaced the interim GetFit v1 images on homepage and case study with three 780 × 1688 JPEG assets; captions/alt text, screenshot status and copy guide now identify bellos. Existing static presentation, route, original source links and development status retained. Historical v1 assets left in place.

Author verification sufficient for imagery/copy change. Static check passed 323 references across 18 pages and whitespace passed. Rendered homepage/case at 390 and 1440 pixels: no horizontal overflow, all three new images loaded; case images remain unlinked and stack on phones. Preserved shared dirty checkout by working from main f97814b in isolated checkout. No application tests, merge or deployment performed.

## Direct demo case and bellos private beta — October 17, 2026

Owner confirmed bellos is released into private beta. Added the Lontra Creek demo case directly beside toolkit/game case links on the homepage. Updated homepage/case captions and status to private beta and changed the public-site link label to Visit bellos. Destination remains bellos.app; no invitation or open registration claim. Updated current copy guide and README.

Author verification sufficient: static check passed 324 references across 18 pages; whitespace passed; 390/1440-pixel checks found no overflow, direct Demo case study click reached the existing Lontra Creek case, and case status/descriptive link match. Existing screenshot PR89 was already merged, so this is a new branch from main8b37830. No merge/deployment performed.

Owner clarification, October17: Personal Treasury is fully available for free macOS distribution; the sample site demonstrates it. Updated homepage status/caption/description/download label, case metadata/current state/distribution paragraph and copy guide. Removed obsolete local-preview wording. Static324/18 and whitespace passed; rendered390/1440 confirms readable download status and links without overflow, and case facts report free macOS availability. Included in openPR90; no merge/deployment.

## Software-first portfolio review preview — October 17, 2026

User approved implementing the supplied two-site review for the personal site only, on a preview branch before owner merge. Branch `codex/portfolio-review-preview`, isolated managed worktree, base `8b86630`. Original dirty `codex/statbatt-case-study` checkout preserved. Implemented founder introduction/biography and commissioned-work route, retained four features with Garnet Guard replacing the Orca website card, added the Garnet case, and curated public More work into software/emerging/website/archive sections. Builder and the personal antilibrary have distinct purposes; Household Administrator is incomplete work. Retained all case URLs, former home Orca anchor, StreamOtter’s three related cases, latest bellos private-beta imagery/status, and Treasury availability. More work gains production canonical/sitemap inclusion; StatBatt, reading and digest exclusions remain. No company source edits or data/auth changes.

Evidence: Garnet public main/local source `c6ecb3013d7bbe18461193b6262dacd675d7e9d2` matched through GitHub API; repository is public. Its real engine inspected synthetic in-memory wheels and fixture provenance, producing C003/T001 warnings saved in `verification/garnet-walkthrough.txt` and rendered as selectable report text. No package code executed, real publisher signature verified, malware replay or accuracy claim made. CLI version and C003 explanation ran successfully. Python dependencies installed only in a temporary environment, with bytecode disabled against product source. Household README at `6a51e37` supports incomplete-component wording; Builder’s purpose is supplied/approved in the review. LLM Bridge is design-only and deferred; Otto lacks a name/purpose; Roost remains a future personal selection, with no new claim derived from its stale local release notes. Shared small inventory is in the management folder, with company placements labeled proposed/team-owned.

Verification: `npm run check` passed 370 references/anchors/image alternatives across 19 pages. All six existing theme tests passed. Production preparation assertions confirmed More work/Garnet canonical and sitemap inclusion and archive/reading/digest noindex preservation; rebuilt local noindex output afterward. Browser: homepage at 320/390/481/640/641/768/1440, case at 320/390/768/1440, collection at 320/390/640/641/768/1440, no horizontal overflow in measured views. Four features retained, loaded case/collection imagery, both themes exercised, Garnet card→case and Orca case→collection round trip work. Navigation wraps at 640px for the extra link; theme behavior is unchanged. Local server on port4182. Author verification sufficient: reversible content/layout/metadata edits, no high-risk controls. Screen-reader execution and production deployment were not tested. Owner retains merge; no deployment by this task.

## Abandoned-project correction — October 17, 2026

Owner clarified that iYosi and StatBatt are abandoned projects, never finalized as products. Supersedes prior iYosi pilot/in-development positioning. Both now appear under Abandoned projects; removed the otherwise empty additional-software section. iYosi’s gallery card opens its historical record, its case removes prospective pilot/launch wording and returns to the archive, and both case introductions/statuses identify abandonment. Existing URLs and historical implementation evidence remain. iYosi now joins StatBatt in production noindex/sitemap exclusion. Copy guide, README and shared management inventory synchronized. Updated the same preview branch/PR91; no company-site changes, merge or deployment. Author verification sufficient for this bounded presentation/status correction.

Owner also added Spessartine as in development, behind Garnet Guard. Source README/brief at a74b5d3 describes an experimental Python diagnostic spike for serial-versus-worker differences, not a released V1. Added a concise emerging entry with no private repository link, release promise or performance claim; Garnet remains featured. Static check passed 370 references across19pages; both abandoned cases retain noindex/sitemap exclusion. Browser verified archive320/1440 without overflow and iYosi record/return link.

## Emerald City entry — October17,2026

Owner requested Emerald City in the in-development collection. Added a name/status entry, retaining Garnet’s featured priority and the abandoned-project corrections. No product purpose, capability, availability, or destination inferred; requested an optional one-sentence public description. Same preview branch/PR91; no company edits, merge or deployment. Author verification sufficient for this bounded content addition.

Verification: static check370references/19pages and whitespace passed; browser confirms four emerging entries including Emerald City, with no horizontal overflow at320/1440px. No runtime behavior or product code changed. Public description remains optional; the confirmed name/status stands on its own.

## Emerald City description — October17,2026

Owner supplied an operating-model brief and confirmed the project is a personal investment strategy application. Replaced the name-only entry with research/backtesting/portfolio-review purpose and explicitly planned separation of research and execution, paper testing, risk limits and decision records. No live integration or performance claim; no private account context or financial figures copied into the site or repository. The brief’s operational instructions are not executed. Same preview branch/PR91, no product changes, merge or deployment. Author verification sufficient for this copy-only update.

Verification: static370references/19pages and whitespace passed; rendered entry matches approved purpose and planned status, no horizontal overflow at320/1440px. No new runtime behavior, financial research, or product implementation was tested or performed.

## Emerald City copy simplification — October17,2026

Owner requests a broad description while project direction is unsettled. Reduced the entry to “A personal investment strategy app.” Retained Personal application / In development; removed all workflow/strategy detail. Copy guide and shared inventory follow the same public description. Same preview PR91; no product work, merge or deployment. Author verification sufficient.
