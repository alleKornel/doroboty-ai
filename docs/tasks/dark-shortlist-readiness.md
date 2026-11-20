# Dark shortlist study and release readiness

## Intent

Build the researched employer shortlist and candidate contribution-card study on the participant fork, using the owner's accepted dark DoRoboty.ai system across the application. Keep the existing marketplace, applications and recruiting stages working. The study uses synthetic records and browser-local persistence. Publishing to invited participants requires a host-level shared-password gate before any page or asset is returned.

## Acceptance criteria

1. Candidate can edit a project contribution card as a private draft, preview it, publish selected text and withdraw it. The employer sees only the published version.
2. Employer can compare the same application in profile-only and profile-plus-card variants, rate visible card sections, record an independent decision/reason/question for each variant, and review a summary. The study score is clearly marked as experimental and never changes the historical or recruiting Match Score.
3. Existing save, import, export and reset cover the study state without breaking version-1 files. Editing a published card invalidates old section ratings.
4. Public, candidate, employer, settings and study views use the dark DoRoboty.ai palette, Roboto, sharp panels, lime primary actions and visible focus. The original local font files and their license travel with the build; no remote font request is needed.
5. The production build works from a clean installation and hash routes/assets work under a subdirectory. The main study path is checked on desktop and mobile with keyboard access.
6. A fresh offline production-readiness report records the exact fork version, local results and remaining host decisions. Release instructions require protection of every route, asset and older deployment. No password is embedded in the frontend.

## Boundaries

- No real people, hiring decisions, invitations, payments, AI calls or shared server data.
- Each browser has its own study state; an exported JSON is the only transfer/backup between devices. The facilitator deletes exports 30 days after analysis.
- Existing Poster People kit remains in the repository as historical reference, but the owner chose the dark system for this branch. Do not mutate the immutable kit.
- Hosting, shared password and production URL must be configured outside this static build and independently checked before participants receive a link.

## Verification record

- Baseline before edits: formatting, reference-kit integrity, lint, types, 27 unit tests, packet verification and Vite build passed under Node 26.4.0. Full `./scripts/verify` stops because the kit requires Node 24. Playwright cannot launch because its Chromium binary is absent; the application test server starts with sandbox escalation.
- After implementation on Node 26.4.0: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test` (31/31), `npm run verify:packet` (120 journeys) and `npm run build` passed. Playwright discovered 35 browser tests, including the new shortlist regression, but could not execute them because its Chromium binary is absent. `./scripts/verify` passed formatting and reference integrity, then stopped at the immutable kit's Node 24 gate. This is a tooling limit, not a product-test failure.
- Browser review of the running app covered the homepage, listing, offer, candidate card editor and employer comparison at 1280px and 390px. Variant B stayed hidden until decision A; ratings of 4/5 across five sections gave a labeled 74/100 experimental result, and decisions survived reload. The built `dist/` was served from `/pilot/index.html`; styles, Roboto, links and hash routes loaded under that subdirectory. The prototype has no public host or password gate yet.
- The static bundle was 212 kB gzipped JavaScript in this build and Vite reported its usual chunk-size advisory. This pilot has at most 10 concurrent participants; no measured remote load time or traffic observation exists yet.
- Online `npm audit --omit=dev --audit-level=high` reported zero production dependency findings. Full `npm audit --audit-level=high` reported ten moderate findings in development dependencies (principally transitive minimatch via shadcn and typescript-eslint); no high or critical findings. These tools are not shipped in the static browser bundle. Recheck at release time and update them separately if a relevant fix becomes available.
