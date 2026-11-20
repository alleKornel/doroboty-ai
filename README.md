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

Static output is `dist/`. Browser checks require provisioned Playwright Chromium; app startup does not install it. The release must be protected by a host-level shared password before any HTML or asset is served. Follow [release procedure](docs/SHORTLIST_RELEASE.md) and review the [offline readiness report](docs/production-readiness.html) before invitations. Do not distribute the full repository history or use the baseline participant source-packaging command on this later-stage branch.

See [current features](FEATURES.md), [participant guide](docs/PARTICIPANT_GUIDE.md), [architecture](docs/architecture.md) and [case protocol](docs/case/CASE_PROTOCOL.md).
