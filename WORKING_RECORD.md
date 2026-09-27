# V1 working record — September 27, 2026

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
