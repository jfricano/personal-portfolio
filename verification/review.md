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
