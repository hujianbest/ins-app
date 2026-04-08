# Release Notes

## 2026-04-05

- Localized the homepage baseline into Chinese, including the root `lang`, homepage discovery copy, and homepage-facing card labels, so the site now starts from a Chinese-first entry experience.
- Added the first branded homepage for the photography showcase site, replacing the default Next.js starter screen with a full-screen hero and curated entry points for portfolios and opportunities.
- Updated the site-wide metadata and global visual tokens so the experience now carries a consistent Lens Archive brand baseline beyond the homepage alone.
- Added public photographer and model profile pages with role-specific showcase sections, contact entry points, and static sample routes for the first browsing flow.
- Added public work detail pages plus profile-to-work navigation, so visitors can move from a creator showcase into individual work stories and back to the owner profile.
- Added public opportunities list and detail pages, allowing visitors to browse city/time booking requests and jump into the poster's profile or contact entry point.
- Added first-pass authentication entry pages and a protected `studio` landing route, giving photographers and models a role-specific sign-in/register path for future creator workflows.
- Added first-pass studio profile and works management pages, so signed-in creators can review editable profile fields and manage the showcase items tied to their public presence.
- Added a first-pass studio opportunities management page, so signed-in creators can draft booking requests with city/time fields and review the active requests currently shown to visitors.
- Added login-gated work likes and profile favorites backed by demo cookies, so signed-in visitors can toggle engagement state while guests are routed through the login entry point.
- Added in-site contact actions plus a protected `inbox`, so signed-in users can start message threads from profiles, works, and opportunities and then review those threads inside the app.
- Added homepage discovery sections for featured works, profiles, and opportunities, so visitors can move from the cinematic hero into curated public content without losing the landing page visual hierarchy.
