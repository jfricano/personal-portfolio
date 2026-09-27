# Jason Fricano — personal website

The latest implementation is **There’s always more to notice**: a human-first editorial site with an original personal identity, illustrated artwork, revised copy, selected projects and a StreamOtter case study. Jason approved this branding and design direction on September 27, 2026, including the integrated JF mark and its knife-edge terminals. It is the current implementation baseline, not publicly deployed.

## Preview

```sh
npm run dev
```

Open http://127.0.0.1:4175. The identity board is at http://127.0.0.1:4175/branding/personal-v1/index.html.

`npm run check` builds and validates local links, anchors and image alternatives. `npm run build` writes a standalone static site to `dist/`. Node is the only runtime dependency. Rebuild and refresh after edits.

## Source and direction

- `site/`: homepage, StreamOtter case study and shared CSS.
- `branding/personal-v1/`: The Turn F/J mark, wordmark, favicon, board and usage notes.
- `artwork/`: original generated illustration, compressed delivery image, exact prompt and provenance.
- `docs/creative-direction-v3.md`: creative rationale and role boundaries.
- `docs/personal-copy.md`: copywriter’s source document.
- `docs/fine-art-advisory.md`: identity critique.
- `verification/review.md`: checks performed and limitations.

The existing mockups and design brief remain below as historical context. Product release claims still need revalidation before launch; the public domain and canonical URLs have not been supplied. Pages are intentionally marked noindex for this review build.

## V1 review candidate

The homepage now links to four complete case studies: StreamOtter, Personal Treasury, Lontra Creek and iYosi. The approved v3 design remains the visual baseline; `mockups/` and the earlier brief are historical references.

`npm run check` validates all seven shipped HTML pages, including the identity board and 404 page. The local server returns a styled 404 with a working home link even for nested missing URLs. Choose another port with `PORT=4176 npm run dev` if 4175 is already occupied.

The static output excludes local workflow documents, artwork provenance notes and the full-size original artwork PNG. Source provenance stays in the repository. No analytics, runtime services or external fonts are required.

See `PROJECT_BRIEF.md`, `WORKING_RECORD.md` and `verification/review.md` for scope and evidence. Public deployment, final domain metadata and search indexing require a separate launch decision. A static host must be configured to use `404.html` for missing pages; this project does not configure a hosting provider.
