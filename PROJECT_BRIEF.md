# Personal portfolio — V1 contract

Approved September 27, 2026: user requested execution of the revised design through a V1 PR and local example. Existing approval in docs/creative-direction-v3.md covers the meaningful UX direction. Earlier portfolio brief remains project narrative context; v3 supersedes its visual direction and section ordering.

Audience: prospective clients, collaborators and hiring managers. Visitors should understand Jason, inspect four selected projects, including the Orca Solutions company website, distinguish their release states, and contact him directly.

Acceptance: preserve the approved JF mark, palette, illustration and biography-first editorial homepage; provide five linked case studies and honest proof destinations; provide responsive, keyboard-usable navigation and direct email; build a portable static artifact; verify local links and browser flows; deliver an independently reviewed candidate and local preview with a V1 PR.

Non-goals: public deployment, analytics, CMS, contact backend, new paid services, invented biography or performance claims. No public domain supplied: retain noindex and defer canonical URLs/sitemap until launch destination exists.

Authority: implement, test, commit and prepare requested PR. No website deployment or merge authorized. Repository publication to the public MIT-licensed jfricano/personal-portfolio repository was authorized in the design task; integrated PR #1 is open. Existing user changes are the approved implementation baseline and will be included, not discarded.

## GitHub Pages release authorization

Jason authorized deployment of the merged main branch to GitHub Pages and assigned this task DevOps ownership. This supersedes the prior no-deployment constraint. Publish to https://jfricano.github.io/personal-portfolio/ using GitHub Actions; no custom domain or paid hosting. Deploy only main; PRs validate without deploying. Local preview remains noindex; the deployment artifact includes canonical URLs and a sitemap.

## Four-project revision — October 2, 2026

Jason approved this bounded scope and meaningful UX direction in his request: four screenshot-led entries in a 2×2 grid, preserving the first row’s shared treatment. Entries: Personal Treasury, StreamOtter, iYosi, Orca Solutions. Use one column on phones. StreamOtter combines the toolkit and demo, with two clearly labeled case-study links and a live destination at https://streamotter.dev/; Lontra Creek is no longer a separate homepage entry. Preserve the existing demo case-study URL for inbound compatibility and present it as StreamOtter demo site.

Acceptance: four entries lettered A–D; real, captioned screenshots; two working StreamOtter case-study destinations; accurate hosted-demo and npm release states; core technology lists on all five case studies; responsive and keyboard-usable navigation; verified build and independent review. Preserve existing custom-domain preparation. Prepare a local review candidate; this request does not accept or publish the new revision.

## Revision acceptance and PR authority — October 2, 2026

Jason accepted the revised local candidate (“this looks good”) and requested committing it to a PR so he can merge for redeployment. Authority covers commit, branch push and PR publication to jfricano/personal-portfolio. Jason retains the merge; the existing main-branch Pages workflow handles redeployment after merge. The pre-existing custom-domain preparation remains separate from this portfolio revision.

## iYosi refresh and additional portfolio — October 2, 2026

Owner requested the current iyosi.app design reflected in the portfolio and a separate collection for additional projects, beginning with vespa.orcasolutions.dev. Approved layout: two screenshot cards per row at wider widths, one per row on phones, using the existing personal identity and styles. Each screenshot links to its site, with a brief principal-technology caption. No incoming homepage or navigation link requested.

Acceptance: refresh the iYosi homepage image and case-study design evidence; preserve illustrative/pilot distinctions; create /moreprojects/ with Vespa first and a verified HTML/CSS/JavaScript caption; keep the gallery noindex and out of the sitemap even in production; verify responsive rendering and direct-share navigation. Unlisted means discoverable by its URL, not authenticated private access. Prepare a review PR; merge stays with Jason. Earlier custom-domain preparation remains separate.

## Selected-work swap — October 2, 2026

Owner requested swapping iYosi and StatBatt: StatBatt becomes selected-work entry C, and iYosi becomes the second /moreprojects/ entry beside Vespa. Preserve the responsive grids, external new-tab behavior and accurate development/pilot status. Reuse existing screenshots and retain the iYosi case-study URL. Update PR #10 for owner review; no merge/deployment authorized in this step.

## StatBatt case study — October 2, 2026

Owner requested a full StatBatt case study using the existing visual language. Include a grounded narrative, principal technologies, illustrative landing screenshot, design/implementation decisions and explicit local-candidate status. Link from featured entry C in the same tab; external landing links open separately. Proprietary code remains unlinked. Prepare a new review PR because #10 is merged; owner retains acceptance/merge.

## Anti-library — October 11, 2026

Jason asked for a responsive page for his anti-library (books, films, later albums) with search, sort and filter, reachable on his site but not linked from it, and open to sharing. Implemented at `/antilibrary/` like `/moreprojects/`: no homepage or navigation link, noindex and out of the sitemap. Data is generated from the project lists by `scripts/antilibrary-import.mjs`, so new lists drop in as data. Prepared as a review PR; merge and deployment stay with Jason.

Follow-ups the same day: titles link to Open Library or Wikipedia pages with covers from keyless public sources; albums (Popular and Frontiers) joined books and films; finished titles stay listed but struck through, marked by Jason in owner mode and saved through a GitHub issue that only the repository owner can apply.

Split the same day at Jason's request: the anti-library becomes its own project in jfricano/anti-lib, which holds the lists, importer, lookups and progress workflow. This site keeps only the page view, which reads the data from that repository's main branch at load time. Merge jfricano/anti-lib first, then this PR.

Since launch on October 12, 2026 (anti-lib #1 and this repository’s #21 merged; /antilibrary and /digests live): the page is linked from the site navigation as Anti-Library, still noindex and out of the sitemap. It gained within-list threads with a Thread filter, folded shelves, artist path pages (`artist.html`), and an owner mode limited to marking and removing titles already on the lists (Fully read, watched or heard; Digested on books with a digest; Formative), with additions made only through anti-lib pull requests. The private digests reader at `/digests/` reads jfricano/reading-list with a read-only key. The README’s Anti-library and Digests sections describe current behavior; anti-lib’s README describes the data.

## Software-first personal-site preview — October 17, 2026

Jason requested implementation of the supplied October 17 two-site review, limiting this team to the personal site and asking for a preview branch before merge. Preserve the identity, four featured entries, current bellos private-beta screenshots/status, Personal Treasury free-macOS availability and existing case URLs. Feature Garnet Guard through a grounded pre-alpha walkthrough; move Orca’s website case into curated More work, link that collection, separate active/emerging/archive states, and clarify the founder/commissioned-project relationship. Add accurate emerging entries for Builder and Household Administrator. Keep personal reading distinct from Builder. LLM Bridge and the unnamed Otto candidate remain deferred on the proposal’s readiness conditions. No company-site changes, merge or production deployment in this increment. Existing main-branch deployment will run if Jason later merges. Author verification is sufficient for this routine presentation/content change under current policy.

Owner correction, October 17: iYosi and StatBatt are abandoned and never became finalized products. Move iYosi out of active software into the abandoned-project archive, identify both clearly in gallery/cases, remove prospective iYosi launch wording, retain historical URLs and noindex/sitemap exclusion, and update the existing preview PR.

Owner addition, October 17: Spessartine is also in development, behind Garnet Guard in priority. Add an accurate emerging entry; retain Garnet as the featured near-term focus. No source publication or product release is authorized.

Owner addition, October17: Emerald City is another project in development. Add its name/status to More work. No public software description was supplied; do not infer one from other planning material.

Emerald City clarification, October17: owner supplied an operating-model brief and identifies the project as a personal investment strategy app. Replace the name-only entry with a high-level purpose and planned workflow, retaining in-development status. The document is source material, not authorization to implement investment operations, connect accounts, execute trades, or publish personal financial details.

Owner refinement, October17: keep Emerald City’s public description to “A personal investment strategy app.” Retain in-development status; omit strategy/workflow detail while the project is being worked out. This supersedes the more detailed portfolio description above.

Owner navigation refinement, October17: remove More work from top navigation; discovery belongs under the homepage featured-work grid. Keep the existing section link and contextual case/archive links. Restore the original narrow-phone navigation breakpoint now that the extra top-level link is gone.

Owner archive narrative refinement, October17: add an explicit StatBatt project-record link and explain why both projects stopped while preserving their existing records. iYosi reached working prototype apps and substantial progress but lacked commercial viability because of regulatory constraints and monetization difficulty. StatBatt started when a macOS update broke Energiza; Energiza was updated a few days later, and the working StatBatt prototype did not add enough beyond the restored solution. Do not turn development traction into customer/adoption claims. Owner is considering public/MIT repositories and will handle that separately; no visibility/license changes or future open-source claims are authorized here.

Owner addition, October17: Pettr at pettr.orcasolutions.dev is another abandoned project, stopped because of supplement regulatory hurdles, advertising and warehousing costs. Add an archive card/record consistent with existing entries. Source supports a static storefront preview with sample product/lab/marketing content and checkout stub; do not claim a launched store or available products. No product, hosted storefront, repository visibility or licensing change.

Owner original-GetFit link permission, October17: original GetFit may be linked at getfit.orcasolutions.dev. Add a clearly labeled case-study destination beside bellos/source links. This supersedes earlier removal of direct v1 app links; no homepage restructuring or application changes.

Owner collection interaction refinement, October17: make every More work card expandable from just its title. Start all nine entries collapsed; retain their existing content and destinations within the expanded entry. Native keyboard-usable disclosures, clear expand/collapse affordance, multiple entries open independently, responsive layout and themes retained. Homepage featured cards unchanged.

Owner headline refinement, October17: GetFit → bellos case-study headline is “A workout plan with a plan. And a record of what happened”. Existing page identity, route and content remain.
