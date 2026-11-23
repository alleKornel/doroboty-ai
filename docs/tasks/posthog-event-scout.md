# PostHog Event Scout integration

## Intent

Connect the participant's EU PostHog project to the deployed shortlist branch and verify one production pageview and one Autocapture click for Q4.3. Keep the existing private Netlify access and synthetic study data boundaries.

## Acceptance criteria

1. Use the browser SDK with an explicit project token and ingestion host supplied by the participant's PostHog project. The token is a public write-only SDK token, never a personal API key.
2. Enable Autocapture for the static homepage “Zobacz oferty” action. Exclude forms, profile text, contribution cards, research notes and recruiting decisions; do not send user-written content or URL query values.
3. Disable session replay, surveys, person profiles and unrelated collection. Keep development and unconfigured builds free of analytics traffic. Analytics failure must not prevent the prototype from rendering.
4. Update product behavior, setup and privacy documentation. Test privacy filtering and initialization boundaries, run the repository checks and record the actual results.
5. Verify the deployed version and see matching fresh Pageview and Autocapture records in PostHog. Record URL, button, time and evidence; preparation alone is not quest completion.

## Verification

Existing Netlify deployment: `https://doroboty-ai-rnpq.netlify.app/`, branch `codex/shortlist-readiness`. PostHog project selected by the participant: EU project `358763` (“Default project”), ingestion host supplied by `project-get`. The project reports IP anonymization enabled. The public SDK token is in ignored `.env.local` and Netlify's production build environment; no personal API key was requested or used.

- Installed `posthog-js` 1.453.1 from the official npm registry with installation scripts disabled. The SDK is a separate lazy-loaded chunk, so it does not block initial rendering.
- Added a single SDK initialization and explicit pageviews for four static public routes. Autocapture selects only the static homepage CTA. The event sanitizer strips DOM properties, referrers, URL parameters and person updates, preserving only delivery/session fields and fixed page/action metadata.
- Development, preview origins and unconfigured builds stay disabled. Private Netlify access remains unchanged. There is no real authentication identity in this prototype, so persona IDs are never passed to `identify`.
- On Node 24.22.3, `./scripts/verify` passed formatting, reference-kit integrity and six renderer tests, lint, TypeScript, all 36 unit tests, baseline packet verification (120 journeys) and production build. The sandbox prevented the browser-test server from binding port 3106; a separate permitted browser-gate run follows.
- The separate browser gate started its server and discovered 35 journeys, but none could execute because the required Playwright Chromium binary is absent. This limitation also existed before the analytics change; browser assertions did not pass. No browser or OS dependencies were automatically installed.
- Separate review checked token handling, the allowed selectors, private-route exclusion, query stripping, StrictMode cleanup and failure isolation. No application state or persona identity is passed to the SDK. FEATURES.md was updated for actual collection and deployed access boundaries.
- Production verification succeeded on 2026-11-23 after Netlify published implementation commit `2d644b8` (20 s build). Activity → Live shows Pageview and Autocapture from the configured site. A bounded read-only event lookup confirmed the participant's homepage Pageview at `19:32:58.613 UTC` and Autocapture at `19:32:59.205 UTC` (`20:32:59 Europe/Warsaw`), with `$el_text=Zobacz oferty`, `action=browse_jobs` and the sanitized homepage URL. The destination Pageview followed at `19:32:59.219 UTC`.
- Matching click event UUID: `01a209e5-b6e9-7333-b3cc-c06ac00c8c12`. The owner confirmed performing the click. These are technical instrumentation checks; customer study observations remain to be collected separately. The Questlog submission is prepared locally for the owner to submit.
