# Local design verification — September 27, 2026

- `npm run check`: passed 30 local references/anchors/image alternatives across the homepage and StreamOtter case study; one H1 and viewport metadata per page.
- Browser review: homepage desktop at 1440px; phone at 390px and 320px. Measured no horizontal overflow at 320, 390, 768, 1440 and 1920px. Case-study phone rendering checked at 390px.
- Clicked Work and verified `#work`, loaded real Treasury and StreamOtter imagery; followed the case-study link and inspected resulting page.
- Tab key exposed the skip link with a visible solid focus outline. Core navigation is native anchors and all content is static HTML; no JavaScript dependency. Reduced-motion CSS disables smooth scrolling.
- Original artwork loaded correctly. Fixed intrinsic image height overriding responsive sizing, and gave the Treasury caption an opaque background for legibility.
- Identity primary/reverse marks inspected in browser. 16/24/40px specimens retain the silhouette; 24px is the documented normal minimum. Live-type wordmark remains font-dependent.
- Text palette contrast calculated separately: cocoa/paper 12.32:1; muted/paper 5.83:1; rust/paper 5.71:1. Supporting surface colors were also checked. This is not a full accessibility certification.

## Scope limits

No public deployment. Existing release labels and external destinations preserved from the brief; no fresh verification of third-party release status. No invented portrait or biographical anecdote. Contact uses the email confirmed for Orca. Brand and design direction accepted by Jason on September 27, 2026. Public domain/canonical metadata and final publication review remain launch inputs. This preview is marked noindex.

## V1 integrated verification — September 27, 2026

- `npm run check`: passed 94 references/anchors/image alternatives across seven shipped pages; one H1/main, language, viewport and unique IDs checked. Nested identity board included.
- Installed Chrome via Playwright: 30 combinations of five content pages and widths 320, 390, 640, 768, 1440, 1920 passed without horizontal overflow or broken images. Lazy images explicitly loaded before assertions. No browser page errors.
- Keyboard skip link, Work anchor, reduced-motion behavior and nested missing-page 404/home recovery passed. Desktop and mobile screenshots inspected. 640px reflow approximates a 1280px viewport at 200% zoom; native browser zoom and screen-reader testing were not performed.
- Anonymous HTTP GET returned 200 for GitHub profile, all three linked source repositories, Treasury demo and iYosi landing. npm registry package endpoint returned 200; npm storefront rendering was not tested.
- Independent reviewer `/root/v1_review` inspected source and rendered desktop/mobile pages. Accepted fixes: nested 404 recovery, actual recursive landmark validation, build provenance exclusion and diagram heading order. No material UI blocker reported.
- iYosi origin paragraph is grounded in sibling `iYosi/api/docs/PRODUCT_BRIEF.md:5`; other new narratives use project READMEs. These are project records, not fresh execution of those projects' test suites.
- Workflow files confirmed ignored with `git check-ignore`. `git diff --check` passed.

Reproduction: run local preview, then `PLAYWRIGHT_MODULE=/path/to/playwright CHROME_PATH=/path/to/chrome node verification/browser-check.cjs`. Default preview port is 4176; override with PREVIEW_URL. Playwright is a verification-only dependency supplied by this environment, not installed or required to build the website.

Candidate remains noindex and is not publicly deployed. No domain/canonical metadata or hosting integration is configured.

## Orca case-study addition

- Inspected the published company page at https://jfricano.github.io/orca-solutions-company-site/ in the browser.
- `npm run check` passes 110 references/alternatives across 8 pages, including landmark and unique-ID checks.
- Browser-inspected the case study and artwork at desktop and 390px; no horizontal overflow measured at 390px or 320px. All three case-study images loaded.
- Followed the case-study return link to homepage entry 05, confirming its case-study and live-site destinations.

Integrated Orca follow-up: Chrome automation now checks six content pages at six widths (36 combinations), plus homepage → Orca case study → homepage #orca. All passed with image loading, keyboard, reduced motion and 404 recovery. Static checks pass 110 references across eight pages.

## Four-project revision — October 2, 2026

- Static build/reference validation: `npm run check` passed 116 checks across eight HTML pages; `git diff --check` passed.
- CUA browser verification: six content pages at widths 320, 390, 640, 768, 1440 and 1920 (36 combinations), with no horizontal overflow. Desktop/tablet use a two-column project grid; phone uses one column. All five case studies show the core technology list. All four homepage images loaded after keyboard traversal. Local browser logs were empty.
- Verified both StreamOtter case-study links, each return to homepage #streamotter, Work navigation, Orca round trip, first-tab skip/focus, and nested missing-page/home recovery. The 404 response status was not measured: the sandboxed curl probe could not connect to the elevated local server.
- Direct public-browser inspection confirmed connected, changing live readings on StreamOtter.dev and the guided field station; existing iYosi/Orca GitHub Pages links redirected to iyosi.app/orcasolutions.dev. Screenshot assets are real captures from October 2. iYosi remains an illustrative landing preview; StreamOtter remains a release candidate.
- Technology lists checked against sibling manifests and code, not inferred from screenshots. Independent read-only reviewer `/root/revision_review` found no blocking or material source/asset/documentation issue.
- Reusable `verification/browser-check.cjs` gained four-card geometry and dual StreamOtter navigation assertions; `node --check` passed. The CLI browser harness was not run; the actual checks above used CUA. Native browser zoom, screen readers and fresh reduced-motion emulation were not exercised; unchanged CSS retains reduced-motion handling.
- Desktop grid and mobile case-study previews are saved in `verification/previews/`. Local candidate only; no commit, push, merge or deployment.

Final visual review: `/root/revision_review` inspected the desktop 2×2 grid, stacked mobile projects and demo case-study reflow; no blocking or material visual findings. Interactive checks were performed by the lead, not independently repeated.

## iYosi redesign and additional portfolio — October 2, 2026

- Fresh public iYosi screenshot and narrative reflect “Find the place. Check the status.” and the illustrative sample app, preserving the pilot state. Vespa screenshot depicts the public fictional law-firm concept; caption technology grounded in its static source and README.
- npm run check: 130 references/anchors/image alternatives across nine pages; git diff --check passed.
- Production noindex/sitemap/homepage-link assertions passed for portfolio.html; no authentication is implemented.
- CUA gallery checks at 320, 390, 640, 768, 1440, 1920px: images loaded, no horizontal overflow, one column on phones / two on larger screens. Phone gallery and iYosi inspected, gallery return link works and keyboard focus is visible. Native zoom and screen readers not exercised.
- Independent source/asset review: /root/v1_review, no unresolved material findings. Review did not repeat live public or local interactions.

Clean-route follow-up: gallery now ships at /moreprojects/ (site/moreprojects/index.html). CUA confirmed bare-path redirect, loaded assets and that Vespa opens a new tab. HTTP assertions passed for normal/query/encoded-slash redirects, gallery/root assets (200) and nested missing-page recovery (404). Shared-asset recursive build checks pass; root-only publication pass preserves nested noindex and sitemap exclusion. Independent reviewer cleared the route changes after the redirect safety fix.

StatBatt card: npm run check passed 132 references/nine pages; whitespace checks passed. Public landing loaded; fresh screenshot saved. Four-width CUA inspection confirms two desktop cards and mobile stacking, no overflow, loaded images, and a new tab on StatBatt click. Swift/SwiftUI/SQLite caption verified from sibling source. No native app changes or test execution.

Placement swap: StatBatt featured as C; iYosi replaces it beside Vespa in /moreprojects/. npm run check passed 131 checks/nine pages and whitespace checks passed. Four-width CUA inspection of both pages (320/390/768/1440px) confirmed responsive grids, loaded assets and no overflow. Both swapped external links opened separate tabs. Bounded source and visual self-review; no new independent review, native zoom or screen-reader run. Saved statbatt-selected-work.jpg and moreprojects-iyosi.jpg.

StatBatt case study: npm run check passes146references/10pages and whitespace checks pass. CUA four-width inspection (320/390/768/1440px) confirms loaded imagery, responsive diagram and no overflow. Same-tab homepage/case-study return and new-tab landing CTA passed. Independent source/evidence review by /root/v1_review found no material issue; reviewer checked12local targets and current native80/100 scope. Native app tests, hardware, native zoom and screen readers were not run.
