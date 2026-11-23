# DoRoboty.ai — AIPH3 shortlist prototype

A frontend-only job marketplace and moderated shortlist study, built with React, TypeScript, Vite and Base UI. This fork branch uses the owner's [dark DoRoboty.ai system](docs/design-system/DOROBOTO-DARK.md) on all screens. The earlier Poster People kit is preserved as historical reference under `docs/design-system/agent-kit`.

## Run locally

Use Node.js 24 and npm:

```sh
npm ci
npm run dev
```

Open [http://127.0.0.1:3001](http://127.0.0.1:3001). No account, database or AI provider is required. Select Marek or Anna as a candidate, or Karolina as an employer. Candidates edit and publish a project contribution card at `/#/app/karta-projektu`. Employers compare the same application in profile-only and profile-plus-card variants at `/#/app/shortlista`. The first decision must be recorded before the card is revealed. Both use synthetic data.

State lives only in this browser. Settings offers JSON export, import and reset. This branch uses a fresh storage key; an older version-one JSON can still be imported. Persona selection organizes the simulation and is not authentication. The experimental 70/30 study result does not change the application's historical Match Score or recruiting stage.

## Build and release

```sh
npm run build
npm run preview
./scripts/verify
```

Static output is `dist/`. Browser checks require provisioned Playwright Chromium. The owner approved a public demo using synthetic data. Follow the [release procedure](docs/SHORTLIST_RELEASE.md) and review the [offline readiness report](docs/production-readiness.html) before sharing. The baseline participant source packager is deliberately blocked on this study branch.

See [current features](FEATURES.md), [participant guide](docs/PARTICIPANT_GUIDE.md), [architecture](docs/architecture.md) and [case protocol](docs/case/CASE_PROTOCOL.md).

## Optional PostHog analytics

Copy `.env.example` to `.env.local` and set `VITE_POSTHOG_ENABLED=true`, `VITE_POSTHOG_PROJECT_TOKEN`, `VITE_POSTHOG_HOST` and `VITE_POSTHOG_SITE_ORIGIN` from the selected project and deployed site. Add the same four values in Netlify's build environment, then rebuild. The SDK token is public and write-only; never use a personal API key. Local env files are ignored by Git.

Analytics runs only in production on that exact site origin. Development, preview URLs and unconfigured builds send no analytics. It records pageviews of four static public routes and native Autocapture for the homepage “Zobacz oferty” CTA. Other routes, forms, profile/card contents, study notes, search parameters, DOM content and referrers are excluded. Session replay, profiles, surveys, flags, error and performance collection are disabled. IDs are kept in memory without cookies and Do Not Track is respected. SDK failure does not block the app.

Historical integration evidence is recorded in the [Event Scout task](docs/tasks/posthog-event-scout.md). The [offline readiness report](docs/production-readiness.html) records checks for the current version.
