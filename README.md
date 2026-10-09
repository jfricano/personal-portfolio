# Jason Fricano — personal website

The latest implementation is **There’s always more to notice**: a human-first editorial site with an original personal identity, illustrated artwork, revised copy, selected projects and case studies. Jason approved this branding and design direction on September 27, 2026, including the integrated JF mark and its knife-edge terminals. It is the current design baseline. The GitHub Pages workflow described below deploys merged main; a local or feature checkout alone does not establish the currently deployed revision.

## Preview

```sh
npm run dev
```

Open http://127.0.0.1:4175. The identity board is at http://127.0.0.1:4175/branding/personal-v1/index.html.

`npm run check` builds and validates local links, anchors and image alternatives. `npm run build` writes a standalone static site to `dist/`. Node is the only runtime dependency. Rebuild and refresh after edits.

## Source and direction

- `site/`: homepage, seven retained case studies, additional-project gallery, project screenshots and shared CSS.
- `branding/personal-v1/`: The Turn F/J mark, wordmark, favicon, board and usage notes.
- `artwork/`: original generated illustration, compressed delivery image, exact prompt and provenance.
- `docs/creative-direction-v3.md`: creative rationale and role boundaries.
- `docs/personal-copy.md`: copywriter’s source document.
- `docs/fine-art-advisory.md`: identity critique.
- `verification/review.md`: checks performed and limitations.

The existing mockups and design brief remain below as historical context. Product release claims need revalidation before a new publication. Local builds are intentionally marked noindex; production metadata uses the base URL configured in `scripts/prepare-pages.mjs`.

## V1 review candidate

The homepage presents four projects in a 2×2 screenshot grid: Personal Treasury, StreamOtter, GetFit → bellos and Orca Solutions. StreamOtter links to separate toolkit and demo-site case studies. iYosi and the archived StatBatt record appear alongside Vespa Law at `/moreprojects/`. Seven case studies remain in the source, including the retained iYosi and StatBatt URLs. The demo retains `lontra-creek.html` for existing links. Each case study lists its core technologies; the public toolkit and demo are at https://streamotter.dev/. The approved v3 design remains the visual baseline; `mockups/` and the earlier brief are historical references.

`npm run check` validates all eleven shipped HTML pages, including the additional-project gallery, identity board and 404 page. The local server returns a styled 404 with a working home link even for nested missing URLs. Choose another port with `PORT=4176 npm run dev` if 4175 is already occupied.

The static output excludes local workflow documents, artwork provenance notes and the full-size original artwork PNG. Source provenance stays in the repository. No analytics, runtime services or external fonts are required.

See `PROJECT_BRIEF.md`, `WORKING_RECORD.md` and `verification/review.md` for scope and evidence. GitHub Pages hosting is configured by the workflow below. Pending feature changes follow the recorded acceptance and merge process. Other static hosts must be configured to use `404.html` for missing pages.

## License

This personal website is open source under the [MIT License](LICENSE).

## GitHub Pages hosting

Public destination: https://jfricano.github.io/personal-portfolio/.

The Pages workflow validates PRs and deploys main after successful checks. It builds `dist/`, then runs `node scripts/prepare-pages.mjs` to add production canonical URLs, sitemap, robots.txt and nested-404 recovery. Local preview stays noindex. For a manual redeploy, run the Deploy GitHub Pages workflow against main. Roll back a bad release by reverting its commit on main; the previous content is then rebuilt and redeployed.

## Additional portfolio

`/moreprojects/` is a direct-share collection for work beyond the homepage, including Vespa Law, iYosi, and the archived StatBatt record. It uses two screenshot cards per row on larger screens and one on phones. A card links to the project site or archived case study; its caption lists principal technologies. Add new entries to `site/moreprojects/index.html` and screenshot assets to `site/assets/`.

Local review: http://127.0.0.1:4176/moreprojects/. No homepage or navigation link is added. Production preparation retains noindex metadata on the gallery and `statbatt.html`, and excludes both from the sitemap. The page is unlisted, not access-controlled. The iYosi screenshot and case study now reflect the redesigned iyosi.app landing site.

## GetFit → bellos and archived StatBatt

Selected-work C follows open-source GetFit into bellos, the commercial phone-first version in development. The case study presents Accordion Training™ by bellos, progression from logs, open-source customization, and the gym use case behind the phone-first design. GetFit’s public repository remains MIT-licensed, and its v1 app is at https://getfit.orcasolutions.dev/. Three portrait screenshots show the live v1 app at phone width: a generated workout plan, training calendar, and movement guide. They appear together on the homepage and larger in the case study, stacking on phones. No workout history is shown; the images are explicitly v1 references until a running bellos interface is ready. The existing `getfit.html` route is retained.

StatBatt has no release planned. Its implementation record remains at `statbatt.html` through `/moreprojects/`, without homepage promotion. These archive pages are unlisted and accessible by URL.

Phone screenshots on the GetFit → bellos homepage card and case study open in a large, scrollable viewer. Select a thumbnail, use Tab to reach the scrollable image, and close with Escape, the Close button, or a click on the dimmed background. Focus returns to the selected thumbnail. With JavaScript unavailable, the links open the image directly.
