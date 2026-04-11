# Lens Archive Discovery Quality Probe Plan

- Status: Draft
- Topic: lens-archive-discovery-quality
- Concept under test: A works-first discovery loop that helps sustained photography creators get published work in front of the right viewers repeatedly enough to create durable relationship and collaboration value.

## 1. Risk Stack

### Desirability risks

- `Untested`: Creators may not want another discovery surface because they already split effort across Instagram, Behance, personal sites, and niche communities.
- `Untested`: "Discovery quality" may be weaker than generic reach, status, or aesthetics as a reason to change behavior.
- `Untested`: Creators may not share a usable definition of "the right viewers"; they may mean clients, peers, collaborators, or simply anyone who engages.
- `Untested`: Users may want discovery but still distrust any platform-mediated discovery promise.

### Usability risks

- `Untested`: The current works-first path may be visually clear but may not communicate why it leads to better discovery outcomes.
- `Untested`: Follow and private-message actions after browsing may feel cold, spammy, or low-trust instead of useful.
- `Untested`: Search across works, creators, and opportunities may feel broad rather than focused on high-fit discovery.
- `Untested`: Even if the browsing flow is understandable, creators may still default to their existing cross-channel workflow.

### Viability risks

- `Untested`: The product may be too similar to Glass, Behance, or portfolio builders if discovery quality is not clearly legible.
- `Untested`: If "right viewers" are too rare, discovery will feel empty; if the pool is too broad, the signal-to-noise ratio collapses.
- `Untested`: The product may attract polite interest but not enough repeated usage to justify a standalone destination.

### Feasibility risks

- `Untested`: Matching work to high-fit viewers may require more human curation, metadata, or cold-start density than the product can support.
- `Untested`: Trust and safety around follow and private-message flows may become a scaling bottleneck early.
- `Untested`: The product may depend on algorithmic-scale distribution even though the direction is trying to avoid that trap.

## 2. Selected Probes

### Probe 1: Structured creator interviews

- Hypothesis: Sustained photography creators care enough about repeatable discovery quality that they would change where or how they publish if a product could reliably surface their work to the right viewers.
- Risk being reduced: Whether "repeatable qualified discovery" is a real behavior driver, and whether creators can define "right viewers" precisely enough to build around.
- Probe type: Semi-structured interview.
- Target audience: 8 to 10 sustained photography creators who publish at least monthly and currently rely on multiple channels for visibility.

### Probe 2: Concierge match week

- Hypothesis: If creators receive a small number of clearly high-fit viewer or collaborator matches after a short intake, they will take actions they would not have taken otherwise.
- Risk being reduced: Whether better discovery quality produces behavior that feels meaningfully different from random browsing or generic exposure.
- Probe type: Human concierge / Wizard-of-Oz matching.
- Target audience: 5 to 8 creators from Probe 1 who could clearly describe who they want to be discovered by.

### Probe 3: One-page narrative with a single CTA

- Hypothesis: A clear promise around "publish once, get seen by the right people repeatedly" will generate more meaningful response than a generic exposure or portfolio pitch.
- Risk being reduced: Whether the discovery-quality story is legible and compelling enough to earn a next action before any product feature exists.
- Probe type: One-page narrative plus fake-door CTA.
- Target audience: A small trusted audience of creators, collaborators, or existing contacts who fit the current discovery-quality segment.

## 3. Success / Failure

### Probe 1: Structured creator interviews

- Pass if: At least 6 of 10 participants can clearly distinguish "right viewers" from generic engagement, and at least 5 of 10 say repeatable quality discovery would change where or how they publish.
- Fail if: Most participants still define success as generic reach, likes, or vanity metrics, or cannot translate "right viewers" into a concrete audience type.
- What harsh truth would kill this direction: 2 or fewer participants can define durable high-value viewer types, and nobody is willing to reallocate effort even under a strong discovery-quality promise.

### Probe 2: Concierge match week

- Pass if: At least half of participants take at least one follow, intro, or message action they would not have taken otherwise, and describe the match quality as clearly better than random browsing.
- Fail if: Participants describe the matches as obvious, generic, low-signal, or not worth acting on.
- What harsh truth would kill this direction: 1 or fewer participants take action, or at least half say even manual matching still feels random, unsafe, or not materially better than their current stack.

### Probe 3: One-page narrative with a single CTA

- Pass if: The response rate is meaningfully above baseline for similar outreach, and at least 30 percent of replies name a specific audience they want to be discovered by rather than asking for more generic exposure.
- Fail if: Replies are vague, generic, or treat the idea as "another portfolio" or "another feed."
- What harsh truth would kill this direction: Meaningful responses are near zero, or the dominant reaction is distrust of any platform claiming to improve discovery.
- Supporting artifacts:
  - `docs/insights/2026-04-10-lens-archive-discovery-quality-p3-narrative.md`
  - `docs/insights/2026-04-10-lens-archive-discovery-quality-p3-outreach-template.md`

## 4. Minimal Setup

### Probe 1: Structured creator interviews

- Cheapest artifact to create: A one-page interview script and a simple note-taking template.
- Timebox: 5 to 7 days including recruiting and synthesis.
- Owner: Product owner or founder-level discovery lead.
- Disposal plan: Keep only raw notes, a short synthesis, and the decision record; do not convert the interview script into product requirements.

### Probe 2: Concierge match week

- Cheapest artifact to create: A lightweight intake form plus a shared document or email template containing 3 to 5 curated matches and suggested next actions.
- Timebox: 5 to 7 days, only if Probe 1 does not kill the direction.
- Owner: Product owner with one support operator if available.
- Disposal plan: Treat all matches, suggested openers, and manual curation logic as disposable learning scaffolds, not proto-product workflows.

### Probe 3: One-page narrative with a single CTA

- Cheapest artifact to create: A short Notion page, PDF, or plain email with one clear promise and one clear response action.
- Timebox: 2 to 3 days including copy, distribution, and response review.
- Owner: Product owner or whoever owns demand discovery.
- Disposal plan: Throw away the page after readout; only retain response patterns and objections.
- Current draft assets:
  - `docs/insights/2026-04-10-lens-archive-discovery-quality-p3-narrative.md`
  - `docs/insights/2026-04-10-lens-archive-discovery-quality-p3-outreach-template.md`

## 5. Readout

- What we will learn:
  - Whether discovery quality is strong enough to change publishing behavior.
  - Whether "right viewers" is a real and narrow enough concept to build around.
  - Whether a works-first browse to relationship path feels credible before any heavy product investment.
- What decision this unlocks:
  - Continue on the discovery-quality direction and narrow the first segment.
  - Narrow the thesis to a smaller audience or a more concrete downstream outcome.
  - Kill the discovery-quality promise and stop treating it as the primary wedge.

## 6. Decision Rules

- If Probe 1 fails on audience definition, stop and narrow the target segment before doing more concept work.
- If Probe 1 passes but Probe 2 fails, do not assume better ranking or better UI will save the idea; reconsider whether discovery quality is truly the wedge.
- If Probes 1 and 2 pass but Probe 3 fails, revisit positioning before moving toward solution shaping.
- If all three probes pass, the team has enough evidence to bridge this direction into more concrete concept and pre-spec work.

## 7. Explicit Non-Goals

- Do not build a feed, ranking model, recommendation system, or matching engine as part of these probes.
- Do not test monetization, subscriptions, or pricing yet.
- Do not spend time polishing brand language beyond what is needed for the one-page narrative.
- Do not treat positive sentiment alone as validation without a concrete next action.

## 8. Recommended Next Skill

- Suggested next step: Execute the probes, then return to `ahe-assumption-probes` with fresh evidence. If the probes pass, continue to `ahe-spec-bridge`.

