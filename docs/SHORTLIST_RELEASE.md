# DoRoboty.ai demo release

Netlify builds the `codex/shortlist-readiness` branch of `alleKornel/doroboty-ai`. The build command, Node major and publish directory live in `netlify.toml`. The owner approved a public link for a synthetic demo. The staged output is `dist/` and includes the baseline exercise CSV. Persona switching is part of the simulation. Edits and study notes live in each browser. The facilitator deletes exported JSON 30 days after analysis.

## Prepare and publish

1. Use Node 24 and run `npm ci`, then `./scripts/verify` with Playwright Chromium. The gate builds and verifies the exact contents of `dist/`. Use a clean browser for the smoke check.
2. Keep the latest successful Netlify deploy ID and commit as a rollback target. Push the reviewed commit to the configured branch. Check the Netlify deploy log and verify that the published deploy points to that commit.
3. Verify the reviewed dist and release URLs before making the demo public. The app shell and Netlify headers request no indexing. The URL is available to anyone who has it once the visibility setting is public. Share the link through the facilitator after the public checks below.
4. Optional PostHog uses a public project token and an exact production origin. The other build settings are versioned. Keep private API keys and personal data out of client-side assets and Netlify snippets.

## Smoke check before each session

- From a fresh browser, open [the demo](https://doroboty-ai-rnpq.netlify.app/) over HTTPS. Confirm Build, Apply, Lead, the portraits, and the primary browse button. Open one category and a job detail through a copied hash URL; reload.
- Use prepared personas to publish a contribution card and complete both employer study variants in order. Reload, confirm decisions survived, then check export/import/reset in the isolated browser. Use fictional content. Stop the session if the primary journey or storage recovery fails.
- The facilitator is the incident contact through the invitation. Record time, deploy ID, route, device and symptom. Check the Deploys activity and build log, and check browser console and network errors in the throwaway session. The facilitator checks manually before sessions, with a limit of 10 concurrent participants in the first series. The team owner checks Netlify Usage before the series.

## Recover

Pause invitations. In Netlify Deploys, confirm the last working commit on a successful deploy. Netlify can republish that immutable deploy with **Publish deploy**. Pin it or stop automatic publishing while repairing a broken revision, then run the same smoke check on the main URL. Record the rollback deploy ID. As a session fallback, open the last checked artifact on the facilitator’s computer and share the screen. Export useful fictional observations before a browser reset. Local state is independent of the published build.

[Netlify rollback and deploy history](https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/) · [Netlify usage and limits](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/)
