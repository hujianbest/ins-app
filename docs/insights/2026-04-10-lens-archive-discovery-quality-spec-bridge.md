# Lens Archive Discovery Quality Spec Bridge

- Status: Draft
- Topic: lens-archive-discovery-quality
- Bridge target: `ahe-coding-skills/ahe-specify`
- Bridge note: This is a draft bridge built from framing, insight, opportunity, probe design, proxy interview synthesis, and a simulated P3 readout. It carries explicit probe debt and must not be mistaken for a fully validated product thesis.

## 1. Opportunity Thesis

- One-line thesis: For sustained photography creators with recurring visibility needs, help published work be repeatedly discovered by named high-value viewers, then move those viewers into a more trusted evaluation and contact path.
- Why this matters:
  - Current creator workflow is fragmented: social surfaces create scattered awareness, owned sites create trust, and real contact often happens elsewhere.
  - The current Lens Archive product already has a works-first public shape, but its story still reads too broadly as a generic photography platform.
  - A narrower discovery-quality wedge gives `ahe-coding-skills` a concrete product thesis instead of forcing it to guess whether the product is a community, a portfolio host, or a collaboration board.

## 2. Target User And Context

- Primary user / segment:
  - Sustained photography creators who publish at least monthly, already use multiple channels, and have recurring visibility needs.
  - Most plausible early segments from current evidence:
    - local portrait or family photographers
    - local studio or recurring collaborator networks
    - niche commercial creators with a clear buyer type
- Situation / trigger:
  - The creator keeps publishing work but feels high-value discovery is still too random.
  - They do not only want broad exposure; they want to be noticed by specific people such as clients, collaborators, peers, curators, or other high-value viewers.
  - They already maintain some form of trusted destination such as a website, portfolio, profile, or direct contact workflow.
- Current workaround or substitute:
  - Instagram, Threads, Behance, niche groups, local hashtags, referrals, DMs, email, and an owned website or portfolio.
  - Social is often used for first touch, while the website or another controlled destination handles serious evaluation and conversion.

## 3. Desired Outcome

- Product or business outcome:
  - Reposition Lens Archive from a broad "comprehensive photography platform" into a narrower, more credible discovery-quality wedge.
  - Create a pre-spec input that lets the next phase define product behavior around qualified discovery rather than generic visibility.
- User value if successful:
  - The right viewers see the work more repeatedly and with higher fit.
  - More discovery flows into profile views, deeper work inspection, follows, direct contact, or another trusted next step.
  - Creators become willing to shift some attention or publishing effort toward the product because it creates better-qualified discovery, not merely broader reach.

## 4. Proposed v1 Shape

- Core behavior to support:
  - A works-first discovery path that helps creators surface selected work to a narrower, more relevant audience and then routes interested viewers into a trusted evaluation and contact path.
- Must-have scope:
  - Keep a works-first public entry and browsing path as the primary story.
  - Make the first segment explicit instead of speaking to all photographers at once.
  - Make "right viewers" legible enough that discovery is not interpreted as generic exposure.
  - Make the handoff path explicit: from discovered work into creator profile, deeper work inspection, follow, direct contact, and possibly an owned destination.
  - Keep collaboration and relationship actions downstream of discovery rather than equal top-level pillars.
  - Preserve enough scope for `ahe-specify` to define exact behavior, signals, and constraints without reinventing the product thesis.
- Explicit non-goals:
  - Replacing the creator's own website or owned portfolio.
  - Re-expanding into a generic "comprehensive photography platform" story.
  - Positioning the product as a universal new home for all photographers.
  - Treating generic likes, follower counts, or broad exposure as the core success signal.
  - Building a full marketplace, generic gig board, or heavy business-management suite in this round.
  - Solving cold-start discovery with an implied algorithmic-scale promise.

## 5. Differentiation

- Wedge:
  - Lens Archive should behave like a discovery bridge, not a universal home.
  - The wedge is not "more exposure." It is "better repeated discovery among the people who matter, followed by a trusted handoff."
- Why now:
  - Creators already split effort across social surfaces, portfolio tools, and direct contact channels.
  - Public signals show distrust of generic platform engagement but continued need for meaningful discovery.
  - The current product already contains works-first surfaces, so the next step is tighter product definition rather than inventing a new broad category.
- Why this is not just a clone:
  - Not Glass-style "home for photographers."
  - Not Behance-style broad creative network plus hirer platform.
  - Not PhotoShelter or Adobe Portfolio style portfolio host.
  - Not Model Mayhem style gig-first matching network.
  - The intended value is narrower: repeated, qualified discovery plus credible handoff for a named creator segment.

## 6. Evidence And Unknowns

### Supported by evidence

- `Observed`: The current Lens Archive experience is already works-first, with public work browsing, creator profiles, follow, private message, and search across works, creators, and opportunities.
- `Observed`: Prior product docs already shifted from a broad showcase-and-collaboration story toward a publish -> discover -> relationship -> continue-creating loop.
- `Observed`: Public discussions repeatedly treat social surfaces as first-touch discovery and websites or other controlled destinations as the trusted place for serious evaluation.
- `Observed`: Public discussions repeatedly distinguish between vanity metrics and meaningful outcomes.
- `Inferred`: Repeatable discovery matters most for creators with recurring visibility needs, not for all photography contexts.
- `Inferred`: A narrower bridge-shaped promise is more credible than a broad new-platform promise.

### Still assumptions

- `Untested`: Which exact early segment should own the first version.
- `Untested`: Whether enough creators would actually change publishing behavior if qualified discovery improved.
- `Untested`: Whether creators can define "right viewers" cleanly enough for a product to support without heavy manual operations.
- `Untested`: Whether the current browse -> profile -> follow/contact path feels legitimate or spam-prone in real use.
- `Untested`: Whether the product can create perceived discovery quality without overpromising algorithmic or cold-start magic.

## 7. Probe Status

- Probe completed:
  - `P1` Structured interviews: not executed
  - `P2` Concierge match week: not executed
  - `P3` Narrative + CTA: drafted, simulated, not executed
- Key readout:
  - Proxy interview synthesis and simulated P3 both support a narrower thesis: creators may care about better qualified discovery, but mostly as a bridge into a trusted destination rather than as a replacement home.
  - The direction looks strongest for creators with recurring discovery demand and named target viewers.
  - The main surviving risk is trust, not awareness of the problem.
- Remaining probe debt:
  - Real creator interviews for segment and audience definition
  - Real P3 send to a small trusted group
  - Optional concierge probe if `ahe-specify` needs more confidence around the handoff and fit logic

## 8. Open Questions For Spec

- Question 1: Which single early segment should the product explicitly optimize for first?
- Question 2: How should the product represent "right viewers" in a way that is understandable, narrow, and not just another vague audience promise?
- Question 3: Which trusted handoff paths belong in v1: internal profile, follow, direct contact, external site, or some combination?
- Question 4: Which product signals should count as evidence of qualified discovery, if generic likes and broad reach are not the primary measure?
- Question 5: How should collaboration and opportunity surfaces be positioned so they remain downstream conversion paths rather than collapsing back into the main product story?

## 9. Spec Boundary Notes

- The next spec should define behavior around a narrowed segment, not around "photographers" as a monolith.
- The next spec should treat discovery, profile trust, and relationship/contact handoff as one connected loop, but still preserve discovery as the entry point.
- The next spec should explicitly document what the product will not try to solve in v1, especially broad social growth, generic portfolio hosting, and all-purpose collaboration management.
- The next spec should carry forward the current probe debt instead of erasing it.

## 10. Recommended Next Skill

- `ahe-specify`

