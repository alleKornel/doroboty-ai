# Shortlist prototype release procedure

This branch is a static Vite prototype with synthetic scenario data. It has no application login, server or shared database. Persona selection is a simulation. Browser storage, including study notes and ratings, stays on that browser; JSON export/import is the transfer mechanism. The facilitator deletes exported files within 30 days of analysis.

## Build and review

1. Use Node 24, run `npm ci`, `./scripts/verify`, `npm run build` and review the generated `dist/`. Browser tests require provisioned Playwright Chromium. The exact results of this worktree are recorded in `docs/tasks/dark-shortlist-readiness.md` and the offline `docs/production-readiness.html`.
2. Confirm the published package contains only this build and synthetic records. Do not put a shared password, token or participant information into JavaScript, HTML, repository variables or client storage.
3. Choose a host that enforces a shared password **before serving `index.html`, every built asset, hash route, preview URL and older deployment URL**. A browser-only password screen is insufficient. Keep the password in the host's access-control settings and share it only with invited participants through the facilitator.
4. Test the exact release URL in a private browser without the password: the host must refuse HTML and assets. Then enter the password and check first load, reload, direct hash links, candidate publication, employer study, mobile layout, export and reset. Repeat the no-password check for preview and prior public URLs. Rotate or remove access when the study ends.
5. Record the host, URL, deployment identifier, reviewer, date and access test in the readiness report. Only then send invitations for moderated sessions (maximum 10 concurrent participants). The facilitator uses the invitation contact channel for reports, checks the site manually before each session and pauses sessions if it fails.

## Rollback and data

Keep the previous verified static artifact as a private rollback target. If the new build breaks, stop invitations, restore that artifact behind the same host-level password, and verify the protected URL. Do not restore an older public artifact. Restart a browser scenario through Settings only after exporting any session notes needed for analysis. Local state loss is acceptable for the pilot, but it must be disclosed to participants and facilitators.
