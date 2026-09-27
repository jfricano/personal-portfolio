# Jason Fricano — personal portfolio design brief

**Working direction:** From complicated idea to working product  
**Date:** September 26, 2026  
**Status:** concept and visual direction for review

## 1. What the site needs to do

The site should help a prospective client, collaborator, or hiring manager answer four questions in a few minutes:

1. Who is Jason, and what is it like to work with him?
2. Can he take an idea all the way through product thinking, architecture, implementation, and delivery?
3. What has he actually made, and can I inspect or try it?
4. How do I contact him?

The site is Jason's home on the web, not a second Orca Solutions site. Orca appears as the studio he founded and the publisher of the software, without competing with his name in the header. The portfolio should feel like a capable person talking directly to another person: clear, thoughtful, warm, and occasionally delighted by the work. The visual design stays quiet enough to let the products carry the evidence.

### Primary audience

- People considering Jason for a project, including freelance prospects arriving from Fiverr or LinkedIn.
- Product owners who have an idea but need someone to make the decisions and ship the software.
- Technical collaborators evaluating the depth of his work.

### Conversion

Primary: start a conversation with Jason. Secondary: inspect a project, try a demo, or read its source and documentation. Do not require visitors to study every project before reaching contact information.

## 2. Positioning and voice

### Positioning line

> Attorney and software builder. I take complicated ideas from first sketch to working product.

This is a more credible version of “I can translate any idea quickly and completely.” It keeps the ambition while letting the portfolio supply proof. Speed belongs in the explanation of Jason's process, alongside judgment, completeness, and verification. Avoid promising a universal turnaround time.

### Homepage headline

> From complicated idea to working product.

### Supporting copy

> I'm Jason Fricano. I'm an attorney with a strong developer streak. I like making useful tools, solving hard problems, and helping people. I bring the same care to software that I bring to legal work: understand what matters, explain the tradeoffs, and follow through.

This biographical line is a **draft based on Jason's description**. His legal career is ongoing and fulfilling; software is an additional practice, not an exit story. Teaching can appear later if Jason wants it in his public biography, but it should not be assumed in the first release.

### Tone

| Use | Avoid |
| --- | --- |
| Plainspoken first person | Agency “we” on the personal site |
| Specific choices and visible evidence | Superlatives, unverified impact, invented client results |
| Warm, occasional dry wit | Mascot-driven whimsy on Jason's pages |
| Direct verbs: designed, built, tested, shipped | Buzzwords and long technology lists in the hero |
| Honest release state | Treating prototypes and pilots as public releases |

The projects have their own distinct visual identities. Their colors and logos can appear **inside their project imagery**, while the portfolio frame remains consistent.

## 3. Site map

Keep the first release small and polished:

```text
Home
├── Work (five selected projects)
│   ├── StreamOtter case study
│   ├── Lontra Creek case study
│   ├── Personal Treasury case study
│   ├── iYosi case study
│   └── Orca Solutions site entry / future case study
├── About / approach (section on Home)
└── Contact (section on Home)
```

Header: `Jason Fricano` at left; `Work`, `About`, `Contact` at right. A restrained “Let's talk” call to action may be used on wide screens. Footer: one-sentence identity, email or contact link, LinkedIn, GitHub, and a small “Founder, Orca Solutions” credit. Add a résumé PDF only if it is current and useful; do not make it the primary way to learn about Jason.

### Homepage order

1. **Introduction:** name, role, headline, two-sentence promise, `Explore my work` and `Get in touch`.
2. **Selected work:** five projects. Start with StreamOtter and Lontra Creek as a connected proof pair, then Personal Treasury and iYosi as breadth. Close with the Orca Solutions company site, which shows Jason shaping the studio's identity. Each card states what the project is and Jason's role, with a visible project status and one primary link when a public destination exists.
3. **How I work:** three short steps: clarify the problem; build across the stack; verify the result. Mention agentic engineering as a method under Jason's direction, with concrete examples of design decisions, tests, and release gates. Avoid making the tools the hero.
4. **About:** brief personal story. Jason almost became a developer; building remained a happy side quest alongside a legal career he values. The section should show how much he enjoys making tools and helping people, without implying that law is behind him. Add a real portrait only when a photograph Jason likes is available.
5. **Contact:** a clear invitation and one direct action. Keep LinkedIn and GitHub as secondary routes.

On a phone, preserve this order, reduce the number of competing calls to action, and keep project status and link labels visible without hover.

## 4. Project narratives

Every case study should use the same five-part structure: **problem → role and decisions → what was built → proof → current state / next step**. Aim for about 500–800 words on the full pages. The cards stay under 70 words.

| Project | What the card should say | Proof to show | Primary destination | Current editorial state |
| --- | --- | --- | --- | --- |
| **StreamOtter** | A TypeScript toolkit that gets live Kafka-backed state into a browser and makes stale data visible. | Architecture diagram, delivery-state example, CLI/workbench view, npm package, docs. | [npm package](https://www.npmjs.com/package/streamotter); [source](https://github.com/jfricano/StreamOtter). | Repo describes `0.1.0-rc` release candidates; label it **release candidate** until that changes. |
| **Lontra Creek** | A fictional otter research station built to demonstrate StreamOtter against a real Kafka pipeline. | Field station screen, guided failure scenario, distinction between simulated world and real pipeline. | Planned `streamotter.app` destination; confirm that the site is live before linking. | Repo says production stack proven in CI, **not yet hosted**. Do not imply the public demo works yet. |
| **Personal Treasury** | A private household finance app that turns paycheck plans into transfers, reconciliation, and traceable debt history. | Current dashboard and reconciliation screenshots, one-minute demo, exact-money and privacy decisions. | [Live browser demo](https://jfricano.github.io/personal-treasury/); [source](https://github.com/jfricano/personal-treasury). | Demo is live with fictional data; distinguish it from the private and Mac builds. |
| **iYosi** | iOS and Android pilot apps, backed by a shared API, for finding and correcting information about designated and reported smoking areas in Metro Manila. | Mobile screens, status labels, moderation flow, platform differences. | [Landing preview](https://jfricano.github.io/iyosi-landing/). | Label as **pilot / in development**. The landing preview uses illustrative places; store links are pending. |
| **Orca Solutions website** | The company presence for Jason's software studio: its work, method, and published products from the studio's point of view. | Site design, information architecture, studio story, and finished public page when available. | Public URL to be added after launch. | **In development.** Show as a brief portfolio entry now; expand its case study when the site is real. |

The StreamOtter and Lontra Creek pages should cross-link. They prove two different capabilities: building a reusable library and using it to make a real application. They must not look like duplicate entries.

Orca Solutions is connected to all four products but has a different job. Its card should explain the site as a designed company presence, while the personal portfolio remains centered on Jason. Do not turn its card into a second general biography or imply that Orca is a team larger than it is.

### Suggested case study opening lines

- **StreamOtter:** “A live screen is only useful when it can tell the truth about whether its data is current.”
- **Lontra Creek:** “I built a small fictional watershed to put a real streaming system through its paces.”
- **Personal Treasury:** “A spreadsheet had become the operating system for a household's money. I made its rules explicit and its history traceable.”
- **iYosi:** “A useful map needs to show what people know, what they only suspect, and how to correct both.”
- **Orca Solutions website:** “A place for the software studio and its products to speak with one clear voice.”

These are editorial proposals, not claims of public impact. Review them with Jason before publication.

## 5. Visual system

**Character:** editorial clarity with a hint of maker energy. The typography and rhythm do the expressive work. Large serif headlines bring warmth; compact sans-serif details bring precision. Hairline rules, numbered project labels, and modest asymmetry keep the page from feeling corporate.

| Token | Direction | Use |
| --- | --- | --- |
| Canvas | warm ivory `#F7F5F0` | Main background |
| Ink | deep blue-charcoal `#202C31` | Type, dark panels |
| Muted ink | `#59676A` | Supporting text |
| Accent | deep teal `#2D6D69` | Links, small labels, focus |
| Warm note | dark copper `#995B39` | Tiny highlights and readable labels |
| Line | `#D8DCD7` | Separators and card borders |
| Display type | Georgia or a carefully selected modern serif | Headlines and brief pulls |
| UI type | system sans-serif or a humanist sans | Body, labels, navigation |

The mockups use broadly available fonts so the layout can be reviewed locally. Before implementation, test a licensed or self-hosted display face if Georgia feels too familiar. Keep body text at 16–18px, line length around 65 characters, and visible focus indicators. Cards use real screenshots or genuine product assets. Avoid generic stock tech imagery, arbitrary gradients, fake browser windows, animated counters, and invented testimonials.

### Motion

Small hover shifts and quiet reveal transitions are sufficient. The content must work without animation. Honor reduced-motion settings. No parallax or auto-playing product videos.

### Image direction

- Product imagery should show the actual work, not merely repeat logos. The first round of mockups uses existing assets to establish layout; the Lontra Creek field card and iYosi phone are explicitly concept illustrations, not product screenshots. The Orca card is provisional typography until its own site direction is ready.
- Use a genuine headshot with natural light, simple background, and direct expression if Jason wants one. Until then, the About layout should stand on typography alone.
- Give each project a wide image and one focused detail view on its case study page. Caption what the visitor is seeing.

## 6. Interaction and implementation rules

- Responsive at phone, tablet, and desktop widths. Start with semantic HTML and CSS; JavaScript should be optional for core navigation.
- Header links are clear, keyboard usable, and retain visible focus. Every external link has a specific label such as “Try the browser demo” or “View npm package.”
- Project status is written as text and updated during release review. Do not use a decorative “live” dot if nothing is hosted.
- Meet WCAG AA contrast for normal text, provide descriptive image alternatives, and test at 200% zoom. Screenshots need captions; do not rely on screenshots for essential case-study content.
- Keep the homepage quick to load. Use responsive image sizes and lazy-load below-the-fold screenshots. Avoid analytics until there is a clear reason and a privacy decision.
- The initial build can be static. Add a CMS only when update frequency justifies one.

## 7. Publication checklist and open inputs

1. Review the attorney-and-builder biography in Jason's own voice; add one or two specific personal details that he wants public.
2. Confirm the LinkedIn URL, preferred contact email or form, GitHub profile, portfolio domain, and whether Fiverr should appear as a contact route.
3. Confirm final public destinations and release states for Lontra Creek / `streamotter.app`, the Orca Solutions website, iYosi landing, app stores, and Personal Treasury download.
4. Capture current product screenshots from public-safe data. Replace provisional logo-heavy project art where a better product screen exists.
5. Write and review the case studies, checking each technical and release claim against its project source before publishing. The Orca site may begin as a short entry until it launches.
6. Add title/description metadata, social preview, favicon, sitemap, canonical URL, and a useful 404 page. Check every link signed out.
7. Review narrow screens, keyboard use, contrast, reduced motion, and loading on a modest mobile connection.

## 8. What to decide from the mockups

The mockups illustrate the recommended direction: warm editorial type, restrained teal, a personal voice, product evidence, and a direct contact route. Review whether the serif feels like Jason, whether the five projects have the right emphasis, and whether the voice should lean a little more conversational or a little more formal. The final implementation can refine spacing and imagery without changing the underlying structure.
