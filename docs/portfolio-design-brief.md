# Jason Fricano — personal portfolio design brief

**Working direction:** The Practice of Paying Attention

**Date:** September 27, 2026

**Status:** historical second concept iteration; first attempt preserved in Git commit `24692e3`. The approved v3 direction and its October 2, 2026 four-project revision supersede the project grouping, layout, and release labels below. See `creative-direction-v3.md` for the current implementation direction.

## 1. What the site needs to do

The site should help a prospective client, collaborator, or hiring manager answer four questions in a few minutes:

1. Who is Jason, and what is it like to work with him?
2. Can he take an idea all the way through product thinking, architecture, implementation, and delivery?
3. What has he actually made, and can I inspect or try it?
4. How do I contact him?

The site is Jason's home on the web, not a second Orca Solutions site. Orca appears as the studio he founded and the publisher of the software, in a separate studio note rather than as a fifth product card. The portfolio should feel like a capable person talking directly to another person: clear, thoughtful, warm, and occasionally delighted by the work. The visual design stays quiet enough to let the products carry the evidence.

The second iteration is built around a more personal connection: **paying attention**. Jason's curiosity about people and systems, his care as an attorney, his pleasure in making things, and his interest in gardens, cars, music, and odd ideas all belong to the same practice. The site should resemble an annotated visual essay or field notebook: a few good observations, actual evidence, and a little room for surprise. It should not simulate handwritten notes or manufacture an eccentric persona.

### Primary audience

- People considering Jason for a project, including freelance prospects arriving from Fiverr or LinkedIn.
- Product owners who have an idea but need someone to make the decisions and ship the software.
- Technical collaborators evaluating the depth of his work.

### Conversion

Primary: start a conversation with Jason. Secondary: inspect a project, try a demo, or read its source and documentation. Do not require visitors to study every project before reaching contact information.

## 2. Positioning and voice

### Positioning line

> Attorney and software builder. I follow good questions until they become useful things.

This is a more personal expression of “I can translate an idea quickly and completely.” The projects supply the proof. Speed belongs in the explanation of Jason's agentic workflow, alongside judgment, completeness, and verification. Avoid promising a universal turnaround time.

### Homepage headline

> I like figuring things out. I like making things that help.

### Supporting copy

> I'm curious about how people and systems work. I follow that curiosity from a question to a useful tool—and stay with the details until it works.

The About section makes his identity explicit: his legal career is ongoing and fulfilling; software is an additional practice, not an exit story. Teaching can appear later if Jason wants it in his public biography, but it should not be assumed in the first release.

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
├── Work (four selected products)
│   ├── StreamOtter case study
│   ├── Lontra Creek case study
│   ├── Personal Treasury case study
│   └── iYosi case study
├── Orca Solutions studio note / future company-site link
├── Things I keep returning to (section on Home)
├── About (section on Home)
└── Contact (section on Home)
```

Header: `Jason Fricano` at left; `Work`, `About`, `Contact` at right. A restrained “Let's talk” call to action may be used on wide screens. Footer: one-sentence identity, email or contact link, LinkedIn, GitHub, and a small “Founder, Orca Solutions” credit. Add a résumé PDF only if it is current and useful; do not make it the primary way to learn about Jason.

### Homepage order

1. **Introduction:** a human sentence rather than a capability claim, followed by a two-sentence introduction and `See what I've made`.
2. **Selected work:** four products. Start with StreamOtter and Lontra Creek as a connected proof pair, then Personal Treasury and iYosi as breadth. Each entry includes one short marginal observation about the question Jason was trying to answer, the project status, and a direct destination when one exists. Vary the scale and placement of real product imagery.
3. **Orca Solutions:** a distinct studio note, making its in-development company website visible without placing it on equal footing with the four products or making Jason's page read like company marketing.
4. **Things I keep returning to:** four very short word pairs—questions / useful tools, people / systems, care / precision, learning / sharing. A sentence explains that agentic tools increase speed while Jason owns judgment, review, and responsibility.
5. **About:** brief personal story. Jason almost became a developer; building remained a happy side quest alongside a legal career he values. A small field note mentions a run, garden, car maintenance, and his wide-ranging music taste. These details add texture without turning the page into a hobby inventory. Add a real portrait only when a photograph Jason likes is available.
6. **Contact:** a clear invitation and one direct action. Keep LinkedIn and GitHub as secondary routes.

On a phone, preserve this order, reduce the number of competing calls to action, and keep project status and link labels visible without hover.

## 4. Project narratives

Every case study should use the same five-part structure: **problem → role and decisions → what was built → proof → current state / next step**. Aim for about 500–800 words on the full pages. The homepage entries stay concise.

| Project | What the homepage entry should say | Proof to show | Primary destination | Current editorial state |
| --- | --- | --- | --- | --- |
| **StreamOtter** | A TypeScript toolkit that gets live Kafka-backed state into a browser and makes stale data visible. | Architecture diagram, delivery-state example, CLI/workbench view, npm package, docs. | [npm package](https://www.npmjs.com/package/streamotter); [source](https://github.com/jfricano/StreamOtter). | Repo describes `0.1.0-rc` release candidates; label it **release candidate** until that changes. |
| **Lontra Creek** | A fictional otter research station built to demonstrate StreamOtter against a real Kafka pipeline. | Field station screen, guided failure scenario, distinction between simulated world and real pipeline. | Planned `streamotter.app` destination; confirm that the site is live before linking. | Repo says production stack proven in CI, **not yet hosted**. Do not imply the public demo works yet. |
| **Personal Treasury** | A private household finance app that turns paycheck plans into transfers, reconciliation, and traceable debt history. | Current dashboard and reconciliation screenshots, one-minute demo, exact-money and privacy decisions. | [Live browser demo](https://jfricano.github.io/personal-treasury/); [source](https://github.com/jfricano/personal-treasury). | Demo is live with fictional data; distinguish it from the private and Mac builds. |
| **iYosi** | iOS and Android pilot apps, backed by a shared API, for finding and correcting information about designated and reported smoking areas in Metro Manila. | Mobile screens, status labels, moderation flow, platform differences. | [Landing preview](https://jfricano.github.io/iyosi-landing/). | Label as **pilot / in development**. The landing preview uses illustrative places; store links are pending. |
| **Orca Solutions website** | The company presence for Jason's software studio: its work, method, and published products from the studio's point of view. | Site design, information architecture, studio story, and finished public page when available. | Public URL to be added after launch. | **In development.** Present as a separate studio note now; expand it when the site is real. |

The StreamOtter and Lontra Creek pages should cross-link. They prove two different capabilities: building a reusable library and using it to make a real application. They must not look like duplicate entries.

Orca Solutions is connected to all four products but has a different job. Its studio note explains the company presence while the personal portfolio remains centered on Jason. Do not turn the note into a second general biography or imply that Orca is a team larger than it is.

### Suggested case study opening lines

- **StreamOtter:** “A live screen is only useful when it can tell the truth about whether its data is current.”
- **Lontra Creek:** “I built a small fictional watershed to put a real streaming system through its paces.”
- **Personal Treasury:** “A spreadsheet had become the operating system for a household's money. I made its rules explicit and its history traceable.”
- **iYosi:** “A useful map needs to show what people know, what they only suspect, and how to correct both.”
- **Orca Solutions website:** “A place for the software studio and its products to speak with one clear voice.”

These are editorial proposals, not claims of public impact. Review them with Jason before publication.

## 5. Visual system

**Character:** a thoughtful person's annotated field notebook. The hero is one unusually direct sentence, set large and with room to breathe. Sturdy sans-serif project titles carry competence; a literary serif is reserved for the human sentence, short observations, and personal asides. A single imperfect line can suggest a thought continuing across the page. The project image sizes and text positions vary, so the work reads as individual decisions rather than identical cards.

| Token | Direction | Use |
| --- | --- | --- |
| Canvas | warm paper `#F5F2EA` | Main background |
| Ink | green-black `#202D2B` | Type, dark panels |
| Muted ink | `#4E5D59` | Supporting text |
| Secondary accent | deep green `#315F56` | Links and small labels |
| Living accent | oxide red `#A13F2B` | A sparing annotation mark |
| Line | `#CBD2C9` | Separators |
| Human type | Baskerville or a carefully selected literary serif | Hero, marginal notes, brief pulls |
| Working type | sturdy humanist sans-serif | Project titles, body, navigation |

The mockups use broadly available fonts so the layout can be reviewed locally. Before implementation, test a licensed or self-hosted face if the system fonts feel too familiar. Keep body text at 16–18px, line length around 65 characters, and visible focus indicators. Use real screenshots or genuine product assets. Avoid stock tech imagery, arbitrary gradients, fake browser windows, animated counters, fabricated handwritten artifacts, and invented testimonials.

### Motion

Small hover shifts and a subtle line movement are sufficient. If the recurring line moves, it should feel like attention shifting and stop immediately under reduced-motion settings. The content must work without animation. No parallax or auto-playing product videos.

### Image direction

- Product imagery should show the actual work, not merely repeat logos. The mockups use existing assets to establish layout; the Lontra Creek field card and iYosi phone are explicitly concept illustrations, not product screenshots. The Orca section is provisional until its own site direction is ready and should not invent the company site's identity.
- One genuine personal image—a candid desk corner, Jason's own diagram, a garden or car detail, or a natural portrait—will convey more personality than fabricated collage. Ask Jason to choose what he is comfortable publishing.
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

The second mockup preserves the first attempt's clarity while adding a more personal opening, small observations beside the products, varied visual rhythm, and a distinct Orca studio note. Review whether the personal details and headline sound like Jason, whether the oxide mark has the right amount of energy, and whether the studio section is distinct enough. The final implementation can refine spacing and imagery without changing the underlying structure.
